"use client";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import MetricsSidebar from "@/components/metrics/MetricsSideBar";
import {
  Banknote, Clock, XCircle, TrendingUp, TrendingDown, Loader2,
  Tag, Award, BarChart3, Building2, UserPlus, Settings2,
  PlusCircle, Undo2, AlertTriangle,
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts";
import {
  getRevenueMetrics,
  calculateNetProfit,
  DEFAULT_COST_FACTORS,
  RevenueCostFactors,
  RevenueMetrics,
} from "@/lib/firebase/metrics-revenue";
import { presetToRange } from "@/lib/date-presets";
import DateRangePicker, { DateRangeChangePayload } from "@/components/metrics/DateRangePicker";

type ChartMetric = "grossRevenue" | "realizedRevenue" | "cancelledRevenue" | "netProfit" | "refundedAmount";

const ISSUE_TYPE_LABELS: Record<string, string> = {
  missing_item: "Missing Item",
  damaged: "Damaged Item",
  wrong_service: "Wrong Service",
  driver_behaviour: "Driver Behaviour",
  delivery_problem: "Delivery Problem",
  other: "Other",
};

function PurpleTopBar(props: any) {
  const { x, y, width, height } = props;
  if (!width || !height) return null;
  const radius = 6;
  const color = "#7F50F4";
  return (
    <g>
      <path d={`M ${x},${y + height} L ${x},${y + radius} Q ${x},${y} ${x + radius},${y} L ${x + width - radius},${y} Q ${x + width},${y} ${x + width},${y + radius} L ${x + width},${y + height} Z`} fill="rgba(127,80,244,0.12)" />
      <path d={`M ${x},${y + radius} Q ${x},${y} ${x + radius},${y} L ${x + width - radius},${y} Q ${x + width},${y} ${x + width},${y + radius}`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

function fmtSAR(n: number): string {
  return `SAR ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function MetricsRevenuePage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [chartMetric, setChartMetric] = useState<ChartMetric>("realizedRevenue");
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [rangeLabel, setRangeLabel] = useState("30d");
  const [currentRange, setCurrentRange] = useState<{ startMs: number; endMs: number }>(() => presetToRange("30d"));
  const [costFactors, setCostFactors] = useState<RevenueCostFactors>(DEFAULT_COST_FACTORS);

  const fetchData = async (startMs: number, endMs: number, currentPeriod: "daily" | "weekly" | "monthly") => {
    setLoading(true);
    try {
      const data = await getRevenueMetrics(startMs, endMs, currentPeriod);
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(currentRange.startMs, currentRange.endMs, period); }, [period, currentRange]);

  const handleRangeChange = ({ startMs, endMs, label }: DateRangeChangePayload) => {
    setRangeLabel(label);
    setCurrentRange({ startMs, endMs });
  };

  const netProfit = useMemo(() => {
    if (!metrics) return null;
    return calculateNetProfit(
      metrics.realizedRevenue,
      metrics.completedOrdersCount,
      metrics.driverEarningsTotal,
      metrics.refunds.totalRefunded,
      costFactors
    );
  }, [metrics, costFactors]);

  const chartData = useMemo(() => {
    if (!metrics) return [];
    return metrics.chartData.map((p) => ({
      ...p,
      netProfit: calculateNetProfit(p.realizedRevenue, p.completedOrders, p.driverEarnings, p.refundedAmount, costFactors).netProfit,
    }));
  }, [metrics, costFactors]);

  const chartConfig = { [chartMetric]: { label: chartMetric, color: "#7F50F4" } };

  return (
    <div className="flex h-screen bg-white">
      <MetricsSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto pt-16 pl-60 pb-16">

          <section className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Revenue Metrics</h1>
              <p className="text-sm text-slate-400">Revenue composition, growth, and profitability analysis</p>
            </div>
            <DateRangePicker defaultPreset="30d" onRangeChange={handleRangeChange} />
          </section>

          {loading || !metrics || !netProfit ? (
            <div className="flex flex-col justify-center items-center py-40 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-xs text-slate-400 font-medium tracking-wide">Compiling revenue ledger...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8 px-8 py-6">

              {/* Row 1: Core revenue KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard label="Gross Revenue" value={fmtSAR(metrics.grossRevenue)} desc="Billed, all orders in period" icon={Banknote} color="text-blue-500" bg="bg-blue-50" />
                <KpiCard
                  label="Realized Revenue"
                  value={fmtSAR(metrics.realizedRevenue)}
                  icon={Banknote}
                  color="text-emerald-500"
                  bg="bg-emerald-50"
                  customSub={
                    metrics.revenueGrowthPct === null ? (
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">No prior-period data</p>
                    ) : (
                      <p className={`text-[10px] font-bold mt-0.5 leading-none flex items-center gap-1 ${metrics.revenueGrowthPct >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                        {metrics.revenueGrowthPct >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(metrics.revenueGrowthPct).toFixed(1)}% vs previous period
                      </p>
                    )
                  }
                />
                <KpiCard label="Awaiting Payment" value={fmtSAR(metrics.awaitingPaymentRevenue)} desc="Unpaid, still active" icon={Clock} color="text-amber-500" bg="bg-amber-50" />
                <KpiCard label="Cancelled Revenue" value={fmtSAR(metrics.cancelledRevenue)} desc="Lost to cancellations" icon={XCircle} color="text-rose-500" bg="bg-rose-50" />
              </div>

              {/* Row 2: Order-value + refund KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard label="Largest Order" value={fmtSAR(metrics.largestOrderValue)} desc="Single highest paid order" icon={Award} color="text-indigo-500" bg="bg-indigo-50" />
                <KpiCard label="Median Order Value" value={fmtSAR(metrics.medianOrderValue)} desc="Typical paid order size" icon={BarChart3} color="text-purple-500" bg="bg-purple-50" />
                <KpiCard label="Discount Given" value={fmtSAR(metrics.discountGiven)} desc="Coupons applied, active orders" icon={Tag} color="text-cyan-500" bg="bg-cyan-50" />
                <KpiCard
                  label="Revenue Concentration"
                  value={`${metrics.revenueConcentration.topRevenuePct.toFixed(1)}%`}
                  desc={`From top ${metrics.revenueConcentration.topSharePct}% of orders (${metrics.revenueConcentration.topOrdersCount})`}
                  icon={TrendingUp} color="text-orange-500" bg="bg-orange-50"
                />
                <KpiCard
                  label="Net Realized Revenue"
                  value={fmtSAR(metrics.netRealizedRevenue)}
                  desc="Realized revenue minus refunds & credits"
                  icon={Banknote} color="text-emerald-500" bg="bg-emerald-50"
                />
                <KpiCard
                  label="Refunds & Credits"
                  value={fmtSAR(metrics.refunds.totalRefunded)}
                  desc={`${metrics.refunds.refundedOrdersCount} order${metrics.refunds.refundedOrdersCount !== 1 ? "s" : ""} · ${metrics.refundRatePct.toFixed(1)}% of completed`}
                  icon={Undo2} color="text-rose-500" bg="bg-rose-50"
                />
              </div>

              {/* Row 3: Revenue by Source / Customer Type */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SplitCard
                  title="Revenue by Source"
                  icon={Building2}
                  iconColor="text-blue-500"
                  iconBg="bg-blue-50"
                  totalValue={metrics.revenueBySource.totalRevenue}
                  segments={[
                    { label: "Individual", value: metrics.revenueBySource.individualRevenue, count: metrics.revenueBySource.individualOrders, pct: metrics.revenueBySource.individualPct, barColor: "bg-blue-500", textColor: "text-blue-600" },
                    { label: "Business", value: metrics.revenueBySource.businessRevenue, count: metrics.revenueBySource.businessOrders, pct: metrics.revenueBySource.businessPct, barColor: "bg-indigo-500", textColor: "text-indigo-600" },
                  ]}
                />
                <SplitCard
                  title="Revenue by Customer Type"
                  icon={UserPlus}
                  iconColor="text-indigo-500"
                  iconBg="bg-indigo-50"
                  totalValue={metrics.revenueByCustomerType.totalRevenue}
                  segments={[
                    { label: "First-time", value: metrics.revenueByCustomerType.firstTimeRevenue, count: metrics.revenueByCustomerType.firstTimeOrders, pct: metrics.revenueByCustomerType.firstTimePct, barColor: "bg-indigo-500", textColor: "text-indigo-600" },
                    { label: "Returning", value: metrics.revenueByCustomerType.returningRevenue, count: metrics.revenueByCustomerType.returningOrders, pct: metrics.revenueByCustomerType.returningPct, barColor: "bg-emerald-500", textColor: "text-emerald-600" },
                  ]}
                />
              </div>

              {/* Row 4: Refunds breakdown — by resolution type, and top reasons */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SplitCard
                  title="Refunds by Type"
                  icon={Undo2}
                  iconColor="text-rose-500"
                  iconBg="bg-rose-50"
                  totalValue={metrics.refunds.totalRefunded}
                  unitLabel="cases"
                  hideCount
                  segments={[
                    { label: "Full Refund", value: metrics.refunds.fullRefundAmount, pct: metrics.refunds.fullRefundPct, barColor: "bg-rose-500", textColor: "text-rose-600" },
                    { label: "Partial Refund", value: metrics.refunds.partialRefundAmount, pct: metrics.refunds.partialRefundPct, barColor: "bg-orange-500", textColor: "text-orange-600" },
                    { label: "Wallet Credit", value: metrics.refunds.walletCreditAmount, pct: metrics.refunds.walletCreditPct, barColor: "bg-purple-500", textColor: "text-purple-600" },
                  ]}
                />

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Top Refund Reasons</p>
                    <div className="bg-rose-50 p-1 rounded-md"><AlertTriangle className="h-3.5 w-3.5 text-rose-500" /></div>
                  </div>
                  {metrics.refunds.byIssueType.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No refunds or credits in this period.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {metrics.refunds.byIssueType.map((r) => (
                        <div key={r.issueType} className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-600">
                            {ISSUE_TYPE_LABELS[r.issueType] ?? r.issueType}
                            <span className="text-[10px] text-slate-400 font-normal ml-1">({r.count})</span>
                          </span>
                          <span className="text-xs font-bold text-rose-600">{fmtSAR(r.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 5: Net Profit panel — live-adjustable cost factors */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-slate-400" />
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Net Profit</h2>
                    <p className="text-xs text-slate-400">Adjust cost assumptions below — recalculates instantly, no data reload</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Controls */}
                  <div className="flex flex-col gap-5">
                    <SliderRow
                      label="Operational Cost" suffix="%" value={costFactors.operationalCostPct} min={0} max={50} step={0.5}
                      onChange={(v) => setCostFactors((c) => ({ ...c, operationalCostPct: v }))}
                    />
                    <SliderRow
                      label="Commission / Gateway Fee" suffix="%" value={costFactors.commissionPct} min={0} max={20} step={0.1}
                      onChange={(v) => setCostFactors((c) => ({ ...c, commissionPct: v }))}
                    />
                    <SliderRow
                      label="Delivery Cost per Order" suffix=" SAR" value={costFactors.deliveryCostPerOrder} min={0} max={50} step={0.5}
                      onChange={(v) => setCostFactors((c) => ({ ...c, deliveryCostPerOrder: v }))}
                    />
                    {metrics.driverEarningsTotal > 0 &&
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <input
                        type="checkbox"
                        checked={costFactors.includeDriverEarnings}
                        onChange={(e) => setCostFactors((c) => ({ ...c, includeDriverEarnings: e.target.checked }))}
                        className="accent-[#7F50F4] w-4 h-4"
                      />
                      Include driver earnings as a cost ({fmtSAR(metrics.driverEarningsTotal)})
                    </label>
                    }
                    {metrics.refunds.totalRefunded > 0 &&
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <input
                        type="checkbox"
                        checked={costFactors.includeRefunds}
                        onChange={(e) => setCostFactors((c) => ({ ...c, includeRefunds: e.target.checked }))}
                        className="accent-[#7F50F4] w-4 h-4"
                      />
                      Include refunds & credits as a cost ({fmtSAR(metrics.refunds.totalRefunded)})
                    </label>
                    }

                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <PlusCircle className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-600">Manual Adjustment</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={costFactors.manualAdjustmentLabel}
                          onChange={(e) => setCostFactors((c) => ({ ...c, manualAdjustmentLabel: e.target.value }))}
                          placeholder="Label (e.g. packaging, marketing)"
                          className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        />
                        <div className="relative w-32 shrink-0">
                          <input
                            type="number"
                            value={costFactors.manualAdjustment}
                            onChange={(e) => setCostFactors((c) => ({ ...c, manualAdjustment: parseFloat(e.target.value) || 0 }))}
                            className="h-8 w-full pl-2.5 pr-10 rounded-lg border border-slate-200 text-xs text-right outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold">SAR</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Positive adds a cost, negative adds credit. Not persisted — resets on reload.
                      </p>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="flex flex-col gap-2 bg-slate-50 rounded-xl p-4">
                    <BreakdownRow label="Realized Revenue" value={netProfit.realizedRevenue} positive />
                    <BreakdownRow label="Driver Earnings" value={-netProfit.driverEarningsCost} />
                    <BreakdownRow label="Refunds & Credits" value={-netProfit.refundCost} />
                    <BreakdownRow label="Operational Cost" value={-netProfit.operationalCost} />
                    <BreakdownRow label="Commission" value={-netProfit.commissionCost} />
                    <BreakdownRow label="Delivery Cost" value={-netProfit.deliveryCost} />
                    {netProfit.manualAdjustment !== 0 && (
                      <BreakdownRow
                        label={costFactors.manualAdjustmentLabel.trim() || "Manual Adjustment"}
                        value={-netProfit.manualAdjustment}
                      />
                    )}
                    <div className="h-px bg-slate-200 my-1" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">Net Profit</span>
                      <span className={`text-lg font-black ${netProfit.netProfit >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                        {fmtSAR(netProfit.netProfit)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 text-right font-semibold">
                      {netProfit.netMarginPct.toFixed(1)}% margin
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 6: Chart */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Revenue Trend</h2>
                    <p className="text-xs text-slate-400">Visual mapping of revenue across time nodes</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold border border-slate-200">
                      {[
                        { key: "grossRevenue", label: "Gross" },
                        { key: "realizedRevenue", label: "Realized" },
                        { key: "cancelledRevenue", label: "Cancelled" },
                        { key: "refundedAmount", label: "Refunds" },
                        { key: "netProfit", label: "Net Profit" },
                      ].map((m) => (
                        <button key={m.key} onClick={() => setChartMetric(m.key as ChartMetric)}
                          className={`px-3 py-1 rounded-md transition ${chartMetric === m.key ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                          {m.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold border border-slate-200">
                      {(["daily", "weekly", "monthly"] as const).map((p) => (
                        <button key={p} onClick={() => setPeriod(p)}
                          className={`px-3 py-1 rounded-md transition capitalize ${period === p ? "bg-white text-[#7F50F4] shadow-sm" : "text-slate-500"}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <ChartContainer config={chartConfig} className="w-full h-60">
                  <BarChart data={chartData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey={chartMetric} shape={<PurpleTopBar />} />
                  </BarChart>
                </ChartContainer>
              </div>

              {/* Row 7: Activity table */}
              <div className="flex flex-col gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Revenue Activity Report</h2>
                  <p className="text-xs text-slate-400">Aggregated daily revenue outputs</p>
                </div>
                <div className="border border-slate-200 rounded-2xl shadow-sm bg-white overflow-hidden">
                  <div className="max-h-[550px] overflow-y-auto">
                    <table className="w-full text-xs table-fixed min-w-[820px]">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                        <tr>
                          <th className="px-6 py-4 text-left bg-slate-50 w-[14%]">Date</th>
                          <th className="px-6 py-4 text-center bg-slate-50 w-[9%]">Orders</th>
                          <th className="px-6 py-4 text-right bg-slate-50 w-[15%]">Gross Revenue</th>
                          <th className="px-6 py-4 text-right bg-slate-50 w-[15%]">Realized Revenue</th>
                          <th className="px-6 py-4 text-right bg-slate-50 w-[12%]">Cancelled</th>
                          <th className="px-6 py-4 text-right bg-slate-50 w-[12%]">Refunds</th>
                          <th className="px-6 py-4 text-right bg-slate-50 w-[11%]">Discount</th>
                          <th className="px-6 py-4 text-right pr-8 bg-slate-50 w-[12%]">Avg Order</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {metrics.reportRows.length === 0 ? (
                          <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-400 font-medium">No records for this period.</td></tr>
                        ) : (
                          metrics.reportRows.map((r) => (
                            <tr key={r.rawSortKey} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-6 py-3.5 font-semibold text-slate-600 truncate">{r.date}</td>
                              <td className="px-6 py-3.5 text-center font-bold text-slate-800">{r.orders}</td>
                              <td className="px-6 py-3.5 text-right font-semibold text-slate-700">{fmtSAR(r.grossRevenue)}</td>
                              <td className="px-6 py-3.5 text-right font-bold text-emerald-600">{fmtSAR(r.realizedRevenue)}</td>
                              <td className="px-6 py-3.5 text-right text-rose-500 font-medium">{r.cancelledRevenue > 0 ? fmtSAR(r.cancelledRevenue) : "—"}</td>
                              <td className="px-6 py-3.5 text-right text-rose-500 font-medium">{r.refundedAmount > 0 ? fmtSAR(r.refundedAmount) : "—"}</td>
                              <td className="px-6 py-3.5 text-right text-cyan-600 font-medium">{r.discountGiven > 0 ? fmtSAR(r.discountGiven) : "—"}</td>
                              <td className="px-6 py-3.5 text-right pr-8 font-bold text-slate-800">{fmtSAR(r.avgOrderValue)}</td>
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

//  helpers 

function KpiCard({
  label, value, desc, icon: Icon, color, bg, customSub,
}: {
  label: string; value: string; desc?: string; icon: any; color: string; bg: string; customSub?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm min-w-[140px]">
      <div className="flex items-start justify-between w-full gap-2">
        <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-tight">{label}</p>
        <div className={`${bg} p-1 rounded-md shrink-0`}><Icon className={`h-3.5 w-3.5 ${color}`} /></div>
      </div>
      <div className="mt-3">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{value}</h3>
        {desc && <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">{desc}</p>}
        {customSub}
      </div>
    </div>
  );
}

function SliderRow({
  label, value, min, max, step, suffix, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <span className="text-xs font-bold text-[#7F50F4]">{value}{suffix}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#7F50F4]"
      />
    </div>
  );
}

function SplitCard({
  title, icon: Icon, iconColor, iconBg, totalValue, segments, unitLabel = "orders", hideCount,
}: {
  title: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  totalValue: number;
  segments: { label: string; value: number; count?: number; pct: number; barColor: string; textColor: string }[];
  unitLabel?: string;
  hideCount?: boolean;
}) {
  const visibleSegments = segments.filter((s) => s.value > 0);
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{title}</p>
        <div className={`${iconBg} p-1 rounded-md`}><Icon className={`h-3.5 w-3.5 ${iconColor}`} /></div>
      </div>

      {visibleSegments.length === 0 ? (
        <p className="text-xs text-slate-400 py-2">No data for this period.</p>
      ) : (
        <>
          <div className="flex w-full h-2 rounded-full overflow-hidden bg-slate-100">
            {segments.map((s) => (
              <div key={s.label} className={s.barColor} style={{ width: `${s.pct}%` }} />
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {segments.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${s.barColor}`} />
                  <span className="text-xs font-semibold text-slate-600">{s.label}</span>
                  {!hideCount && s.count !== undefined && (
                    <span className="text-[10px] text-slate-400">({s.count} {unitLabel})</span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-xs font-bold ${s.textColor}`}>{fmtSAR(s.value)}</span>
                  <span className="text-[10px] text-slate-400 font-semibold w-9 text-right">{s.pct.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Total</span>
            <span className="text-xs font-bold text-slate-700">{fmtSAR(totalValue)}</span>
          </div>
        </>
      )}
    </div>
  );
}

function BreakdownRow({ label, value, positive }: { label: string; value: number; positive?: boolean }) {
  const isNegative = value < 0;
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className={`font-bold ${positive ? "text-emerald-600" : isNegative ? "text-rose-500" : "text-slate-700"}`}>
        {isNegative ? "-" : ""}{fmtSAR(Math.abs(value))}
      </span>
    </div>
  );
}