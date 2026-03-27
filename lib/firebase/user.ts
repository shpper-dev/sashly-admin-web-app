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
  getCountFromServer,
  getDoc
} from "firebase/firestore";
import { QuerySnapshot, DocumentData } from "firebase/firestore";

import { User } from "@/lib/models/user.model";
import { db } from "./config";
import { mapUser } from "../mappers/user.mapper";
export interface UserFilters {
  isDeleted?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  appLanguageCode?: string;
}



function buildUserQuery(
  pageSize: number,
  filters: UserFilters,
  cursor?: any
) {
  const constraints: QueryConstraint[] = [
    orderBy("createdAt", "desc"),
    limit(pageSize),
  ];

  if (filters.isDeleted !== undefined) {
    constraints.push(where("isDeleted", "==", filters.isDeleted));
  }

  if (filters.isEmailVerified !== undefined) {
    constraints.push(where("isEmailVerified", "==", filters.isEmailVerified));
  }

  if (filters.isPhoneVerified !== undefined) {
    constraints.push(where("isPhoneVerified", "==", filters.isPhoneVerified));
  }

  if (filters.appLanguageCode) {
    constraints.push(where("appLanguageCode", "==", filters.appLanguageCode));
  }

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  return query(collection(db, "users"), ...constraints);
}
export async function getUsers(
  pageSize = 10,
  filters: UserFilters = {}
): Promise<{ rows: User[]; lastDoc: any }> {

  const q = buildUserQuery(pageSize, filters);
  const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
  const rows = snapshot.docs.map(mapUser);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;
  return { rows, lastDoc };
}

export async function getUsersNextPage(
  lastDoc: any,
  pageSize = 10,
  filters: UserFilters = {}
): Promise<{ rows: User[]; lastDoc: any }> {

  const q = buildUserQuery(pageSize, filters, lastDoc);

  const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);

  const rows = snapshot.docs.map(mapUser);

  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return { rows, lastDoc: newLastDoc };
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

// get singular user by id
export async function getUserById(id: string): Promise<User | null> {
  const snap = await getDoc(doc(db,"users",id));
  if(!snap.exists()) return null;
  return {id: snap.id, ...snap.data() } as unknown as User
}

export async function getUsersCount(filters: UserFilters = {}) {
  let q: any = collection(db, "users");

  if (filters.isDeleted !== undefined) {
    q = query(q, where("isDeleted", "==", filters.isDeleted));
  }

  const snap = await getCountFromServer(q);
  return snap.data().count;
}