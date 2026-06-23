import { User } from "../models/user.model";

export function serializeUser(user: Partial<User>) {
  return {
    name: user.name ?? "",
    email: user.email ?? "",

    isEmailVerified: user.isEmailVerified ?? false,
    isPhoneVerified: user.isPhoneVerified ?? false,

    phoneCode: user.phoneCode ?? null,
    phone: user.phone ?? null,

    profileImageUrl: user.profileImageUrl ?? null,
    appLanguageCode: user.appLanguageCode ?? null,

    notificationPref: user.notificationPref ?? null,

    createdAt: user.createdAt ?? Date.now(),

    businessAccountId: user.businessAccountId ?? null,

    isDeleted: user.isDeleted ?? false,
    deletedAt: user.deletedAt ?? null,
  };
}