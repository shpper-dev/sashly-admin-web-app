
export interface User {
    userId: string;
    name: string;
    email: string;
    isEmailVerified: boolean;
    phoneCode?: string | null;
    phone?: string | null;
    isPhoneVerified: boolean;
    profileImageUrl?: string | null;
    appLanguageCode?: string | null;
    notificationPref: NotificationPref ;
    createdAt: number;
    isDeleted?: boolean | null;
    deletedAt?: number | null;

}

//notification model : always embedded within user, never alone
export interface NotificationPref{
    userId: string;
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    whatsappEnabled: boolean;
    getOrderUpdates: boolean;
    getOffers: boolean;
    getPromotions: boolean;
    getServiceAlerts: boolean;
}

export interface UserAddress{
    id: string;
    userId: string;
    type: string;
    formattedAddress?: string | null;
    lat?: number | null;
    lng?: number | null;
    address1?: string | null;
    address2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: CustomCountry | null;
    isDefault: boolean;
    buildingName?: string | null;
    floor?: string | null;
    apartment?: string | null;
    specialLandmark?: string | null;
    createdAt: number;
}
export interface CustomCountry{
    code: string;
    en: string;
    ar: string;
    searchTerms: string[];

}

export interface DeviceToken{
    userId: string;
    deviceToken: string;
}