"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { day: "Feb 20", sales: 8200,  target: 10000 },
  { day: "Feb 21", sales: 11500, target: 10000 },
  { day: "Feb 22", sales: 9300,  target: 10000 },
  { day: "Feb 23", sales: 14200, target: 10000 },
  { day: "Feb 24", sales: 10800, target: 10000 },
  { day: "Feb 25", sales: 7600,  target: 10000 },
  { day: "Feb 26", sales: 12335, target: 10000 },
  { day: "Feb 27", sales: 9100,  target: 10000 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-xs ">
      <p className="font-bold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 capitalize">{p.name}:</span>
          <span className="font-bold text-slate-800">SAR {p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function FinancialTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#7F50F4" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#7F50F4" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#02D0FF" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#02D0FF" stopOpacity={0}   />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />

        <XAxis
          dataKey="day"
          tick={{ fontSize: 10, fill: "#94A3B8", }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#94A3B8", }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />

        <Tooltip content={<CustomTooltip />} />

        <Area
          type="monotone"
          dataKey="target"
          name="Target"
          stroke="#02D0FF"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          fill="url(#targetGrad)"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="sales"
          name="Sales"
          stroke="#7F50F4"
          strokeWidth={2}
          fill="url(#salesGrad)"
          dot={{ r: 3, fill: "#7F50F4", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#7F50F4", strokeWidth: 2, stroke: "#fff" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}