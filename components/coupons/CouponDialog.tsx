import { Coupon } from '@/lib/models/coupon.model';
import React, { useEffect, useState } from 'react'
import CouponFormFields, { CouponFormState, couponToForm, EMPTY_FORM, formToCoupon } from './CouponFormFields';
import { useToast } from '@/lib/providers/ToastProvider';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Loader2, X } from 'lucide-react';
import { createCoupon, updateCoupon } from '@/lib/firebase/coupon';

interface CouponDialogProps {
    children: React.ReactNode;
    mode: "add" | "edit";
    coupon?: Coupon;
    onSuccess?: () => void;

}

export default function CouponDialog({children, mode, coupon, onSuccess}: CouponDialogProps) {
  const isEdit = mode === "edit";
 
  const [open,   setOpen]   = useState(false);
  const [form,   setForm]   = useState<CouponFormState>(isEdit && coupon ? couponToForm(coupon) : EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error,  setError]  = useState<string | null>(null);
 
  const { showToast } = useToast();
 
  // Re-seed when coupon prop changes (edit only)
  useEffect(() => {
    if (isEdit && coupon) setForm(couponToForm(coupon));
  }, [coupon]);
 
  const handleClose = () => {
    setForm(isEdit && coupon ? couponToForm(coupon) : EMPTY_FORM);
    setError(null);
    setOpen(false);
  };
 
  const handleSave = async () => {
    if (!isEdit && (!form.code || !form.discountValue || !form.startDate || !form.endDate)) return;
    setLoading(true);
    setError(null);
    try {
      if (isEdit && coupon) {
        await updateCoupon(coupon.id, formToCoupon(form));
        showToast(`Coupon: ${form.code} updated successfully`, "success");
      } else {
        await createCoupon(formToCoupon(form));
        showToast(`Coupon: ${form.code} created successfully`, "success");
      }
      onSuccess?.();
      handleClose();
    } catch (e:any) {
      console.error(`${isEdit ? "Update" : "Create"} coupon failed:`, e);
      if (e.message === "Coupon code already exists") {
      setError("This coupon code already exists. Please choose a different code.");
    } else {
      setError(`Failed to ${isEdit ? "update" : "create"} coupon. Please try again.`);
    }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg rounded-2xl p-8">
        <DialogHeader className="flex flex-row items-center justify-between mb-4">
          <DialogTitle className="text-xl font-bold text-slate-700">{isEdit ? "Edit":"Create"} Coupon</DialogTitle>
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
           disabled={loading || !form.code || !form.discountValue || !form.endDate || !form.startDate}
           className="px-5 py-2 text-sm font-semibold text-white bg-linear-to-r from-cyan-500 to-blue-500 rounded-lg hover:opacity-90 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
         >
           {loading ? (
             <>
               <Loader2 size={14} className="animate-spin" />
               Saving…
             </>
           ) : (
             isEdit ? "Save Changes" : "Add Coupon"
           )}
         </button>
      </DialogContent>
    </Dialog>
  )
}
