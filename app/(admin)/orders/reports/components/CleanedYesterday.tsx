"use client"
import { Check } from "lucide-react"

type TableRow = {
  id: string
  readyBy: string
  time: string
  placed: string
  customer: string
  breakdown: string
  pcs: number
  notes: string
  paid: "PENDING" | "BANK"
  total: string
}

export default function CleanedYesterday() {
  const tableHeadings = [
    { key: "id", label: "ID" },
    { key: "readyBy", label: "READY BY" },
    { key: "time", label: "TIME" },
    { key: "placed", label: "PLACED" },
    { key: "customer", label: "CUSTOMER" },
    { key: "breakdown", label: "ORDER BREAKDOWN" },
    { key: "pcs", label: "PCS" },
    { key: "notes", label: "NOTES" },
    { key: "paid", label: "PAID" },
    { key: "total", label: "TOTAL" },
  ]

  const mockData: TableRow[] = [
    {
      id: "#3861",
      readyBy: "15/01/26",
      time: "8pm-10pm",
      placed: "10/01/26",
      customer: "Abdullah Q",
      breakdown: "Carpet || 11.5 متر (B)",
      pcs: 6,
      notes: "Handle with care, delicate edges.",
      paid: "PENDING",
      total: "84.00",
    },
    {
      id: "#4668",
      readyBy: "17/02/26",
      time: "6pm-8pm",
      placed: "16/02/26",
      customer: "Atheer Alahmed",
      breakdown: "Abaya (S)",
      pcs: 1,
      notes: "تغليف خاص",
      paid: "BANK",
      total: "37.50",
    },
    {
      id: "#3861",
      readyBy: "15/01/26",
      time: "8pm-10pm",
      placed: "10/01/26",
      customer: "Abdullah Q",
      breakdown: "Carpet || 11.5 متر (B)",
      pcs: 6,
      notes: "Handle with care, delicate edges.",
      paid: "PENDING",
      total: "84.00",
    },
    {
      id: "#3861",
      readyBy: "15/01/26",
      time: "8pm-10pm",
      placed: "10/01/26",
      customer: "Abdullah Q",
      breakdown: "Carpet || 11.5 متر (B)",
      pcs: 6,
      notes: "Handle with care, delicate edges.",
      paid: "PENDING",
      total: "84.00",
    },
  ]

  function renderCellContent(key: string, value: any) {
    switch (key) {
      case "id":
        return <span className="font-semibold text-slate-900">{value}</span>

      



      case "customer":
        return (
          <span className="font-semibold text-slate-800 whitespace-nowrap">
            {value}
          </span>
        )

      case "pcs":
        return (
          <span className="font-semibold text-slate-900">
            {value}
          </span>
        )

      case "notes":
        return (
          <span className="text-slate-400 italic">
            {value || "—"}
          </span>
        )

      case "paid":
        if (value === "BANK") {
          return (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
              <Check className="w-3 h-3" />
              BANK
            </span>
          )
        }

        return (
          <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-500 text-xs font-semibold">
            PENDING
          </span>
        )

      case "total":
        return (
          <span className="font-bold text-slate-900 whitespace-nowrap">
            SAR {value}
          </span>
        )

      default:
        return (
          <span className="font-medium text-slate-400 whitespace-nowrap">
            {value}
          </span>
        )
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-5 bg-slate-50 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800">
          Data
        </h2>
        <span className="text-xs font-semibold tracking-widest text-slate-400">
          SHOWING {mockData.length} RECORDS
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold text-slate-400 tracking-widest">
              {tableHeadings.map((heading) => (
                <th
                  key={heading.key}
                  className="px-5 py-2.5"
                >
                  {heading.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {mockData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
              >
                {tableHeadings.map((heading) => (
                  <td
                    key={heading.key}
                    className="px-6 py-3"
                  >
                    {renderCellContent(
                      heading.key,
                      row[heading.key as keyof TableRow]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}