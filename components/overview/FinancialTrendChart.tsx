"use client";

import { DailyRevenueRow } from "@/lib/firebase/overview";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface FinancialTrendChartProps {
  data: DailyRevenueRow[];
}

// Format "YYYY-MM-DD" → "DD MMM" for axis labels
function fmtAxisDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-bold text-slate-800">
            SAR {Number(p.value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function FinancialTrendChart({ data }: FinancialTrendChartProps) {
  // Derive a flat "target" line as the period's average daily revenue
  const avgRevenue =
    data.length > 0
      ? data.reduce((s, r) => s + r.revenue, 0) / data.length
      : 0;

  // Recharts reads data in order — sort ascending (oldest → newest) for the chart
  const chartData = [...data]
    .sort((a, b) => a.dateMs - b.dateMs)
    .map((r) => ({
      label:   fmtAxisDate(r.date),
      revenue: r.revenue,
      target:  Math.round(avgRevenue),
    }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart
        data={chartData}
        margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
      >
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#7F50F4" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#7F50F4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#02D0FF" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#02D0FF" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />

        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "#94A3B8" }}
          // Thin out ticks when there are many points so labels don't crowd
          interval={data.length > 30 ? Math.floor(data.length / 8) : "preserveStartEnd"}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "#94A3B8" }}
          tickFormatter={(v) => `${Math.round(v / 1000)}k`}
        />

        <Tooltip content={<CustomTooltip />} />

        {/* Flat average target reference line */}
        <Area
          type="monotone"
          dataKey="target"
          name="Avg Target"
          stroke="#02D0FF"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          fill="url(#targetGrad)"
          dot={false}
          activeDot={false}
        />

        {/* Actual daily revenue */}
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#7F50F4"
          strokeWidth={2}
          fill="url(#revenueGrad)"
          dot={data.length <= 14 ? { r: 3 } : false}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}