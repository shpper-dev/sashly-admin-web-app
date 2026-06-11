export type NotificationType = "new_order" | "order_pickedUp" | "order_disputed" | "new_business" | "broadcast";
export type DeepLinkType = "orders" | "business-accounts" | "none" ;

export interface Notification {
    id: string;
    title: string;
    body: string;
    type: NotificationType;
    deepLink?: DeepLinkType | null;
    priority: "urgent" | "normal";
    isRead: boolean;
    readAt?: number | null;
    createdAt: number;
}