import { collection, doc, getDoc, getDocs, query, where, setDoc } from "firebase/firestore";
import { db } from "./config";
import { Order } from "../models/order.model";
import { mapOrder } from "../mappers/order.mapper";

import { latLngToCell } from "h3-js";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

export interface AreaStats {
  area:                string;
  city:                string;
  registeredCustomers: number;
  activeCustomers:     number;
  totalOrders:         number;
  firstOrderDate:      number | null;
  lastOrderDate:       number | null;
  expressOrders:       number;
  ordinaryOrders:      number;
  totalRevenue:        number;
  aov:                 number;
}

interface ResolvedArea {
  h3Key: string;
  area:  string;
  city:  string;
}

async function getAreaForLocation(lat: number, lng: number): Promise<ResolvedArea> {
  const h3 = latLngToCell(lat, lng, 7);
  const bucketRef = doc(db, "geo_buckets", h3);
  const bucketSnap = await getDoc(bucketRef);

  if (bucketSnap.exists()) {
    const data = bucketSnap.data();
    return {
      h3Key: h3,
      area:  data.area,
      city:  data.city ?? "Unknown",
    };
  }

  const url =
    `https://maps.googleapis.com/maps/api/geocode/json` +
    `?latlng=${lat},${lng}` +
    `&key=${GOOGLE_API_KEY}`;

  const response = await fetch(url);
  const json = await response.json();

  let area = "Unknown";
  let city = "Unknown";

  if (json.results?.length) {
    const components = json.results[0].address_components;
    const find = (...types: string[]) =>
      components.find((c: any) => types.some(t => c.types.includes(t)));

    area =
      find("neighborhood")?.long_name ??
      find("sublocality_level_1")?.long_name ??
      find("sublocality")?.long_name ??
      find("administrative_area_level_2")?.long_name ??
      find("locality")?.long_name ??
      "Unknown";

    city =
      find("locality")?.long_name ??
      find("administrative_area_level_2")?.long_name ??
      find("administrative_area_level_1")?.long_name ??
      "Unknown";
  }

  await setDoc(bucketRef, {
    area,
    city,
    lat,
    lng,
    createdAt: Date.now(),
  });

  return { h3Key: h3, area, city };
}

async function resolveArea(order: Order): Promise<ResolvedArea> {
  const a = order.pickUpAddress;
  if (!a?.lat || !a?.lng) {
    return { h3Key: "unknown", area: "Unknown", city: "Unknown" };
  }
  return getAreaForLocation(a.lat, a.lng);
}

const RESOLVE_CONCURRENCY = 25;

async function resolveAreasInBatches(orders: Order[]): Promise<ResolvedArea[]> {
  const results: ResolvedArea[] = new Array(orders.length);
  for (let i = 0; i < orders.length; i += RESOLVE_CONCURRENCY) {
    const chunk = orders.slice(i, i + RESOLVE_CONCURRENCY);
    const resolvedChunk = await Promise.all(chunk.map((o) => resolveArea(o)));
    resolvedChunk.forEach((r, j) => { results[i + j] = r; });
  }
  return results;
}

export async function getGeographyReport(
  startMs?: number,
  endMs?: number
): Promise<AreaStats[]> {

  const constraints = [where("isDelivered", "==", true)];
  if (startMs != null) constraints.push(where("createdAt", ">=", startMs));
  if (endMs != null) constraints.push(where("createdAt", "<=", endMs));

  const snap = await getDocs(query(collection(db, "orders"), ...constraints));
  const filtered = snap.docs.map(mapOrder);

  type AreaAgg = {
    area:          string;
    city:          string;
    customers:     Set<string>;
    totalOrders:   number;
    expressOrders: number;
    totalRevenue:  number;
    firstOrder:    number | null;
    lastOrder:     number | null;
  };

  const areaMap = new Map<string, AreaAgg>();

  const resolvedAreas = await resolveAreasInBatches(filtered);

  filtered.forEach((order, i) => {
    const { area, city } = resolvedAreas[i];

    const normalizedArea = area.trim().toLocaleLowerCase();
    const normalizedCity = city.trim().toLocaleLowerCase();
    const groupKey = `${normalizedCity}::${normalizedArea}`;

    if (!areaMap.has(groupKey)) {
      areaMap.set(groupKey, {
        area: area.trim(),
        city: city.trim(),
        customers: new Set(),
        totalOrders: 0,
        expressOrders: 0,
        totalRevenue: 0,
        firstOrder: null,
        lastOrder: null,
      });
    }

    const s = areaMap.get(groupKey)!;
    s.customers.add(order.userId);
    s.totalOrders++;
    s.totalRevenue += order.totalPrice;
    if (order.serviceType === "express") s.expressOrders++;
    if (!s.firstOrder || order.createdAt < s.firstOrder) s.firstOrder = order.createdAt;
    if (!s.lastOrder || order.createdAt > s.lastOrder) s.lastOrder = order.createdAt;
  });

  return [...areaMap.values()]
    .map(s => ({
      area:                s.area,
      city:                s.city,
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