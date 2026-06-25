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

type Preset = "7d" | "30d" | "90d" | "365d" | "custom";
const PRESETS: { key: Preset; label: string }[] = [
  { key: "7d",     label: "Last 7 days"  },
  { key: "30d",    label: "Last 30 days" },
  { key: "90d",    label: "Last 90 days" },
  { key: "365d",   label: "Last year"    },
  { key: "custom", label: "Custom range" },
];

function presetToRange(p: Preset) {
  const now = Date.now();
  if (p === "custom") return { startMs: now - 30 * 86400000, endMs: now };
  return { startMs: now - parseInt(p) * 86400000, endMs: now };
}

const fmtDate = (ms: number | null) =>
  ms ? new Date(ms).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function GeographyReportPage() {
  const [preset,      setPreset]      = useState<Preset>("30d");
  const [pickerOpen,  setPickerOpen]  = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd,   setCustomEnd]   = useState("");
  const [stats,       setStats]       = useState<AreaStats[]>([]);
  const [loading,     setLoading]     = useState(true);

  const currentLabel = preset === "custom" && customStart && customEnd
    ? `${customStart} to ${customEnd}`
    : PRESETS.find(p => p.key === preset)?.label ?? "Last 30 days";

  const fetchData = useCallback(async (p: Preset, cStart?: string, cEnd?: string) => {
    setLoading(true);
    let startMs: number | undefined, endMs: number | undefined;
    if (p === "custom" && cStart && cEnd) {
      startMs = new Date(cStart).getTime();
      endMs   = new Date(cEnd).getTime() + 86400000 - 1;
    } else if (p !== "custom") {
      ({ startMs, endMs } = presetToRange(p));
    }
    try {
      setStats(await getGeographyReport(startMs, endMs));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(preset); }, []);

  const handlePreset = (p: Preset) => {
    setPreset(p);
    if (p !== "custom") { setPickerOpen(false); fetchData(p); }
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
      `geography-report-${preset}.csv`
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
                {stats.length} areas · {currentLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu open={pickerOpen} onOpenChange={setPickerOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 transition outline-none">
                  <CalendarDays size={15} className="text-slate-400" />
                  {currentLabel}
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[220px] rounded-xl p-1">
                {PRESETS.map(p => (
                  <DropdownMenuItem key={p.key}
                    onSelect={e => { if (p.key === "custom") e.preventDefault(); handlePreset(p.key); }}
                    className={`rounded-lg px-3 py-2 text-sm font-medium cursor-pointer ${
                      preset === p.key ? "text-indigo-600 bg-indigo-50" : "text-slate-600"
                    }`}
                  >
                    {p.label}
                  </DropdownMenuItem>
                ))}
                {preset === "custom" && (
                  <>
                    <DropdownMenuSeparator className="my-1" />
                    <div className="px-3 pb-2 pt-1 flex flex-col gap-2" onPointerDown={e => e.stopPropagation()}>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From</label>
                        <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                          className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To</label>
                        <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                          className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      </div>
                      <button onClick={() => { setPickerOpen(false); fetchData("custom", customStart, customEnd); }}
                        disabled={!customStart || !customEnd}
                        className="mt-0.5 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg transition disabled:opacity-40">
                        Apply Range
                      </button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

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