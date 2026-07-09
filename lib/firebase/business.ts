import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "./config";
import { Business, CatalogItem } from "../models/business.model";
import { mapBusiness } from "../mappers/business.mapper";
import { serializeBusiness } from "../serializers/business.serializer";

//  Businesses 

export async function getBusinesses(): Promise<Business[]> {
  const q = query(collection(db, "businesses"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapBusiness);
}

//  Join code helpers

function randomCode(length = 4): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function generateUniqueJoinCode(businessName: string): Promise<string> {
  const prefix = businessName
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase()
    .slice(0, 6);

  while (true) {
    const code = `${prefix}-${randomCode(4)}`;
    const existing = await getDocs(
      query(
        collection(db, "businesses"),
        where("joinCode", "==", code),
        where("isActive", "==", true),
        limit(1)
      )
    );
    if (existing.empty) return code;
  }
}


export async function createBusiness(data: Partial<Business>): Promise<string> {
  const joinCode = await generateUniqueJoinCode(data.name ?? "BUSINESS");
  const docRef = await addDoc(
    collection(db, "businesses"),
    serializeBusiness({ ...data, joinCode, isActive: true, createdAt: Date.now() })
  );
  return docRef.id;
}

export async function updateBusiness(businessId: string, data: Partial<Business>): Promise<void> {
  await updateDoc(doc(db, "businesses", businessId), data);
}

export async function removeBusinessMembers(businessId: string) {
  const usersSnap = await getDocs(
    query(collection(db, "users"), where("businessAccountId", "==", businessId))
  );
  const batch = writeBatch(db);
  usersSnap.docs.forEach((d) => batch.update(d.ref, { businessAccountId: null }));
  await batch.commit();
}

export async function deleteBusiness(businessId: string) {
  await removeBusinessMembers(businessId);
  // Delete catalog items first
  const catalog = await getCatalog(businessId);

  await Promise.all(
    catalog.map((item) =>
      deleteCatalogItem(businessId, item.id)
    )
  );
  await deleteDoc(doc(db, "businesses", businessId));
}

export async function regenerateBusinessJoinCode(businessId: string): Promise<string> {
  const businessRef  = doc(db, "businesses", businessId);
  const businessSnap = await getDoc(businessRef);
  if (!businessSnap.exists()) throw new Error("Business not found");
  const business = mapBusiness(businessSnap as any);
  const newCode   = await generateUniqueJoinCode(business.name);
  await updateDoc(businessRef, { joinCode: newCode });
  return newCode;
}

// Catalog subcollection

export async function getCatalog(businessId: string): Promise<CatalogItem[]> {
  const snap = await getDocs(collection(db, "businesses", businessId, "catalog"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as CatalogItem))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function upsertCatalogItem(
  businessId: string,
  item: Omit<CatalogItem, "id">,
  id?: string
): Promise<string> {
  const colRef = collection(db, "businesses", businessId, "catalog");
  if (id) {
    await setDoc(doc(colRef, id), item);
    return id;
  }
  const ref = await addDoc(colRef, item);
  return ref.id;
}

export async function deleteCatalogItem(businessId: string, itemId: string): Promise<void> {
  await deleteDoc(doc(db, "businesses", businessId, "catalog", itemId));
}

// seed catalog from the global Items/Services/Categories hierarchy
export async function seedCatalogFromGlobal(businessId: string, replace = false): Promise<void> {
  const [itemsSnap, categoriesSnap] = await Promise.all([
    getDocs(collection(db, "Items")),
    getDocs(collection(db, "Categories")),
  ]);
  const categoryMap = new Map(categoriesSnap.docs.map((d) => [d.id, d.data().name as string]));
  const entries: Omit<CatalogItem, "id">[] = [];
  let sortIndex = 0;

  for (const itemDoc of itemsSnap.docs) {
    const item = itemDoc.data();
    const categoryName = categoryMap.get(item.categoryId as string) ?? "";
    const services: any[] = item.services ?? [];
    if (services.length === 0) {
      entries.push({ name: item.name as string, price: 0, category: categoryName, serviceType: null, unit: null, imageUrl: item.photoUrl ?? null, isActive: true, sortOrder: sortIndex++ });
    } else {
      for (const svc of services) {
        entries.push({ name: item.name as string, price: svc.price ?? 0, category: categoryName, serviceType: svc.name as string, unit: null, imageUrl: item.photoUrl ?? null, isActive: true, sortOrder: sortIndex++ });
      }
    }
  }

  const catalogRef = collection(db, "businesses", businessId, "catalog");
  if (replace) {
    const existing = await getDocs(catalogRef);
    const wipeBatch = writeBatch(db);
    existing.docs.forEach((d) => wipeBatch.delete(d.ref));
    await wipeBatch.commit();
  }
  for (let i = 0; i < entries.length; i += 400) {
    const batch = writeBatch(db);
    entries.slice(i, i + 400).forEach((entry) => batch.set(doc(catalogRef), entry));
    await batch.commit();
  }
}

//  Catalog discount 

// Builds a lookup of standard (undiscounted) prices from the global Items/Services
// collection, keyed the same way seedCatalogFromGlobal names its catalog entries.
function catalogEntryKey(name: string, serviceType: string | null | undefined): string {
  return `${name}::${serviceType ?? ""}`;
}

async function getGlobalStandardPriceMap(): Promise<Map<string, number>> {
  const itemsSnap = await getDocs(collection(db, "Items"));
  const priceMap = new Map<string, number>();

  for (const itemDoc of itemsSnap.docs) {
    const item = itemDoc.data();
    const services: any[] = item.services ?? [];

    if (services.length === 0) {
      priceMap.set(catalogEntryKey(item.name as string, null), 0);
    } else {
      for (const svc of services) {
        priceMap.set(catalogEntryKey(item.name as string, svc.name as string), svc.price ?? 0);
      }
    }
  }

  return priceMap;
}

// Applies a % discount to every catalog item, computed relative to that item's
// standard price in the global Items price list (not relative to its current price,
// so re-applying a different percentage never compounds). Items with no matching
// global item (e.g. manually added ones) are left untouched.
export async function applyCatalogDiscount(
  businessId: string,
  percentage: number
): Promise<{ updated: number; skipped: number }> {
  const clampedPct = Math.min(100, Math.max(0, percentage));

  const [catalog, standardPrices] = await Promise.all([
    getCatalog(businessId),
    getGlobalStandardPriceMap(),
  ]);

  const catalogRef = collection(db, "businesses", businessId, "catalog");
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < catalog.length; i += 499) {
    const batch = writeBatch(db);
    catalog.slice(i, i + 499).forEach((item) => {
      const standardPrice = standardPrices.get(catalogEntryKey(item.name, item.serviceType));

      if (standardPrice === undefined) {
        skipped++;
        return; // no matching global item — nothing to discount relative to
      }

      const discountedPrice = Math.round(standardPrice * (1 - clampedPct / 100) * 100) / 100;
      batch.update(doc(catalogRef, item.id), { price: discountedPrice });
      updated++;
    });
    await batch.commit();
  }

  return { updated, skipped };
}

//  duplicate: copies contact info, clones catalog, generates a NEW unique join code
export async function duplicateBusiness(sourceId: string, newName: string): Promise<string> {
  // Fetch source to copy contact info (createBusiness always makes a fresh join code)
  const sourceSnap = await getDoc(doc(db, "businesses", sourceId));
  if (!sourceSnap.exists()) throw new Error("Source business not found");
  const source = mapBusiness(sourceSnap as any);

  const newId = await createBusiness({
    name:         newName,
    contactName:  source.contactName,
    contactPhone: source.contactPhone,
    isActive:     source.isActive,
    address:      source.address,
  });

  const sourceCatalog = await getCatalog(sourceId);
  if (sourceCatalog.length === 0) return newId;

  const targetCatalogRef = collection(db, "businesses", newId, "catalog");
  for (let i = 0; i < sourceCatalog.length; i += 400) {
    const batch = writeBatch(db);
    sourceCatalog.slice(i, i + 400).forEach(({ id: _id, ...rest }) => batch.set(doc(targetCatalogRef), rest));
    await batch.commit();
  }

  return newId;
}

//  Members 

export interface BusinessMember {
  userId:    string;
  name:      string;
  email:     string;
  phone?:    string | null;
  createdAt: number;
}

export async function getBusinessMembers(businessId: string): Promise<BusinessMember[]> {
  const snap = await getDocs(
    query(collection(db, "users"), where("businessAccountId", "==", businessId))
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return { userId: d.id, name: data.name ?? "Unknown", email: data.email ?? "", phone: data.phone ?? null, createdAt: data.createdAt ?? 0 };
  });
}

export async function removeBusinessMember(userId: string): Promise<void> {
  await updateDoc(doc(db, "users", userId), { businessAccountId: null });
}

// get single business
export async function getBusinessById(businessId: string): Promise<Business | null> {
  const snap = await getDoc(doc(db, "businesses", businessId));
  if (!snap.exists()) return null;
  return mapBusiness(snap as any);
}

