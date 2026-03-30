import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { User } from "../models/user.model";

export function mapUser(doc: QueryDocumentSnapshot<DocumentData>): User {
  const data = doc.data();

  if (!data) {
    throw new Error(`User document ${doc.id} is empty`);
  }

  return {
    userId: doc.id,

    name: data.name ?? "",
    email: data.email ?? "",

    isEmailVerified: data.isEmailVerified ?? false,
    isPhoneVerified: data.isPhoneVerified ?? false,

    phoneCode: data.phoneCode ?? null,
    phone: data.phone ?? null,

    profileImageUrl: data.profileImageUrl ?? null,
    appLanguageCode: data.appLanguageCode ?? null,

    notificationPref: data.notificationPref ?? undefined,

    createdAt: data.createdAt?.toMillis?.() ?? data.createdAt ?? 0,

    isDeleted: data.isDeleted ?? false,
    deletedAt: data.deletedAt ?? null,
  };
}