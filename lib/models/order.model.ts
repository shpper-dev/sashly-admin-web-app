import { UserAddress } from "./user.model";

export type ServiceType = "ordinary" | "express";

export type OrderStatuses = "unpaid" | "confirmed" | "pickedUp" | "sorting" | "inProgress" | "readyToDeliver" | "delivered" | "cancelled" ;

export interface Order {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    items: OrderItem[];
    totalPrice: number;
    latestStatus: OrderStatus;
    statusHistory: OrderStatus[];
    isPaid: boolean;
    isDelivered: boolean;
    isCancelled: boolean;
    serviceType: "ordinary" | "express";
    pickUpStartTime: number;
    pickUpEndTime: number;
    pickUpAddress: UserAddress;
    deliveryAddress: UserAddress;
    expectedDeliveryTime?: number | null;
    deliveryStartTime?: number | null;
    deliveryEndTime?: number | null;
    paidBy ?: string | null;
    paymentInfo ?: string | null;
    ratingByUser ?: OrderRating | null;
    createdAt : number;
    updatedAt: number;

}

export interface OrderItem {
    id: string;
    name: string;
    arabicName: string;
    categoryId: string;
    serviceName: string;
    serviceArabicName: string;
    servicePrice: number;
    count: number;
    photoUrl?: string | null;
}
export interface OrderStatus {
    status: string;
    description?: string | null;
    createdAt: number;
}

export interface OrderRating{
    rating: number;
    feedback?: string | null;
    photoUrls?: string[] | null;
}



