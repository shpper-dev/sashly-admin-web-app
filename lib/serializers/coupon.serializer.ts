
import { Coupon } from "../models/coupon.model";
export function serializeCoupon(coupon: Partial<Coupon>) {
  return {
    code: coupon.code ?? "",
    discountType: coupon.discountType ?? "percentage",
    discountValue: coupon.discountValue ?? 0,

    minOrderValue: coupon.minOrderValue ?? null,
    maxUsage: coupon.maxUsage ?? null,
    usageCount: coupon.usageCount ?? 0,

    startDate: coupon.startDate ?? 0,
    endDate: coupon.endDate ?? 0,
    
    isAppPromotion: coupon.isAppPromotion ?? false,
    isActive: coupon.isActive ?? true,
    createdAt: coupon.createdAt ?? Date.now(),
  };
}