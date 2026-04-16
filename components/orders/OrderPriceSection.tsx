"use client";
import { updateOrderPrice } from "@/lib/firebase/order";
import { Order } from "@/lib/models/order.model";
import { useToast } from "@/lib/providers/ToastProvider";
import { Check, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

interface OrderPriceSectionProps{ 
    order: Order,
    onSuccess?: () => void;
 }

export function OrderPriceSection({ order, onSuccess }: OrderPriceSectionProps ) {
  const [expanded, setExpanded] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [saved, setSaved] = useState(false);

  const [subtotal, setSubtotal] = useState(order.totalPrice || 0);
  //there is no tax or express fee in the model as of now
  const [tax, setTax] = useState(0);
  const [expressFee, setExpressFee] = useState(order.serviceType === "express" ? 2: 0 || 0);
  const [reason, setReason] = useState("");

  useEffect(() => {
    // When the order items change and total price is recalculated in the parent,
    // update local state to match the new source of truth.
    if (!adjusting) {
      setSubtotal(order.totalPrice || 0);
      setExpressFee(order.serviceType === "express" ? 2 : 0);
    }
  }, [order.totalPrice, order.serviceType, adjusting]);

  const {showToast} = useToast();

  const currentTotal = subtotal + tax + expressFee;
  const originalTotal = order.totalPrice;
  const diff = currentTotal - originalTotal;
  const hasDiff = Math.abs(diff) > 0.001;

  const handleSave = async () => {
    // await updateOrderPrice(order.id, { subtotal, tax, expressFee, total: currentTotal, reason });
    try{
        await updateOrderPrice(order.id, currentTotal);
        onSuccess?.();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }catch(err){
        setSaved(false);
        showToast(`Error adjusting price for ${order.id.slice(-6)}`,"error")
    }finally{
        setAdjusting(false);
    }
  };

  const handleCancel = () => {
    setSubtotal(order.totalPrice || 0);
    setTax(0);
    setExpressFee(order.serviceType === "express" ? 2: 0 || 0);
    setReason("");
    setAdjusting(false);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Summary Row */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Current Total</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">SAR {currentTotal.toFixed(2)}</span>
            {hasDiff && (
               <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${diff > 0 ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
                {diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
              </span>
            )}
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

      {/* Breakdown Section */}
      {expanded && (
        <div className="p-4 bg-white space-y-3 border-b border-slate-100">
          {!adjusting ? (
            /* READ ONLY VIEW */
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium">SAR {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Tax (VAT)</span>
                <span className="font-medium">SAR {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Express Fee</span>
                <span className="font-medium">SAR {expressFee.toFixed(2)}</span>
              </div>
              {/* only for unpaid orders : change in the future as needed */}
              {!order.isPaid && (
                <button 
                onClick={() => setAdjusting(true)}
                className="w-full mt-2 py-1.5 border border-dashed border-slate-200 rounded-lg text-[10px] font-bold text-[#02d0ff] hover:bg-cyan-50 transition-colors flex items-center justify-center gap-1"
              >
                <Pencil size={10} /> EDIT INDIVIDUAL FEES
              </button>
              )}
            </div>
          ) : (
            /* EDITABLE VIEW */
            <div className="flex flex-col gap-3">
              <PriceInput label="Subtotal" value={subtotal} onChange={setSubtotal} />
              <PriceInput label="Tax" value={tax} onChange={setTax} />
              <PriceInput label="Express Fee" value={expressFee} onChange={setExpressFee} />

              <div className="flex flex-col gap-1 mt-2">
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
                  disabled={!reason.trim()}
                  className="flex-1 h-8 rounded-lg bg-[#02d0ff] text-white text-xs font-semibold disabled:opacity-40"
                >
                  Save Changes
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
function PriceInput({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
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