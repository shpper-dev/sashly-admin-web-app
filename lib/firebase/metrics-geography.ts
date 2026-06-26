import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "./config";
import { Order } from "../models/order.model";
import { mapOrder } from "../mappers/order.mapper";

import { latLngToCell } from "h3-js";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

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

async function getAreaForLocation(
    lat: number,
    lng: number
): Promise<{ key: string; label: string }> {

    const h3 = latLngToCell(lat, lng, 7);
    const bucketRef = doc(db, "geo_buckets", h3);
    const bucketSnap = await getDoc(bucketRef);
    if (bucketSnap.exists()) {
        return {
            key: h3,
            label: bucketSnap.data().area,
        };
    }
    // Not cached -> reverse geocode once
    const url =
        `https://maps.googleapis.com/maps/api/geocode/json` +
        `?latlng=${lat},${lng}` +
        `&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);

    const json = await response.json();

    let area = "Unknown";

    if (json.results?.length) {
        const components = json.results[0].address_components;
        const find = (...types: string[]) =>
            components.find((c: any) =>
                types.some(t => c.types.includes(t))
            );

        area =
            find("neighborhood")?.long_name ??
            find("sublocality_level_1")?.long_name ??
            find("sublocality")?.long_name ??
            find("administrative_area_level_2")?.long_name ??
            find("locality")?.long_name ??
            "Unknown";
    }

    await setDoc(bucketRef, {
        area,
        lat,
        lng,
        createdAt: Date.now(),
    });

    return { key: h3,label: area,};
}


async function resolveArea(order: Order) {
    const a = order.pickUpAddress;
    if (!a?.lat || !a?.lng) {
        return { key: "unknown", label: "Unknown",};
    }
    return getAreaForLocation(a.lat, a.lng);
}

export async function getGeographyReport(
  startMs?: number,
  endMs?:   number
): Promise<AreaStats[]> {

  const snap = await getDocs(
    query(collection(db, "orders"), where("isDelivered", "==", true))
  );

  const orders  = snap.docs.map(mapOrder);
  const filtered = orders.filter(o => {
    if (startMs && o.createdAt < startMs) return false;
    if (endMs   && o.createdAt > endMs)   return false;
    return true;
  });

  const areaMap = new Map<string, {
    label:         string;
    customers:     Set<string>;
    totalOrders:   number;
    expressOrders: number;
    totalRevenue:  number;
    firstOrder:    number | null;
    lastOrder:     number | null;
  }>();

  for (const order of filtered) {
    const { key, label } = await resolveArea(order);

    if (!areaMap.has(key)) {
        areaMap.set(key, {
            label,
            customers: new Set(),
            totalOrders: 0,
            expressOrders: 0,
            totalRevenue: 0,
            firstOrder: null,
            lastOrder: null,
        });
    }
    const s = areaMap.get(key)!;
    s.customers.add(order.userId);
    s.totalOrders++;
    s.totalRevenue += order.totalPrice;
    if (order.serviceType === "express")
        s.expressOrders++;
    if (!s.firstOrder || order.createdAt < s.firstOrder)
        s.firstOrder = order.createdAt;
    if (!s.lastOrder || order.createdAt > s.lastOrder)
        s.lastOrder = order.createdAt;
}

  return [...areaMap.values()]
    .map(s => ({
      area:                s.label,
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