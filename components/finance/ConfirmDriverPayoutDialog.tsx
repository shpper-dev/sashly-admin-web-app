"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { X, CircleUser, TriangleAlert } from "lucide-react"

interface ConfirmDriverPayoutProps {
  children: React.ReactNode
}

export default function ConfirmDriverPayoutDialog({ children }: ConfirmDriverPayoutProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        className="p-0 gap-0 border-0 overflow-hidden rounded-2xl"
        style={{
          width: 440,
          maxWidth: "calc(100vw - 32px)",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        {/* ── Header ── */}
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
          <DialogTitle className="text-base font-bold text-[#101828]">
            Confirm Driver Payout
          </DialogTitle>
          <DialogClose asChild>
            <button className="w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer">
              <X className="w-4 h-4 text-[#62748E]" />
            </button>
          </DialogClose>
        </DialogHeader>

        {/* ── Body ── */}
        <div className="flex flex-col gap-4 px-6 py-5 bg-white">

          {/* Driver + amount card */}
          <div className="flex flex-col gap-5 p-4 bg-[#F8FAFC] border border-slate-200 rounded-xl">

            {/* Driver row */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <CircleUser className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest">Driver</span>
                <span className="text-sm font-bold text-[#101828]">Ahmed Al-Farsi</span>
              </div>
            </div>

           

            {/* Amount + Payment method row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest">
                  Amount to Pay
                </span>
                <span className="text-base font-bold text-[#7F50F4]">SAR 3,450.00</span>
              </div>

              <div className="flex flex-col gap-1 items-start">
                <span className="text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest">
                  Payment Method
                </span>
                <span className="px-2.5 py-1 text-[11px] font-semibold text-[#314158] bg-white border border-slate-300 rounded-lg">
                  SA93 1000 1234 5678
                </span>
                <span className="text-[10px] text-[#90A1B9]">International Bank Account Number</span>
              </div>
            </div>
          </div>

          {/* Admin note */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-note" className="text-xs font-bold text-[#101828]">
              Admin Note
            </label>
            <textarea
              id="admin-note"
              name="admin-note"
              rows={4}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-700 placeholder:text-[#94A3B8] resize-none focus:outline-none focus:ring-2 focus:ring-[#7F50F4]/30 focus:border-[#7F50F4]/40 transition"
              placeholder="Enter reason or reference for this payment"
            />
          </div>

          {/* Warning */}
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span><TriangleAlert className="w-5 h-5 text-amber-600 " strokeWidth={3}/></span>
            <span className="text-[11px] text-amber-700">
              This action is permanent. Once confirmed, the amount will be deducted from the platform's
              pending liability and recorded in the audit logs.
            </span>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-[#FBFCFD] border-t border-slate-100">
          <DialogClose asChild>
            <button className="flex-1 py-2.5 text-xs font-bold text-[#314158] bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors cursor-pointer">
              Cancel
            </button>
          </DialogClose>
          <button className="flex-1 py-2.5 text-xs font-bold text-white bg-[#7F50F4] hover:bg-[#6B3FD4] rounded-xl shadow-sm transition-colors">
            Confirm Payout
          </button>
        </div>

      </DialogContent>
    </Dialog>
  )
}