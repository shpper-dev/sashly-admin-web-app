"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import Header from "@/components/Header";
import {
  getCustomerMetrics, buildCustomerReportRows,
  CustomerMetric, CustomerReportRow,
} from "@/lib/firebase/metrics-customers";
import {
  Download, Loader2, Search, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { exportToCsv, fmtSAR } from "@/lib/utils";
import DateRangePicker, { DateRangeChangePayload } from "@/components/metrics/DateRangePicker";
import { presetToRange } from "@/lib/date-presets";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";

export default function CustomerReportPage() {
  const [rows,        setRows]        = useState<CustomerReportRow[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState(false);
  const [search,      setSearch]      = useState("");
  const [rangeLabel, setRangeLabel] = useState("Last 30 days");
  const [lastRange, setLastRange] = useState(() => presetToRange("30d"));

  const fetchData = useCallback(async (startMs: number, endMs: number) => {
    setLoading(true);
    setFetchError(false);
    setLastRange({ startMs, endMs });
    try {
      const stats = await getCustomerMetrics(startMs, endMs);
      setRows(buildCustomerReportRows(stats.customers));
      } catch (e) {
      console.error("Failed to load customer report:", e);
      setFetchError(true);
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

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const handleCsv = () => {
    exportToCsv(
      filtered.map(r => ({
        Name:               r.name,
        Email:              r.email,
        Phone:              `="${r.phone || ""}"`,
        "Signed Up":        r.signupDate,
        "Total Orders (All Time)": r.totalOrdersAllTime,
        "First Order (All Time)":  r.firstOrderDate,
        "Last Order (All Time)":   r.lastOrderDate,
        "Spend in Range":   r.spendInRange.toFixed(2),
        "LTV (All Time)":   r.ltv.toFixed(2),
        "Avg Order Value (All Time)": r.avgOrderValue.toFixed(2),
        Type:               r.type,
      })),
      `customer-report-${rangeLabel}.csv`
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16 pl-60 pb-12 flex flex-col gap-0">

        <section className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Link href="/metrics/reports" className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-400">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Customer Report</h1>
              <p className="text-sm text-slate-500">
                {filtered.length} customers · {rangeLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
           <DateRangePicker defaultPreset="30d" onRangeChange={handleRangeChange} />
            <button onClick={handleCsv}
              className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyan-600 transition">
              <Download size={15} /> Export CSV
            </button>
          </div>
        </section>

        <section className="px-8 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">{filtered.length} rows</p>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm w-72">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="bg-transparent outline-none text-xs text-slate-600 placeholder:text-slate-400 w-full" />
          </div>
        </section>

        {loading ? (
          <LoadingState title="Loading customer report" className="h-[50vh] border-0 shadow-none" />
         ) : fetchError ? (
           <div className="px-8 py-10">
             <ErrorState description="We couldn't load the customer report." onRetry={() => fetchData(lastRange.startMs, lastRange.endMs)} />
           </div>
         ) : (
          <section className="overflow-x-auto overflow-y-auto max-h-[70vh]">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                  {["#","Name","Email","Phone","Signed Up","Total Orders (All Time)","First Order (All Time)","Last Order (All Time)","Spend (Range)","LTV (All Time)","AOV (All Time)","Type"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-0">
                       <EmptyState
                         title="No customers found"
                         description={search ? "Try a different search term." : "No customer data for this period."}
                         className="border-0 rounded-none"
                       />
                     </td>
                  </tr>
                ) : filtered.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-300 font-bold">{String(i + 1).padStart(2, "0")}</td>
                    <td className="px-5 py-3 font-semibold text-slate-700 whitespace-nowrap">{r.name}</td>
                    <td className="px-5 py-3 text-slate-500">{r.email}</td>
                    <td className="px-5 py-3 text-slate-500">{r.phone || "—"}</td>
                    <td className="px-5 py-3 text-slate-500">{r.signupDate}</td>
                    <td className="px-5 py-3 font-bold text-indigo-600 text-center">{r.totalOrdersAllTime}</td>
                    <td className="px-5 py-3 text-slate-500">{r.firstOrderDate}</td>
                    <td className="px-5 py-3 text-slate-500">{r.lastOrderDate}</td>
                    <td className="px-5 py-3 font-semibold text-slate-700">{fmtSAR(r.spendInRange)}</td>
                    <td className="px-5 py-3 font-bold text-purple-600">{fmtSAR(r.ltv)}</td>
                    <td className="px-5 py-3 font-semibold text-slate-600">{fmtSAR(r.avgOrderValue)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.type === "New"       ? "bg-emerald-50 text-emerald-600" :
                        r.type === "Returning" ? "bg-blue-50 text-blue-600"       :
                        r.type === "Active"    ? "bg-indigo-50 text-indigo-600"   :
                        r.type === "Deleted"   ? "bg-red-50 text-red-500"         :
                        "bg-slate-100 text-slate-400"
                      }`}>
                        {r.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}