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

import { Business } from "../models/business.model";
import { mapBusiness } from "../mappers/business.mapper";
import { serializeBusiness } from "../serializers/business.serializer";

// get all businesses
export async function getBusinesses(): Promise<Business[]> {
  const q = query(
    collection(db, "businesses"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(mapBusiness);
}

// add new business
export async function createBusiness(
  data: Partial<Business>
): Promise<string> {
  const docRef = await addDoc(
    collection(db, "businesses"),
    serializeBusiness({
      ...data,
      createdAt: Date.now(),
    })
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

  await updateDoc(
    businessRef,
    serializeBusiness({
      ...data,
    })
  );
}

// soft delete business
// export async function blockBusiness(
//   businessId: string
// ): Promise<void> {
//   await updateDoc(
//     doc(db, "businesses", businessId),
//     {
//       isDeleted: true,
//       updatedAt: Date.now(),
//     }
//   );
// }

// // restore business
// export async function restoreBusiness(
//   businessId: string
// ): Promise<void> {
//   await updateDoc(
//     doc(db, "businesses", businessId),
//     {
//       isDeleted: false,
//       updatedAt: Date.now(),
//     }
//   );
// }