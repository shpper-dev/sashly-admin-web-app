"use client";
import Header from "@/components/Header";
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import StatsCard from "@/components/StatsCard";
import { dashboardHeadings } from "@/constants/headings";
import { TableHeading } from "@/lib/types";
import { Banknote, Flag, Megaphone, Radio } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const mockData = [{
  id:1,
  issue_id: "#4627",
  order_id: "ORD-7953",
  flag_reason:"Address Issue",
  time_elapsed: "4h ago",
  action: "Resolve"
},
{
  id:2,
  issue_id: "#5251",
  order_id: "ORD-623G",
  flag_reason:"Customer Request",
  time_elapsed: "1h ago",
  action: "Resolve"
},
{
  id:3,
  issue_id: "#7252",
  order_id: "ORD-32QQ",
  flag_reason:"Damaged Pkg",
  time_elapsed: "2h ago",
  action: "Resolve"
},
{
  id:4,
  issue_id: "#1261",
  order_id: "ORD-6272",
  flag_reason:"Customer Request",
  time_elapsed: "2h ago",
  action: "Resolve"
}
]

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(()=>{
    setIsLoading(true);
    setTimeout(()=>{
      setData(mockData);
      setIsLoading(false)
    },2000);
    ;
  },[])
  return (
    <div className="min-h-screen bg-slate-50">
      <Header/>
      <main className="flex flex-col pt-12 pl-60 min-h-screen gap-3">
        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
           <StatsCard title="ACTIVE ORDERS" value={"1,270"} change={12} />
           <StatsCard title="DISPUTES" value={13} change={+2} comparisonText="new alerts requires action" icon={Flag} hasAlerts={true} />
           <StatsCard title="PENDING PAYOUTS" value={"SAR 75,212.00"} change={6} icon={Banknote } />
        </section>
        {/* Priority Resolution Section with Side Card */}
        <section className="px-6 pb-6">
          {/* Section Header */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Priority Resolution</h2>
            <p className="text-sm text-slate-500">Review flagged issues requiring manual intervention.</p>
          </div>

          {/* Grid Layout:  */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Table Section (8 columns) */}
            <div className="lg:col-span-9 overflow-x-auto rounded-lg border border-slate-200 bg-white">
              {isLoading ? (
                <TableSkeleton tableHeadings={dashboardHeadings} />
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-200/50">
                    <tr>
                      {dashboardHeadings.map((heading) => (
                        <th
                          className="px-6 py-3 text-left text-sm font-semibold text-slate-700 first:rounded-tl-lg last:rounded-tr-lg"
                          key={heading.id}
                        >
                          {heading.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {data.length === 0 ? (
                      <tr>
                        <td
                          colSpan={dashboardHeadings.length}
                          className="px-6 py-12 text-center text-sm text-slate-500"
                        >
                          No data available
                        </td>
                      </tr>
                    ) : (
                      data.map((row, index) => (
                        <tr key={row.id || index} className="hover:bg-slate-50 transition-colors">
                          {dashboardHeadings.map((heading) => (
                            <td key={heading.id} className="px-6 py-3 text-sm text-slate-700">
                              {row[heading.id] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-200/50">
                    <tr>
                      <td
                        colSpan={dashboardHeadings.length}
                        className="px-6 py-3 text-left text-sm text-slate-600 first:rounded-bl-lg last:rounded-br-lg"
                      >
                        {data.length} {data.length === 1 ? "item" : "items"} requires attention
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* Broadcasting card */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex flex-col items-center justify-center bg-white rounded-lg border border-blue-500/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Icon and Title */}
            <div className={`flex  items-center justify-center gap-4 p-4 `}>
                <Radio className="h-6 w-6 text-purple-600" />
              <h3 className={`font-bold text-center text-sm`}>
                Quick Broadcast
              </h3>
            </div>

            {/* Button */}
            <Link href={"/broadcast"}
              className="px-5 py-3 bg-purple-600 text-white rounded-md font-medium transition-colors text-sm"
            >
              + New Broadcast
            </Link>

            {/* Description */}
            <div className={`px-6 py-3 bg-white w-[90%]`}>
              <p className={`text-slate-600 text-center lg:text-left text-xs`}>
                Send quick alerts to users and drivers
              </p>
            </div>
            </div>
              
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
