"use client"

import Header from "@/components/Header"
import FinancialTrendChart from "@/components/overview/FinancialTrendChart"
import {
  AlertCircle,
  ChevronDown,
  Download,
  FileText,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────
interface StatCard {
  label: string
  value: string | number
  color?: string
}

interface ServiceHealthRow {
  id: string
  customer: string
  readyBy: string
  amount: string
  status: "OVERDUE" | "ON TRACK" | "PENDING"
}

interface RevenueLogRow {
  date: string
  revenue: string
  cash: string
  card: string
  bank: string
}

interface SectionProgressItem {
  label: string
  percentage: number
  color: string
}

// ── Static data ───────────────────────────────────────────────────────────────
const STATS: StatCard[] = [
  { label: "Orders",       value: "19",          color: "text-[#101828]"  },
  { label: "Pieces",       value: "281",          color: "text-[#101828]"  },
  { label: "Total Value",  value: "SAR 23,646",   color: "text-[#7F50F4]"  },
  { label: "Revenue",      value: "SAR 23,646",   color: "text-green-500"  },
  { label: "Discounts",    value: "SAR 75.60",    color: "text-red-400"    },
  { label: "Unpaid Inv.",  value: "0",            color: "text-orange-400" },
  { label: "Cleaned",      value: "113",          color: "text-[#02D0FF]"  },
]

const SERVICE_HEALTH_ROWS: ServiceHealthRow[] = [
  { id: "#4056", customer: "شركة بونيا",   readyBy: "24/01/26 12pm–1pm", amount: "SAR 15.00",  status: "OVERDUE"  },
  { id: "#4057", customer: "Ahmed Khalid", readyBy: "27/02/26 2pm–4pm",  amount: "SAR 42.00",  status: "ON TRACK" },
  { id: "#4058", customer: "Mariam S",     readyBy: "27/02/26 6pm–8pm",  amount: "SAR 108.00", status: "PENDING"  },
]

const STATUS_STYLES: Record<ServiceHealthRow["status"], string> = {
  OVERDUE:  "bg-red-50   text-red-500   border border-red-100",
  "ON TRACK": "bg-green-50 text-green-600 border border-green-100",
  PENDING:  "bg-amber-50 text-amber-500 border border-amber-100",
}

const REVENUE_LOG: RevenueLogRow[] = [
  { date: "2026-02-27", revenue: "SAR 930.05",   cash: "SAR 58.60",   card: "SAR 871.45",   bank: "SAR 0.00" },
  { date: "2026-02-26", revenue: "SAR 2,125.12", cash: "SAR 153.60",  card: "SAR 1,971.52", bank: "SAR 0.00" },
]

const TOP_SECTIONS: SectionProgressItem[] = [
  { label: "Wash & Iron — غسيل وكوي",   percentage: 84, color: "bg-[#7F50F4]"  },
  { label: "Bedding — مفارش",           percentage: 52, color: "bg-[#02D0FF]"  },
  { label: "Special Care — بخار",       percentage: 31, color: "bg-blue-300"   },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Overview() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] ">
      <Header />

      <main className="pt-14 pl-60 pb-12 min-h-screen">
        <div className="px-8 py-6 flex flex-col gap-8">

          {/* ── Page header ── */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-2xl font-bold text-[#101828]">Operational Analytics</h1>
              <p className="text-sm text-[#90A1B9]">Advanced business intelligence for Sashly Admin</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#45556C] shadow-sm hover:border-slate-300 transition-colors">
                <span className="text-slate-400">Feb 27, 2026 – Feb 27, 2026</span>
                <ChevronDown size={13} className="text-slate-400" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-[#7F50F4] hover:bg-[#6B3FD4] text-white rounded-xl text-xs font-bold transition-colors shadow-sm">
                <FileText size={14} />
                Export PDF
              </button>
            </div>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-7 gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col gap-1.5"
              >
                <span className="text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest">
                  {stat.label}
                </span>
                <span className={`text-xl font-bold ${stat.color ?? "text-[#101828]"}`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* ── Trends + Revenue Breakdown ── */}
          <div className="grid grid-cols-3 gap-6">

            {/* Financial Performance — col-span-2 */}
            <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-bold text-[#101828]">Financial Performance Trends</h3>
                  <p className="text-xs text-[#90A1B9]">Sales vs Target projection over time</p>
                </div>
                <button className="flex items-center gap-1.5 text-[11px] font-semibold border border-slate-200 px-3 py-1.5 rounded-xl text-[#45556C] bg-slate-50 hover:bg-slate-100 transition-colors">
                  Daily View <ChevronDown size={12} />
                </button>
              </div>

              {/* Recharts area chart */}
              <FinancialTrendChart />

              {/* KPI row */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-5">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#90A1B9] font-bold uppercase tracking-wide">Net Sales</span>
                  <span className="text-lg font-bold text-[#101828]">SAR 12,335.32</span>
                  <span className="text-[10px] text-red-500 flex items-center gap-1 font-semibold">
                    <TrendingDown size={10} /> -15% vs LY
                  </span>
                </div>
                <div className="border-l border-slate-100 pl-4 flex flex-col gap-1">
                  <span className="text-[10px] text-[#90A1B9] font-bold uppercase tracking-wide">Avg Order Value</span>
                  <span className="text-lg font-bold text-[#101828]">SAR 750.76</span>
                  <span className="text-[10px] text-green-500 flex items-center gap-1 font-semibold">
                    <TrendingUp size={10} /> +1% vs Prev
                  </span>
                </div>
                <div className="border-l border-slate-100 pl-4 flex flex-col gap-1">
                  <span className="text-[10px] text-[#90A1B9] font-bold uppercase tracking-wide">New Acquisitions</span>
                  <span className="text-lg font-bold text-[#101828]">238</span>
                  <span className="text-[10px] text-green-500 flex items-center gap-1 font-semibold">
                    <TrendingUp size={10} /> +15% Month
                  </span>
                </div>
              </div>
            </div>

            {/* Revenue Breakdown — col-span-1 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
              <div className="flex flex-col gap-5">
                <h3 className="text-sm font-bold text-[#101828]">Revenue Breakdown</h3>

                {/* Card payments */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#7F50F4]" />
                      Card Payments
                    </span>
                    <span className="text-[#101828]">SAR 871.45</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full">
                    <div className="h-1.5 w-[85%] bg-[#7F50F4] rounded-full" />
                  </div>
                </div>

                {/* Cash */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Cash
                    </span>
                    <span className="text-[#101828]">SAR 58.60</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full">
                    <div className="h-1.5 w-[15%] bg-green-500 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Adjustments Ledger */}
              <div className="pt-5 mt-5 border-t border-dashed border-slate-200 flex flex-col gap-3">
                <span className="text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest">
                  Adjustments Ledger
                </span>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#6A7282]">Credit Given</span>
                  <span className="text-red-500 font-bold">SAR 73.95</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#6A7282]">Manual Payouts</span>
                  <span className="text-[#101828] font-bold">SAR 0.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Service Health + Top Sections ── */}
          <div className="grid grid-cols-2 gap-6">

            {/* Service Health — col-span-2 */}
            <div className=" bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-lg">
                    <AlertCircle size={13} className="text-blue-600" />
                  </span>
                  Service Health
                </h3>
                <div className="flex items-center gap-2">
                  <button className="text-[10px] px-3 py-1.5 bg-[#02D0FF] text-white rounded-xl font-bold">
                    Critical Only
                  </button>
                  <button className="text-[10px] px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                    View All
                  </button>
                </div>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Order ID", "Customer", "Ready By", "Amount", "Status"].map((h) => (
                      <th
                        key={h}
                        className={`pb-3 text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest text-left ${
                          h === "Status" ? "text-right" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {SERVICE_HEALTH_ROWS.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 text-xs font-bold text-[#7F50F4]">{row.id}</td>
                      <td className="py-3.5 text-xs font-semibold text-[#101828]">{row.customer}</td>
                      <td className="py-3.5 text-xs text-[#90A1B9]">{row.readyBy}</td>
                      <td className="py-3.5 text-xs font-bold text-[#101828]">{row.amount}</td>
                      <td className="py-3.5 text-right">
                        <span className={`inline-flex px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wide ${STATUS_STYLES[row.status]}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Top Selling Sections — col-span-1 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
              <h3 className="text-sm font-bold text-[#101828]">Top Selling Sections</h3>
              <div className="flex flex-col gap-5">
                {TOP_SECTIONS.map((s) => (
                  <div key={s.label} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#314158]">{s.label}</span>
                      <span className="text-[10px] font-bold text-[#90A1B9]">
                        {s.percentage}% contribution
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${s.color}`}
                        style={{ width: `${s.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Revenue Log Table ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#101828]">Comprehensive Revenue Log</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#90A1B9] font-semibold">Show Subtotal</span>
                  <div className="w-9 h-5 bg-slate-200 rounded-full relative cursor-pointer">
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-semibold border border-slate-200 px-3 py-1.5 rounded-xl text-[#45556C] hover:bg-slate-50 transition-colors">
                  <Download size={13} /> CSV
                </button>
              </div>
            </div>

            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {["Date", "Revenue", "Paid by Cash", "Paid by Card", "Regular Card", "Paid by Bank"].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-left text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {REVENUE_LOG.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs text-[#6A7282] font-semibold">{row.date}</td>
                    <td className="px-6 py-4 text-xs font-bold text-[#101828]">{row.revenue}</td>
                    <td className="px-6 py-4 text-xs text-[#90A1B9] font-semibold">{row.cash}</td>
                    <td className="px-6 py-4 text-xs text-[#90A1B9] font-semibold">{row.card}</td>
                    <td className="px-6 py-4 text-xs text-[#90A1B9] font-semibold">{row.card}</td>
                    <td className="px-6 py-4 text-xs text-[#90A1B9] font-semibold">{row.bank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  )
}
