"use client";
import Header from "@/components/Header";
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import StatsCard from "@/components/StatsCard";
import { dashboardHeadings } from "@/constants/headings";
import { getActiveOrdersCount } from "@/lib/firebase/order";
import { TableHeading } from "@/lib/types";
import { Banknote, ChevronLeft, ChevronRight, Flag, Headset, LucideIcon, MapPinX, Megaphone, PackageX, Radio } from "lucide-react";
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
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [activeOrdersCount, setActiveOrdersCount] = useState<number>(0);
  const [disputesCount, setDisputesCount] = useState<number>(13);
  const [payoutsCount, setPayoutsCount] = useState<number>(75212);

 useEffect(() => {
  const fetchData = async () => {
    setLoading(true);

    const activeCount = await getActiveOrdersCount();
    setActiveOrdersCount(activeCount);

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 2000);
  };

  fetchData();
}, []);

const renderCellContent = (heading:TableHeading, value:any)=>{
    if(!value || value === "-"){
      return (
        <span className='text-slate-400'>-</span>
      );
    }

    switch (heading.id){
      case "action":
        return(
          <div className="flex items-center justify-end px-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium`}>
                {value}
              </span>
          
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
        );
      case "flag_reason":
        type ReachKey = "address issue" | "customer request" | "damaged pkg"

        const REACH_CONFIG: Record<ReachKey, { icon: LucideIcon; style: string }> = {
          "address issue":    { icon: MapPinX,  style: "text-amber-700 "  },
          "customer request": { icon: Headset,  style: "text-blue-700 "   },
          "damaged pkg":      { icon: PackageX, style: "text-red-700"    },
        }
        const key = value.toLowerCase().trim() as ReachKey
        const config = REACH_CONFIG[key]
        const Icon = config?.icon
      
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold`}>
            {Icon && <Icon className={`h-3.5 w-3.5 ${config?.style ?? "text-slate-600"}`}  />}
            {value}
          </span>
        );
      case "time_elapsed":
        return (
          <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium">{value} ago</span>
        );
     
      default:
      return value;
    }

  }
  return (
    <div className="min-h-screen bg-slate-50">
      <Header/>
      <main className="flex flex-col pt-12 pl-60 min-h-screen gap-3">
        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
           <StatsCard title="ACTIVE ORDERS" value={activeOrdersCount} change={0} />
           <StatsCard title="DISPUTES" value={disputesCount} change={+2} comparisonText="new alerts requires action" icon={Flag} hasAlerts={true} />
           <StatsCard title="PENDING PAYOUTS" value={`SAR ${payoutsCount?.toLocaleString()}.00`} change={6} icon={Banknote } />
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
              {loading ? (
                 <TableSkeleton tableHeadings={dashboardHeadings} />
                ):(
                 <table className='w-full'>
                     <thead className='bg-slate-200/50'>
                         <tr>
                             {dashboardHeadings.map((heading)=>(
                                 <th key={heading.id} className='px-6 py-3 text-left text-sm font-semibold text-slate-700 first:rounded-tl-lg last:rounded-tr-lg'>{heading.title} </th>
                             ))}
                         </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-slate-200">
                         {data.length === 0 ? (
                                 <tr>
                                     <td colSpan={dashboardHeadings.length}
                                     className="px-6 py-12 text-center text-sm text-slate-500 ">
                                         No data available
                                     </td>
                                 </tr>
                             ):(
                                 data.map((row,index)=>(
                                     <tr key={row.id || index} className="hover:bg-slate-50 transition-colors">
                                     {dashboardHeadings.map((heading)=>(
                                         <td key={heading.id}
                                         className={`px-6 py-3 text-sm text-slate-700`}>
                                             {renderCellContent(heading, row[heading.id])}
                                         </td>
                                     ))}
                                     </tr>
                                 ))
                             )}
                     </tbody>
                     <tfoot className='bg-slate-200/50'>
                         <tr>
                             <td colSpan={dashboardHeadings.length} className='px-6 py-3 first:rounded-bl-lg last:rounded-br-lg'>
                                 <div className='flex items-center justify-between'>
                                     {/* left : showing text */}
                                     <div className='text-left text-sm text-slate-600'>
                                         showing <b>1</b>-<b>3</b> of <b>{data.length}</b> orders
                                     </div>
                                     {/* Right: pagination controls */}
                                     <div className='flex items-center gap-2'>
                                         <button>
                                             <ChevronLeft className='h-3 w-3 text-slate-700' />
                                         </button>
                                         <button>
                                             <ChevronRight className='h-3 w-3 text-slate-700'/>
                                         </button>
                                     </div>
                                 </div>
                                 
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
