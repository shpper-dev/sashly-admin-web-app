"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  ArrowUpRight, Search, Shirt, Zap, Loader2, TrendingUp,
} from "lucide-react";
import Header from "@/components/Header";
import {
  getTopSellingStats,
  MatrixData, ProductStats, ServiceStats,
} from "@/lib/firebase/metrics-top-selling";
import DateRangePicker, { DateRangeChangePayload } from "@/components/metrics/DateRangePicker";
import { presetToRange } from "@/lib/date-presets";

export default function MetricsTopSellingPage() {
  const [showAvgPrice, setShowAvgPrice] = useState(false);
  const [activeMode,   setActiveMode]   = useState<"items" | "services">("items");
  const [products,     setProducts]     = useState<ProductStats[]>([]);
  const [services,     setServices]     = useState<ServiceStats[]>([]);
  const [matrix,       setMatrix]       = useState<MatrixData>(new Map());
  const [loading,      setLoading]      = useState(true);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [rangeLabel,   setRangeLabel]   = useState("Last 30 days");

  const fetchData = useCallback(async (startMs: number, endMs: number) => {
    setLoading(true);
    try {
      const result = await getTopSellingStats(startMs, endMs);
      setProducts(result.products);
      setServices(result.services);
      setMatrix(result.matrix);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
  const { startMs, endMs } = presetToRange("30d"); // match defaultPreset
  fetchData(startMs, endMs);
}, []);

  const handleRangeChange = ({ startMs, endMs, label }: DateRangeChangePayload) => {
    setRangeLabel(label);
    fetchData(startMs, endMs);
  };

  const matrixItems    = products.slice(0, 4);
  const matrixServices = services.slice(0, 3);
  const matrixCell     = (itemName: string, svcName: string) =>
    matrix.get(itemName)?.get(svcName) ?? 0;
  const matrixRowTotal = (itemName: string) =>
    matrixServices.reduce((sum, s) => sum + matrixCell(itemName, s.serviceName), 0);

  const filteredProducts = useMemo(
    () => products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.arabicName.includes(searchQuery)
    ),
    [products, searchQuery]
  );
  const filteredServices = useMemo(
    () => services.filter((s) =>
      s.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [services, searchQuery]
  );

  const topItem    = products[0];
  const topService = services[0];
  const topRevItem = [...products].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];

  const SERVICE_COLORS = [
    { bar: "bg-indigo-500" },
    { bar: "bg-blue-500"   },
    { bar: "bg-cyan-400"   },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16 pb-8 pl-60 flex flex-col gap-6">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Top Selling Items</h1>
            <p className="text-sm text-slate-500">Detailed breakdown of top selling items &amp; services</p>
          </div>
          <DateRangePicker defaultPreset="30d" onRangeChange={handleRangeChange} />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
              <StatCard
                title="TOP ITEM"
                value={topItem?.name ?? "—"}
                subValue={`${topItem?.totalQuantity.toLocaleString() ?? 0} units cleaned`}
                trend={`${topItem?.totalOrders ?? 0} orders`}
                icon={<Shirt className="text-cyan-500" />}
                iconBg="bg-cyan-50"
              />
              <StatCard
                title="TOP SERVICE"
                value={topService?.serviceName ?? "—"}
                subValue={`${topService?.totalPieces.toLocaleString() ?? 0} pieces`}
                trend={`${services.length} services total`}
                icon={<Zap className="text-blue-500" />}
                iconBg="bg-blue-50"
              />
              <StatCard
                title="TOP REVENUE ITEM"
                value={topRevItem?.name ?? "—"}
                subValue={`SAR ${topRevItem?.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 }) ?? "0.00"}`}
                trend="highest earnings"
                icon={<TrendingUp className="text-purple-500" />}
                iconBg="bg-purple-50"
              />
            </div>

            {/* Matrix + Ranking Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800">Service × Item Matrix</h3>
                  <span className="text-xs text-slate-400 font-medium">
                    Top {matrixItems.length} items · Top {matrixServices.length} services · pieces
                  </span>
                </div>
                {matrixItems.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">No data available</div>
                ) : (
                  <div className="space-y-5">
                    {matrixItems.map((item) => {
                      const rowTotal = matrixRowTotal(item.name);
                      return (
                        <div key={item.name} className="flex items-center gap-4">
                          <div className="w-24 shrink-0 text-right">
                            <span className="text-xs font-semibold text-slate-600 leading-tight block truncate">
                              {item.name}
                            </span>
                            {item.arabicName && (
                              <span className="text-[10px] text-slate-400 block">{item.arabicName}</span>
                            )}
                          </div>
                          <div className="flex-1 flex h-9 rounded-lg overflow-hidden bg-slate-100">
                            {rowTotal === 0 ? (
                              <div className="flex-1 flex items-center justify-center text-[10px] text-slate-400">No data</div>
                            ) : (
                              matrixServices.map((svc, si) => {
                                const pieces = matrixCell(item.name, svc.serviceName);
                                const pct    = (pieces / rowTotal) * 100;
                                if (pct === 0) return null;
                                return (
                                  <div
                                    key={svc.serviceName}
                                    style={{ width: `${pct}%` }}
                                    className={`${SERVICE_COLORS[si].bar} flex items-center justify-center text-[10px] text-white font-bold border-l border-white/20 first:border-l-0 overflow-hidden whitespace-nowrap px-1`}
                                    title={`${svc.serviceName}: ${pieces} pcs (${pct.toFixed(0)}%)`}
                                  >
                                    {pct > 12 ? `${pct.toFixed(0)}%` : ""}
                                  </div>
                                );
                              })
                            )}
                          </div>
                          <div className="w-16 shrink-0 text-right">
                            <span className="text-xs font-bold text-slate-700">{rowTotal.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 block">pcs</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex flex-wrap justify-center gap-4 mt-8 pt-4 border-t border-slate-100">
                  {matrixServices.map((svc, si) => (
                    <div key={svc.serviceName} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-sm ${SERVICE_COLORS[si].bar}`} />
                      <span className="text-xs font-medium text-slate-500">{svc.serviceName}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <RankingList
                  title="Top Items by Volume"
                  items={products.slice(0, 3).map((p) => ({
                    label: p.name,
                    value: p.totalQuantity.toLocaleString(),
                  }))}
                />
                <RankingList
                  title="Top Services by Revenue"
                  items={services.slice(0, 3).map((s) => ({
                    label: s.serviceName,
                    value: `SAR ${s.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                  }))}
                  isCurrency
                />
              </div>
            </div>

            {/* Detailed Table */}
            <div className="px-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="font-bold text-slate-800">Detailed Breakdown</h3>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setActiveMode("items")}
                      className={`px-6 py-1 text-sm font-medium rounded-md transition-all ${
                        activeMode === "items" ? "bg-white shadow-sm text-slate-800" : "text-slate-500"
                      }`}
                    >
                      Items
                    </button>
                    <button
                      onClick={() => setActiveMode("services")}
                      className={`px-6 py-1 text-sm font-medium rounded-md transition-all ${
                        activeMode === "services" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"
                      }`}
                    >
                      Services
                    </button>
                  </div>
                </div>

                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowAvgPrice(!showAvgPrice)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 ${
                        showAvgPrice ? "bg-purple-600" : "bg-gray-200"
                      }`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition duration-200 ${
                        showAvgPrice ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Show Avg. Price Per Piece
                    </span>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Filter ${activeMode}...`}
                      className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="max-h-[550px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-400 font-medium uppercase text-[11px] tracking-widest border-b border-slate-100 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 w-8 bg-slate-50">#</th>
                        {activeMode === "items" ? (
                          <>
                            <th className="px-6 py-4 bg-slate-50">Product</th>
                            <th className="px-6 py-4 bg-slate-50">Arabic</th>
                            <th className="px-6 py-4 bg-slate-50">Units</th>
                            <th className="px-6 py-4 bg-slate-50">Orders</th>
                            <th className="px-6 py-4 bg-slate-50">Revenue</th>
                            {showAvgPrice && <th className="px-6 py-4 bg-slate-50">Avg / Piece</th>}
                          </>
                        ) : (
                          <>
                            <th className="px-6 py-4 bg-slate-50">Service Name</th>
                            <th className="px-6 py-4 bg-slate-50">Line Items</th>
                            <th className="px-6 py-4 bg-slate-50">Pieces</th>
                            <th className="px-6 py-4 bg-slate-50">Orders</th>
                            <th className="px-6 py-4 bg-slate-50">Revenue</th>
                            {showAvgPrice && <th className="px-6 py-4 bg-slate-50">Avg / Piece</th>}
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {activeMode === "items"
                        ? filteredProducts.map((item, i) => (
                            <tr key={item.name} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-slate-300 font-bold text-xs">{String(i + 1).padStart(2, "0")}</td>
                              <td className="px-6 py-4 font-semibold text-slate-700">{item.name}</td>
                              <td className="px-6 py-4 text-slate-400">{item.arabicName}</td>
                              <td className="px-6 py-4 text-slate-500">{item.totalQuantity.toLocaleString()}</td>
                              <td className="px-6 py-4 text-slate-500">{item.totalOrders.toLocaleString()}</td>
                              <td className="px-6 py-4 font-bold text-purple-600">
                                SAR {item.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </td>
                              {showAvgPrice && (
                                <td className="px-6 py-4 text-slate-400 font-medium">
                                  SAR {item.totalQuantity > 0 ? (item.totalRevenue / item.totalQuantity).toFixed(2) : "0.00"}
                                </td>
                              )}
                            </tr>
                          ))
                        : filteredServices.map((svc, i) => (
                            <tr key={svc.serviceName} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-slate-300 font-bold text-xs">{String(i + 1).padStart(2, "0")}</td>
                              <td className="px-6 py-4 font-semibold text-slate-700">{svc.serviceName}</td>
                              <td className="px-6 py-4 text-slate-500">{svc.totalQuantity.toLocaleString()}</td>
                              <td className="px-6 py-4 text-slate-500">{svc.totalPieces.toLocaleString()}</td>
                              <td className="px-6 py-4 text-slate-500">{svc.totalOrders.toLocaleString()}</td>
                              <td className="px-6 py-4 font-bold text-purple-600">
                                SAR {svc.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </td>
                              {showAvgPrice && (
                                <td className="px-6 py-4 text-slate-400 font-medium">
                                  SAR {svc.totalPieces > 0 ? (svc.totalRevenue / svc.totalPieces).toFixed(2) : "0.00"}
                                </td>
                              )}
                            </tr>
                          ))}
                    </tbody>
                  </table>

                  {(activeMode === "items" ? filteredProducts : filteredServices).length === 0 && (
                    <div className="text-center py-10 text-slate-400 text-sm">No results found</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// helpers

function StatCard({ title, value, subValue, trend, icon, iconBg }: {
  title: string; value: string; subValue: string; trend: string;
  icon: React.ReactNode; iconBg: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
      <div className={`absolute top-6 right-6 p-2 rounded-lg ${iconBg}`}>{icon}</div>
      <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{title}</p>
      <h2 className="text-2xl font-bold text-slate-800 mt-2 truncate pr-10">{value}</h2>
      <div className="flex items-center justify-between mt-1">
        <p className="text-sm text-slate-500">{subValue}</p>
        <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
          <ArrowUpRight size={14} /> {trend}
        </span>
      </div>
    </div>
  );
}

function RankingList({ title, items, isCurrency }: {
  title: string;
  items: { label: string; sub?: string; value: string }[];
  isCurrency?: boolean;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4">{title}</h3>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-slate-300 text-xs font-bold shrink-0">{String(idx + 1).padStart(2, "0")}</span>
              <div className="min-w-0">
                <span className="text-sm font-semibold text-slate-700 block truncate">{item.label}</span>
                {item.sub && <span className="text-[10px] text-slate-400">{item.sub}</span>}
              </div>
            </div>
            <span className={`text-sm font-bold shrink-0 ml-2 ${isCurrency ? "text-emerald-600" : "text-blue-600"}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}