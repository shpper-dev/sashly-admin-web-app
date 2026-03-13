
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


