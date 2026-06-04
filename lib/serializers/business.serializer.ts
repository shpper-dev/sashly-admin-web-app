import { Business } from "../models/business.model";

export function serializeBusiness(business: Partial<Business>) {
  return {
    name: business.name,
    arabicName: business.arabicName,

    ownerName: business.ownerName,

    email: business.email,
    phone: business.phone,

    address: business.address ?? null,
    logoUrl: business.logoUrl ?? null,

    pricing: business.pricing?.map((item) => ({
      itemId: item.itemId,
      itemName: item.itemName,
      arabicName: item.arabicName,
      enabled: item.enabled,

      services: item.services.map((service) => ({
        serviceId: service.serviceId,
        serviceName: service.serviceName,
        price: service.price,
        enabled: service.enabled,
      })),
    })),

    rating: business.rating ?? null,
    totalOrders: business.totalOrders ?? 0,

    isDeleted: business.isDeleted ?? false,

    createdAt: business.createdAt,
    updatedAt: business.updatedAt ?? Date.now(),
  };
}