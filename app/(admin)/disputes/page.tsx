"use client";
import Header from '@/components/Header'
import TableSkeleton from '@/components/skeleton/TableSkeleton';
import { TableHeading } from '@/lib/types';
import { ChevronLeft, ChevronRight, CircleAlert, Download, ListFilter, MessagesSquare, Timer, UserRoundX } from 'lucide-react';
import React, { useEffect, useState } from 'react'

const disputeHeadings : TableHeading[]= [
{
    id: "order_id",
    title: "ORDER ID"
},
{
    id: "issue_category",
    title: "ISSUE CATEGORY"
},
{
    id: "wait_time",
    title: "WAIT TIME"
},
{
    id: "last_activity",
    title: "LAST ACTIVITY"
},
{
    id:"status_disputes",
    title:"STATUS"
},
]
const mockData = [
{
  id:1,
  order_id: "#4267",
  issue_category:{ icon: UserRoundX , text: "Driver No-Show", color:"yellow" },
  wait_time:{ time: "14m", color:"purple"},
  last_activity:"Customer uploaded photo 5m ago",
  status_disputes:"Needs Attention",
},
{
  id:2,
  order_id: "#5251",
  issue_category:{ icon: MessagesSquare , text: "User Dispute", color:"blue"},
  wait_time:{ time:"2h 10m", color:"red"},
  last_activity:"Order Cancel Request",
  status_disputes:"Action Required",
},
{
  id:3,
  order_id: "#7262",
  issue_category:{ icon: CircleAlert , text:"Payment Failure", color:"red"},
  wait_time:{ time:"45m", color:"yellow"},
  last_activity:"System Retry failed",
  status_disputes:"Needs Attention",
}]


export default function Disputes() {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<any[]>([]);

    // helper function 
    const renderCellContent = (heading: TableHeading, value: any) => {
  if (!value || value === "-") {
    return <span className="text-slate-400">-</span>;
  }

  switch (heading.id) {

    // ✅ Issue Category with icon
    case "issue_category": {
      const Icon = value.icon;
      return (
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 text-${value.color}-600`}  />
          <span>{value.text}</span>
        </div>
      );
    }

    // ✅ Wait Time Badge
    case "wait_time": {
      return (
        <div className="flex items-center">
          <Timer className={`h-4 w-4 text-${value.color}-600`} />
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium text-${value.color}-600`}>
            {value.time}
          </span>
        </div>
      );
    }

    // ✅ Status
    case "status_disputes":
      return (
        <div className="flex items-center justify-between gap-8">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
              value.toLowerCase() === "needs attention"
                ? "bg-purple-100/50 text-purple-600"
                : "bg-slate-100/50"
            }`}
          >
            {value}
          </span>

          <ChevronRight className="h-4 w-4 text-slate-400" />
        </div>
      );

    default:
      return value;
  }
};


    useEffect(()=>{
        setLoading(true);
        setTimeout(()=>{
            setData(mockData);
            setLoading(false)
        },2000);
    },[]);
  return (
    <div className='min-h-screen bg-slate-50'>
        <Header title="Disputes" />
        <main className='flex flex-col pt-16 pl-60 min-h-screen'>
            <section className='px-6 pb-6'>
                <div className='flex gap-3 mb-4 justify-between'>
                    <div>
                        <h2 className='text-xl font-bold text-slate-800'>Resolution Queue</h2>
                        <p className='text-sm text-slate-500'>Review and resolve manual order disputes to maintain marketplace trust</p>
                    </div>
                    <div className='flex gap-2 items-center'>
                        <button className='flex gap-2 items-center bg-white px-3 py-2 text-sm rounded-md '>
                            <ListFilter className='h-3 w-3' />
                            Filter</button>
                    <button className='flex gap-2 items-center bg-[#7F50F4] px-3 py-2 text-white text-sm rounded-md'>
                         <Download className='h-3 w-3' />
                        Export Report</button>
                    </div>
                    
                </div>
                <div>
                   {loading ? (
                    <TableSkeleton tableHeadings={disputeHeadings} />
                   ):(
                    <table className='w-full'>
                        <thead className='bg-slate-200/50'>
                            <tr>
                                {disputeHeadings.map((heading)=>(
                                    <th key={heading.id} className='px-6 py-3 text-left text-sm font-semibold text-slate-700 first:rounded-tl-lg last:rounded-tr-lg'>{heading.title} </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={disputeHeadings.length}
                                        className="px-6 py-12 text-center text-sm text-slate-500 ">
                                            No data available
                                        </td>
                                    </tr>
                                ):(
                                    data.map((row,index)=>(
                                        <tr key={row.id || index} className="hover:bg-slate-50 transition-colors">
                                        {disputeHeadings.map((heading)=>(
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
                                <td colSpan={disputeHeadings.length} className='px-6 py-3 first:rounded-bl-lg last:rounded-br-lg'>
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
            </section>
        </main>
    </div>
  )
}
