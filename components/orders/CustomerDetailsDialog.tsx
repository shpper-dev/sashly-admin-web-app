"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { X, Phone, Mail, MapPin, Trash2, User } from "lucide-react"

interface CustomerDetailsDialogProps {
  children: React.ReactNode;
  customer: string; // will replace this with a more detailed type later
}

export function CustomerDetailsDialog({
  children,
  customer,
}: CustomerDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent
        className="
          p-0 
          overflow-hidden 
          border-none 
          rounded-[28px] 
          bg-transparent 
          shadow-none
          max-w-130
        "
      >
        {/* Hidden accessible title (required for accessibility) */}
        <DialogHeader className="sr-only">
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>

        {/* Custom Modal Card */}
        <div className="relative rounded-[28px] bg-[#F2F2F2] shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden">

          {/* Header */}
          <div className="h-25 bg-linear-to-r from-[#17B6CF] to-[#1EB4D4] relative">
            <DialogTrigger>
                <button
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition cursor-pointer"
            >
              <X size={16} />
            </button>
            </DialogTrigger>
          </div>

          {/* Floating Avatar */}
          <div className="absolute top-8.25 left-8">
            <div className="w-22 h-22 rounded-2xl bg-[#D9D9D9] flex items-center justify-center shadow-lg border-4 border-white">
              <User size={38} className="text-[#17B6CF]" />
            </div>
          </div>

          {/* Content */}
          <div className="pt-7 px-8 pb-8">

            {/* Name */}
            <h2 className="text-[26px] font-semibold text-[#1C2434]">
              {customer}
            </h2>

            {/* Badges */}
            <div className="flex items-center gap-3 mt-1">
              <span className="px-3 py-1 text-[11px] font-semibold rounded-full bg-[#FFE7C2] text-[#C46A00] tracking-wide">
                MEMBER SINCE 2026
              </span>
              <span className="text-[11px] font-semibold text-[#8A9BB5] tracking-wide">
                • NEW CUSTOMER
              </span>
            </div>

            {/* Contact Row */}
            <div className="flex gap-4 mt-4">
              {/* Phone */}
              <div className="flex items-center gap-3 bg-[#E9ECEF] rounded-2xl px-4 py-3 flex-1 shadow-inner">
                <div className="w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center">
                  <Phone size={16} className="text-[#8A9BB5]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#8A9BB5] tracking-wide">
                    PHONE
                  </p>
                  <p className="text-[14px] font-semibold text-[#1C2434]">
                    +966 50 123 4567
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 bg-[#E9ECEF] rounded-2xl px-4 py-3 flex-1 shadow-inner">
                <div className="w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center">
                  <Mail size={16} className="text-[#8A9BB5]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#8A9BB5] tracking-wide">
                    EMAIL
                  </p>
                  <p className="text-[14px] font-semibold text-[#1C2434]">
                    abdullah.q@email.com
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-3 bg-[#E9ECEF] rounded-2xl px-4 py-3 mt-4 shadow-inner">
              <div className="w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center">
                <MapPin size={16} className="text-[#8A9BB5]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#8A9BB5] tracking-wide">
                  ADDRESS
                </p>
                <p className="text-[14px] font-semibold text-[#1C2434]">
                  King Fahd Road, Riyadh
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#D9DEE7] my-4" />

            {/* Actions */}
            <div className="flex items-center justify-between">
              {/* Delete */}
              <button className="w-12 h-10 rounded-xl bg-[#FADADD] flex items-center justify-center text-[#FF4D6D] hover:opacity-90 transition">
                <Trash2 size={18} />
              </button>

              <div className="flex gap-4">
                {/* Close handled automatically by Dialog */}
                <DialogTrigger asChild>
                  <button className="px-8 h-10 rounded-xl bg-[#E5E7EB] text-[#1C2434] font-semibold text-sm hover:bg-[#DADDE2] transition cursor-pointer">
                    CLOSE
                  </button>
                </DialogTrigger>

                <button className="px-8 h-10 rounded-xl bg-[#17B6CF] text-white font-semibold text-sm shadow-lg hover:brightness-110 transition">
                  UPDATE DETAILS
                </button>
              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}