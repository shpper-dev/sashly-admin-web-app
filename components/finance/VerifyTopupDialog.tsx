"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { X, CheckCircle, CircleX } from "lucide-react"
import Image from "next/image"

interface VerifyTopupDialogProps {
  children: React.ReactNode
}

export default function VerifyTopupDialog({ children }: VerifyTopupDialogProps) {
  return (
    <Dialog>
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
            <div className="relative w-full h-full rounded-xl overflow-hidden">
                <Image
              src="/images/receipt.png"
              alt="Bank receipt"
              fill
              className="object-cover"
            />
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
                <button className="w-7 h-7 flex items-center justify-center rounded-xlshrink-0 ">
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
                  { label: "User Name", value: "Reem Al-Anzi",        valueClass: "text-[#101828] font-bold" },
                  { label: "Amount",    value: "SAR 500.00",           valueClass: "text-[#7F50F4] font-bold" },
                  { label: "Date",      value: "Oct 24, 2023 · 14:30", valueClass: "text-[#101828] font-bold" },
                ].map(({ label, value, valueClass }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[10px] text-[#6A7282]">{label}</span>
                    <span className={`text-[10px] ${valueClass}`}>{value}</span>
                  </div>
                ))}

                {/* Method — pill style */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#6A7282]">Method</span>
                  <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-lg text-[10px] font-bold text-blue-600">
                    STC Pay
                  </span>
                </div>
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
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700 placeholder:text-[#94A3B8] resize-none focus:outline-none focus:ring-2 focus:ring-[#7F50F4]/30 focus:border-[#7F50F4]/40 transition"
                  placeholder="Add a note for other admins..."
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex flex-col gap-3 px-5 pb-5 shrink-0">
              <button className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-[#7F50F4] hover:bg-[#6B3FD4] rounded-xl text-white text-xs font-bold transition-colors shadow-md">
                <CheckCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
                Approve Top-up
              </button>
              <button className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 rounded-xl text-red-500 text-xs font-bold transition-colors shadow-md">
                <CircleX className="h-3.5 w-3.5" />
                Reject with Reason
              </button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}