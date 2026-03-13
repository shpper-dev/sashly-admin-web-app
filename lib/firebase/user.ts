import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  where,
  QueryConstraint,
  updateDoc,
  doc,
  Query,
  getCountFromServer
} from "firebase/firestore";


import { User } from "@/lib/models/user.model";
import { db } from "./config";

export interface UserFilters {
  isDeleted?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  appLanguageCode?: string;
}

export async function getUsers(pageSize = 20, filters: UserFilters = {}): Promise<{ rows: User[]; lastDoc: any }> {
  const constraints: QueryConstraint[] = [];

  if (filters.isDeleted === true) {
    constraints.push(where("isDeleted", "==", true));
  } else if (filters.isDeleted === false) {
    // "Active" — explicitly not deleted
    constraints.push(where("isDeleted", "==", false));
  }
 
  constraints.push(orderBy("createdAt", "desc"), limit(pageSize));

  const q = query(collection(db, "users"), ...constraints);
  const snapshot = await getDocs(q);
  const rows = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as unknown as User));
  return { rows, lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null };
}

export async function getUsersNextPage(lastDoc: any, pageSize = 20, filters: UserFilters = {}): Promise<{ rows: User[]; lastDoc: any }> {
  const constraints: QueryConstraint[] = [];

  if (filters.isDeleted === true) {
    constraints.push(where("isDeleted", "==", true));
  } else if (filters.isDeleted === false) {
    constraints.push(where("isDeleted", "==", false));
  }

  constraints.push(orderBy("createdAt", "desc"), startAfter(lastDoc), limit(pageSize));

  const q = query(collection(db, "users"), ...constraints);
  const snapshot = await getDocs(q);
  const rows = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as unknown as User));
  return { rows, lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null };
}
// to get just the total count
export async function getUsersTotalCount(): Promise<number> {
  const snap = await getCountFromServer(collection(db, "Users"));
  return snap.data().count;
}

export async function updateUser(userId: string, updates: Partial<{
  name: string;
  phoneCode: string | null;
  phone: string | null;
  profileImageUrl: string | null;
  appLanguageCode: string | null;
  isDeleted: boolean;
  deletedAt: number | null;
  notificationPref: {
    userId: string;
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    whatsappEnabled: boolean;
    getOrderUpdates: boolean;
    getOffers: boolean;
    getPromotions: boolean;
    getServiceAlerts: boolean;
  };
}>) {
  await updateDoc(doc(db, "users", userId), updates);
}

// Soft-delete a user
export async function softDeleteUser(userId: string) {
  await updateDoc(doc(db, "users", userId), {
    isDeleted: true,
    deletedAt: Date.now(),
  });
}

// Restore a deleted user
export async function restoreUser(userId: string) {
  await updateDoc(doc(db, "users", userId), {
    isDeleted: false,
    deletedAt: null,
  });
}