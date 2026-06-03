import { Business } from "../models/business.model";

import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config";


// get all businesses
export async function getBusinesses(): Promise<Business[]> {
  const q = query(
    collection(db, "businesses"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Business, "id">),
  }));
}

// add new business
export async function createBusiness(data: Partial<Business>): Promise<string> {
  const docRef = await addDoc(
    collection(db, "businesses"),
    {
      name: data.name ?? "",
      arabicName: data.arabicName ?? "",
      ownerName: data.ownerName ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",

      pricing: data.pricing ?? [],

      address: data.address ?? null,
      logoUrl: data.logoUrl ?? null,

      rating: 0,
      totalOrders: 0,

      isDeleted: false,

      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  );

  return docRef.id;
}

// edit business
export async function updateBusiness(
  businessId: string,
  data: Partial<Business>
): Promise<void> {
  const businessRef = doc(
    db,
    "businesses",
    businessId
  );

  const payload: Record<string, any> = {
    updatedAt: Date.now(),
  };

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      payload[key] = value;
    }
  });

  await updateDoc(businessRef, payload);
}

// soft delete business
export async function blockBusiness(businessId: string): Promise<void> {
  await updateDoc(
    doc(db, "businesses", businessId),
    {
      isDeleted: true,
      updatedAt: Date.now(),
    }
  );
}

// restore business
export async function restoreBusiness(businessId: string): Promise<void> {
  await updateDoc(
    doc(db, "businesses", businessId),
    {
      isDeleted: false,
      updatedAt: Date.now(),
    }
  );
}