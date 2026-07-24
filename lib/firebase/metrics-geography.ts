// import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
// import { db } from "./config";
// import { Order } from "../models/order.model";
// import { mapOrder } from "../mappers/order.mapper";

// import { latLngToCell } from "h3-js";

// const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

// export interface AreaStats {
//   area:                string;
//   registeredCustomers: number;
//   activeCustomers:     number;   // placed at least one order
//   totalOrders:         number;
//   firstOrderDate:      number | null;
//   lastOrderDate:       number | null;
//   expressOrders:       number;
//   ordinaryOrders:      number;
//   totalRevenue:        number;
//   aov:                 number;
// }

// async function getAreaForLocation(
//     lat: number,
//     lng: number
// ): Promise<{ key: string; label: string }> {

//     const h3 = latLngToCell(lat, lng, 7);
//     const bucketRef = doc(db, "geo_buckets", h3);
//     const bucketSnap = await getDoc(bucketRef);
//     if (bucketSnap.exists()) {
//         return {
//             key: h3,
//             label: bucketSnap.data().area,
//         };
//     }
//     // Not cached -> reverse geocode once
//     const url =
//         `https://maps.googleapis.com/maps/api/geocode/json` +
//         `?latlng=${lat},${lng}` +
//         `&key=${GOOGLE_API_KEY}`;

//     const response = await fetch(url);

//     const json = await response.json();

//     let area = "Unknown";

//     if (json.results?.length) {
//         const components = json.results[0].address_components;
//         const find = (...types: string[]) =>
//             components.find((c: any) =>
//                 types.some(t => c.types.includes(t))
//             );

//         area =
//             find("neighborhood")?.long_name ??
//             find("sublocality_level_1")?.long_name ??
//             find("sublocality")?.long_name ??
//             find("administrative_area_level_2")?.long_name ??
//             find("locality")?.long_name ??
//             "Unknown";
//     }

//     await setDoc(bucketRef, {
//         area,
//         lat,
//         lng,
//         createdAt: Date.now(),
//     });

//     return { key: h3,label: area,};
// }


// async function resolveArea(order: Order) {
//     const a = order.pickUpAddress;
//     if (!a?.lat || !a?.lng) {
//         return { key: "unknown", label: "Unknown",};
//     }
//     return getAreaForLocation(a.lat, a.lng);
// }

// export async function getGeographyReport(
//   startMs?: number,
//   endMs?: number
// ): Promise<AreaStats[]> {

//   const snap = await getDocs(
//     query(collection(db, "orders"), where("isDelivered", "==", true))
//   );

//   const orders = snap.docs.map(mapOrder);
//   const filtered = orders.filter(o => {
//     if (startMs && o.createdAt < startMs) return false;
//     if (endMs && o.createdAt > endMs) return false;
//     return true;
//   });

//   type AreaAgg = {
//     label: string; // display label, original casing
//     customers: Set<string>;
//     totalOrders: number;
//     expressOrders: number;
//     totalRevenue: number;
//     firstOrder: number | null;
//     lastOrder: number | null;
//   };

//   // Grouping key is the AREA NAME, not the H3 cell.
//   // H3 is still used inside resolveArea()/getAreaForLocation() purely to
//   // cache reverse-geocode lookups — it's an implementation detail of
//   // *lookup*, not of *reporting*.
//   const areaMap = new Map<string, AreaAgg>();

//   for (const order of filtered) {
//     const { label } = await resolveArea(order);

//     // Normalize so stray whitespace / casing differences from the
//     // geocoder can't create silent near-duplicates either.
//     const normalizedKey = label.trim().toLocaleLowerCase();

//     if (!areaMap.has(normalizedKey)) {
//       areaMap.set(normalizedKey, {
//         label: label.trim(),
//         customers: new Set(),
//         totalOrders: 0,
//         expressOrders: 0,
//         totalRevenue: 0,
//         firstOrder: null,
//         lastOrder: null,
//       });
//     }

//     const s = areaMap.get(normalizedKey)!;
//     s.customers.add(order.userId);
//     s.totalOrders++;
//     s.totalRevenue += order.totalPrice;
//     if (order.serviceType === "express") s.expressOrders++;
//     if (!s.firstOrder || order.createdAt < s.firstOrder) s.firstOrder = order.createdAt;
//     if (!s.lastOrder || order.createdAt > s.lastOrder) s.lastOrder = order.createdAt;
//   }

//   return [...areaMap.values()]
//     .map(s => ({
//       area:                s.label,
//       registeredCustomers: s.customers.size,
//       activeCustomers:     s.customers.size,
//       totalOrders:         s.totalOrders,
//       firstOrderDate:      s.firstOrder,
//       lastOrderDate:       s.lastOrder,
//       expressOrders:       s.expressOrders,
//       ordinaryOrders:      s.totalOrders - s.expressOrders,
//       totalRevenue:        s.totalRevenue,
//       aov:                 s.totalOrders > 0 ? s.totalRevenue / s.totalOrders : 0,
//     }))
//     .sort((a, b) => b.totalOrders - a.totalOrders);
// }
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "./config";
import { Order } from "../models/order.model";
import { mapOrder } from "../mappers/order.mapper";

import { latLngToCell } from "h3-js";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

export interface AreaStats {
  area:                string;
  city:                string;   // NEW — disambiguates same-named areas across cities
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
      city:  data.city ?? "Unknown", // tolerate buckets cached before this change
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

    // City is deliberately resolved independently of the area fallback
    // chain above, so it stays consistent even when `area` had to fall
    // back to a sublocality/locality value.
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

export async function getGeographyReport(
  startMs?: number,
  endMs?: number
): Promise<AreaStats[]> {

  const snap = await getDocs(
    query(collection(db, "orders"), where("isDelivered", "==", true))
  );

  const orders = snap.docs.map(mapOrder);
  const filtered = orders.filter(o => {
    if (startMs && o.createdAt < startMs) return false;
    if (endMs && o.createdAt > endMs) return false;
    return true;
  });

  type AreaAgg = {
    area:          string; // display label
    city:          string; // display label
    customers:     Set<string>;
    totalOrders:   number;
    expressOrders: number;
    totalRevenue:  number;
    firstOrder:    number | null;
    lastOrder:     number | null;
  };

  // Grouping key is CITY + AREA together. H3 is still used only inside
  // getAreaForLocation() to cache individual reverse-geocode lookups —
  // that's a lookup-layer detail, unrelated to how the report groups rows.
  const areaMap = new Map<string, AreaAgg>();

  for (const order of filtered) {
    const { area, city } = await resolveArea(order);

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
  }

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