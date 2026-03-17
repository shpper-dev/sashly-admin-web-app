"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OrderStatuses } from "@/lib/models/order.model";
import { advanceOrderStatus, getAllowedNextStatuses } from "@/lib/firebase/order";

const STATUS_LABELS: Record<OrderStatuses, string> = {
  unpaid:         "Unpaid",
  confirmed:      "Confirmed",
  pickedUp:       "Picked Up",
  sorting:        "Sorting",
  inProgress:     "In Progress",
  readyToDeliver: "Ready to Deliver",
  delivered:      "Delivered",
  cancelled:      "Cancelled",
};

interface UpdateOrderDialogProps {
  orderId: string;
  currentStatus: OrderStatuses;
  onSuccess?: () => void;
  children: React.ReactNode;
}

export default function UpdateOrderDialog({ orderId, currentStatus, onSuccess, children }: UpdateOrderDialogProps) {
  const [open, setOpen]           = useState(false);
  const [selected, setSelected]   = useState<OrderStatuses | null>(null);
  const [description, setDescription] = useState("");
  const [saving, setSaving]       = useState(false);

  const allowedNext = getAllowedNextStatuses(currentStatus);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await advanceOrderStatus(orderId, selected, description || undefined);
      setOpen(false);
      setSelected(null);
      setDescription("");
      onSuccess?.();
    } catch (e) {
      console.error("Status update failed:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          {/* Current status */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Current:</span>
            <span className="font-semibold text-slate-700">{STATUS_LABELS[currentStatus]}</span>
          </div>

          {/* Next status options */}
          {allowedNext.length === 0 ? (
            <p className="text-sm text-slate-400">No further transitions available.</p>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Advance to</span>
              {allowedNext.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelected(status)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    selected === status
                      ? "bg-purple-50 border-purple-400 text-purple-700"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {STATUS_LABELS[status]}
                  {/* Show what flag gets set */}
                  {status === "confirmed"     && <span className="text-xs text-green-500">Sets isPaid ✓</span>}
                  {status === "delivered"     && <span className="text-xs text-blue-500">Sets isDelivered ✓</span>}
                  {status === "cancelled"     && <span className="text-xs text-red-400">Sets isCancelled ✓</span>}
                </button>
              ))}
            </div>
          )}

          {/* Optional description */}
          {selected && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Note (optional)</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Items loaded into machines"
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!selected || saving}
            className="mt-1 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold disabled:opacity-40 transition"
          >
            {saving ? "Saving..." : "Confirm Update"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}