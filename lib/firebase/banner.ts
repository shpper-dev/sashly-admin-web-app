import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./config";
import { mapBanner } from "../mappers/banner.mapper";
import { Banner } from "../models/banner.model";
import { serializeBanner } from "../serializers/banner.serializer";

// fetch existing
export async function getBanners() {
    const snapshot = await getDocs(collection(db,"banners"));
    return snapshot.docs.map(mapBanner);
}

// create new
export async function createBanner(data: Omit<Banner, "id" | "createdAt">):Promise<string> {
  const docRef = await addDoc(
    collection(db, "banners"),
    serializeBanner({
      ...data,
      createdAt: serverTimestamp() as any,
    })
  );

  return docRef.id;
}

// update existing
export async function updateBanner(
  bannerId: string,
  data: Partial<Banner>
): Promise<void> {
  const bannerRef = doc(
    db,
    "banners",
    bannerId
  );

  await updateDoc(
    bannerRef,
    serializeBanner({
      ...data,
    })
  );
}

// delete existing
export async function deleteBanner(id: string): Promise<void> {
  await deleteDoc(doc(db, "banners", id));
}

// Real-time subscription — ordered by sortOrder so the list reflects
// the intended display sequence without any composite index
// export function subscribeToBanners(callback: (banners: Banner[]) => void): () => void {
//   const q = query(collection(db, "banners"), orderBy("sortOrder", "asc"));
//   return onSnapshot(q, (snap) => {
//     callback(snap.docs.map(mapBanner));
//   });
// }