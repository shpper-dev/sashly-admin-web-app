"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";

interface DeleteCouponDialogProps {
  children: React.ReactNode;
  couponCode: string;
  onConfirm: () => Promise<void> | void;
  onSuccess?: () => void;
}

export default function DeleteCouponDialog({
  children,
  couponCode,
  onConfirm,
  onSuccess,
}: DeleteCouponDialogProps) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onSuccess?.();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="bg-white border-0 rounded-2xl px-8 py-5 max-w-sm! text-center shadow-xl">

        <DialogTitle className="sr-only">Delete Coupon</DialogTitle>

        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-2">
          <TriangleAlert className="w-7 h-7 text-red-500" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-slate-800">Delete Coupon</h2>

        {/* Description */}
        <p className="text-slate-400 mt-1.5 text-sm leading-relaxed">
          Are you sure you want to delete this coupon?<br />
          This action cannot be undone.
        </p>

        {/* Coupon box */}
        <div className="mt-4 bg-slate-100 rounded-xl py-3">
          <p className="text-xs text-slate-400 tracking-wider mb-0.5 uppercase">
            Coupon to delete
          </p>
          <p className="text-base font-bold text-slate-800">{couponCode}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}