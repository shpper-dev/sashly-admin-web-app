import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import {
  Business,
  ItemPricing,
  ItemServicePrice,
} from "../models/business.model";

export function mapBusiness(doc: QueryDocumentSnapshot<DocumentData>): Business {
  const data = doc.data();

  if (!data) {
    throw new Error(`Business document ${doc.id} is empty`);
  }

  const mapServicePrice = (service: any): ItemServicePrice => ({
    serviceId: service?.serviceId ?? "",
    serviceName: service?.serviceName ?? "",
    price: service?.price ?? 0,
    enabled: service?.enabled ?? false,
  });

  const mapItemPricing = (item: any): ItemPricing => ({
    itemId: item?.itemId ?? "",
    itemName: item?.itemName ?? "",
    arabicName: item?.arabicName ?? "",
    enabled: item?.enabled ?? false,

    services: Array.isArray(item?.services)
      ? item.services.map(mapServicePrice)
      : [],
  });

  return {
    id: doc.id,

    name: data.name ?? "",
    arabicName: data.arabicName ?? "",

    ownerName: data.ownerName ?? "",

    email: data.email ?? "",
    phone: data.phone ?? "",

    address: data.address ?? null,
    logoUrl: data.logoUrl ?? null,

    pricing: Array.isArray(data.pricing)
      ? data.pricing.map(mapItemPricing)
      : [],

    rating: data.rating ?? null,
    totalOrders: data.totalOrders ?? 0,

    isDeleted: data.isDeleted ?? false,

    createdAt:
      data.createdAt?.toMillis?.() ??
      data.createdAt ??
      0,

    updatedAt:
      data.updatedAt?.toMillis?.() ??
      data.updatedAt ??
      0,
  };
}