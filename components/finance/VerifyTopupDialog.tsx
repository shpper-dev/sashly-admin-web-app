"use client"

import { useState } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { X, CheckCircle, CircleX, Loader2, ImageOff } from "lucide-react"
import { WalletTransaction } from "@/lib/models/wallet.model"
import { updateTransactionStatus } from "@/lib/firebase/wallet"
import { useToast } from "@/lib/providers/ToastProvider"
import { getCurrentUser } from "@/lib/firebase/admin.auth"

interface VerifyTopupDialogProps {
  children: React.ReactNode
  transaction: WalletTransaction
  userName?: string
  onSuccess?: () => void
}

export default function VerifyTopupDialog({ children, transaction, userName, onSuccess }: VerifyTopupDialogProps) {
  const [open, setOpen]         = useState(false);
  const [note, setNote]         = useState("");
  const [processing, setProcessing] = useState<"approve" | "reject" | null>(null);
  const { showToast } = useToast();

  const displayName = userName ?? transaction.email ?? "Unknown user";
  const requestDate = new Date(transaction.createdAt).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });

  const handleApprove = async () => {
    setProcessing("approve");
    try {
      // note is captured in state but there's no field on WalletTransaction to
      // persist it to yet — add e.g. `adminNote` to the model if this needs to stick.
      const admin = await getCurrentUser();
      await updateTransactionStatus(transaction.id, "success", admin?.uid ?? "admin");
      showToast(`Top-up approved for ${displayName}`, "success");
      onSuccess?.();
      setOpen(false);
    } catch (e) {
      console.error("Failed to approve top-up:", e);
      showToast("Failed to approve top-up.", "error");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    setProcessing("reject");
    try {
      await updateTransactionStatus(transaction.id, "failed", "admin");
      showToast(`Top-up rejected for ${displayName}`, "error");
      onSuccess?.();
      setOpen(false);
    } catch (e) {
      console.error("Failed to reject top-up:", e);
      showToast("Failed to reject top-up.", "error");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setNote(""); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        className="p-0 gap-0 border-0 overflow-hidden rounded-2xl"
        style={{
          width: 820,
          maxWidth: "calc(100vw - 32px)",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        <div className="flex h-full">

          {/* ── Left — 60% — Receipt image ── */}
          <div className="w-[60%] p-6 bg-slate-100 border-r border-slate-200 relative min-h-140">
            <div className="relative w-full h-full rounded-xl overflow-hidden bg-white border border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-300">
              {/* No receipt/proof-of-payment field exists on WalletTransaction yet.
                  Swap this block for an <Image src={transaction.receiptUrl} .../>
                  once that field is added. */}
              <ImageOff className="w-10 h-10" />
              <span className="text-xs font-medium text-slate-400">No receipt on file</span>
            </div>
          </div>

          {/* ── Right — 40% — Content ── */}
          <div className="w-[40%] flex flex-col bg-white overflow-y-auto">

            {/* Header */}
            <DialogHeader className="flex flex-row items-start justify-between px-5 py-4 bg-[#FBFCFD] border-b border-slate-100 shrink-0">
              <div className="flex flex-col gap-0.5">
                <DialogTitle className="text-sm font-bold text-[#101828]">
                  Verify Top Up
                </DialogTitle>
                <p className="text-[10px] text-[#90A1B9] font-medium">
                  Review the bank slip for manual approval
                </p>
              </div>
              <DialogClose asChild>
                <button className="w-7 h-7 flex items-center justify-center rounded-xl shrink-0">
                  <X className="w-3.5 h-3.5 text-[#62748E]" />
                </button>
              </DialogClose>
            </DialogHeader>

            {/* Body */}
            <div className="flex flex-col gap-4 px-5 py-5 flex-1">

              {/* Request details card */}
              <div className="flex flex-col gap-2.5 p-4 bg-[#F8FAFC] border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest">
                  Request Details
                </span>

                {[
                  { label: "User Name", value: displayName,                        valueClass: "text-[#101828] font-bold" },
                  { label: "Email",     value: transaction.email || "—",           valueClass: "text-[#101828] font-medium" },
                  { label: "Amount",    value: `SAR ${transaction.amount.toFixed(2)}`, valueClass: "text-[#7F50F4] font-bold" },
                  { label: "Date",      value: requestDate,                        valueClass: "text-[#101828] font-bold" },
                  // No "method" field exists — subject is real data, shown in its place.
                  { label: "Subject",   value: transaction.subject || "—",         valueClass: "text-[#101828] font-medium" },
                ].map(({ label, value, valueClass }) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="text-[10px] text-[#6A7282] shrink-0">{label}</span>
                    <span className={`text-[10px] text-right truncate ${valueClass}`}>{value}</span>
                  </div>
                ))}

                {transaction.description && (
                  <div className="pt-1 border-t border-slate-200">
                    <span className="text-[10px] text-[#6A7282] block mb-1">Description</span>
                    <span className="text-[10px] text-[#101828]">{transaction.description}</span>
                  </div>
                )}
              </div>

              {/* Internal note */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="internal-note"
                  className="text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest"
                >
                  Internal Note (optional)
                </label>
                <textarea
                  id="internal-note"
                  name="internal-note"
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700 placeholder:text-[#94A3B8] resize-none focus:outline-none focus:ring-2 focus:ring-[#7F50F4]/30 focus:border-[#7F50F4]/40 transition"
                  placeholder="Add a note for other admins..."
                />
                {/* Not persisted yet — WalletTransaction has no note/adminNote field. */}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex flex-col gap-3 px-5 pb-5 shrink-0">
              <button
                onClick={handleApprove}
                disabled={processing !== null}
                className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-[#7F50F4] hover:bg-[#6B3FD4] rounded-xl text-white text-xs font-bold transition-colors shadow-md disabled:opacity-50"
              >
                {processing === "approve"
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <CheckCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
                }
                Approve Top-up
              </button>
              <button
                onClick={handleReject}
                disabled={processing !== null}
                className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 rounded-xl text-red-500 text-xs font-bold transition-colors shadow-md disabled:opacity-50"
              >
                {processing === "reject"
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <CircleX className="h-3.5 w-3.5" />
                }
                Reject with Reason
              </button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}