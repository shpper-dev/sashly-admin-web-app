import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./config";
import { Order } from "../models/order.model";
import { mapOrder } from "../mappers/order.mapper";

export interface AreaStats {
  area:                string;
  registeredCustomers: number;
  activeCustomers:     number;   // placed at least one order
  totalOrders:         number;
  firstOrderDate:      number | null;
  lastOrderDate:       number | null;
  expressOrders:       number;
  ordinaryOrders:      number;
  totalRevenue:        number;
  aov:                 number;
}

export async function getGeographyReport(
  startMs?: number,
  endMs?:   number
): Promise<AreaStats[]> {

  const snap = await getDocs(
    query(collection(db, "orders"), where("isDelivered", "==", true))
  );
  const orders = snap.docs.map(mapOrder);

  const filtered = orders.filter(o => {
    if (startMs && o.createdAt < startMs) return false;
    if (endMs   && o.createdAt > endMs)   return false;
    return true;
  });

  // Resolve each order to an area using pickUpAddress
  const resolveArea = (o: Order): string =>
    o.pickUpAddress?.city      ||
    o.pickUpAddress?.state     ||
    o.pickUpAddress?.formattedAddress  ||
    "Unknown";

  // Build per-area stats in one pass
  const areaMap = new Map<string, {
    customers:     Set<string>;
    totalOrders:   number;
    expressOrders: number;
    totalRevenue:  number;
    firstOrder:    number | null;
    lastOrder:     number | null;
  }>();

  for (const order of filtered) {
    const area = resolveArea(order);
    if (!areaMap.has(area)) {
      areaMap.set(area, {
        customers:     new Set(),
        totalOrders:   0,
        expressOrders: 0,
        totalRevenue:  0,
        firstOrder:    null,
        lastOrder:     null,
      });
    }

    const s = areaMap.get(area)!;
    s.customers.add(order.userId);
    s.totalOrders   += 1;
    s.totalRevenue  += order.totalPrice;
    s.expressOrders += order.serviceType === "express" ? 1 : 0;

    if (!s.firstOrder || order.createdAt < s.firstOrder) s.firstOrder = order.createdAt;
    if (!s.lastOrder  || order.createdAt > s.lastOrder)  s.lastOrder  = order.createdAt;
  }

  return [...areaMap.entries()]
    .map(([area, s]) => ({
      area,
      registeredCustomers: s.customers.size,
      activeCustomers:     s.customers.size,
      totalOrders:         s.totalOrders,
      firstOrderDate:      s.firstOrder,
      lastOrderDate:       s.lastOrder,
      expressOrders:       s.expressOrders,
      ordinaryOrders:      s.totalOrders - s.expressOrders,
      totalRevenue:        s.totalRevenue,
      aov:                 s.totalOrders > 0 ? s.totalRevenue / s.totalOrders : 0,
    }))
    .sort((a, b) => b.totalOrders - a.totalOrders);
}

// Resolve each order to an area intelligently
const resolveArea = (o: Order): string => {
  // 1. If city or state were explicitly provided, use them immediately
  const explicitArea = o.pickUpAddress?.city?.trim() || o.pickUpAddress?.state?.trim();
  if (explicitArea) return explicitArea;

  const formatted = o.pickUpAddress?.formattedAddress;
  if (!formatted) return "Unknown";

  // 2. Clean up and split the address by both English (,) and Arabic (،) commas
  const parts = formatted
    .split(/[,،]+/)
    .map(p => p.trim())
    .filter(Boolean);

  if (parts.length === 0) return "Unknown";

  // 3. TARGET A: Look for a District / Neighborhood token (e.g., "حي العارض" or "Al Arid District")
  const districtToken = parts.find(p => 
    p.includes("حي") || 
    p.toLowerCase().includes("district") || 
    p.toLowerCase().includes("neighborhood")
  );
  if (districtToken) return districtToken;

  // 4. TARGET B: Grab the City token fallback
  // In typical address patterns, Country is last (e.g., "Saudi Arabia"), City is second or third to last
  let cityToken = "Unknown";
  if (parts.length >= 2) {
    // If the last token is the country, look at the second to last token
    const lastTokenLower = parts[parts.length - 1].toLowerCase();
    if (lastTokenLower.includes("arabia") || lastTokenLower === "sa" || lastTokenLower === "ksa") {
      cityToken = parts[parts.length - 2];
    } else {
      cityToken = parts[parts.length - 1];
    }
  } else {
    cityToken = parts[0];
  }

  // 5. Clean up the city token by removing postal codes/digits (e.g., "Riyadh 13342" -> "Riyadh")
  // This ensures "Riyadh 13342" and "Riyadh 11564" merge into the exact same report group
  const cleanedCity = cityToken.replace(/[0-9]/g, "").trim();

  return cleanedCity || "Unknown";
};