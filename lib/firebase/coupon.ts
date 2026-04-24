import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, query, orderBy, where,
  runTransaction
} from "firebase/firestore";
import { db } from "./config";
import { Coupon } from "@/lib/models/coupon.model";
import { mapCoupon } from "../mappers/coupon.mapper";

// Fetch (currently not utilising the server side filtering so activeOnly is always false)
export async function getCoupons(activeOnly = false): Promise<Coupon[]> {
  const constraints = activeOnly
    ? [where("isActive", "==", true), orderBy("createdAt", "desc")]
    : [orderBy("createdAt", "desc")];

  const q = query(collection(db, "coupons"), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapCoupon);
}

// Create 

export async function createCoupon(
  data: Omit<Coupon, "id" | "usageCount" | "createdAt">
) {
  const code = data.code.toUpperCase().trim();
  const ref = doc(db, "coupons", code);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);

    if (snap.exists()) {
      throw new Error("Coupon code already exists");
    }

    transaction.set(ref, {
      ...data,
      code,
      usageCount: 0,
      createdAt: Date.now(),
    });
  });
}

// Update 
export async function updateCoupon(
  id: string,
  data: Partial<Omit<Coupon, "id" | "usageCount" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "coupons", id), {
    ...data,
    ...(data.code && { code: data.code.toUpperCase().trim() }),
  });
}

// Deactivate (soft delete) - for future 
export async function deactivateCoupon(id: string): Promise<void> {
  await updateDoc(doc(db, "coupons", id), { isActive: false });
}

// Hard delete
export async function deleteCoupon(id: string): Promise<void> {
  await deleteDoc(doc(db, "coupons", id));
}