"use client";
import Header from '@/components/Header'
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CircleAlert, Landmark, Users2, Zap } from "lucide-react";
import SimpleStatsCard from '@/components/SimpleStatsCard';
import TableSkeleton from '@/components/skeleton/TableSkeleton';
import { TableHeading } from '@/lib/types';
import BroadcastBanner from '@/components/BroadcastBanner';

const userHeadings : TableHeading[]= [
{
    id: "user_id",
    title: "USER ID"
},
{
    id: "name",
    title: "NAME"
},
{
    id: "contact",
    title: "CONTACT"
},
{
    id: "active_orders",
    title: "ACTIVE ORDERS"
},
{
    id:"wallet_balance",
    title:"SWALLET BALANCE"
},
{
  id:"actions",
  title:""
}
]
const mockData = [
{
  id:1,
  user_id: "#4627",
  name: "Fahad Al-Saud",
  contact: "fahad@email.com",
  active_orders: 3,
  wallet_balance: "1,246.00",
  actions: "Manage",
},
{
  id:2,
  user_id: "#5251",
  name: "Mariam Saleh",
  contact: "mariam@email.com",
  active_orders: 12,
  wallet_balance: "671.00",
  actions: "Manage",
},
{
 id:3,
  user_id: "#4267",
  name: "Ahmed Khalid",
  contact: "khalid@email.com",
  active_orders: 8,
  wallet_balance: "1,322.00",
  actions: "Manage",
}]


export default function Users() {
  const [loading , setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);

  const renderCellContent = (Heading:TableHeading, value:any)=>{
    if(!value || value === "-"){
      return (
        <span className='text-slate-400'>-</span>
      );
    }

    switch (Heading.id){
      case "active_orders":
        return(
          <span className='bg-slate-200/50 rounded-full px-2 py-1'>{value}</span>
        );
      case "wallet_balance":
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
        <Header />
        <main className='flex flex-col pt-16 pl-60 min-h-screen'>
            {/* cards to display stats */}
            <section className='flex flex-col gap-4 px-8 pb-6'>
              <div className='flex flex-col gap-1'>
                <h2 className='text-xl font-semibold'>Users Management</h2>
                <p className='text-sm text-slate-700'>Manage sashly user directory and account status</p>
              </div>
              <div className='flex items-center justify-between'>
                <SimpleStatsCard title={'TOTAL USERS'} value={'24,512'} icon={Users2} />  
                <SimpleStatsCard title={'ACTIVE TODAY'} value={'1,882'} icon={Zap} color='green' />
                <SimpleStatsCard title={'TOTAL WALLETS'} value={'SAR 125K'} icon={Landmark} color='purple'/>
                <SimpleStatsCard title={'FLAGGED'} value={'42'} icon={CircleAlert} color="red" />
              </div>
            </section>
            {/* users table */}
            <section>
              <div className='px-8 pb-6'>
                   {loading ? (
                    <TableSkeleton tableHeadings={userHeadings} />
                   ):(
                    <table className='w-full'>
                        <thead className='bg-slate-200/50'>
                            <tr>
                                {userHeadings.map((heading)=>(
                                    <th key={heading.id} className='px-6 py-3 text-left text-sm font-semibold text-slate-700 first:rounded-tl-lg last:rounded-tr-lg'>{heading.title} </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={userHeadings.length}
                                        className="px-6 py-12 text-center text-sm text-slate-500 ">
                                            No data available
                                        </td>
                                    </tr>
                                ):(
                                    data.map((row,index)=>(
                                        <tr key={row.id || index} className="hover:bg-slate-50 transition-colors">
                                        {userHeadings.map((heading)=>(
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
                                <td colSpan={userHeadings.length} className='px-6 py-3 first:rounded-bl-lg last:rounded-br-lg'>
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
              <BroadcastBanner target='ALL USERS' />
            </section>
        </main>
    </div>
  )
}   
