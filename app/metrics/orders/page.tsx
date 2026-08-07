"use client";
import { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import MetricsSidebar from "@/components/metrics/MetricsSideBar";
import { 
  CheckCircle, ShoppingCart, XCircle, ArrowDown, 
  FileText, Loader2, Gauge, Zap, PackagePlus, Sparkles
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts";
import { getOperationalOrderMetrics, OperationalOrderMetrics, ServiceTypeBreakdown } from "@/lib/firebase/metrics-orders";
import { presetToRange } from "@/lib/date-presets";
import DateRangePicker, { DateRangeChangePayload } from "@/components/metrics/DateRangePicker";
import PurpleTopBar from "@/components/metrics/PurpleTopBar";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";

type ActiveChartMetric = "orders" | "completed" | "cancelled" | "firstOrders";



export default function MetricsOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [chartMetric, setChartMetric] = useState<ActiveChartMetric>("orders");
  const [metrics, setMetrics] = useState<OperationalOrderMetrics | null>(null);

  const [rangeLabel, setRangeLabel] = useState("30d");
  // Keep track of active timestamps so dynamic period buttons can reuse them
  const [currentRange, setCurrentRange] = useState<{ startMs: number; endMs: number }>(() => {
    return presetToRange("30d");
  });

  const printRef = useRef<HTMLDivElement>(null);

  const fetchData = async (startMs: number, endMs: number, currentPeriod: "daily" | "weekly" | "monthly") => {
    setLoading(true);
    setFetchError(false);
    try {
      const data = await getOperationalOrderMetrics(startMs, endMs, currentPeriod);
      setMetrics(data);
    } catch (err) {
      console.error(err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  // Re-run whenever period state OR current selected timeframe boundary timestamps alter
  useEffect(() => {
    fetchData(currentRange.startMs, currentRange.endMs, period);
  }, [period, currentRange]);
  
  const handleRangeChange = ({ startMs, endMs, label }: DateRangeChangePayload) => {
    setRangeLabel(label);
    setCurrentRange({ startMs, endMs });
  };
  // const handleCsvExport = () => {
  //   if (!metrics || metrics.reportRows.length === 0) return;
  //   exportToCsv(
  //     metrics.reportRows.map(r => ({
  //       "Date Node": r.date,
  //       "Total Orders Count": r.orders,
  //       "Acquired New Customers": r.firstOrders,
  //       "Completed Deliveries": r.completed,
  //       "Cancelled Drops": r.cancelled,
  //       "Operational Completion Rate %": `${r.completionRate.toFixed(1)}%`
  //     })),
  //     `Operational_Activity_Report_${rangeLabel}.csv`
  //   );
  // };

  const chartConfig = {
    [chartMetric]: { label: chartMetric.toUpperCase(), color: "#7F50F4" }
  };

  return (
    <div className="flex h-screen bg-white">
      <MetricsSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto pt-16 pl-60 pb-16">

          {/* Core Controls Top Bar */}
          <section className="flex items-center justify-between px-8 py-5 border-b border-slate-100 print:hidden">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Orders Metrics</h1>
              <p className="text-sm text-slate-400">Order lifecycle management parameters and customer acquisition analysis</p>
            </div>

            <div className="flex items-center gap-3">
              <DateRangePicker defaultPreset="30d" onRangeChange={handleRangeChange} />
              {/* <button onClick={() => handlePdf()} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition"><FileText className="h-4 w-4 text-slate-400" /> Export PDF</button>
              <button onClick={handleCsvExport} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#16B4CF] hover:bg-[#119CB4] text-white text-sm font-semibold shadow-md transition"><ArrowDown className="h-4 w-4" /> Export CSV</button> */}
            </div>
          </section>

          {loading ? (
           <LoadingState title="Compiling order operational logs" className="h-[50vh] border-0 shadow-none" />
           ) : fetchError ? (
             <div className="px-8 py-10">
               <ErrorState description="We couldn't load order metrics." onRetry={() => fetchData(currentRange.startMs, currentRange.endMs, period)} />
             </div>
           ) : (
            <div ref={printRef} className="flex flex-col gap-8 px-8 py-6 print:p-6 bg-white">
              
              {/* Hidden Print Header Details */}
              <div className="hidden print:flex flex-col border-b border-slate-200 pb-4 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">Operational Order Matrix Log</h1>
                <p className="text-xs text-slate-500">Selected Window: {rangeLabel} · Printed on: {new Date().toLocaleDateString("en-GB")}</p>
              </div>

              {/* Row 1: Operational KPI Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Orders", value: metrics?.totalOrders.toLocaleString(), desc: "Created in period", icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-50" },
                  { label: "Completed Orders", value: metrics?.completedOrders.toLocaleString(), desc: "Delivered successfully", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { label: "Cancelled Orders", value: metrics?.cancelledOrders.toLocaleString(), desc: "Dropped requests", icon: XCircle, color: "text-rose-500", bg: "bg-rose-50" },
                  { label: "First-Time Orders", value: metrics?.firstTimeOrders.toLocaleString(), sub: metrics && metrics.totalOrders > 0 ? `${((metrics.firstTimeOrders / metrics.totalOrders) * 100).toFixed(1)}% of total` : "0%", icon: Sparkles, color: "text-indigo-500", bg: "bg-indigo-50" },
                  { label: "Avg Order Value", value: `SAR ${(metrics?.averageOrderValue ?? 0).toFixed(1)}`, desc: "Completed orders only", icon: Gauge, color: "text-amber-500", bg: "bg-amber-50" },
                  { label: "Avg Items / Order", value: `${(metrics?.averageItemsPerOrder ?? 0).toFixed(1)} pcs`, desc: "Completed orders only", icon: PackagePlus, color: "text-purple-500", bg: "bg-purple-50" },
                ].map((c, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm min-w-[140px]">
                    <div className="flex items-start justify-between w-full gap-2">
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-tight">{c.label}</p>
                      <div className={`${c.bg} p-1 rounded-md shrink-0`}><c.icon className={`h-3.5 w-3.5 ${c.color}`} /></div>
                    </div>
                    <div className="mt-3">
                      <h3 className="text-lg font-bold text-slate-800 tracking-tight">{c.value}</h3>
                      {c.desc && <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">{c.desc}</p>}
                      {c.sub && <p className="text-[10px] text-indigo-600 font-bold mt-0.5 leading-none">{c.sub}</p>}
                    </div>
                  </div>
                ))}

                {/* Express Volume — demand count with fulfillment-outcome breakdown */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm min-w-[140px]">
                  <div className="flex items-start justify-between w-full gap-2">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-tight">Express Volume</p>
                    <div className="bg-cyan-50 p-1 rounded-md shrink-0"><Zap className="h-3.5 w-3.5 text-cyan-500" /></div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">{metrics?.expressOrders.toLocaleString()}</h3>
                    <p className="text-[10px] text-indigo-600 font-bold mt-0.5 leading-none">
                      {metrics && metrics.totalOrders > 0 ? `${((metrics.expressOrders / metrics.totalOrders) * 100).toFixed(1)}% of demand` : "0%"}
                    </p>
                    {metrics && <BreakdownLine breakdown={metrics.expressBreakdown} />}
                  </div>
                </div>

                {/* Ordinary Orders — demand count with fulfillment-outcome breakdown */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm min-w-[140px]">
                  <div className="flex items-start justify-between w-full gap-2">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-tight">Ordinary Orders</p>
                    <div className="bg-slate-50 p-1 rounded-md shrink-0"><ShoppingCart className="h-3.5 w-3.5 text-slate-500" /></div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">{metrics?.ordinaryOrders.toLocaleString()}</h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">Standard workflow</p>
                    {metrics && <BreakdownLine breakdown={metrics.ordinaryBreakdown} />}
                  </div>
                </div>
              </div>

              {/* Row 2: Performance Graph Segment */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-6 print:break-inside-avoid">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Order Metrics</h2>
                    <p className="text-xs text-slate-400">Visual mapping of operational performance across time nodes</p>
                  </div>
                  
                  {/* Operational Metric Selectors & Period Controls */}
                  <div className="flex flex-wrap items-center gap-4 print:hidden">
                    <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold border border-slate-200">
                      {[
                        { key: "orders", label: "Total Orders" },
                        { key: "completed", label: "Completed" },
                        { key: "cancelled", label: "Cancelled" },
                        { key: "firstOrders", label: "First-Time" }
                      ].map((m) => (
                        <button key={m.key} onClick={() => setChartMetric(m.key as ActiveChartMetric)}
                          className={`px-3 py-1 rounded-md transition ${chartMetric === m.key ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{m.label}</button>
                      ))}
                    </div>

                    <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold border border-slate-200">
                      {(["daily", "weekly", "monthly"] as const).map((p) => (
                        <button key={p} onClick={() => setPeriod(p)}
                          className={`px-3 py-1 rounded-md transition capitalize ${period === p ? "bg-white text-[#7F50F4] shadow-sm" : "text-slate-500"}`}>{p}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <ChartContainer config={chartConfig} className="w-full h-60">
                  <BarChart data={metrics?.chartData ?? []}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey={chartMetric} shape={<PurpleTopBar />} />
                  </BarChart>
                </ChartContainer>
              </div>

              {/* Row 3: Primary Core Table - Order Activity Matrix */}
              <div className="flex flex-col gap-3 print:break-inside-avoid">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Order Activity Matrix Report</h2>
                  <p className="text-xs text-slate-400">Aggregated daily operational workflow outputs</p>
                </div>
                {/* Scrollable Container Wrapper */}
                <div className="border border-slate-200 rounded-2xl shadow-sm bg-white overflow-hidden">
                  <div className="max-h-[550px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-xs table-fixed min-w-[600px]">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                        <tr>
                          <th className="px-6 py-4 text-left bg-slate-50 w-[20%]">Date Node</th>
                          <th className="px-6 py-4 text-center bg-slate-50 w-[16%]">Orders Placed</th>
                          <th className="px-6 py-4 text-center bg-slate-50 w-[18%]">First Time Orders</th>
                          <th className="px-6 py-4 text-center bg-slate-50 w-[16%]">Completed Orders</th>
                          <th className="px-6 py-4 text-center bg-slate-50 w-[16%]">Cancelled Orders</th>
                          <th className="px-6 py-4 text-right pr-8 bg-slate-50 w-[14%]">Completion Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {!metrics || metrics.reportRows.length === 0 ? (
                           <tr><td colSpan={6} className="p-0"><EmptyState title="No records" description="No records matching the selected criteria." className="border-0 rounded-none" /></td></tr>
                         ) : (
                          metrics.reportRows.map((r) => (
                            <tr key={r.rawSortKey} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-6 py-3.5 font-semibold text-slate-600 truncate">{r.date}</td>
                              <td className="px-6 py-3.5 text-center font-bold text-slate-800">{r.orders}</td>
                              <td className="px-6 py-3.5 text-center"><span className={r.firstOrders > 0 ? "bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold" : "text-slate-400"}>{r.firstOrders}</span></td>
                              <td className="px-6 py-3.5 text-center text-emerald-600 font-semibold">{r.completed}</td>
                              <td className="px-6 py-3.5 text-center text-rose-500 font-medium">{r.cancelled}</td>
                              <td className="px-6 py-3.5 text-right pr-8 font-bold text-slate-800">{r.completionRate.toFixed(1)}%</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Row 4: Secondary Isolated Table -Customer Acquisition List */}
              <div className="flex flex-col gap-3 page-break-before print:mt-8">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-500 fill-indigo-500" /> First Time Customer Conversions
                  </h2>
                  <p className="text-xs text-slate-400">Detailed list of newly acquired customer orders converted within this period</p>
                </div>
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                  <div className="max-h-[550px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-left">Order Reference</th>
                        <th className="px-6 py-4 text-left">Customer Profile</th>
                        <th className="px-6 py-4 text-center">Conversion Date</th>
                        <th className="px-6 py-4 text-center">Ticket Status</th>
                        <th className="px-6 py-4 text-right pr-8">Total Ticket</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {!metrics || metrics.firstOrderRows.length === 0 ? (
                         <tr><td colSpan={5} className="p-0"><EmptyState title="No new customer conversions" description="No first-time orders were placed in this period." className="border-0 rounded-none" /></td></tr>
                       ) : (
                        metrics.firstOrderRows.map((f) => (
                          <tr key={f.orderId} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-6 py-3.5 align-middle">
                              <div className="flex flex-col items-start gap-0.5">
                                <span className="font-bold text-slate-800">#{f.orderNumber}</span>
                                <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded uppercase tracking-wide">⭐ First Order</span>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 font-medium text-slate-800 align-middle">{f.customer}</td>
                            <td className="px-6 py-3.5 text-center text-slate-400 font-medium align-middle">{new Date(f.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                            <td className="px-6 py-3.5 text-center align-middle">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                f.status === "delivered" || f.status === "completed" ? "bg-green-50 text-green-600" : f.status === "cancelled" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                              }`}>{f.status}</span>
                            </td>
                            <td className="px-6 py-3.5 text-right pr-8 font-bold text-slate-900 align-middle">SAR {f.total.toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// helpers

// Small inline fulfillment-outcome breakdown, e.g. "62% delivered · 12% cancelled · 26% pending"
function BreakdownLine({ breakdown }: { breakdown: ServiceTypeBreakdown }) {
  if (breakdown.total === 0) return null;
  return (
    <p className="text-[9px] text-slate-400 font-semibold mt-1 leading-tight">
      <span className="text-emerald-500">{breakdown.completedPct.toFixed(0)}% delivered</span>
      {" · "}
      <span className="text-rose-400">{breakdown.cancelledPct.toFixed(0)}% cancelled</span>
      {" · "}
      <span className="text-slate-400">{breakdown.pendingPct.toFixed(0)}% pending</span>
    </p>
  );
}