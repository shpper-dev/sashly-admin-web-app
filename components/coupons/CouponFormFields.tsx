"use client";
import { Coupon, DiscountType } from "@/lib/models/coupon.model";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ChevronDown } from "lucide-react";

export interface CouponFormState {
  code: string;
  discountType: DiscountType;
  discountValue: string;
  minOrderValue: string;
  maxUsage: string;
  startDate: string;   // "YYYY-MM-DD" — HTML date input
  endDate: string;
  isActive: boolean;
}

export const EMPTY_FORM: CouponFormState = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderValue: "",
  maxUsage: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

// Seed form from existing coupon for edit
export function couponToForm(c: Coupon): CouponFormState {
  return {
    code:          c.code,
    discountType:  c.discountType,
    discountValue: String(c.discountValue),
    minOrderValue: c.minOrderValue != null ? String(c.minOrderValue) : "",
    maxUsage:      c.maxUsage != null ? String(c.maxUsage) : "",
    startDate:     new Date(c.startDate).toISOString().split("T")[0],
    endDate:       new Date(c.endDate).toISOString().split("T")[0],
    isActive:      c.isActive,
  };
}

// Convert form back to Coupon payload
export function formToCoupon(f: CouponFormState): Omit<Coupon, "id" | "usageCount" | "createdAt"> {
  return {
    code:          f.code.toUpperCase().trim(),
    discountType:  f.discountType,
    discountValue: Number(f.discountValue),
    minOrderValue: f.minOrderValue ? Number(f.minOrderValue) : null,
    maxUsage:      f.maxUsage ? Number(f.maxUsage) : null,
    startDate:     new Date(f.startDate).getTime(),
    endDate:       new Date(f.endDate).getTime(),
    isActive:      f.isActive,
  };
}

interface CouponFormFieldsProps {
  form: CouponFormState;
  onChange: (updated: CouponFormState) => void;
}

export default function CouponFormFields({ form, onChange }: CouponFormFieldsProps) {
  const set = (key: keyof CouponFormState, value: any) =>
    onChange({ ...form, [key]: value });

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-5">

      {/* Code */}
      <FormField label="Coupon Code" className="col-span-2">
        <input
          value={form.code}
          onChange={(e) => set("code", e.target.value.toUpperCase())}
          placeholder="e.g. SUMMER20"
          className={inputCls}
        />
      </FormField>

      {/* Discount Type */}
      <FormField label="Discount Type">
        <Select
          value={form.discountType}
          onValueChange={(v) => set("discountType", v as DiscountType)}
        >
          <SelectTrigger className={`${inputCls} flex items-center justify-between`}>
            <SelectValue placeholder="Select type" />
            
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage (%)</SelectItem>
            <SelectItem value="fixed">Fixed (SAR)</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      {/* Discount Value */}
      <FormField label={form.discountType === "percentage" ? "Discount (%)" : "Discount (SAR)"}>
        <input
          type="number"
          value={form.discountValue}
          onChange={(e) => set("discountValue", e.target.value)}
          placeholder={form.discountType === "percentage" ? "e.g. 20" : "e.g. 50"}
          min="0"
          className={inputCls}
        />
      </FormField>

      {/* Min Order Value */}
      <FormField label="Min Order Value (SAR)" hint="Leave empty for no minimum">
        <input
          type="number"
          value={form.minOrderValue}
          onChange={(e) => set("minOrderValue", e.target.value)}
          placeholder="e.g. 100"
          min="0"
          className={inputCls}
        />
      </FormField>

      {/* Max Usage */}
      <FormField label="Max Usage" hint="Leave empty for unlimited">
        <input
          type="number"
          value={form.maxUsage}
          onChange={(e) => set("maxUsage", e.target.value)}
          placeholder="e.g. 100"
          min="1"
          className={inputCls}
        />
      </FormField>

      {/* Start Date */}
      <FormField label="Start Date">
        <input
          type="date"
          value={form.startDate}
          onChange={(e) => set("startDate", e.target.value)}
          className={inputCls}
        />
      </FormField>

      {/* End Date */}
      <FormField label="End Date">
        <input
          type="date"
          value={form.endDate}
          onChange={(e) => set("endDate", e.target.value)}
          className={inputCls}
        />
      </FormField>

      {/* Active toggle */}
      <FormField label="Status" className="col-span-2">
        <button
          type="button"
          onClick={() => set("isActive", !form.isActive)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all w-full ${
            form.isActive
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-slate-50 border-slate-200 text-slate-500"
          }`}
        >
          <div className={`w-8 h-4 rounded-full relative transition-colors ${form.isActive ? "bg-[#7F50F4]" : "bg-slate-300"}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${form.isActive ? "left-4" : "left-0.5"}`} />
          </div>
          {form.isActive ? "Active" : "Inactive"}
        </button>
      </FormField>

    </div>
  );
}

// helpers
const inputCls = "w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7F50F4]";

function FormField({ label, hint, children, className }: {
  label: string; hint?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{label}</label>
      {children}
      {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
    </div>
  );
}