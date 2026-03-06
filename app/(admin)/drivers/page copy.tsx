"use client";
import Header from '@/components/Header'
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CircleAlert, Download, Landmark, OctagonAlert, UserPlus, Users2, Zap } from "lucide-react";
import SimpleStatsCard from '@/components/SimpleStatsCard';
import TableSkeleton from '@/components/skeleton/TableSkeleton';
import { TableHeading } from '@/lib/types';
import BroadcastBanner from '@/components/BroadcastBanner';
import { driverHeadings } from '@/constants/headings';


const mockData = [
{
  id:1,
  driver_id: "#4627",
  name: "Fahad Al-Saud",
  contact: "fahad@email.com",
  status:"Suspended",
  active_orders: 125,
  pending_payout: "1,246.00",
  actions: "Manage",
},
{
  id:2,
  driver_id: "#5251",
  name: "Mariam Saleh",
  contact: "mariam@email.com",
  status:"Active",
  active_orders: 42,
  pending_payout: "671.00",
  actions: "Manage",
},
{
  id:3,
  driver_id: "#4267",
  name: "Ahmed Khalid",
  contact: "khalid@email.com",
  status:"Suspended",
  active_orders: 611,
  pending_payout: "1,322.00",
  actions: "Manage",
}]


export default function Drivers() {
  const [loading , setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);

  const renderCellContent = (Heading:TableHeading, value:any)=>{
    if(!value || value === "-"){
      return (
        <span className='text-slate-400'>-</span>
      );
    }

    switch (Heading.id){
      case "status":
        let isRed = value.toLowerCase() === "suspended" || value.toLowerCase() === "blocked"
        return(
          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                        isRed  ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                    }`}>{value}</span>
        )
      case "active_orders":
        return(
          <span className='bg-slate-200/50 rounded-full px-2 py-1'>{value}</span>
        );
      case "pending_payout":
        return(
          <span className='text-purple-800 font-medium'>SAR {value}</span>
        )
      case "actions":
        return(
          <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium`}>
                {value}
              </span>
          
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
        )
      default:
        return value;
    }

  }

  useEffect(()=>{
    setLoading(true);
    setTimeout(()=>{
      setData(mockData);
      setLoading(false);
    },2000)
  },[]);
  return (
    <div className='min-h-screen bg-slate-50'>
        <Header  />
        <main className='flex flex-col pt-16 pl-60 min-h-screen'>
            {/* cards to display stats */}
            <section className='flex flex-col gap-4 px-8 pb-6'>
              <div className='flex flex-col gap-1'>
                <h2 className='text-xl font-semibold'>Drivers Management</h2>
                <p className='text-sm text-slate-700'>Manage sashly driver directory and account status</p>
              </div>
              <div className='flex items-center justify-between'>
                <SimpleStatsCard title={'TOTAL DRIVERS'} value={'1,456'} icon={Users2} />  
                <SimpleStatsCard title={'ACTIVE TODAY'} value={'965'} icon={Zap} color='green' />
                <SimpleStatsCard title={'SUSPENDED'} value={'12'} icon={OctagonAlert} color='red'/>
                <SimpleStatsCard title={'PENDING PAYOUTS'} value={'12,456'} icon={Landmark} color="purple" />
              </div>
            </section>
            {/* drivers table and categories */}
            <section className='flex flex-col px-8 gap-3'>
              <div className='flex justify-between '>
                <div className='flex items-center gap-2'>
                  <button className='px-3 py-1 bg-white text-sm font-medium border border-blue-500/30 rounded-full cursor-pointer focus:bg-[#7F50F4] focus:text-white'>All Driver</button>
                  <button className='px-3 py-1 bg-white text-sm font-medium border border-blue-500/30 rounded-full cursor-pointer focus:bg-[#7F50F4] focus:text-white'>Active</button>
                  <button className='px-3 py-1 bg-white text-sm font-medium border border-blue-500/30 rounded-full cursor-pointer focus:bg-[#7F50F4] focus:text-white'>Suspended</button>
                  <button className='px-3 py-1 bg-white text-sm font-medium border border-blue-500/30 rounded-full cursor-pointer focus:bg-[#7F50F4] focus:text-white'>Blocked</button>
                </div>
                <div className='flex gap-2'>
                  <button className='flex gap-2 items-center bg-white px-3 py-2 border border-slate-500/30 text-sm font-medium rounded-md '>
                    <Download className='h-3 w-3' />
                      Export CSV
                  </button>
                  <button className='flex gap-2 items-center bg-[#7F50F4] px-3 py-2 text-white text-sm font-medium rounded-md'>
                    <UserPlus className='h-3 w-3'/>
                        Add New Driver
                  </button>
                </div>

              </div>
              <div className='pb-6'>
                   {loading ? (
                    <TableSkeleton tableHeadings={driverHeadings} />
                   ):(
                    <table className='w-full'>
                        <thead className='bg-slate-200/50'>
                            <tr>
                                {driverHeadings.map((heading)=>(
                                    <th key={heading.id} className='px-6 py-3 text-left text-sm font-semibold text-slate-700 first:rounded-tl-lg last:rounded-tr-lg'>{heading.title} </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={driverHeadings.length}
                                        className="px-6 py-12 text-center text-sm text-slate-500 ">
                                            No data available
                                        </td>
                                    </tr>
                                ):(
                                    data.map((row,index)=>(
                                        <tr key={row.id || index} className="hover:bg-slate-50 transition-colors">
                                        {driverHeadings.map((heading)=>(
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
                                <td colSpan={driverHeadings.length} className='px-6 py-3 first:rounded-bl-lg last:rounded-br-lg'>
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
            {/* broadcasting banner */}
            <section className='px-8 pb-6' >
              <BroadcastBanner target='DRIVERS' />
            </section>
        </main>
    </div>
  )
}   
