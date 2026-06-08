"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import Header from "@/components/Header";
import {
  getCustomerMetrics,
  CustomerMetric,
  CustomerPageStats,
} from "@/lib/firebase/metrics-customers";
import {
  Users, RefreshCcw, UserPlus, ShoppingBag,
  TrendingUp, Search, Download, FileText,
  ChevronDown, CalendarDays, Loader2, ArrowUpRight,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Date range presets

type Preset = "7d" | "30d" | "90d" | "365d" | "custom";

const PRESETS: { key: Preset; label: string }[] = [
  { key: "7d",   label: "Last 7 days"  },
  { key: "30d",  label: "Last 30 days" },
  { key: "90d",  label: "Last 90 days" },
  { key: "365d", label: "Last year"    },
  { key: "custom", label: "Custom range" },
];

function presetToRange(preset: Preset): { startMs: number; endMs: number } {
  const now = Date.now();
  if (preset === "custom") return { startMs: now - 30 * 86400000, endMs: now }; 
  const days = parseInt(preset);
  return { startMs: now - days * 86400000, endMs: now };
}

// Tab types 

type TabType =  "New" | "Returning" | "No Recent Orders" | "Deactivated";

const TABS: TabType[] = [ "New", "Returning", "No Recent Orders", "Deactivated"];


export default function MetricsCustomersPage() {
  const [preset,      setPreset]      = useState<Preset>("30d");
  const [pickerOpen,  setPickerOpen]  = useState(false);
  const [customStart, setCustomStart] = useState("");  // ISO date string for <input type="date">
  const [customEnd,   setCustomEnd]   = useState("");
  const [stats,       setStats]       = useState<CustomerPageStats | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState<TabType>("New");
  const [search,      setSearch]      = useState("");
  const [sortKey,     setSortKey]     = useState<keyof CustomerMetric>("spendInRange");
  const [sortDir,     setSortDir]     = useState<"asc" | "desc">("desc");

  // Fetch 

  const fetchStats = useCallback(async (p: Preset, cStart?: string, cEnd?: string) => {
    setLoading(true);
    let startMs: number, endMs: number;

    if (p === "custom" && cStart && cEnd) {
      startMs = new Date(cStart).getTime();
      endMs   = new Date(cEnd).getTime() + 86400000 - 1; 
    } else {
      ({ startMs, endMs } = presetToRange(p));
    }

    try {
      const data = await getCustomerMetrics(startMs, endMs);
      setStats(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(preset); }, []);

  const handlePreset = (p: Preset) => {
    setPreset(p);
    if (p !== "custom") {
      setPickerOpen(false);
      fetchStats(p);
    }
    
  };

  const handleCustomApply = () => {
    setPickerOpen(false);
    fetchStats("custom", customStart, customEnd);
  };

  //  Tab filtering
  // Each tab filters the master customer list differently:
  // "New"              → signed up in the selected range
  // "Returning"        → had prior orders AND ordered in range
  // "No Recent Orders" → active users with zero orders in range
  // "Deactivated"      → isDeleted === true
  // "All Customers"    → non-deleted, regardless of orders

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
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  // Label helpers

  const currentLabel = preset === "custom" && customStart && customEnd
    ? `${customStart} → ${customEnd}`
    : PRESETS.find(p => p.key === preset)?.label ?? "Last 30 days";

  const fmtDate = (ms: number | null) =>
    ms ? new Date(ms).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const fmtSAR = (n: number) =>
    `SAR ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Top spenders for distribution chart 
  // Show top 5 customers by spend in range, sorted descending
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

            {/* Date picker */}
            
            <DropdownMenu open={pickerOpen} onOpenChange={setPickerOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 transition outline-none">
                  <CalendarDays size={15} className="text-slate-400" />
                  {currentLabel}
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
              </DropdownMenuTrigger>
            
              <DropdownMenuContent align="end" className="min-w-[220px] rounded-xl p-1">
            
                {/* Preset options */}
               {PRESETS.map(p => (
                  <DropdownMenuItem
                    key={p.key}
                    onSelect={e => {
                      if (p.key === "custom") e.preventDefault(); 
                      handlePreset(p.key);
                    }}
                    className={`rounded-lg px-3 py-2 text-sm font-medium cursor-pointer ${
                      preset === p.key
                        ? "text-indigo-600 bg-indigo-50 focus:bg-indigo-50 focus:text-indigo-600"
                        : "text-slate-600"
                    }`}
                  >
                    {p.label}
                  </DropdownMenuItem>
                ))}
            
                
                {preset === "custom" && (
                  <>
                    <DropdownMenuSeparator className="my-1" />
            
                    
                    <div
                      className="px-3 pb-2 pt-1 flex flex-col gap-2"
                      onPointerDown={e => e.stopPropagation()} 
                    >
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          From
                        </label>
                        <input
                          type="date"
                          value={customStart}
                          onChange={e => setCustomStart(e.target.value)}
                          className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />    
                      </div>
            
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          To
                        </label>
                        <input
                          type="date"
                          value={customEnd}
                          onChange={e => setCustomEnd(e.target.value)}
                          className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                      </div>
            
                      <button
                          onClick={handleCustomApply}
                        disabled={!customStart || !customEnd}
                        className="mt-0.5 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg transition disabled:opacity-40"
                      >
                        Apply Range
                      </button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50">
              <FileText size={16} className="text-blue-500" /> Export PDF
            </button>
            <button className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyan-600 transition">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : stats && (
          <>
            {/* Stat Cards */}
           
            <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 px-8 mb-6">
              <StatCard
                label="TOTAL CUSTOMERS"
                value={stats.totalCustomers.toLocaleString()}
                sub={`${stats.newInRange} joined in range`}
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
                sub="Orders per active customer"
                icon={<ShoppingBag size={16} className="text-cyan-600" />}
                iconBg="bg-cyan-50"
                trend="In range"
                trendColor="text-cyan-500"
              />
              <StatCard
                label="AVG LTV"
                value={`SAR ${Math.round(stats.avgLTV).toLocaleString()}`}
                sub="Avg all-time spend"
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
                    Top Spenders — {currentLabel}
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
                    onClick={() => setActiveTab(tab)}
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
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">#</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signed Up</th>
                        <SortableTh label="Orders (Range)" sortKey="ordersInRange"    current={sortKey} dir={sortDir} onSort={toggleSort} />
                        <SortableTh label="Spend (Range)"  sortKey="spendInRange"     current={sortKey} dir={sortDir} onSort={toggleSort} />
                        <SortableTh label="LTV (All Time)" sortKey="ltv"              current={sortKey} dir={sortDir} onSort={toggleSort} />
                        <SortableTh label="Total Orders"   sortKey="totalOrdersAllTime" current={sortKey} dir={sortDir} onSort={toggleSort} />
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Order</th>
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
                          {/* Orders in range — highlights activity in the selected period */}
                          <td className="px-6 py-4">
                            <span className={`font-bold ${c.ordersInRange > 0 ? "text-indigo-600" : "text-slate-300"}`}>
                              {c.ordersInRange}
                            </span>
                          </td>
                          {/* Spend in range */}
                          <td className="px-6 py-4 font-bold text-slate-700">
                            {c.spendInRange > 0 ? fmtSAR(c.spendInRange) : <span className="text-slate-300">—</span>}
                          </td>
                          {/* LTV — all-time spend regardless of range */}
                          <td className="px-6 py-4 font-bold text-purple-600">
                            {c.ltv > 0 ? fmtSAR(c.ltv) : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-6 py-4 text-slate-500">{c.totalOrdersAllTime}</td>
                          <td className="px-6 py-4 text-slate-500">{fmtDate(c.lastOrderAt)}</td>
                          {/* Customer type badge */}
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

function StatCard({ label, value, sub, icon, iconBg, trend, trendColor = "text-emerald-500" }: {
  label: string; value: string; sub: string; icon: React.ReactNode;
  iconBg: string; trend: string; trendColor?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
      <div className={`absolute top-4 right-4 p-2 rounded-lg ${iconBg}`}>{icon}</div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pr-8">{label}</p>
      <p className="text-xl font-bold text-slate-800 mt-1">{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
      <p className={`text-[10px] font-semibold mt-1.5 flex items-center gap-1 ${trendColor}`}>
        <ArrowUpRight size={11} /> {trend}
      </p>
    </div>
  );
}

// Sortable column header — shows direction arrow when active
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

// Derives a visual badge from the customer's computed metrics
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