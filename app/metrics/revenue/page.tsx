"use client";

import { useState } from "react";
import Header from "@/components/Header";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts";
import { ArrowDown, ChevronDown, FileText, List, Notebook } from "lucide-react";

export default function RevenuePage() {
  const [showSubtotal, setShowSubtotal] = useState(true);
  const [showTips, setShowTips]         = useState(true);
  const [showDelivery, setShowDelivery] = useState(true);

  const tableHeadings = [
    "date", "revenue", "cash", "card", "regular",
    "check", "bank",
    ...(showTips ? ["tips"] : []),
    "credit", "discount",
    ...(showSubtotal ? ["subtotal"] : []),
  ];

  const rows = Array(8).fill({
    date: "Oct 28, 2023", revenue: 339, cash: 300,
    card: 2450, regular: 2450, check: 2450, bank: 2450,
    tips: 0, credit: 100, discount: 100, subtotal: 1078.9,
  });

  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");

const chartDataMap = {
  daily: [
    { day: "Mon", revenue: 120 },
    { day: "Tue", revenue: 200 },
    { day: "Wed", revenue: 150 },
    { day: "Thu", revenue: 250 },
    { day: "Fri", revenue: 180 },
    { day: "Sat", revenue: 300 },
    { day: "Sun", revenue: 220 },
  ],
  weekly: [
    { day: "W1", revenue: 200 },
    { day: "W2", revenue: 450 },
    { day: "W3", revenue: 300 },
    { day: "W4", revenue: 550 },
  ],
  monthly: [
    { day: "Jan", revenue: 1200 },
    { day: "Feb", revenue: 1800 },
    { day: "Mar", revenue: 1500 },
    { day: "Apr", revenue: 2200 },
    { day: "May", revenue: 1200 },
    { day: "Jun", revenue: 1800 },
    { day: "Jul", revenue: 1500 },
    { day: "Aug", revenue: 2200 },
    { day: "Sep", revenue: 1200 },
    { day: "Oct", revenue: 1800 },
    { day: "Nov", revenue: 1500 },
    { day: "Dec", revenue: 2200 },
  ],
};

const getChartData = () => chartDataMap[period];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#7F50F4",
  },
};


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
  return (
    <div className="bg-white min-h-screen">
      <Header />

      <main className="flex flex-col gap-6 pt-16 pl-60 min-h-screen pb-6">

        <section className="px-6">
          {/* TOP BAR */}
            <div className="flex items-center justify-between pb-4">

              {/* LEFT: Title */}
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Revenue Analytics
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Revenue stats
                </p>
              </div>

              {/* RIGHT: Controls */}
              <div className="flex items-center gap-4">

                {/* Date Picker */}
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 shadow-sm hover:bg-slate-50 transition">
                  <span className="text-slate-400">📅</span>
                  Oct 01, 2023 - Oct 31, 2023
                  <span className="text-slate-400"><ChevronDown strokeWidth={3} className="h-3 w-3"/></span>
                </button>

                {/* Divider */}
                <div className="h-6 w-px bg-slate-200" />

                {/* Export PDF */}
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition">
                  <FileText className="h-4 w-4" />
                  Export PDF
                </button>

                {/* Export CSV */}
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16B4CF] hover:bg-[#119CB4] text-white text-sm font-semibold shadow-md transition">
                  <ArrowDown className="h-4 w-5" />
                  Export CSV
                </button>

              </div>
            </div>
            {/*Stats  */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard title="Unpaid Orders"      value="SAR 128,430.00" change="+12.5%" />
              <StatCard title="Avg. Order Value"   value="SAR 1,562.80"   change="-2.1%"  />
              <StatCard title="Card Transactions"  value="843"            change="+5.4%"  />
              <StatCard title="Bank Transfers"     value="SAR 128,430.00" change="+1.2%"  />
            </div>
        </section>

        {/* Chart  */}
        <section className="px-6">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm px-8 pt-10 pb-8 flex flex-col gap-8">
        
            {/* HEADER */}
            <div className="flex items-center justify-between w-full">
        
              {/* LEFT */}
              <div className="flex flex-col">
                <h2 className="text-[20px] font-bold text-slate-900">
                  Revenue
                </h2>
                <p className="text-sm text-slate-500">
                  Visual representation of revenues for the chosen time period
                </p>
              </div>
        
              {/* RIGHT SWITCH */}
              <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                {["daily", "weekly", "monthly"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setPeriod(type as any)}
                    className={`px-4 py-1.5 rounded-md transition ${
                      period === type
                        ? "bg-white text-[#7F50F4] shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
        
            {/* CHART */}
            <div className="relative w-full h-95">

               {/* GRID LINES */}
               <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
                 {Array(5).fill(0).map((_, i) => (
                   <div key={i} className="border-t border-slate-900 w-full" />
                 ))}
               </div>             

               <ChartContainer config={chartConfig} className="w-full h-full">
                 <BarChart key={period} data={getChartData()} barGap={16}>
                   
                   <XAxis
                     dataKey="day"
                     axisLine={false}
                     tickLine={false}
                     tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 700 }}
                   />             

                   <ChartTooltip content={<ChartTooltipContent />} />             

                   <Bar dataKey="revenue" shape={<PurpleTopBar />} />
                 </BarChart>
               </ChartContainer>
             </div>
        
          </div>
        </section>

        <section className="flex flex-col gap-3 px-6">
          {/*  Toggles */}
        <div className="flex items-center gap-6 px-2">
          <Toggle label="Show Subtotal"              value={showSubtotal}  onChange={setShowSubtotal}  />
          <Toggle label="Show Tips"                  value={showTips}      onChange={setShowTips}      />
          <Toggle label="Show Delivery Contribution" value={showDelivery}  onChange={setShowDelivery}  />
        </div>

        {/*  Table  */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {tableHeadings.map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  {tableHeadings.map((h) => (
                    <td key={h} className="px-4 py-3 text-sm text-slate-700">
                      {renderCellContent(h, row, showDelivery)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#02D0FF]">
              <tr>
                <td className="px-4 py-3 text-white font-bold text-sm">TOTAL</td>
                <td colSpan={tableHeadings.length - 1} className="px-4 py-3 text-white font-semibold text-sm">
                  SAR 221,078.90
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        </section>

      </main>
    </div>
  );
}

//  Helpers ─
function StatCard({ title, value, change }: { title: string; value: string; change: string }) {
  const positive = change.startsWith("+");
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1">
      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{title}</p>
      <h3 className="text-lg font-bold text-slate-800">{value}</h3>
      <p className={`text-xs font-medium ${positive ? "text-green-500" : "text-red-500"}`}>
        {change} vs last month
      </p>
    </div>
  );
}


function Toggle({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center gap-2 text-sm text-slate-600"
    >
      <div className={`w-9 h-5 rounded-full relative transition-colors ${value ? "bg-[#7F50F4]" : "bg-slate-300"}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? "left-4" : "left-0.5"}`} />
      </div>
      {label}
    </button>
  );
}

function renderCellContent(key: string, row: any, showDelivery: boolean) {
  if (key === "date") return <span className="text-slate-500 whitespace-nowrap">{row.date}</span>;

  if (key === "revenue") {
    return (
      <div className="flex flex-col">
        <span className="font-semibold text-slate-800">SAR {row.revenue}</span>
        {showDelivery && <span className="text-[10px] text-purple-500">(SAR {row.revenue})</span>}
      </div>
    );
  }

  const val = row[key];
  if (val === undefined || val === null) return "—";
  return <span>SAR {typeof val === "number" ? val.toFixed(2) : val}</span>;
}