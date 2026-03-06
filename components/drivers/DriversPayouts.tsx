"use client"

import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  MoreHorizontal,
  Wallet,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────
export type TableHeading = {
  id: string
  title: string | null
}

interface StatCardData {
  title: string
  value: string
  accent: "purple" | "green" | "slate"
  icon: React.ReactNode
}

interface PayoutRow {
  id: string
  time: string
  type: "Commission" | "Bonus" | "Adjustment"
  amount: string
  sign: "+" | "-"
  staff: string
}

// ── Data ──────────────────────────────────────────────────────────────────────
const STATS: StatCardData[] = [
  {
    title: "Pending Payout (SAR)",
    value: "1,240.50",
    accent: "purple",
    icon: <Wallet className="w-4 h-4" />,
  },
  {
    title: "Total Paid (SAR)",
    value: "45,820.00",
    accent: "green",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  {
    title: "Lifetime Earnings (SAR)",
    value: "47,060.50",
    accent: "slate",
    icon: <Wallet className="w-4 h-4" />,
  },
]

// Figma-spec card styles per accent
const CARD_STYLES = {
  purple: {
    wrap:  "bg-[rgba(124,93,250,0.05)] border border-[rgba(124,93,250,0.1)]",
    label: "text-[#7F50F4]/70",
    value: "text-[#7F50F4]",
    icon:  "bg-[rgba(124,93,250,0.1)] text-[#7F50F4]",
  },
  green: {
    wrap:  "bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]",
    label: "text-emerald-500/70",
    value: "text-emerald-600",
    icon:  "bg-emerald-100 text-emerald-600",
  },
  slate: {
    wrap:  "bg-[rgba(100,116,139,0.05)] border border-[rgba(100,116,139,0.1)]",
    label: "text-slate-400",
    value: "text-slate-700",
    icon:  "bg-slate-200 text-slate-500",
  },
}

const TABLE_HEADINGS: TableHeading[] = [
  { id: "id",           title: "ID"           },
  { id: "time",         title: "Time"         },
  { id: "payment_type", title: "Payment Type" },
  { id: "amount",       title: "Amount"       },
  { id: "staff",        title: "Staff"        },
  { id: "action",       title: "Action"       },
]

const TYPE_STYLES: Record<PayoutRow["type"], string> = {
  Commission: "bg-blue-50   text-blue-600   border border-blue-100",
  Bonus:      "bg-[#F2EDFF] text-[#7F50F4]  border border-[rgba(124,93,250,0.15)]",
  Adjustment: "bg-orange-50 text-orange-600 border border-orange-100",
}

const ROWS: PayoutRow[] = [
  { id: "#9921", time: "Oct 24, 2023 · 14:30", type: "Commission", amount: "154.00", sign: "+", staff: "System Auto"  },
  { id: "#9840", time: "Oct 20, 2023 · 09:15", type: "Bonus",      amount: "154.00", sign: "+", staff: "M. Al-Fahad" },
  { id: "#9840", time: "Oct 12, 2023 · 12:00", type: "Adjustment", amount: "154.00", sign: "-", staff: "M. Al-Fahad" },
]

// ── Cell renderer ─────────────────────────────────────────────────────────────
function renderCellContent(heading: TableHeading, row: PayoutRow) {
  switch (heading.id) {
    case "id":
      return <span className="font-bold text-[#7F50F4] text-xs">{row.id}</span>

    case "time":
      return <span className="text-xs text-[#6A7282]">{row.time}</span>

    case "payment_type":
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full ${TYPE_STYLES[row.type]}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {row.type}
        </span>
      )

    case "amount":
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold text-[#02D0FF] uppercase tracking-wide">SAR</span>
          <span className={`text-sm font-bold ${row.sign === "-" ? "text-red-500" : "text-[#101828]"}`}>
            {row.sign}{row.amount}
          </span>
        </div>
      )

    case "staff":
      return <span className="text-xs text-[#314158] font-medium">{row.staff}</span>

    case "action":
      return (
        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      )

    default:
      return null
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DriverPayouts() {
  return (
    <div className="overflow-y-auto bg-white p-6 flex flex-col gap-7 h-full ">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {STATS.map((stat) => {
          const s = CARD_STYLES[stat.accent]
          return (
            <div
              key={stat.title}
              className={`flex flex-col items-start gap-2.5 p-5 rounded-3xl ${s.wrap}`}
              style={{ minHeight: 145 }}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.icon}`}>
                {stat.icon}
              </div>
              <div className="flex flex-col gap-1">
                <span className={`text-[9px] font-bold uppercase tracking-widest ${s.label}`}>
                  {stat.title}
                </span>
                <span className={`text-2xl font-bold ${s.value}`}>
                  {stat.value}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Payout History header ── */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-md font-bold text-[#101828]">Payout History</h3>
          <p className="text-xs text-[#90A1B9]">View and manage driver transaction history</p>
        </div>
        <button className="flex items-center gap-2 bg-[#7F50F4] hover:bg-[#6B3FD4] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm">
          <FileText className="w-3.5 h-3.5" />
          Process Payout
        </button>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl border border-slate-100 shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              {TABLE_HEADINGS.map((h) => (
                <th
                  key={h.id}
                  className={`px-5 py-3.5 text-left text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest ${
                    h.id === "action" ? "text-right" : ""
                  }`}
                >
                  {h.title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50 bg-white">
            {ROWS.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                {TABLE_HEADINGS.map((h) => (
                  <td
                    key={h.id}
                    className={`px-5 py-4 text-sm ${h.id === "action" ? "text-right" : ""}`}
                  >
                    {renderCellContent(h, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

          <tfoot className="border-t border-slate-100 bg-slate-50">
            <tr>
              <td colSpan={TABLE_HEADINGS.length}>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs text-[#90A1B9] font-medium">
                    Showing 1–3 of 42 payouts
                  </span>
                  <div className="flex gap-2">
                    <button className="w-5 h-5 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors text-xs font-bold">
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button className="w-5 h-5 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors text-xs font-bold">
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Bottom actions ── */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs font-bold hover:bg-red-100 transition-colors">
          <Ban className="w-3.5 h-3.5" />
          Block Driver
        </button>
        <button className="flex items-center gap-2 bg-[#7F50F4] hover:bg-[#6B3FD4] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm">
          <Download className="w-3.5 h-3.5" />
          Export Report
        </button>
      </div>

    </div>
  )
}