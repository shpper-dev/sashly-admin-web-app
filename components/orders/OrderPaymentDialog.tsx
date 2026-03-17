"use client";
import {
  Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useState } from "react";
import { confirmOrderPayment } from "@/lib/firebase/order";

interface OrderPaymentDialogProps {
  children: React.ReactNode;
  total: number;
  orderId: string;
  isPaid: boolean;
  onSuccess?: () => void;
}

type PayMethod = "cash" | "card" | "wallet";

export default function OrderPaymentDialog({ children, total, orderId, isPaid, onSuccess }: OrderPaymentDialogProps) {
  const [open, setOpen]         = useState(false);
  const [saving, setSaving]     = useState(false);
  const [completed, setCompleted] = useState(false);

  const handlePay = async (method: PayMethod) => {
    if (!completed) return; // order completed checkbox must be checked
    setSaving(true);
    try {
      await confirmOrderPayment(orderId, method);
      setOpen(false);
      onSuccess?.();
    } catch (e) {
      console.error("Payment failed:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-180 rounded-2xl p-8">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-3xl font-bold text-slate-700">Payment</DialogTitle>
          <DialogClose>
            <X className="w-5 h-5 text-slate-400 cursor-pointer" />
          </DialogClose>
        </DialogHeader>

        <div className="space-y-6">
          {isPaid ? (
            // Already paid — read only
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-bold text-[#02D0FF]">SAR {total.toFixed(2)}</h2>
              <div className="flex items-center gap-2 px-5 py-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-green-700 font-semibold text-sm">✓ This order has already been paid</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-[#02D0FF]">SAR {total.toFixed(2)}</h2>

              {/* Order completed checkbox — must be checked before payment */}
              <div className="flex justify-between items-center py-3 px-5 border border-slate-300/50 rounded-lg">
                <span>Payment Received</span>
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                  className="h-5 w-5 accent-green-700"
                />
              </div>

              {/* Payment method buttons */}
              <div className="grid grid-cols-2 gap-2">
                {(["cash", "card", "wallet"] as PayMethod[]).map((method) => (
                  <button
                    key={method}
                    onClick={() => handlePay(method)}
                    disabled={!completed || saving}
                    className="px-2 py-3 text-xl font-semibold border border-blue-500/30 rounded-lg text-[#02D0FF] hover:bg-blue-100 focus:bg-blue-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed capitalize transition-colors"
                  >
                    {saving ? "..." : method.charAt(0).toUpperCase() + method.slice(1)}
                  </button>
                ))}

                {/* Unpaid — just closes without updating */}
                <button
                  onClick={() => setOpen(false)}
                  className="px-2 py-3 text-xl font-semibold border border-slate-300/50 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Unpaid
                </button>
              </div>

              {!completed && (
                <p className="text-xs text-amber-500 text-center">
                  Check "Payment Received" before selecting a payment method
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}