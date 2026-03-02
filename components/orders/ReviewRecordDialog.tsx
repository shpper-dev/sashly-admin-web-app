"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"

interface ReviewRecordDialogProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  subtotal: number;
  itemCount?: number;
  setSuccessOpen: Dispatch<SetStateAction<boolean>>
}

type ServiceType = "default" | "express"
type BillingType  = "cash" | "card" | "online"

export function ReviewRecordDialog({
  open,
  onOpenChange,
  subtotal,
  itemCount = 6,
  setSuccessOpen,
}: ReviewRecordDialogProps) {
  const [serviceType, setServiceType] = useState<ServiceType>("default")
  const [billing,     setBilling]     = useState<BillingType>("online")

  const tax   = subtotal * 0.15
  const total = subtotal + tax

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Review Record</DialogTitle>

      <DialogContent className="
        p-0 gap-0 border-0 overflow-hidden
        w-159.5 max-w-[calc(100vw-32px)]!
        h-116.5 max-h-[calc(100vh-32px)]
        bg-white rounded-[32px]
        shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]
        flex flex-col items-start
      ">

        {/* Header */}
        <div className="
          box-border shrink-0
          flex flex-row items-center justify-between
          w-159.5 h-22.25
          px-7.5 pt-6 pb-4 gap-2.5
          bg-[#FBFCFD] border-b border-[#F1F5F9]
        ">
          {/* Left group */}
          <div className="flex flex-row items-center gap-4 w-[317.5px] h-12.25">

            {/* Purple check box */}
            <input type="checkbox" className="w-5 h-5 accent-[#7F50F4] rounded-[6px] shrink-0" defaultChecked/>

            {/* Text col — 157 × 49, gap 2 */}
            <div className="flex flex-col items-start gap-0.5 w-39.25 h-12.25">
              <span className="
                block w-39.25 h-8
                font-bold text-[20px] leading-8 text-[#0F172B]
              ">
                Review Record
              </span>
              <span className="
                block w-36 h-3.75
                font-medium text-[12px] leading-3.75
                uppercase text-[#90A1B9]
              ">
                Payment Validation
              </span>
            </div>
          </div>

          {/* Close btn  */}
          <button
            onClick={() => onOpenChange(false)}
            className="
              shrink-0 flex items-start
              w-9 h-9 p-2 pb-0
              bg-[#F1F5F9] rounded-full
              border-none cursor-pointer
              hover:bg-[#E2E8F0] transition-colors
            "
          >
            <div className="w-5 h-5">
              <X size={20} color="#99A1AF" strokeWidth={1.67} />
            </div>
          </button>
        </div>

        <div className="
          flex flex-col items-start shrink-0
          w-159.5 h-94.25 p-8 gap-7.5
        ">

          {/* ── Top row: controls + invoice  574 × 222, gap 24 ── */}
          <div className="flex flex-row items-start gap-6 w-143.5 h-55.5 shrink-0">

            {/* ── Left controls: 280 × 157, gap 40 ── */}
            <div className="flex flex-col items-start gap-10 w-70 h-39.25 shrink-0">

              {/* Service Type — 280 × 59, gap 8 */}
              <div className="flex flex-col items-start gap-2 w-70 h-14.75">
                <span className="
                  block w-24.5 h-3.75
                  font-bold text-[10px] leading-3.75
                  uppercase text-[#90A1B9]
                ">
                  Estimated Total
                </span>

                {/* Toggle pill — 212 × 36, radius 14, inset shadow */}
                <div className="
                  flex flex-row items-center
                  w-53 h-9 px-1 gap-1
                  bg-[#F1F5F9] rounded-[14px]
                  shadow-[inset_0px_2px_4px_rgba(0,0,0,0.05)]
                ">
                  {/* Default */}
                  <button
                    onClick={() => setServiceType("default")}
                    className={`
                      flex items-center justify-center
                      w-25 h-6.75 px-4 py-1.5 gap-2.5
                      rounded-[10px] border-none cursor-pointer
                       font-bold text-[10px] leading-3.75
                      text-center tracking-[0.5px] uppercase
                      transition-all duration-150
                      ${serviceType === "default"
                        ? "bg-white text-[#02D0FF] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
                        : "bg-transparent text-[#62748E] shadow-none"
                      }
                    `}
                  >
                    Default
                  </button>

                  {/* Express */}
                  <button
                    onClick={() => setServiceType("express")}
                    className={`
                      flex items-center justify-center
                      w-25 h-6.75 px-4 py-1.5 gap-2.5
                      rounded-[10px] border-none cursor-pointer
                      font-bold text-[10px] leading-3.75
                      text-center tracking-[0.5px] uppercase
                      transition-all duration-150
                      ${serviceType === "express"
                        ? "bg-white text-[#02D0FF] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
                        : "bg-transparent text-[#62748E] shadow-none"
                      }
                    `}
                  >
                    Express
                  </button>
                </div>
              </div>

              {/* Billing — 280 × 58, gap 8 */}
              <div className="flex flex-col items-start gap-2 w-70 h-14.5">
                <span className="
                  block w-10.75 h-3.75
                  font-bold text-[10px] leading-3.75
                  uppercase text-[#90A1B9]
                ">
                  Billing
                </span>

                {/* Buttons row — 256 × 35, gap 8 */}
                <div className="flex flex-row items-start gap-2 w-[256px] h-8.75">
                  {(
                    [
                      { key: "cash",   label: "Cash"   },
                      { key: "card",   label: "Card"   },
                      { key: "online", label: "Online" },
                    ] as { key: BillingType; label: string }[]
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setBilling(key)}
                      className={`
                        box-border flex items-center justify-center
                        w-20 h-8.75 px-5.5 py-2.5 gap-2
                        rounded-xl border cursor-pointer
                        font-bold text-[10px] leading-3.75
                        text-center tracking-[0.5px] uppercase
                        transition-all duration-150
                        ${billing === key
                          ? "bg-[#FAF5FF] border-[#7F50F4] text-[#7F50F4]"
                          : "bg-[#F8FAFC] border-[#F2F6F9] text-[#45556C]"
                        }
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Invoice card — 270 × 222, bg #F8FAFC, border #E5E7EB, radius 16, p16, gap 16 ── */}
            <div className="
              box-border flex flex-col items-start shrink-0
              w-67.5 h-55.5 p-4 gap-4
              bg-[#F8FAFC] border border-[#E5E7EB] rounded-3xl
            ">
              {/* "Invoicing" header row — pb 16, border-b #E5E7EB */}
              <div className="
                box-border flex flex-col items-start
                w-59.5 h-7.75
                pb-4 gap-4
                border-b border-[#E5E7EB]
              ">
                <span className="
                  block w-17.25 h-3.75
                  font-bold text-[12px] leading-3.75
                  uppercase text-[#101828]
                ">
                  Invoicing
                </span>
              </div>

              {/* Line items — 238 × 68, gap 10 */}
              <div className="flex flex-col items-start gap-2.5 w-59.5 h-17">
                {/* Items */}
                <div className="flex flex-row justify-between items-center w-59.5 h-4">
                  <span className="font-bold text-[12px] leading-4 tracking-[0.6px] uppercase text-[#90A1B9]">
                    Items
                  </span>
                  <span className="font-bold text-[14px] leading-4 text-[#314158]">
                    SAR {subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Subtotal */}
                <div className="flex flex-row justify-between items-center w-59.5 h-4">
                  <span className="font-bold text-[12px] leading-4 tracking-[0.6px] uppercase text-[#7F50F4]">
                    Subtotal
                  </span>
                  <span className="font-bold text-[14px] leading-4 text-[#7F50F4]">
                    SAR {subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Tax */}
                <div className="flex flex-row justify-between items-center w-59.5 h-4">
                  <span className="font-bold text-[12px] leading-4 tracking-[0.6px] uppercase text-[#90A1B9]">
                    Tax (15%)
                  </span>
                  <span className="font-bold text-[14px] leading-4 text-[#314158]">
                    SAR {tax.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payable Total — 238 × 59, border-t #E2E8F0, pt 12, justify-end */}
              <div className="
                box-border flex flex-row justify-end items-center
                w-59.5 h-14.75 pt-3
                border-t border-[#E2E8F0]
              ">
                <div className="flex flex-col justify-center items-end gap-0.5 w-29.5 h-11.5">
                  <span className="
                    block w-23.25 h-4
                    font-bold text-[10px] leading-4
                    tracking-[0.6px] uppercase text-[#90A1B9]
                  ">
                    Payable Total
                  </span>
                  <span className="
                    block w-29.5 h-7
                    font-bold text-[24px] leading-7
                    text-right text-[#4F39F6]
                  ">
                    SAR {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer row  */}
          <div className="
            box-border flex flex-row justify-end items-center shrink-0
            w-143.5 h-15.25 pt-4 gap-[1.53px]
            border-t border-[#F1F5F9]
          ">
            
            <div className="flex flex-row items-center gap-4 w-143.5 h-11">

             
              <button
                onClick={() => onOpenChange(false)}
                className="
                  flex items-center justify-center
                  w-69.75 h-11 px-6 py-3.5
                  bg-[#F8FAFC] rounded-[14px]
                  border-none cursor-pointer
                  font-bold text-[12px] leading-4
                  text-center tracking-[1px] uppercase text-[#0F172B]
                  hover:bg-[#F1F5F9] transition-colors duration-150
                "
              >
                Close
              </button>

              
              <button
                onClick={() => {
                  onOpenChange(false);
                  setSuccessOpen(true);
                }}
                className="
                  flex items-center justify-center
                  w-69.75 h-11 px-6 py-3.5
                  bg-[#7F50F4] rounded-[14px]
                  shadow-[0px_10px_15px_-3px_rgba(2,208,255,0.08),0px_4px_5.3px_-4px_rgba(2,208,255,0.16)]
                  border-none cursor-pointer
                   font-bold text-[12px] leading-4
                  text-center tracking-[1px] uppercase text-white
                  hover:bg-[#6B3FD4] transition-colors duration-150
                "
              >
                Add Order
              </button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}