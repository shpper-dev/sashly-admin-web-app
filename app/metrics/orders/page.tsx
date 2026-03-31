"use client";
import Header from "@/components/Header";
import { useState } from "react";
import { CheckCircle, ShoppingCart, XCircle, ArrowDown, Notebook, FileText } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts";
import MetricsSidebar from "@/components/metrics/MetricsSideBar";

const chartDataMap = {
  daily: [
    { day: "Mon", orders: 18 },
    { day: "Tue", orders: 32 },
    { day: "Wed", orders: 24 },
    { day: "Thu", orders: 41 },
    { day: "Fri", orders: 29 },
    { day: "Sat", orders: 55 },
    { day: "Sun", orders: 38 },
  ],
  weekly: [
    { day: "W1", orders: 120 },
    { day: "W2", orders: 180 },
    { day: "W3", orders: 150 },
    { day: "W4", orders: 210 },
  ],
  monthly: [
    { day: "Jan", orders: 400 },
    { day: "Feb", orders: 380 },
    { day: "Mar", orders: 520 },
    { day: "Apr", orders: 610 },
    { day: "May", orders: 490 },
    { day: "Jun", orders: 700 },
  ],
};

const chartConfig = {
  orders: { label: "Orders", color: "#7F50F4" },
};

const headings = ["Date", "Orders", "Sales"];

const rows = Array.from({ length: 6 }).map(() => ({
  date: "Oct 24, 2023",
  orders: 32,
  sales: 930.8,
  contribution: 894.35,
}));

function PurpleTopBar(props: any) {
  const { x, y, width, height } = props;
  if (!width || !height) return null;

  const radius = 8; 
  const color = "#7F50F4";
  const pathData = `
    M ${x},${y + height}
    L ${x},${y + radius}
    Q ${x},${y} ${x + radius},${y}
    L ${x + width - radius},${y}
    Q ${x + width},${y} ${x + width},${y + radius}
    L ${x + width},${y + height}
    Z
  `;

  return (
    <g>
      <path d={pathData} fill="rgba(59,130,246,0.18)" />
      {/* Top Border Only */}
      <path
        d={`M ${x},${y + radius} Q ${x},${y} ${x + radius},${y} L ${x + width - radius},${y} Q ${x + width},${y} ${x + width},${y + radius}`}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </g>
  );
}

export default function MetricsOrdersPage() {
  const [showContribution, setShowContribution] = useState(true);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  const renderCell = (heading: string, row: any) => {
    switch (heading) {
      case "Date":
        return <span className="text-slate-500 whitespace-nowrap">{row.date}</span>;
      case "Orders":
        return <span className="font-semibold text-slate-800">{row.orders}</span>;
      case "Sales":
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800">SAR {row.sales.toFixed(2)}</span>
            {showContribution && (
              <span className="text-[10px] text-slate-400">(SAR {row.contribution})</span>
            )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <MetricsSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto pt-16 pl-60 pb-6">

          {/* Top bar*/}
          <section className="flex items-center justify-between px-8 py-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">Order Report</h1>
              <p className="text-sm text-slate-400">Detailed breakdown of transaction metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition">
                <FileText className="h-4 w-4" /> Export PDF
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16B4CF] hover:bg-[#119CB4] text-white text-sm font-semibold shadow-md transition">
                <ArrowDown className="h-4 w-4" /> Export CSV
              </button>
            </div>
          </section>

          <div className="flex flex-col gap-6 px-8 py-6">

            {/* Stats*/}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Orders",      value: "1,284", change: "+12.5%", icon: ShoppingCart },
                { label: "Active Orders",     value: "152",   change: "-2.1%",  icon: ShoppingCart },
                { label: "Completion Rate",   value: "96.4%", change: "+5.4%",  icon: CheckCircle  },
                { label: "Cancelled Orders",  value: "12",    change: "+1.2%",  icon: XCircle      },
              ].map(({ label, value, change, icon: Icon }) => (
                <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{label}</p>
                    <h3 className="text-xl font-bold text-slate-800">{value}</h3>
                    <p className={`text-xs font-medium ${change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                      {change} vs last month
                    </p>
                  </div>
                  <div className="bg-slate-100 p-2 rounded-lg shrink-0">
                    <Icon className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm px-8 pt-8 pb-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Order Trends</h2>
                  <p className="text-sm text-slate-400">Daily transaction volume comparison</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                  {(["daily", "weekly", "monthly"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-4 py-1.5 rounded-md transition capitalize ${
                        period === p ? "bg-white text-[#7F50F4] shadow-sm" : "text-slate-500"
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <ChartContainer config={chartConfig} className="w-full h-64">
                <BarChart key={period} data={chartDataMap[period]} barGap={12}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 700 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="orders"
                    shape={<PurpleTopBar />}
                  />
                </BarChart>
              </ChartContainer>
            </div>

            {/* Toggle + Table  */}
            <div className="flex flex-col gap-3">
              {/* Toggle */}
              <div className="flex items-center gap-3 px-1">
                <button
                  onClick={() => setShowContribution(!showContribution)}
                  className="flex items-center gap-2 text-sm text-slate-600"
                >
                  <div className={`w-9 h-5 rounded-full relative transition-colors ${showContribution ? "bg-[#7F50F4]" : "bg-slate-300"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${showContribution ? "left-4" : "left-0.5"}`} />
                  </div>
                  Show Delivery Contribution
                </button>
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      {headings.map((h) => (
                        <th key={h} className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {rows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        {headings.map((h) => (
                          <td key={h} className="px-6 py-4">{renderCell(h, row)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#16B4CF]">
                    <tr>
                      <td className="px-6 py-3 text-white font-bold text-sm">TOTAL</td>
                      <td className="px-6 py-3 text-white font-semibold text-sm">192</td>
                      <td className="px-6 py-3 text-white font-semibold text-sm">SAR 5,584.80</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}