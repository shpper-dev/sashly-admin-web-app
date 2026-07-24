"use client";
import { Fragment, useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import FinancialTrendChart from "@/components/overview/FinancialTrendChart";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle, CalendarDays, ChevronDown, ChevronRight,
  Download, FileText, Loader2,
} from "lucide-react";
import { getOverviewData, OverviewData, ServiceHealthOrder } from "@/lib/firebase/overview";

//Date presets 

type Preset = "7d" | "30d" | "90d" | "365d" | "custom";

const PRESETS: { key: Preset; label: string }[] = [
  { key: "7d",     label: "Last 7 days"  },
  { key: "30d",    label: "Last 30 days" },
  { key: "90d",    label: "Last 90 days" },
  { key: "365d",   label: "Last year"    },
  { key: "custom", label: "Custom range" },
];

function presetToRange(preset: Preset): { startMs: number; endMs: number } {
  const now = Date.now();
  if (preset === "custom") return { startMs: now - 30 * 86400000, endMs: now };
  const days = parseInt(preset);
  return { startMs: now - days * 86400000, endMs: now };
}

function msToDateInput(ms: number): string {
  return new Date(ms).toISOString().split("T")[0];
}

// Status helpers 

const STATUS_STYLES: Record<ServiceHealthOrder["status"], string> = {
  OVERDUE:    "bg-red-50   text-red-500   border border-red-100",
  "ON TRACK": "bg-green-50 text-green-600 border border-green-100",
  PENDING:    "bg-amber-50 text-amber-500 border border-amber-100",
};

const STATUS_PRIORITY: Record<ServiceHealthOrder["status"], number> = {
  OVERDUE: 0, PENDING: 1, "ON TRACK": 2,
};

function worstStatus(orders: ServiceHealthOrder[]): ServiceHealthOrder["status"] {
  return orders.reduce((worst, o) =>
    STATUS_PRIORITY[o.status] < STATUS_PRIORITY[worst] ? o.status : worst,
    orders[0].status
  );
}

//  Group service health by customer

interface CustomerGroup {
  customerName: string;
  orders: ServiceHealthOrder[];
  worstStatus: ServiceHealthOrder["status"];
  totalPrice: number;
  overdueCount: number;
}

function groupByCustomer(rows: ServiceHealthOrder[]): CustomerGroup[] {
  const map = new Map<string, ServiceHealthOrder[]>();
  for (const row of rows) {
    const key = row.customerName;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }
  return [...map.entries()]
    .map(([customerName, orders]) => ({
      customerName,
      orders,
      worstStatus:  worstStatus(orders),
      totalPrice:   orders.reduce((s, o) => s + o.totalPrice, 0),
      overdueCount: orders.filter(o => o.status === "OVERDUE").length,
    }))
    .sort((a, b) => STATUS_PRIORITY[a.worstStatus] - STATUS_PRIORITY[b.worstStatus]);
}


const SECTION_COLORS = [
  "bg-[#7F50F4]", "bg-[#02D0FF]", "bg-blue-300", "bg-emerald-400", "bg-amber-400",
];


const fmtSAR = (n: number) =>
  `SAR ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const fmtDelivery = (ms: number | null) =>
  ms ? new Date(ms).toLocaleDateString("en-GB", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  }) : "—";



export default function Overview() {
  const [preset,       setPreset]       = useState<Preset>("30d");
  const [data,         setData]         = useState<OverviewData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [showSubtotal, setShowSubtotal] = useState(false);
  const [showCustom,   setShowCustom]   = useState(false);

  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());

  const [customStart, setCustomStart] = useState<string>(() => msToDateInput(Date.now() - 30 * 86400000));
  const [customEnd,   setCustomEnd]   = useState<string>(() => msToDateInput(Date.now()));

 

  const fetchData = useCallback(async (p: Preset, cStart?: string, cEnd?: string) => {
    setLoading(true);
    let startMs: number;
    let endMs: number;

    if (p === "custom" && cStart && cEnd) {
      startMs = new Date(cStart).getTime();
      endMs   = new Date(cEnd).getTime() + 86399999;
    } else {
      ({ startMs, endMs } = presetToRange(p));
    }

    try {
      const result = await getOverviewData(startMs, endMs);
      setData(result);
      setExpandedCustomers(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(preset); }, []);

  const handlePreset = (p: Preset) => {
    setPreset(p);
    if (p === "custom") {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      fetchData(p);
    }
  };

  const handleCustomApply = () => {
    if (!customStart || !customEnd) return;
    fetchData("custom", customStart, customEnd);
  };

  const toggleCustomer = (name: string) => {
    setExpandedCustomers(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const currentLabel = preset === "custom"
    ? `${customStart} → ${customEnd}`
    : PRESETS.find(p => p.key === preset)?.label ?? "";

 

  const STATS = data ? [
    { label: "Orders",        value: data.stats.orderCount,               color: "text-[#101828]"  },
    { label: "Pieces",        value: data.stats.totalPieces,              color: "text-[#101828]"  },
    { label: "Total Value",   value: fmtSAR(data.stats.totalValue),       color: "text-[#7F50F4]"  },
    { label: "Revenue",       value: fmtSAR(data.stats.revenue),          color: "text-green-500"  },
    { label: "Discounts",     value: fmtSAR(data.stats.totalDiscounts),   color: "text-red-400"    },
    { label: "Store Credits", value: fmtSAR(data.stats.totalCreditsUsed), color: "text-orange-400" },
    { label: "Unpaid Inv.",   value: data.stats.unpaidInvoices,           color: "text-orange-400" },
    { label: "Cleaned",       value: data.stats.cleanedPieces,            color: "text-[#02D0FF]"  },
  ] : [];

  const customerGroups   = data ? groupByCustomer(data.serviceHealth) : [];
  const overdueCustomers = customerGroups.filter(g => g.worstStatus === "OVERDUE").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <main className="pt-14 pl-60 pb-12 min-h-screen">
        <div className="px-8 py-6 flex flex-col gap-8">

          {/*  Page header  */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-2xl font-bold text-[#101828]">Operational Analytics</h1>
              <p className="text-sm text-[#90A1B9]">Advanced business intelligence for Sashly Admin</p>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#45556C] shadow-sm hover:border-slate-300 transition-colors outline-none">
                    <CalendarDays size={13} className="text-slate-400" />
                    {currentLabel}
                    <ChevronDown size={13} className="text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[200px] rounded-xl p-1">
                  {PRESETS.map(p => (
                    <DropdownMenuItem
                      key={p.key}
                      onSelect={() => handlePreset(p.key)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium cursor-pointer ${
                        preset === p.key
                          ? "text-[#7F50F4] bg-purple-50 focus:bg-purple-50 focus:text-[#7F50F4]"
                          : "text-slate-600"
                      }`}
                    >
                      {p.label}
                    </DropdownMenuItem>
                  ))}
                  {showCustom && (
                    <div
                      className="px-3 pt-2 pb-3 border-t border-slate-100 mt-1 flex flex-col gap-2"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">From</label>
                        <input
                          type="date"
                          value={customStart}
                          max={customEnd}
                          onChange={(e) => setCustomStart(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:border-purple-400"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">To</label>
                        <input
                          type="date"
                          value={customEnd}
                          min={customStart}
                          max={msToDateInput(Date.now())}
                          onChange={(e) => setCustomEnd(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:border-purple-400"
                        />
                      </div>
                      <button
                        onClick={handleCustomApply}
                        className="mt-1 w-full px-3 py-2 bg-[#7F50F4] hover:bg-[#6B3FD4] text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* <button className="flex items-center gap-2 px-4 py-2.5 bg-[#7F50F4] hover:bg-[#6B3FD4] text-white rounded-xl text-xs font-bold transition-colors shadow-sm">
                <FileText size={14} /> Export PDF
              </button> */}
            </div>
          </div>

          {/*  Loading  */}
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : !data ? null : (
            <>
              {/*  Stats row  */}
              <div className="grid grid-cols-8 gap-4">
                {STATS.map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest">{stat.label}</span>
                    <span className={`text-xl font-bold ${stat.color ?? "text-[#101828]"}`}>{stat.value}</span>
                  </div>
                ))}
              </div>

              {/*  Trends + Revenue Breakdown  */}
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-sm font-bold text-[#101828]">Financial Performance Trends</h3>
                    <p className="text-xs text-[#90A1B9]">Daily revenue vs period average · {currentLabel}</p>
                  </div>
                  <FinancialTrendChart data={data.dailyRevenue} />
                  <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-5">
                    <div className="flex flex-col gap-1 border-l-2 border-cyan-600 pl-4">
                      <span className="text-[10px] text-[#90A1B9] font-bold uppercase tracking-wide">Net Sales</span>
                      <span className="text-lg font-bold text-[#101828]">{fmtSAR(data.netSales)}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">After discounts</span>
                    </div>
                    <div className="border-l-2 border-green-600 pl-4 flex flex-col gap-1">
                      <span className="text-[10px] text-[#90A1B9] font-bold uppercase tracking-wide">Avg Order Value</span>
                      <span className="text-lg font-bold text-[#101828]">{fmtSAR(data.avgOrderValue)}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{currentLabel}</span>
                    </div>
                    <div className="border-l-2 border-purple-600 pl-4 flex flex-col gap-1">
                      <span className="text-[10px] text-[#90A1B9] font-bold uppercase tracking-wide">New Acquisitions</span>
                      <span className="text-lg font-bold text-[#101828]">{data.newAcquisitions}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">New sign-ups</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
                  <div className="flex flex-col gap-5">
                    <h3 className="text-sm font-bold text-[#101828]">Revenue Breakdown</h3>
                    <RevenueBar label="Card Payments" color="bg-[#7F50F4]" dotColor="bg-[#7F50F4]" amount={data.revenueBreakdown.card} pct={data.revenueBreakdown.cardPct} />
                    <RevenueBar label="Cash" color="bg-green-500" dotColor="bg-green-500" amount={data.revenueBreakdown.cash} pct={data.revenueBreakdown.cashPct} />
                    {data.revenueBreakdown.bank > 0 && (
                      <RevenueBar label="Bank Transfer" color="bg-blue-400" dotColor="bg-blue-400" amount={data.revenueBreakdown.bank} pct={data.revenueBreakdown.bankPct} />
                    )}
                  </div>
                  <div className="pt-5 mt-5 border-t border-dashed border-slate-200 flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest">Adjustments Ledger</span>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#6A7282]">Credit Given</span>
                      <span className="text-red-500 font-bold">{fmtSAR(data.revenueBreakdown.creditGiven)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#6A7282]">Total Discounts</span>
                      <span className="text-[#101828] font-bold">{fmtSAR(data.stats.totalDiscounts)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/*  Service Health + Top Sections  */}
              <div className="grid grid-cols-2 gap-6">

                {/*  Service Health (grouped by customer, expandable)  */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                  {/* Fixed header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                    <h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-lg">
                        <AlertCircle size={13} className="text-blue-600" />
                      </span>
                      Service Health
                      {overdueCustomers > 0 && (
                        <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[10px] font-bold rounded-full">
                          {overdueCustomers} overdue
                        </span>
                      )}
                    </h3>
                    <button className="text-[10px] px-3 py-1.5 bg-[#02D0FF] text-white rounded-xl font-bold">
                      Critical Only
                    </button>
                  </div>

                  {/* Sticky column headers */}
                  {customerGroups.length > 0 && (
                    <table className="w-full shrink-0">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-3 w-8" />
                          <th className="px-3 py-3 text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest text-left">Customer</th>
                          <th className="px-3 py-3 text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest text-left">Orders</th>
                          <th className="px-3 py-3 text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest text-left">Total</th>
                          <th className="px-3 py-3 text-[10px] font-bold text-[#90A1B9] uppercase tracking-widest text-right pr-6">Status</th>
                        </tr>
                      </thead>
                    </table>
                  )}

                  {/* Scrollable rows */}
                  <div className="overflow-y-auto" style={{ height: "320px" }}>
                    {customerGroups.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-sm text-slate-400">
                        All orders are on track ✓
                      </div>
                    ) : (
                      <table className="w-full">
                        <tbody className="divide-y divide-slate-50">
                          {customerGroups.map((group) => {
                            const isExpanded = expandedCustomers.has(group.customerName);
                            return (
                              <Fragment key={group.customerName}>
                                
                                <tr
                                  
                                  className="hover:bg-slate-50 transition-colors cursor-pointer select-none"
                                  onClick={() => toggleCustomer(group.customerName)}
                                >
                                  <td className="px-6 py-3.5 w-8">
                                    <ChevronRight
                                      size={13}
                                      className={`text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                                    />
                                  </td>
                                  <td className="px-3 py-3.5 text-xs font-semibold text-[#101828]">
                                    {group.customerName}
                                    {group.overdueCount > 0 && (
                                      <span className="ml-1.5 text-[9px] font-bold text-red-400">
                                        {group.overdueCount} overdue
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-3.5 text-xs text-[#90A1B9] font-semibold">
                                    {group.orders.length} {group.orders.length === 1 ? "order" : "orders"}
                                  </td>
                                  <td className="px-3 py-3.5 text-xs font-bold text-[#101828]">
                                    {fmtSAR(group.totalPrice)}
                                  </td>
                                  <td className="px-3 py-3.5 text-right pr-6">
                                    <span className={`inline-flex px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wide ${STATUS_STYLES[group.worstStatus]}`}>
                                      {group.worstStatus}
                                    </span>
                                  </td>
                                </tr>

                                {/* Expanded: individual order rows */}
                                {isExpanded && group.orders.map((order) => (
                                  <tr key={order.id} className="bg-slate-50/70 border-l-2 border-l-slate-200">
                                    <td className="px-6 py-2.5 w-8" />
                                    <td className="px-3 py-2.5 text-[11px] font-bold text-[#7F50F4] pl-5">
                                      {order.orderNumber}
                                    </td>
                                    <td className="px-3 py-2.5 text-[11px] text-[#90A1B9] font-medium">
                                      {fmtDelivery(order.expectedDeliveryTime)}
                                    </td>
                                    <td className="px-3 py-2.5 text-[11px] font-semibold text-[#101828]">
                                      {fmtSAR(order.totalPrice)}
                                    </td>
                                    <td className="px-3 py-2.5 text-right pr-6">
                                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wide ${STATUS_STYLES[order.status]}`}>
                                        {order.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Top Selling Sections */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
                  <h3 className="text-sm font-bold text-[#101828]">Top Selling Sections</h3>
                  {data.topSections.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-sm text-slate-400">
                      No data for this period
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5">
                      {data.topSections.map((s, i) => (
                        <div key={s.label} className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#314158]">
                              {s.label}
                              {s.arabicName && <span className="text-[#90A1B9] ml-1">— {s.arabicName}</span>}
                            </span>
                            <span className="text-[10px] font-bold text-[#90A1B9]">
                              {s.percentage}% · {s.totalPieces.toLocaleString()} pcs
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${SECTION_COLORS[i % SECTION_COLORS.length]}`}
                              style={{ width: `${s.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/*  Revenue Log Table  */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Fixed header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                  <div>
                    <h3 className="text-sm font-bold text-[#101828]">Comprehensive Revenue Log (paid only)</h3>
                    <p className="text-xs text-[#90A1B9] mt-0.5">{data.dailyRevenue.length} days in range</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#90A1B9] font-semibold">Show Subtotals</span>
                      <Switch
                        checked={showSubtotal}
                        onCheckedChange={setShowSubtotal}
                        className="cursor-pointer data-[state=checked]:bg-cyan-600!"
                      />
                    </div>
                    {/* <button className="flex items-center gap-1.5 text-xs font-semibold border border-slate-200 px-3 py-1.5 rounded-xl text-[#45556C] hover:bg-slate-50 transition-colors">
                      <Download size={13} /> CSV
                    </button> */}
                  </div>
                </div>

                {data.dailyRevenue.length === 0 ? (
                  <div className="px-6 py-12 text-center text-sm text-slate-400">
                    No paid orders in this period
                  </div>
                ) : (
                  <>
                    {/* Sticky column headers */}
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          {[
                            "Date", "Orders", "Revenue", "Cash", "Card", "Bank",
                            ...(showSubtotal ? ["Discounts", "Credits"] : []),
                          ].map(h => (
                            <th key={h} className="px-6 py-3.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                    </table>

                    {/* Scrollable rows */}
                    <div className="overflow-y-auto" style={{ height: "320px" }}>
                      <table className="w-full">
                        <tbody className="divide-y divide-slate-50">
                          {data.dailyRevenue.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-xs text-[#6A7282] font-semibold">{fmtDate(row.date)}</td>
                              <td className="px-6 py-4 text-xs font-bold text-[#101828]">{row.orderCount}</td>
                              <td className="px-6 py-4 text-xs font-bold text-[#101828]">{fmtSAR(row.revenue)}</td>
                              <td className="px-6 py-4 text-xs text-[#90A1B9] font-semibold">{fmtSAR(row.cash)}</td>
                              <td className="px-6 py-4 text-xs text-[#90A1B9] font-semibold">{fmtSAR(row.card)}</td>
                              <td className="px-6 py-4 text-xs text-[#90A1B9] font-semibold">{fmtSAR(row.wallet)}</td>
                              {showSubtotal && (
                                <>
                                  <td className="px-6 py-4 text-xs text-red-400 font-semibold">{fmtSAR(row.discounts)}</td>
                                  <td className="px-6 py-4 text-xs text-orange-400 font-semibold">{fmtSAR(row.credits)}</td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals footer — always visible below scroll area */}
                    <table className="w-full border-t border-slate-200">
                      <tfoot className="bg-slate-50">
                        <tr>
                          <td className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</td>
                          <td className="px-6 py-3.5 text-xs font-bold text-[#101828]">
                            {data.dailyRevenue.reduce((s, r) => s + r.orderCount, 0)}
                          </td>
                          <td className="px-6 py-3.5 text-xs font-bold text-[#7F50F4]">
                            {fmtSAR(data.dailyRevenue.reduce((s, r) => s + r.revenue, 0))}
                          </td>
                          <td className="px-6 py-3.5 text-xs font-bold text-[#101828]">
                            {fmtSAR(data.dailyRevenue.reduce((s, r) => s + r.cash, 0))}
                          </td>
                          <td className="px-6 py-3.5 text-xs font-bold text-[#101828]">
                            {fmtSAR(data.dailyRevenue.reduce((s, r) => s + r.card, 0))}
                          </td>
                          <td className="px-6 py-3.5 text-xs font-bold text-[#101828]">
                            {fmtSAR(data.dailyRevenue.reduce((s, r) => s + r.wallet, 0))}
                          </td>
                          {showSubtotal && (
                            <>
                              <td className="px-6 py-3.5 text-xs font-bold text-red-400">
                                {fmtSAR(data.dailyRevenue.reduce((s, r) => s + r.discounts, 0))}
                              </td>
                              <td className="px-6 py-3.5 text-xs font-bold text-orange-400">
                                {fmtSAR(data.dailyRevenue.reduce((s, r) => s + r.credits, 0))}
                              </td>
                            </>
                          )}
                        </tr>
                      </tfoot>
                    </table>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

//helpers

function RevenueBar({ label, color, dotColor, amount, pct }: {
  label: string; color: string; dotColor: string; amount: number; pct: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          {label}
        </span>
        <span className="text-[#101828]">{fmtSAR(amount)}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full">
        <div className={`h-1.5 ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-[#90A1B9] font-medium">{pct}% of total</span>
    </div>
  );
}