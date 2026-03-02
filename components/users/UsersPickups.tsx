"use client"

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  RefreshCcw,
  Truck,
} from "lucide-react"
import { useState } from "react"

// ── Types ─────────────────────────────────────────────────────────────────────
interface PickupItem {
  label: string
  qty: string
}

interface PickupRow {
  id: string
  placed: string
  items: PickupItem[]
  extraCount?: number
  status: "AWAITING COLLECTION" | "IN PROGRESS" | "COMPLETED" | "CANCELLED"
  pcs: number
  notes: string
  pickup: string
  total: string
}

type SectionKey = "regular" | "active" | "recent"


interface Column {
  id: keyof PickupRow | "actions"
  label: string
  className?: string
}

const COLUMNS: Column[] = [
  { id: "id",     label: "ID",     className: "w-[60px]"  },
  { id: "placed", label: "Placed", className: "w-[80px]"  },
  { id: "items",  label: "Order",  className: "w-[180px]" },
  { id: "status", label: "Status", className: "w-[160px]" },
  { id: "pcs",    label: "Pcs",    className: "w-[40px]"  },
  { id: "notes",  label: "Notes",  className: "flex-1"    },
  { id: "pickup", label: "Pickup", className: "w-[80px]"  },
  { id: "total",  label: "Total",  className: "w-[90px] text-right" },
]

// ── Status styles ─────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<PickupRow["status"], string> = {
  "AWAITING COLLECTION": "bg-yellow-50  text-yellow-700  border border-yellow-200",
  "IN PROGRESS":         "bg-cyan-50    text-cyan-700    border border-cyan-200",
  "COMPLETED":           "bg-green-50   text-green-700   border border-green-200",
  "CANCELLED":           "bg-red-50     text-red-600     border border-red-200",
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_ROWS: PickupRow[] = [
  {
    id: "4637",
    placed: "Oct 24, 2023",
    items: [
      { label: "Laundry Bag", qty: "x1" },
      { label: "Trousers",    qty: "x2" },
      { label: "T-Shirt",     qty: "x3" },
    ],
    extraCount: 4,
    status: "AWAITING COLLECTION",
    pcs: 3,
    notes: "Leave at the door if no answer",
    pickup: "Oct 24, 2023",
    total: "SAR 150.00",
  },
  {
    id: "4638",
    placed: "Nov 01, 2023",
    items: [
      { label: "Thob",    qty: "x2" },
      { label: "Shemagh", qty: "x1" },
    ],
    status: "IN PROGRESS",
    pcs: 5,
    notes: "—",
    pickup: "Nov 01, 2023",
    total: "SAR 84.00",
  },
  {
    id: "4639",
    placed: "Nov 10, 2023",
    items: [
      { label: "Serwal",     qty: "x4" },
      { label: "Undershirt", qty: "x2" },
    ],
    status: "COMPLETED",
    pcs: 6,
    notes: "Call before arriving",
    pickup: "Nov 11, 2023",
    total: "SAR 112.00",
  },
]


function renderCellContent(col: Column, row: PickupRow) {
  switch (col.id) {
    case "id":
      return (
        <span className="font-bold text-slate-700 text-xs">{row.id}</span>
      )

    case "placed":
      return (
        <span className="text-xs text-slate-500 whitespace-pre-line leading-5">
          {row.placed.replace(", ", ",\n")}
        </span>
      )

    case "items":
      return (
        <div className="flex flex-wrap gap-1.5">
          {row.items.map((item) => (
            <ItemPill key={item.label} label={item.label} qty={item.qty} />
          ))}
          {row.extraCount && (
            <span className="px-2 py-1 rounded-lg bg-indigo-100 text-indigo-600 text-[10px] font-bold">
              +{row.extraCount} MORE
            </span>
          )}
        </div>
      )

    case "status":
      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wide ${
            STATUS_STYLES[row.status]
          }`}
        >
          {row.status}
        </span>
      )

    case "pcs":
      return (
        <span className="font-semibold text-slate-800 text-xs">{row.pcs}</span>
      )

    case "notes":
      return (
        <span className="text-xs text-slate-500 leading-relaxed">{row.notes}</span>
      )

    case "pickup":
      return (
        <span className="text-xs text-slate-500 whitespace-pre-line leading-5">
          {row.pickup.replace(", ", ",\n")}
        </span>
      )

    case "total":
      return (
        <span className="font-bold text-slate-900 text-xs">{row.total}</span>
      )

    default:
      return "—"
  }
}

export default function PickupsTab() {
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    regular: false,
    active:  false,
    recent:  true,
  })

  const toggle = (key: SectionKey) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    
    <div className="flex flex-col bg-white h-full overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 shrink-0">
        <div>
          <h2 className="text-base font-bold text-slate-900">Pickup Details</h2>
          <p className="text-xs text-slate-400">Manage customer pickups</p>
        </div>
        <button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-5 h-9 rounded-xl text-xs font-bold shadow-md shadow-cyan-100 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Create Regular Pickup
        </button>
      </div>

     
      <div
        className="flex-1 overflow-y-auto"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#06b6d4 transparent",
        }}
      >
        <style>{`
          .pickups-scroll::-webkit-scrollbar { width: 6px; }
          .pickups-scroll::-webkit-scrollbar-track { background: transparent; }
          .pickups-scroll::-webkit-scrollbar-thumb { background: #06b6d4; border-radius: 99px; }
        `}</style>

        <PickupSection
          sectionKey="regular"
          title="REGULAR PICKUPS"
          icon={<RefreshCcw className="w-3.5 h-3.5 text-cyan-500" />}
          open={openSections.regular}
          onToggle={() => toggle("regular")}
          rows={MOCK_ROWS.slice(0, 1)}
        />

        <PickupSection
          sectionKey="active"
          title="ACTIVE PICKUPS"
          icon={<Truck className="w-3.5 h-3.5 text-emerald-500" />}
          open={openSections.active}
          onToggle={() => toggle("active")}
          rows={MOCK_ROWS.slice(1, 2)}
        />

        <PickupSection
          sectionKey="recent"
          title="RECENT PICKUPS"
          icon={<Clock className="w-3.5 h-3.5 text-[#7F50F4]" />}
          open={openSections.recent}
          onToggle={() => toggle("recent")}
          rows={MOCK_ROWS}
        />
      </div>
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────
function PickupSection({
  title,
  icon,
  open,
  onToggle,
  rows,
}: {
  sectionKey: SectionKey
  title: string
  icon: React.ReactNode
  open: boolean
  onToggle: () => void
  rows: PickupRow[]
}) {
  return (
   
    <div className="border-b border-slate-100">

      {/* Accordion header — always visible */}
      <button
        onClick={onToggle}
        className={`w-full px-6 py-3.5 flex items-center justify-between transition-colors bg-slate-50
        `}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
            {title}
          </span>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {rows.length}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Accordion body — only renders when open */}
      {open && (
        <div className="px-2 pb-6 bg-white">
          <PickupTable rows={rows} />
        </div>
      )}
    </div>
  )
}

// ── Table ─────────────────────────────────────────────────────────────────────
function PickupTable({ rows }: { rows: PickupRow[] }) {
  const [page, setPage] = useState(0)
  const perPage = 3
  const totalPages = Math.ceil(rows.length / perPage)
  const pageRows = rows.slice(page * perPage, page * perPage + perPage)

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-160">

        {/* Column headers */}
        <thead>
          <tr className="border-b border-slate-200">
            {COLUMNS.map((col) => (
              <th
                key={col.id}
                className={`py-3 px-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest ${col.className ?? ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Data rows */}
        <tbody className="divide-y divide-slate-100">
          {pageRows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              {COLUMNS.map((col) => (
                <td
                  key={col.id}
                  className={`py-4 px-2 align-top ${col.className ?? ""}`}
                >
                  {renderCellContent(col, row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination footer */}
      <div className="flex items-center justify-between pt-4 text-[10px] text-slate-400 font-medium">
        <span>
          Showing {pageRows.length} of {rows.length} pickups
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── ItemPill ──────────────────────────────────────────────────────────────────
function ItemPill({ label, qty }: { label: string; qty: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-white shadow-sm text-[10px] font-medium text-slate-700">
      {label}
      <span className="text-indigo-600 font-bold">{qty}</span>
    </span>
  )
}