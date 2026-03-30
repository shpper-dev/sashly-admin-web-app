import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Coupon } from "../models/coupon.model";

export function mapCoupon(doc: QueryDocumentSnapshot<DocumentData>): Coupon {
  const data = doc.data();

  if (!data) {
    throw new Error(`Coupon document ${doc.id} is empty.`);
  }

  return {
    id: doc.id,
    code: data.code ?? "",
    discountType: data.discountType ?? "percentage",
    discountValue: data.discountValue ?? 0,

    minOrderValue: data.minOrderValue ?? null,
    maxUsage: data.maxUsage ?? null,
    usageCount: data.usageCount ?? 0,

    startDate:
      data.startDate?.toMillis?.() ??
      data.startDate ??
      0,

    endDate:
      data.endDate?.toMillis?.() ??
      data.endDate ??
      0,

    isActive: data.isActive ?? true,

    createdAt:
      data.createdAt?.toMillis?.() ??
      data.createdAt ??
      0,
  };
}