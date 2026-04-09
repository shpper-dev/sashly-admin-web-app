"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { createCoupon } from "@/lib/firebase/coupon";
import CouponFormFields, { EMPTY_FORM, CouponFormState, formToCoupon } from "./CouponFormFields";
import { useToast } from "@/lib/providers/ToastProvider";

interface CreateCouponDialogProps {
  children: React.ReactNode;
  onSuccess: () => void;
}

export default function CreateCouponDialog({ children, onSuccess }: CreateCouponDialogProps) {
  const [open, setOpen]   = useState(false);
  const [form, setForm]   = useState<CouponFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  // toast
  const {showToast} = useToast();

  const handleClose = ()=>{
    setForm(EMPTY_FORM); setOpen(false);
  }

  const handleSave = async () => {
    if (!form.code || !form.discountValue || !form.startDate || !form.endDate) return;
    setSaving(true);
    try {
      await createCoupon(formToCoupon(form));
      setForm(EMPTY_FORM);
      setOpen(false);
      onSuccess();
      handleClose();
      showToast(`Coupon: ${form.code} created successfully`,"success");
    } catch (e) {
      console.error("Create coupon failed:", e);
      setError("Failed to create coupon. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg rounded-2xl p-8">
        <DialogHeader className="flex flex-row items-center justify-between mb-4">
          <DialogTitle className="text-xl font-bold text-slate-700">Create Coupon</DialogTitle>
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
          disabled={saving || !form.code || !form.discountValue}
          className="mt-6 w-full py-2.5 rounded-xl bg-[#7F50F4] hover:bg-[#6B3FD4] text-white text-sm font-semibold disabled:opacity-40 transition"
        >
          {saving ? "Creating..." : "Create Coupon"}
        </button>
      </DialogContent>
    </Dialog>
  );
}