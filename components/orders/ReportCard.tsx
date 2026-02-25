import { ReportGroup } from "@/lib/types"
import { ReactNode } from "react"

interface ReportCardProps {
  title: string
  icon: ReactNode
  iconBg: string
  accentColor: string
  data: ReportGroup[]
}

export function ReportCard({
  title,
  icon,
  iconBg,
  accentColor,
  data,
}: ReportCardProps) {
  const total = data.reduce(
    (sum, group) =>
      sum + group.items.reduce((s, item) => s + item.qty, 0),
    0
  )

  return (
    <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 text-xs font-semibold text-slate-400 mb-4 px-4">
        <span>READY BY</span>
        <span>ITEM</span>
        <span className="text-right">QTY</span>
      </div>

      {/* Data */}
      <div className="space-y-6">
        {data.map((group, index) => (
          <div key={index} className="relative">
            {/* Left Accent Bar */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
              style={{ backgroundColor: accentColor }}
            />

            <div className="bg-slate-100 rounded-xl p-4 pl-6 space-y-3 shadow-sm">
              {group.items.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 items-center text-sm"
                >
                  <span className="text-slate-600 font-medium">
                    {i === 0 ? group.date : ""}
                  </span>

                  <span className="text-slate-700">
                    {item.name}
                  </span>

                  <span className="text-right font-semibold text-slate-900">
                    {item.qty.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Aggregate */}
      <div className="border-t border-slate-200 mt-8 pt-6 flex justify-between items-center font-semibold text-lg">
        <span className="text-slate-700">Aggregate Total</span>
        <span className="text-slate-900">
          {total.toFixed(2)}
        </span>
      </div>
    </div>
  )
}