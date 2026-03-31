"use client";

import { ArrowDown, ChevronDown, TrendingUp, TrendingDown, Minus, FileText, ShoppingCart } from "lucide-react";
import Header from '@/components/Header';
import {
  ChartContainer,
} from "@/components/ui/chart";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const orders = [
  { name: "Elite Services Co.", phone: "0501758162",   qty: 14, progress: 15, value: "1,554.00", color: "bg-red-400"    },
  { name: "Badr Management",    phone: "0096654888492", qty: 12, progress: 45, value: "473.50",   color: "bg-yellow-400" },
  { name: "Bayan Alghamdi",     phone: "0543400040",   qty: 2,  progress: 80, value: "372.00",   color: "bg-blue-500"   },
  { name: "Reyouf Al-Qahtani", phone: "0508461260",   qty: 1,  progress: 95, value: "346.00",   color: "bg-blue-600"   },
  { name: "K. Management",      phone: "",              qty: 5,  progress: 60, value: "288.00",   color: "bg-blue-500"   },
  { name: "Khalid Nasser",      phone: "",              qty: 3,  progress: 30, value: "195.00",   color: "bg-blue-400"   },
];

const invoices = [
  { name: "Bonya Co.",           id: "054561952",   count: 12, status: "overdue",   value: "2,400.00" },
  { name: "Furless Permanent",   id: "0559641083",  count: 1,  status: "recent",    value: "32.50"    },
  { name: "Starlight Estates",   id: "0561239874",  count: 3,  status: "awaiting",  value: "890.00"   },
  { name: "Urban Cafe",          id: "",             count: 7,  status: "recent",    value: "1,220.40" },
  { name: "Metro Logistics",     id: "",             count: 4,  status: "recent",    value: "640.00"   },
];

// Sparkline data
const risingData   = [2, 3, 2.5, 4, 3.8, 5, 6, 5.5, 7].map((v, i) => ({ v, i }));
const stableData   = [4, 4.2, 3.8, 4.1, 4, 3.9, 4.2, 4, 4.1].map((v, i) => ({ v, i }));

export default function MetricsUnpaidPage() {
  return (
    <div className="flex min-h-screen bg-white">
      <Header />

      <main className="flex-1 pt-16 pb-8 pl-60 flex flex-col gap-6">

        {/* Page header */}
        <section className="flex items-center justify-between px-6 py-2">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Unpaid Reports</h1>
            <p className="text-sm text-slate-500">List of unpaid orders and invoices</p>
          </div>
          <div className="flex items-center gap-3">
            <FilterButton label="Status: All Orders" />
            <FilterButton label="Last 7 Days" />
            <button className="bg-[#16B4CF] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow hover:bg-[#119CB4] transition-colors">
              Apply Filters
            </button>
          </div>
        </section>

        <div className="flex flex-col gap-6 px-6">

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4">

            {/* Card 1 — Unpaid Orders — rising */}
            <StatCard
              title="UNPAID ORDERS"
              value="SAR 11,256.27"
              trend="+12%"
              trendType="positive"
              icon={<ShoppingCart className="h-4 w-4 text-orange-500" />}
              iconBg="bg-orange-50"
              sparkData={risingData}
              sparkColor="#22c55e"
            />

            {/* Card 2 — Unpaid Invoices — stable */}
            <StatCard
              title="UNPAID INVOICES"
              value="SAR 2,432.50"
              trend="Stable"
              trendType="neutral"
              icon={<FileText className="h-4 w-4 text-blue-500" />}
              iconBg="bg-blue-50"
              sparkData={stableData}
              sparkColor="#94a3b8"
            />

            {/* Card 3 — Total — progress bar */}
            <div className="bg-white border border-slate-200 border-l-3 border-l-red-600 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Total Unpaid Balance
                </p>
                <span className="text-[10px] px-2 py-1 bg-red-100 text-red-500 rounded-full font-semibold">
                  URGENT
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">SAR 13,688.77</h2>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>COLLECTION TARGET</span>
                  <span>85% Achieved</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-2 bg-red-400 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>
            </div>

          </div>

          {/* Tables */}
          <div className="grid grid-cols-2 gap-6">

            {/* LEFT — Unpaid Orders */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Unpaid Orders Detail
                </h3>
                <button className="text-xs text-[#16B4CF] flex items-center gap-1 font-semibold">
                  <ArrowDown className="w-3 h-3" /> Export
                </button>
              </div>

              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      Client / Phone
                    </th>
                    <th className="px-4 py-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold text-center">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      Progress
                    </th>
                    <th className="px-5 py-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold text-right">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-800 text-sm">{order.name}</p>
                        <p className="text-xs text-slate-400">{order.phone || "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-700">
                        {order.qty}
                      </td>
                      <td className="px-4 py-3 w-32">
                        <ProgressBar value={order.progress} color={order.color} />
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-red-500 whitespace-nowrap">
                        SAR {order.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* RIGHT — Unpaid Invoices */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Unpaid Invoices Detail
                </h3>
                <button className="text-xs text-[#16B4CF] flex items-center gap-1 font-semibold">
                  <ArrowDown className="w-3 h-3" /> Export
                </button>
              </div>

              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      Corporate Account
                    </th>
                    <th className="px-4 py-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold text-center">
                      Inv
                    </th>
                    <th className="px-4 py-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold text-center">
                      Status
                    </th>
                    <th className="px-5 py-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold text-right">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-800 text-sm">{inv.name}</p>
                        <p className="text-xs text-slate-400">{inv.id || "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-700">
                        {inv.count}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-red-500 whitespace-nowrap">
                        SAR {inv.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

//helpers

function FilterButton({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-colors">
      {label}
      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
    </button>
  );
}

function StatCard({ title, value, trend, trendType, icon, iconBg, sparkData, sparkColor }: {
  title: string; value: string; trend: string;
  trendType: "positive" | "negative" | "neutral";
  icon: React.ReactNode; iconBg: string;
  sparkData: { v: number; i: number }[];
  sparkColor: string;
}) {
  
  const trendColor = trendType === "positive" ? "text-green-500" : trendType === "negative" ? "text-red-500" : "text-slate-400";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">

      {/* Top row — title + icon */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <h2 className="text-xl font-bold text-slate-900">{value}</h2>

      {/* Bottom row — sparkline + trend */}
      <div className="flex items-end justify-between gap-3">
        {/* Trend label */}
        <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
          {trend}
        </div>

        {/* Sparkline */}
        <div className="h-10 w-28">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={sparkColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        

      </div>
    </div>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-slate-400 font-semibold text-right">{value}%</span>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    overdue:  "bg-red-100 text-red-500",
    recent:   "bg-green-100 text-green-600",
    awaiting: "bg-yellow-100 text-yellow-600",
  };
  return (
    <span className={`inline-flex text-[10px] px-2 py-1 rounded-full font-semibold ${map[status] ?? "bg-slate-100 text-slate-500"}`}>
      {status.toUpperCase()}
    </span>
  );
}