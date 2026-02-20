"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useState } from "react"

interface OrderPaymentDialogProps {
  children: React.ReactNode
  total: number
}

export default function OrderPaymentDialog({ children , total}: OrderPaymentDialogProps) {

  return (
    <Dialog >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-180 rounded-2xl p-8">
        {/* HEADER */}
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-3xl font-bold text-slate-700">
            Payment
          </DialogTitle>
          <DialogClose>
                <X className="w-5 h-5 text-slate-400 cursor-pointer" />
          </DialogClose>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-[#02D0FF]">SAR {total.toFixed(2)}</h2>
            <div className="flex justify-between items-center py-3 px-5 border border-slate-300/50 rounded-lg">
              <span className="">Order Completed</span> 
              <input type="checkbox" className="h-5 w-5 accent-green-700" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="px-2 py-3 text-xl font-semibold border border-blue-500/30 rounded-lg text-[#02D0FF] hover:bg-blue-100 focus:bg-blue-100 cursor-pointer">Cash</button>
              <button className="px-2 py-3 text-xl font-semibold border border-blue-500/30 rounded-lg text-[#02D0FF] hover:bg-blue-100 focus:bg-blue-100 cursor-pointer">Card</button>
              <button className="px-2 py-3 text-xl font-semibold border border-blue-500/30 rounded-lg text-[#02D0FF] hover:bg-blue-100 focus:bg-blue-100 cursor-pointer">Bank</button>
              <button className="px-2 py-3 text-xl font-semibold border border-blue-500/30 rounded-lg text-[#02D0FF] hover:bg-blue-100 focus:bg-blue-100 cursor-pointer">Unpaid</button>
            </div>

          </div>

          

          

          
        </div>
      </DialogContent>
    </Dialog>
  )
}
