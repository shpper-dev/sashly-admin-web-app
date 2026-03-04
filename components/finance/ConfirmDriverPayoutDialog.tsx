"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { X, CalendarIcon, CircleUser, TriangleAlert } from "lucide-react"

import { useState } from "react"
import { format } from "date-fns"

interface ConfirmDriverPayoutProps {
  children: React.ReactNode
}

export default function ConfirmDriverPayoutDialog({
  children,
}: ConfirmDriverPayoutProps) {
 
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-120 rounded-2xl p-8">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-3xl font-bold text-slate-700">
            Confirm Driver Payout
          </DialogTitle>

          <DialogClose asChild>
            <button>
              <X className="w-5 h-5 text-slate-400 cursor-pointer" />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-6 mt-6 bg-white">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 bg-slate-50 rounded-md shadow">
                {/* driver details */}
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-white text-slate-700">
                        <CircleUser className="h-4 w-4 text-slate-700" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-600">Driver</span>
                        <span className="text-xs text-slate-900 font-semibold">Ahmed Al-Farsi</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-slate-600 font-medium text-xs uppercase tracking-wide">Amount to pay</span>
                        <span className="text-purple-600 text-sm font-bold">SAR 3,450.00</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-slate-600 font-medium text-xs uppercase tracking-wide">Payment method</span>
                        <span className="bg-white px-2 py-1 text-[10px] text-slate-700 rounded-lg border border-slate-400">SA93 1000 1234 5678</span>
                        <span className="text-[10px] text-slate-500">International Bank Account Number</span>
                    </div>
                </div>
            </div>
            {/* admin note */}
            <div className="flex flex-col">
                <label htmlFor="admin-note" className="text-slate-900 text-xs font-medium">Admin Note</label>
                <textarea name="admin-note" id="admin-note" rows={5} className="bg-white p-1.5 border border-slate-400 rounded-md text-[10px] placeholder:text-slate-500" placeholder="Enter reason or reference for this payment"></textarea>
            </div>
            {/* warning */}
            <div className="flex items-center gap-2 p-2 bg-yellow-600/25 border border-yellow-300 rounded-md">
                <TriangleAlert className="h-5 w-5 text-yellow-600" />
                <span className="text-[9px] text-yellow-800 ">This action is permanent. Once confirmed, the amount will be deducted from the platform's pending liability and recorded in the audit logs</span>
            </div>
          </div>
          {/* footer */}
          <div className="flex items-center justify-between px-4 mb-5">
            <DialogClose>
                <button className="px-5 py-2 text-slate-900 text-xs bg-white rounded-md border border-slate-300 shadow cursor-pointer">Cancel</button>
            </DialogClose>
            <button className="px-5 py-2 text-white text-xs bg-purple-600 rounded-md shadow cursor-pointer">Cancel</button>
          </div>
          
        </div>
      </DialogContent>
    </Dialog>
  )
}
