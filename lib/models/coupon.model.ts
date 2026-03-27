export type DiscountType = "percentage" | "fixed";

export interface Coupon {
  id: string;
  code: string;                    // e.g. "SUMMER20" — unique
  discountType: DiscountType;
  discountValue: number;           
  minOrderValue?: number | null;   
  maxUsage?: number | null;        // null = unlimited - total uses globally
  usageCount: number;
  startDate: number;               // ms timestamp
  endDate: number;                 // ms timestamp
  isActive: boolean;
  createdAt: number;
}

// coupon usage to track per person usage
interface CouponUsage {
  id: string;
  userId: string;
  couponId: string;
  orderId: string;
  createdAt: number;
}