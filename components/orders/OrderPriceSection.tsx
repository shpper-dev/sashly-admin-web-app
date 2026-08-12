"use client";
import { updateOrderPrice } from "@/lib/firebase/order";
import { createMessage } from "@/lib/firebase/message";
import { getCurrentUser } from "@/lib/firebase/admin.auth";
import { Order } from "@/lib/models/order.model";
import { useToast } from "@/lib/providers/ToastProvider";
import { ChevronDown, ChevronUp, Pencil, Tag, Wallet, PackageOpen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface OrderPriceSectionProps {
  order: Order;
  onSuccess?: () => void;
}

export function OrderPriceSection({ order, onSuccess }: OrderPriceSectionProps) {
  const [expanded, setExpanded]   = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [reason, setReason]       = useState("");
  const { showToast } = useToast();

  // Live subtotal from the CURRENT items array.
  const itemsSubtotal = useMemo(
    () => order.items.reduce((sum, item) => sum + item.servicePrice * item.count, 0),
    [order.items]
  );

  const discount   = order.discountAmount ?? 0;
  const walletUsed = order.walletAmountUsed ?? 0;
  const couponCode = order.appliedCoupon?.code;

  const basisAtCheckout = order.preDiscountTotal ?? itemsSubtotal;
  const itemsEditedSinceCheckout = Math.abs(itemsSubtotal - basisAtCheckout) > 0.001;
  const itemsDelta = itemsSubtotal - basisAtCheckout;

  const expectedAtCheckout = basisAtCheckout - discount - walletUsed;

  const manualAdjustment = order.totalPrice - expectedAtCheckout - itemsDelta;
  const hasManualAdjustment = Math.abs(manualAdjustment) > 0.001;

  const [adjustmentInput, setAdjustmentInput] = useState(manualAdjustment);

  useEffect(() => {
    if (!adjusting) setAdjustmentInput(manualAdjustment);
  }, [manualAdjustment, adjusting]);

  const previewTotal = expectedAtCheckout + itemsDelta + adjustmentInput;

  const showRemainingBalance = !order.isPaid && order.remainingAmountToPay != null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateOrderPrice(order.id, previewTotal);

      if (reason.trim()) {
        const admin = await getCurrentUser();
        await createMessage({
          orderId: order.id,
          text: `Price adjusted from SAR ${order.totalPrice.toFixed(2)} to SAR ${previewTotal.toFixed(2)}. Reason: ${reason.trim()}`,
          role: "system",
          senderId: admin?.uid,
          photoUrl: null,
          readByAdmin: true,
          readByUser: false,
        });
      }

      onSuccess?.();
      setSaved(true);
      setReason("");
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      showToast(`Error adjusting price for ${order.id.slice(-6)}`, "error");
    } finally {
      setAdjusting(false);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setAdjustmentInput(manualAdjustment);
    setReason("");
    setAdjusting(false);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Summary Row */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Final Amount</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">SAR {order.totalPrice.toFixed(2)}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${order.isPaid ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
              {order.isPaid ? "PAID" : "UNPAID"}
            </span>
          </div>
        </div>
        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
        >
          {expanded ? "Hide breakdown" : "View breakdown"}
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {expanded && (
        <div className="p-4 bg-white space-y-3 border-b border-slate-100">
          {!adjusting ? (
            /* READ ONLY VIEW */
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>
                  Items Subtotal{order.preDiscountTotal != null ? " (at Checkout)" : ""} ({order.items.length} item{order.items.length !== 1 ? "s" : ""})
                </span>
                <span className="font-medium">SAR {basisAtCheckout.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Tag size={11} /> Discount{couponCode ? ` (${couponCode})` : ""}
                  </span>
                  <span className="font-medium">− SAR {discount.toFixed(2)}</span>
                </div>
              )}

              {walletUsed > 0 && (
                <div className="flex justify-between text-xs text-cyan-600">
                  <span className="flex items-center gap-1">
                    <Wallet size={11} /> Wallet Credit Used (at Checkout)
                  </span>
                  <span className="font-medium">− SAR {walletUsed.toFixed(2)}</span>
                </div>
              )}

              {itemsEditedSinceCheckout && (
                <div className={`flex justify-between text-xs ${itemsDelta > 0 ? "text-slate-600" : "text-emerald-600"}`}>
                  <span className="flex items-center gap-1">
                    <PackageOpen size={11} /> Items Changed Since Checkout
                  </span>
                  <span className="font-medium">
                    {itemsDelta > 0 ? "+ " : "− "}SAR {Math.abs(itemsDelta).toFixed(2)}
                  </span>
                </div>
              )}

              {hasManualAdjustment && (
                <div className={`flex justify-between text-xs ${manualAdjustment > 0 ? "text-slate-600" : "text-emerald-600"}`}>
                  <span>Manual Adjustment</span>
                  <span className="font-medium">
                    {manualAdjustment > 0 ? "+ " : "− "}SAR {Math.abs(manualAdjustment).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-xs text-slate-800 font-bold pt-2 border-t border-slate-100">
                <span>Final Total</span>
                <span>SAR {order.totalPrice.toFixed(2)}</span>
              </div>

              {showRemainingBalance && (
                <div className="flex justify-between text-xs text-amber-600 pt-1">
                  <span>Balance Due (Cash/Card on Delivery)</span>
                  <span className="font-medium">SAR {order.remainingAmountToPay!.toFixed(2)}</span>
                </div>
              )}

              {!order.isPaid && (
                <button
                  onClick={() => setAdjusting(true)}
                  className="w-full mt-2 py-1.5 border border-dashed border-slate-200 rounded-lg text-[10px] font-bold text-[#02d0ff] hover:bg-cyan-50 transition-colors flex items-center justify-center gap-1"
                >
                  <Pencil size={10} /> ADJUST TOTAL
                </button>
              )}
            </div>
          ) : (
            /* EDITABLE VIEW */
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Items Subtotal{order.preDiscountTotal != null ? " (at Checkout)" : ""}</span>
                <span>SAR {basisAtCheckout.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>Discount{couponCode ? ` (${couponCode})` : ""}</span>
                  <span>− SAR {discount.toFixed(2)}</span>
                </div>
              )}

              {walletUsed > 0 && (
                <div className="flex justify-between text-xs text-cyan-600">
                  <span>Wallet Credit Used</span>
                  <span>− SAR {walletUsed.toFixed(2)}</span>
                </div>
              )}

              {itemsEditedSinceCheckout && (
                <div className={`flex justify-between text-xs ${itemsDelta > 0 ? "text-slate-500" : "text-emerald-600"}`}>
                  <span>Items Changed Since Checkout</span>
                  <span>{itemsDelta > 0 ? "+ " : "− "}SAR {Math.abs(itemsDelta).toFixed(2)}</span>
                </div>
              )}

              <PriceInput
                label="Manual Adjustment (+/-)"
                value={adjustmentInput}
                onChange={setAdjustmentInput}
              />

              <div className="flex justify-between text-xs font-bold text-slate-800 pt-2 border-t border-slate-100">
                <span>New Total</span>
                <span>SAR {previewTotal.toFixed(2)}</span>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Reason for adjustment *</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Waived express fee due to delay"
                  className="resize-none w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 focus:ring-2 focus:ring-indigo-200 outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button onClick={handleCancel} className="flex-1 h-8 rounded-lg border border-slate-200 text-xs font-semibold text-slate-500">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!reason.trim() || saving}
                  className="flex-1 h-8 rounded-lg bg-[#02d0ff] text-white text-xs font-semibold disabled:opacity-40"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Status */}
      <div className="px-4 py-2 bg-slate-50 flex items-center justify-center">
        <p className="text-[9px] text-slate-400 italic">
          {saved ? "✅ Adjustment saved successfully" : "Adjustments update the final invoice sent to user."}
        </p>
      </div>
    </div>
  );
}

// helpers
function PriceInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">SAR</span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 transition-all"
        />
      </div>
    </div>
  );
}