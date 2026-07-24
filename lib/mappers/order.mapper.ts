import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Order, OrderItem, OrderStatus, OrderRating } from "../models/order.model";

export function mapOrder(doc: QueryDocumentSnapshot<DocumentData>): Order {
  const data = doc.data();

  if (!data) {
    throw new Error(`Order document ${doc.id} is empty`);
  }

  const mapStatus = (s: any): OrderStatus => ({
    status: s?.status ?? "unpaid",
    description: s?.description ?? null,
    createdAt: s?.createdAt ?? 0,
  });

  const mapItem = (item: any): OrderItem => ({
    id: item?.id ?? "",
    name: item?.name ?? "",
    arabicName: item?.arabicName ?? "",
    categoryId: item?.categoryId ?? "",
    serviceName: item?.serviceName ?? "",
    serviceArabicName: item?.serviceArabicName ?? "",
    servicePrice: item?.servicePrice ?? 0,
    count: item?.count ?? 0,
    photoUrl: item?.photoUrl ?? null,
  });

  const mapRating = (r: any): OrderRating => ({
    rating: r?.rating ?? 0,
    feedback: r?.feedback ?? null,
    photoUrls: Array.isArray(r?.photoUrls) ? r.photoUrls : null,
});

  const mapDriverLocation = (loc: any) => ({
  latitude: loc?.latitude ?? 0,
  longitude: loc?.longitude ?? 0,
  timestamp: loc?.timestamp ?? 0,
});
  

  return {
    id: doc.id,
    orderNumber: data.orderNumber ?? null,
    
    userId: data.userId ?? "",
    userName: data.userName ?? "",
    userEmail: data.userEmail ?? "",
    userPhone: data.userPhone ?? "",

    items: Array.isArray(data.items) ? data.items.map(mapItem) : [],

    totalPrice: data.totalPrice ?? 0,

    latestStatus: mapStatus(data.latestStatus),

    statusHistory: Array.isArray(data.statusHistory)
      ? data.statusHistory.map(mapStatus)
      : [],

    isPaid: data.isPaid ?? false,
    isDelivered: data.isDelivered ?? false,
    isCancelled: data.isCancelled ?? false,

    serviceType: data.serviceType ?? "ordinary",

    pickUpStartTime: data.pickUpStartTime ?? 0,
    pickUpEndTime: data.pickUpEndTime ?? 0,

    pickUpAddress: data.pickUpAddress ?? null,
    deliveryAddress: data.deliveryAddress ?? null,

    expectedDeliveryTime: data.expectedDeliveryTime ?? null,

    deliveryStartTime: data.deliveryStartTime?.toMillis?.() ?? data.deliveryStartTime ?? null,
    deliveryEndTime: data.deliveryEndTime?.toMillis?.() ?? data.deliveryEndTime ?? null,

    paidBy: data.paidBy ?? null,
    paymentInfo: data.paymentInfo ?? null,
    paymentDate: data.paymentDate ?? null,

    // coupons
    discountAmount: data.discountAmount ?? null,
    appliedCoupon: data.appliedCoupon ?? null,

    // driver details
    assignedDriverId: data.assignedDriverId ?? null,
    driverName: data.driverName ?? null,
    driverPhone: data.driverPhone ?? null,
    driverProfileImageUrl: data.driverProfileImageUrl ?? null,

    driverAssignedAt: data.driverAssignedAt?.toMillis?.() ?? data.driverAssignedAt ?? null,
    driverAcceptedAt: data.driverAcceptedAt?.toMillis?.() ?? data.driverAcceptedAt ?? null,

    driverEarnings: data.driverEarnings ?? null,
    platformFee: data.platformFee ?? null,
    driverFee: data.driverFee ?? null,

    driverLocation: data.driverLocation
      ? mapDriverLocation(data.driverLocation)
      : null,
    estimatedPickupTime: data.estimatedPickupTime ?? null,
    estimatedDeliveryTime: data.estimatedDeliveryTime ?? null,
    deliveryNotes: data.deliveryNotes ?? null,
    pickupPhotoUrl: data.pickupPhotoUrl ?? null,
    deliveryPhotoUrl: data.deliveryPhotoUrl ?? null,
    customerSignatureUrl: data.customerSignatureUrl ?? null,
    driverActivePhase: data.driverActivePhase ?? null,

    // dispute details
    hasOpenDispute: data.hasOpenDispute ?? false,
    disputeId: data.disputeId ?? "",
    disputeStatus: data.disputeStatus ?? null,
    disputeIssueType: data.disputeIssueType ?? null,
    lastDisputeAt: data.lastDisputeAt?.toMillis?.() ?? data.lastDisputeAt ?? 0,

    businessAccountId: data.businessAccountId ?? null,

    // operational flags
    needsManualAssignment: data.needsManualAssignment ?? null,
    needsSorting: data.needsSorting ?? null,

    // financial breakdown recorded at checkout — see Order model comments
    preDiscountTotal: data.preDiscountTotal ?? null,
    walletAmountUsed: data.walletAmountUsed ?? null,
    remainingAmountToPay: data.remainingAmountToPay ?? null,

    ratingByUser: data.ratingByUser ? mapRating(data.ratingByUser) : null,

    createdAt: data.createdAt?.toMillis?.() ?? data.createdAt ?? 0,
    updatedAt: data.updatedAt?.toMillis?.() ?? data.updatedAt ?? 0,
  };
}
