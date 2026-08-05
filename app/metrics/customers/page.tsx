"use client";
import { useEffect, useState, useMemo, useCallback, useTransition } from "react";
import Header from "@/components/Header";
import {
  getCustomerMetrics,
  CustomerMetric,
  CustomerPageStats,
} from "@/lib/firebase/metrics-customers";
import {
  Users, RefreshCcw, UserPlus, ShoppingBag,
  TrendingUp, Search, Loader2, ArrowUpRight, Wallet,
} from "lucide-react";

import DateRangePicker, { DateRangeChangePayload } from "@/components/metrics/DateRangePicker";
import { presetToRange } from "@/lib/date-presets";
import { fmtDate, fmtSAR, fmtTimestamp } from "@/lib/utils";
import { StatCard } from "@/components/metrics/MetricStatCard";


// Tab types 
type TabType =  "New" | "Returning" | "No Recent Orders" | "Deactivated";
const TABS: TabType[] = [ "New", "Returning", "No Recent Orders", "Deactivated"];


export default function MetricsCustomersPage() {
  const [stats,       setStats]       = useState<CustomerPageStats | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState<TabType>("New");
  const [search,      setSearch]      = useState("");
  const [sortKey,     setSortKey]     = useState<keyof CustomerMetric>("spendInRange");
  const [sortDir,     setSortDir]     = useState<"asc" | "desc">("desc");
  const [rangeLabel, setRangeLabel] = useState("Last 30 days");

  const [isPending, startTransition] = useTransition();

  const fetchStats = useCallback(async (startMs: number, endMs: number) => {
    try {
      const data = await getCustomerMetrics(startMs, endMs);
      setStats(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  const { startMs, endMs } = presetToRange("30d"); // match defaultPreset
  fetchStats(startMs, endMs);
}, []);

   const handleRangeChange = ({ startMs, endMs, label }: DateRangeChangePayload) => {
    setRangeLabel(label);
    fetchStats(startMs, endMs);
  };

  const handleTabChange = (tab: TabType) => {
    if (tab === activeTab) return;
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  //  Tab filtering

  const tabFiltered = useMemo<CustomerMetric[]>(() => {
    if (!stats) return [];
    const all = stats.customers;
    switch (activeTab) {
      case "New":              return all.filter(c => c.isNew && !c.isDeleted);
      case "Returning":        return all.filter(c => c.isReturning && !c.isDeleted);
      case "No Recent Orders": return all.filter(c => !c.hasOrdersInRange && !c.isDeleted);
      case "Deactivated":      return all.filter(c => c.isDeleted);
      default:                 return all.filter(c => !c.isDeleted);
    }
  }, [stats, activeTab]);

  //  Search 

  const searched = useMemo(() => {
    if (!search.trim()) return tabFiltered;
    const q = search.toLowerCase();
    return tabFiltered.filter(
      c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [tabFiltered, search]);

  // Sort 

  const sorted = useMemo(() => {
    return [...searched].sort((a, b) => {
      const av = a[sortKey] as number ?? 0;
      const bv = b[sortKey] as number ?? 0;
      return sortDir === "desc" ? bv - av : av - bv;
    });
  }, [searched, sortKey, sortDir]);

  const toggleSort = (key: keyof CustomerMetric) => {
    startTransition(() => {
      if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
      else { setSortKey(key); setSortDir("desc"); }
    });
  };

  // Top spenders for distribution chart — already period-scoped, unaffected by the bugs above
  const topSpenders = useMemo(() => {
    if (!stats) return [];
    return [...stats.customers]
      .filter(c => c.spendInRange > 0)
      .sort((a, b) => b.spendInRange - a.spendInRange)
      .slice(0, 5);
  }, [stats]);

  const maxSpend = topSpenders[0]?.spendInRange ?? 1;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex flex-col pt-14 pl-60 min-h-screen pb-10">

        {/* Page Header */}
        <section className="flex items-center justify-between px-8 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Customer Reports</h1>
            <p className="text-sm text-slate-500">Acquisition, retention, frequency &amp; lifetime value</p>
          </div>
          <div className="flex items-center gap-3">
          <DateRangePicker defaultPreset="30d" onRangeChange={handleRangeChange} />
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : stats && (
          <>
            {/* Stat Cards — 6 now: 5 original + Avg Spend/Active Customer (genuinely period-scoped) */}
            <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 px-8 mb-6">
              <StatCard
                label="TOTAL CUSTOMERS"
                value={stats.totalCustomers.toLocaleString()}
                sub={`${stats.newInRange} joined in range · all-time total`}
                icon={<Users size={16} className="text-purple-600" />}
                iconBg="bg-purple-50"
                trend={`+${stats.newInRange} new`}
              />
              <StatCard
                label="NEW IN RANGE"
                value={stats.newInRange.toLocaleString()}
                sub="Signed up in period"
                icon={<UserPlus size={16} className="text-emerald-600" />}
                iconBg="bg-emerald-50"
                trend="Acquisitions"
                trendColor="text-emerald-500"
              />
              <StatCard
                label="RETURNING"
                value={stats.returningInRange.toLocaleString()}
                sub="Had prior + new orders"
                icon={<RefreshCcw size={16} className="text-blue-600" />}
                iconBg="bg-blue-50"
                trend="Retention"
                trendColor="text-blue-500"
              />
              <StatCard
                label="AVG ORDER FREQ."
                value={stats.avgOrderFrequency.toFixed(1)}
                sub="Orders per active customer, in range"
                icon={<ShoppingBag size={16} className="text-cyan-600" />}
                iconBg="bg-cyan-50"
                trend="In range"
                trendColor="text-cyan-500"
              />
              <StatCard
                label="AVG SPEND / CUSTOMER"
                value={fmtSAR(stats.avgSpendPerActiveCustomer)}
                sub="Realized spend, active customers in range"
                icon={<Wallet size={16} className="text-indigo-600" />}
                iconBg="bg-indigo-50"
                trend="Revenue/customer"
                trendColor="text-indigo-500"
              />
              <StatCard
                label="AVG LTV"
                value={`SAR ${Math.round(stats.avgLTV).toLocaleString()}`}
                sub="Avg all-time spend — lifetime, not range"
                icon={<TrendingUp size={16} className="text-amber-600" />}
                iconBg="bg-amber-50"
                trend="Lifetime value"
                trendColor="text-amber-500"
              />
            </section>
            {/* Distribution Chart */}
            <section className="px-8 mb-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Top Spenders — {rangeLabel}
                  </h3>
                  <span className="text-[10px] text-slate-300 font-medium">by spend in period</span>
                </div>
                {topSpenders.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No orders in this period</p>
                ) : (
                  <div className="space-y-4">
                    {topSpenders.map((c, i) => (
                      <div key={c.userId} className="flex items-center gap-4">
                        <span className="w-5 text-[10px] font-bold text-slate-300 shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="w-32 text-xs font-semibold text-slate-600 truncate shrink-0">
                          {c.name}
                        </span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-700"
                            style={{ width: `${(c.spendInRange / maxSpend) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 shrink-0 w-32 text-right">
                          {fmtSAR(c.spendInRange)}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 w-16 text-right">
                          {c.ordersInRange} orders
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Tabs */}
            <section className="px-8">
              <div className="flex items-center gap-6 border-b border-slate-100 mb-5">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`pb-3 text-sm font-semibold transition-all relative whitespace-nowrap ${
                      activeTab === tab ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab}
                    <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === tab ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"
                    }`}>
                      {tab === "New"              ? stats.newInRange
                      : tab === "Returning"       ? stats.returningInRange
                      : tab === "No Recent Orders" ? stats.customers.filter(c => !c.hasOrdersInRange && !c.isDeleted).length
                      : tab === "Deactivated"     ? stats.customers.filter(c => c.isDeleted).length
                      : stats.totalCustomers}
                    </span>
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs text-slate-400 font-medium">
                  {sorted.length} customer{sorted.length !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm w-72">
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="bg-transparent outline-none text-xs text-slate-600 placeholder:text-slate-400 w-full"
                  />
                </div>
              </div>
            </section>

            {/* Table */}
            <section>
              <div className="bg-white border-y border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto max-h-[550px] overflow-y-auto custom-scrollbar relative">
                  {isPending && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-start justify-center pt-16 z-20">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                    </div>
                  )}
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">#</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signed Up</th>
                        <SortableTh label="Orders (Range)" sortKey="ordersInRange"    current={sortKey} dir={sortDir} onSort={toggleSort} />
                        <SortableTh label="Spend (Range)"  sortKey="spendInRange"     current={sortKey} dir={sortDir} onSort={toggleSort} />
                        <SortableTh label="LTV (All Time)" sortKey="ltv"              current={sortKey} dir={sortDir} onSort={toggleSort} />
                        <SortableTh label="Total Orders (All Time)" sortKey="totalOrdersAllTime" current={sortKey} dir={sortDir} onSort={toggleSort} />
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Order (All Time)</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sorted.length > 0 ? sorted.map((c, i) => (
                        <tr key={c.userId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-slate-300 font-bold">{String(i + 1).padStart(2, "0")}</td>
                          <td className="px-6 py-4 font-semibold text-slate-700">{c.name}</td>
                          <td className="px-6 py-4 text-slate-500">{c.email}</td>
                          <td className="px-6 py-4 text-slate-500">{c.phone || "—"}</td>
                          <td className="px-6 py-4 text-slate-500">{fmtDate(c.signupDate)}</td>
                          <td className="px-6 py-4">
                            <span className={`font-bold ${c.ordersInRange > 0 ? "text-indigo-600" : "text-slate-300"}`}>
                              {c.ordersInRange}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-700">
                            {c.spendInRange > 0 ? fmtSAR(c.spendInRange) : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-6 py-4 font-bold text-purple-600">
                            {c.ltv > 0 ? fmtSAR(c.ltv) : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-6 py-4 text-slate-500">{c.totalOrdersAllTime}</td>
                          <td className="px-6 py-4 text-slate-500">{fmtDate(c.lastOrderAt)}</td>
                          <td className="px-6 py-4">
                            <CustomerTypeBadge customer={c} />
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={11} className="px-6 py-12 text-center text-slate-400">
                            No customers match this filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

// Helpers

function SortableTh({ label, sortKey, current, dir, onSort }: {
  label: string;
  sortKey: keyof CustomerMetric;
  current: keyof CustomerMetric;
  dir: "asc" | "desc";
  onSort: (k: keyof CustomerMetric) => void;
}) {
  const active = current === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap cursor-pointer hover:text-slate-600 select-none"
    >
      <span className="flex items-center gap-1">
        {label}
        <span className={`transition-opacity ${active ? "opacity-100" : "opacity-30"}`}>
          {active && dir === "asc" ? "↑" : "↓"}
        </span>
      </span>
    </th>
  );
}

function CustomerTypeBadge({ customer: c }: { customer: CustomerMetric }) {
  if (c.isDeleted)
    return <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-[10px] font-bold">Deleted</span>;
  if (c.isNew && c.ordersInRange > 0)
    return <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">New</span>;
  if (c.isReturning)
    return <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold">Returning</span>;
  if (c.ordersInRange === 0)
    return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold">Inactive</span>;
  return <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold">Active</span>;
}