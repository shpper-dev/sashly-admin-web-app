"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Zap, AlertTriangle, Minus, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { ClothingItem } from "@/app/(admin)/orders/add-order/page"

interface ItemDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ClothingItem
  onAddToBasket: (
    item: ClothingItem,
    quantity: number,
    palette: string | null,
    stains: string[],
    damages: string[]
  ) => void
}

const STAINS = [
  "MUD", "OIL", "PAINT", "COFFEE", "PERFUME",
  "SWEAT", "COLOUR", "DRINKS", "RUST", "WINE",
  "CHOCOLATE", "FOOD", "CHEMICAL", "TEA",
]

const DAMAGES = [
  "BUBBLE", "BROKEN BUTTON", "MISSING COLLAR",
  "STITCH", "STRINGS", "TEAR", "TORN",
  "COLOR LOSS", "DYE", "FADED", "HOLES",
]

const PALETTE = [
  "#D1D5DB", "#E5E7EB", "#000000", "#EF4444",
  "#3B82F6", "#10B981", "#06B6D4", "#F59E0B",
  "#EC4899", "#6B7280", "#1E3A8A", "#E7E5D4",
]

function TagButton({
  label,
  selected,
  onToggle,
}: {
  label: string
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all duration-150 whitespace-nowrap ${
        selected
          ? "bg-[#7F50F4] text-white"
          : "bg-gray-100 text-[#64748B] hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  )
}

export function ItemDetailsDialog({
  open,
  onOpenChange,
  item,
  onAddToBasket,
}: ItemDetailsDialogProps) {
  const [count, setCount]                   = useState(1)
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null)
  const [selectedStains, setSelectedStains]   = useState<string[]>([])
  const [selectedDamages, setSelectedDamages] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setCount(1)
      setSelectedPalette(null)
      setSelectedStains([])
      setSelectedDamages([])
    }
  }, [open])

  const toggle = (
    val: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => setList(list.includes(val) ? list.filter(v => v !== val) : [...list, val])

  const price = Number(item.price)
  const total = (price * count).toFixed(2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="hidden" >
        Select Item Details
      </DialogTitle>
      <DialogContent
        className="p-0 gap-0 border-0 overflow-hidden"
        style={{
          width: 620,
          maxWidth: "calc(100vw - 48px)",
          height: 543,
          maxHeight: "calc(100vh - 48px)",
          borderRadius: 32,
          boxShadow: "0px 25px 50px -12px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
        }}
      >

        {/* ── HEADER (fixed height) ───────────────────────────────────── */}
        <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4">
            {/* Item thumbnail */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                 style={{ background: "linear-gradient(135deg,#EEF2FF,#F3E8FF)" }}>
              <svg width="28" height="28" viewBox="0 0 22 22" fill="none">
                <path d="M8 3L5 6v3h2v10h8V9h2V6l-3-3-2 2-2-2z" fill="#7F50F4" opacity="0.8" />
              </svg>
            </div>

            <div className="flex flex-col gap-0.5">
              <h2 className="text-xl font-bold text-[#101828] leading-tight">{item.name}</h2>
              <p className="text-sm font-semibold text-[#7F50F4]">
                UNIT PRICE: SAR {price.toFixed(2)}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0"
          >
            <X size={16} color="#62748E" strokeWidth={2} />
          </button>
        </div>

        {/* ── BODY (flex-1 + overflow-hidden, two columns) ────────────── */}
        <div className="flex flex-1 overflow-hidden bg-[#F8FAFC]">

          {/* ── Left column ── */}
          <div className="flex flex-col gap-5 px-8 py-6 w-70 shrink-0 border-r border-gray-100 overflow-y-auto">

            {/* Estimated total */}
            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest">
                Estimated Total
              </p>
              <h3 className="text-4xl font-bold text-[#101828] leading-none mt-1">
                SAR {total}
              </h3>
            </div>

            {/* Unit count */}
            <div className="flex flex-col gap-2.5">
              <p className="text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest">
                Unit Count
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCount(Math.max(1, count - 1))}
                  className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Minus size={18} color="#62748E" strokeWidth={2} />
                </button>
                <span className="text-2xl font-bold text-[#101828] min-w-[24px] text-center">
                  {count}
                </span>
                <button
                  onClick={() => setCount(count + 1)}
                  className="w-11 h-11 rounded-xl bg-[#00D1FF] flex items-center justify-center hover:bg-[#00BAE0] transition-colors shadow-sm"
                >
                  <Plus size={18} color="#fff" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Service palette */}
            <div className="flex flex-col gap-2.5">
              <p className="text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest">
                Service Palette
              </p>
              <div className="grid grid-cols-6 gap-2">
                {PALETTE.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedPalette(color === selectedPalette ? null : color)}
                    className="w-9 h-9 rounded-xl border-2 transition-all duration-150"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedPalette === color ? "#7F50F4" : "#E2E8F0",
                      boxShadow: selectedPalette === color
                        ? "0 0 0 2px rgba(127,80,244,0.3)"
                        : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-5 px-7 py-6 flex-1 overflow-hidden">

            {/* Stain logs */}
            <div className="flex flex-col gap-2.5 flex-1 min-h-0">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Zap size={14} color="#7F50F4" strokeWidth={2} />
                <p className="text-[10px] font-bold text-[#101828] uppercase tracking-widest">
                  Stain Logs
                </p>
              </div>
              <div className="flex flex-wrap gap-2 overflow-y-auto pr-1"
                   style={{ maxHeight: 110 }}>
                {STAINS.map(s => (
                  <TagButton
                    key={s}
                    label={s}
                    selected={selectedStains.includes(s)}
                    onToggle={() => toggle(s, selectedStains, setSelectedStains)}
                  />
                ))}
              </div>
            </div>

            {/* Damage logs */}
            <div className="flex flex-col gap-2.5 flex-1 min-h-0">
              <div className="flex items-center gap-2 flex-shrink-0">
                <AlertTriangle size={14} color="#F87171" strokeWidth={2} />
                <p className="text-[10px] font-bold text-[#101828] uppercase tracking-widest">
                  Damage Logs
                </p>
              </div>
              <div className="flex flex-wrap gap-2 overflow-y-auto pr-1"
                   style={{ maxHeight: 110 }}>
                {DAMAGES.map(d => (
                  <TagButton
                    key={d}
                    label={d}
                    selected={selectedDamages.includes(d)}
                    onToggle={() => toggle(d, selectedDamages, setSelectedDamages)}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── FOOTER (fixed height) ───────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 px-8 py-4 bg-white border-t border-gray-100 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-11 px-6 rounded-2xl text-xs font-bold text-[#62748E] uppercase tracking-wider hover:bg-gray-100"
          >
            Close
          </Button>

          <Button
            onClick={() => {
              onAddToBasket(item, count, selectedPalette, selectedStains, selectedDamages)
              onOpenChange(false)
            }}
            className="h-11 px-6 rounded-2xl text-xs font-bold text-white uppercase tracking-wider"
            style={{
              background: "#00D1FF",
              boxShadow: "0px 8px 15px -3px rgba(0,209,255,0.3)",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#00BAE0")}
            onMouseLeave={e => (e.currentTarget.style.background = "#00D1FF")}
          >
            Add to Basket
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}