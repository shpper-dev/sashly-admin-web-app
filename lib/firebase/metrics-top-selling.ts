
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./config";
import { Order } from "../models/order.model";
import { mapOrder } from "../mappers/order.mapper";

export interface ProductStats {
  name: string;
  arabicName: string;
  categoryId: string;
  totalQuantity: number; // total pieces cleaned
  totalOrders: number;   // distinct orders containing this item
  totalRevenue: number;
}

export interface ServiceStats {
  serviceName: string;
  serviceArabicName: string;
  totalQuantity: number; // number of order-line occurrences (one per item-line)
  totalPieces: number;   // total pieces processed under this service
  totalRevenue: number;
  totalOrders: number;   // distinct orders that used this service
}

export type MatrixData = Map<string, Map<string, number>>;

export interface AggregatedStats {
  products: ProductStats[];
  services: ServiceStats[];
  matrix: MatrixData;
}

export async function getTopSellingStats(
  startMs?: number,
  endMs?: number
): Promise<AggregatedStats> {
  // Fetch only delivered orders — these are the ones that generated real revenue
  const q = query(collection(db, "orders"), where("isDelivered", "==", true));
  const snap = await getDocs(q);
  const orders = snap.docs.map(mapOrder);

  // client side filtering since composite indexes can complicate the process
  const filtered = orders.filter((o) => {
    if (startMs && o.createdAt < startMs) return false;
    if (endMs   && o.createdAt > endMs)   return false;
    return true;
  });

  const productMap = new Map<string, ProductStats>();
  const serviceMap = new Map<string, ServiceStats>();
  const matrixMap:  MatrixData = new Map();

  for (const order of filtered) {
    const seenItems    = new Set<string>();
    const seenServices = new Set<string>(); 

    for (const item of order.items) {

      // Products 
      // Each unique item.name gets one ProductStats entry.
      // totalQuantity accumulates pieces; totalOrders counts distinct orders.
      if (!productMap.has(item.name)) {
        productMap.set(item.name, {
          name: item.name,
          arabicName: item.arabicName,
          categoryId: item.categoryId,
          totalQuantity: 0,
          totalOrders: 0,
          totalRevenue: 0,
        });
      }
      const ps = productMap.get(item.name)!;
      ps.totalQuantity += item.count;
      ps.totalRevenue  += item.servicePrice * item.count;
      if (!seenItems.has(item.name)) {
        ps.totalOrders += 1;
        seenItems.add(item.name);
      }

      // Services 
      // Each unique item.serviceName gets one ServiceStats entry.
      // totalQuantity = line-item occurrences (how many item lines used this service)
      // totalPieces   = actual piece count
      // totalOrders   = distinct orders that included this service 
      if (!serviceMap.has(item.serviceName)) {
        serviceMap.set(item.serviceName, {
          serviceName:       item.serviceName,
          serviceArabicName: item.serviceArabicName,
          totalQuantity: 0,
          totalPieces:   0,
          totalRevenue:  0,
          totalOrders:   0, 
        });
      }
      const ss = serviceMap.get(item.serviceName)!;
      ss.totalQuantity += 1;
      ss.totalPieces   += item.count;
      ss.totalRevenue  += item.servicePrice * item.count;
      if (!seenServices.has(item.serviceName)) { 
        ss.totalOrders += 1;
        seenServices.add(item.serviceName);
      }

      //  Matrix 
      // matrixMap[itemName][serviceName] = total pieces
      // This lets the bar chart show "how many Thob pieces were Dry Cleaned" etc.
      if (!matrixMap.has(item.name)) matrixMap.set(item.name, new Map());
      const row = matrixMap.get(item.name)!;
      row.set(item.serviceName, (row.get(item.serviceName) ?? 0) + item.count);
    }
  }

  // Sort descending by volume (popularity)
  const products = [...productMap.values()].sort((a, b) => b.totalQuantity - a.totalQuantity);
  const services = [...serviceMap.values()].sort((a, b) => b.totalPieces   - a.totalPieces);

  return { products, services, matrix: matrixMap };
}