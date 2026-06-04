import { Order } from "../models/order.model";

export function serializeOrder(order: Partial<Order>) {
  return {
    orderNumber: order.orderNumber ?? null,
    userId: order.userId,
    userName: order.userName,
    userEmail: order.userEmail,
    userPhone: order.userPhone,

    items: order.items?.map((item) => ({
      id: item.id,
      name: item.name,
      arabicName: item.arabicName,
      categoryId: item.categoryId,
      serviceName: item.serviceName,
      serviceArabicName: item.serviceArabicName,
      servicePrice: item.servicePrice,
      count: item.count,
      photoUrl: item.photoUrl ?? null,
    })),

    totalPrice: order.totalPrice,

    latestStatus: order.latestStatus
      ? {
          status: order.latestStatus.status,
          description: order.latestStatus.description ?? null,
          createdAt: order.latestStatus.createdAt,
        }
      : undefined,

    statusHistory: order.statusHistory?.map((s) => ({
      status: s.status,
      description: s.description ?? null,
      createdAt: s.createdAt,
    })),

    isPaid: order.isPaid,
    isDelivered: order.isDelivered,
    isCancelled: order.isCancelled,

    serviceType: order.serviceType,

    pickUpStartTime: order.pickUpStartTime,
    pickUpEndTime: order.pickUpEndTime,

    pickUpAddress: order.pickUpAddress ?? null,
    deliveryAddress: order.deliveryAddress ?? null,

    expectedDeliveryTime: order.expectedDeliveryTime ?? null,
    deliveryStartTime: order.deliveryStartTime ?? null,
    deliveryEndTime: order.deliveryEndTime ?? null,

    paidBy: order.paidBy ?? null,
    paymentInfo: order.paymentInfo ?? null,
    paymentDate: order.paymentDate ?? null,

    // coupons
    discountAmount: order.discountAmount ?? null,
    appliedCoupon: order.appliedCoupon ?? null,

    // driver details
    assignedDriverId: order.assignedDriverId ?? null,
    driverName: order.driverName ?? null,
    driverPhone: order.driverPhone ?? null,
    driverProfileImageUrl: order.driverProfileImageUrl ?? null,

    driverAssignedAt: order.driverAssignedAt ?? null,
    driverAcceptedAt: order.driverAcceptedAt ?? null,

    driverEarnings: order.driverEarnings ?? null,
    platformFee: order.platformFee ?? null,
    driverFee: order.driverFee ?? null,

    driverLocation: order.driverLocation
      ? {
          latitude: order.driverLocation.latitude,
          longitude: order.driverLocation.longitude,
          timestamp: order.driverLocation.timestamp,
        }
      : null,
    
    estimatedPickupTime: order.estimatedPickupTime ?? null,
    estimatedDeliveryTime: order.estimatedDeliveryTime ?? null,
    deliveryNotes: order.deliveryNotes ?? null,
    pickupPhotoUrl: order.pickupPhotoUrl ?? null,
    deliveryPhotoUrl: order.deliveryPhotoUrl ?? null,
    customerSignatureUrl: order.customerSignatureUrl ?? null,
    driverActivePhase: order.driverActivePhase ?? null,


    ratingByUser: order.ratingByUser
      ? {
          rating: order.ratingByUser.rating,
          feedback: order.ratingByUser.feedback ?? null,
          photoUrls: order.ratingByUser.photoUrls ?? null,
        }
      : null,

    createdAt: order.createdAt,
    updatedAt: order.updatedAt ?? Date.now(),
  };
}