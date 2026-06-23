import { Coupon } from "./coupon.model";
import { DisputeIssueType, DisputeStatus } from "./dispute.model";
import { UserAddress } from "./user.model";

export type ServiceType = "ordinary" | "express";

export type OrderStatuses = "confirmed" |"pickedUp" |"sorting" |"detailing" |"cleaning" |"readyToDeliver" | "delivered" | "cancelled" | "disputed" | "disputeResolved" ;

export interface Order {
    id: string;
    orderNumber?: string | null;

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
    serviceType: ServiceType;
    pickUpStartTime: number;
    pickUpEndTime: number;
    pickUpAddress: UserAddress;
    deliveryAddress: UserAddress;
    expectedDeliveryTime?: number | null;
    deliveryStartTime?: number | null;
    deliveryEndTime?: number | null;
    paidBy ?: string | null;
    paymentInfo ?: any | null;
    paymentDate ?: number | null;
    
    // coupons
    discountAmount?: number | null;
    appliedCoupon?: Coupon | null;

    // driver details
    assignedDriverId?: string | null;
    driverName?: string | null;
    driverPhone?: string | null;
    driverProfileImageUrl?: string | null;
    driverAssignedAt?: number | null;   // milliseconds
    driverAcceptedAt?: number | null;   // milliseconds

    // earnings
    driverEarnings?: number | null;
    platformFee?: number | null;
    driverFee?: number | null;

    // driver tracking
    driverLocation?: DriverLocation | null;
    estimatedPickupTime?: number| null;
    estimatedDeliveryTime?: number | null;
    deliveryNotes?:string   | null;
    pickupPhotoUrl?: string | null;
    deliveryPhotoUrl?: string | null;
    customerSignatureUrl?: string | null;
    driverActivePhase?: "headingToPickup" | "headingToDelivery" |  null;

    // dispute details
    hasOpenDispute?: boolean | null;
    disputeId?: string | null;
    disputeStatus?: DisputeStatus | null;
    disputeIssueType?: DisputeIssueType | null;
    lastDisputeAt?: number | null;

    businessAccountId?: string | null;

    ratingByUser ?: OrderRating | null;
    createdAt : number;
    updatedAt: number;

}

export interface DriverLocation  {
       latitude: number;
       longitude: number;
       timestamp: number; // milliseconds
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



