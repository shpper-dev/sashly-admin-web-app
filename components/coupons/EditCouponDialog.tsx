"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { updateCoupon } from "@/lib/firebase/coupon";
import { Coupon } from "@/lib/models/coupon.model";
import CouponFormFields, { CouponFormState, couponToForm, EMPTY_FORM, formToCoupon } from "./CouponFormFields";
import { useToast } from "@/lib/providers/ToastProvider";

interface EditCouponDialogProps {
  children: React.ReactNode;
  coupon: Coupon;
  onSuccess: () => void;
}

export default function EditCouponDialog({ children, coupon, onSuccess }: EditCouponDialogProps) {
  const [open, setOpen]     = useState(false);
  const [form, setForm]     = useState<CouponFormState>(couponToForm(coupon));
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  // toast
  const {showToast} = useToast();

  // Re-seed when coupon prop changes
  useEffect(() => { setForm(couponToForm(coupon)); }, [coupon]);
  const handleClose = ()=>{
    setForm(couponToForm(coupon)); setOpen(false);
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCoupon(coupon.id, formToCoupon(form));
      setOpen(false);
      onSuccess();
      handleClose();
      showToast(`Coupon: ${form.code} updated successfully`,"success");
      
    } catch (e) {
      console.error("Update coupon failed:", e);
      setError("Failed to update coupon. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg rounded-2xl p-8">
        <DialogHeader className="flex flex-row items-center justify-between mb-4">
          <DialogTitle className="text-xl font-bold text-slate-700">Edit Coupon</DialogTitle>
          <DialogClose><X className="w-5 h-5 text-slate-400 cursor-pointer" /></DialogClose>
        </DialogHeader>
        {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}
        <CouponFormFields form={form} onChange={setForm} />

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full py-2.5 rounded-xl bg-[#7F50F4] hover:bg-[#6B3FD4] text-white text-sm font-semibold disabled:opacity-40 transition"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </DialogContent>
    </Dialog>
  );
}