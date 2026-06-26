"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import Header from "@/components/Header";
import { getGeographyReport, AreaStats } from "@/lib/firebase/metrics-geography";
import {
  CalendarDays, ChevronDown, Download, FileText,
  Loader2, MapPin, ArrowLeft,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { exportToCsv } from "@/lib/utils";
import { fmtSAR } from "../page";
import { presetToRange } from "@/lib/date-presets";
import DateRangePicker, { DateRangeChangePayload } from "@/components/metrics/DateRangePicker";


const fmtDate = (ms: number | null) =>
  ms ? new Date(ms).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function GeographyReportPage() {
  const [stats,       setStats]       = useState<AreaStats[]>([]);
  const [loading,     setLoading]     = useState(true);

  const [rangeLabel, setRangeLabel] = useState("Last 30 days");


  const fetchData = useCallback(async (startMs: number, endMs: number) => {
    setLoading(true);
    try {
      setStats(await getGeographyReport(startMs, endMs));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
  const { startMs, endMs } = presetToRange("30d"); 
  fetchData(startMs, endMs);
}, []);

 const handleRangeChange = ({ startMs, endMs, label }: DateRangeChangePayload) => {
    setRangeLabel(label);
    fetchData(startMs, endMs);
  };
 

  // Summary totals for the stat cards at the top
  const totals = useMemo(() => ({
    customers: stats.reduce((s, a) => s + a.registeredCustomers, 0),
    orders:    stats.reduce((s, a) => s + a.totalOrders, 0),
    revenue:   stats.reduce((s, a) => s + a.totalRevenue, 0),
    express:   stats.reduce((s, a) => s + a.expressOrders, 0),
    ordinary:  stats.reduce((s, a) => s + a.ordinaryOrders, 0),
    aov:       stats.reduce((s, a) => s + a.totalRevenue, 0) /
               Math.max(stats.reduce((s, a) => s + a.totalOrders, 0), 1),
  }), [stats]);

  const handleCsv = () => {
    exportToCsv(
      stats.map(a => ({
        Area:                    a.area,
        "Registered Customers":  a.registeredCustomers,
        "Active Customers":      a.activeCustomers,
        "Total Orders":          a.totalOrders,
        "First Order":           fmtDate(a.firstOrderDate),
        "Last Order":            fmtDate(a.lastOrderDate),
        "Express Orders":        a.expressOrders,
        "Ordinary Orders":       a.ordinaryOrders,
        "Total Revenue (SAR)":   a.totalRevenue.toFixed(2),
        "AOV (SAR)":             a.aov.toFixed(2),
      })),
      `geography-report-${rangeLabel}.csv`
    );
  };

//   const handlePdf = async () => {
//     await exportToPdf(
//       `Geographic Report — ${currentLabel}`,
//       ["Area", "Customers", "Active", "Orders", "First Order", "Last Order", "Express", "Ordinary", "Revenue", "AOV"],
//       stats.map(a => [
//         a.area, a.registeredCustomers, a.activeCustomers, a.totalOrders,
//         fmtDate(a.firstOrderDate), fmtDate(a.lastOrderDate),
//         a.expressOrders, a.ordinaryOrders,
//         a.totalRevenue.toFixed(2), a.aov.toFixed(2),
//       ]),
//       `geography-report-${preset}.pdf`
//     );
//   };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16 pl-60 pb-12 flex flex-col gap-0">

        {/* Header */}
        <section className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Link href="/metrics/reports" className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-400">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Geographic Report</h1>
              <p className="text-sm text-slate-500">
                {stats.length} areas · {rangeLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
           <DateRangePicker defaultPreset="30d" onRangeChange={handleRangeChange} />

            {/* <button onClick={handlePdf}
              className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 transition">
              <FileText size={15} className="text-blue-500" /> Export PDF
            </button> */}
            <button onClick={handleCsv}
              className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyan-600 transition">
              <Download size={15} /> Export CSV
            </button>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            {/* Summary stat cards */}
            <section className="grid grid-cols-3 md:grid-cols-6 gap-4 px-8 py-5 border-b border-slate-100">
              {[
                { label: "Total Customers", value: totals.customers.toLocaleString() },
                { label: "Total Orders",    value: totals.orders.toLocaleString() },
                { label: "Total Revenue",   value: fmtSAR(totals.revenue) },
                { label: "Express Orders",  value: totals.express.toLocaleString() },
                { label: "Ordinary Orders", value: totals.ordinary.toLocaleString() },
                { label: "Avg Order Value", value: fmtSAR(totals.aov) },
              ].map(card => (
                <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">{card.value}</p>
                </div>
              ))}
            </section>

            {/* Table */}
            <section className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {["#","Area","Registered","Active Customers","Total Orders","First Order","Last Order","Express","Ordinary","Revenue","AOV"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {stats.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-5 py-12 text-center text-slate-400">No data for this period.</td>
                    </tr>
                  ) : stats.map((row, i) => (
                    <tr key={row.area} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-slate-300 font-bold">{String(i + 1).padStart(2, "0")}</td>
                      <td className="px-5 py-3 font-semibold text-slate-800 whitespace-nowrap flex items-center gap-2">
                        <MapPin size={12} className="text-cyan-500 shrink-0" />
                        {row.area}
                      </td>
                      <td className="px-5 py-3 text-slate-600 text-center">{row.registeredCustomers}</td>
                      <td className="px-5 py-3 text-indigo-600 font-semibold text-center">{row.activeCustomers}</td>
                      <td className="px-5 py-3 font-bold text-slate-800 text-center">{row.totalOrders}</td>
                      <td className="px-5 py-3 text-slate-500">{fmtDate(row.firstOrderDate)}</td>
                      <td className="px-5 py-3 text-slate-500">{fmtDate(row.lastOrderDate)}</td>
                      <td className="px-5 py-3 text-purple-600 font-semibold text-center">{row.expressOrders}</td>
                      <td className="px-5 py-3 text-slate-600 text-center">{row.ordinaryOrders}</td>
                      <td className="px-5 py-3 font-bold text-slate-800">{fmtSAR(row.totalRevenue)}</td>
                      <td className="px-5 py-3 font-bold text-emerald-600">{fmtSAR(row.aov)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>
    </div>
  );
}