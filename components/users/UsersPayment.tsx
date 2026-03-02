import { ChevronLeft, ChevronRight, CircleCheck, Timer, TrendingUp, Wallet } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import TableSkeleton from '../skeleton/TableSkeleton'
import { TableHeading } from '@/lib/types';

const paymentHeadings : TableHeading[]= [
{
    id: "user_id",
    title: "ID"
},
{
    id: "time",
    title: "TIME"
},
{
    id: "payment_type",
    title: "PAYMENT TYPE"
},
{
    id:"amount",
    title:"AMOUNT"
},
{
  id:"staff",
  title:"STAFF"
},
]

const mockData = [
    {id:1 , user_id: 4750, time:"23/10/24,10:30am", payment_type:"Card", amount:150, staff:"Sarah J."},
    {id:2 , user_id: 4742, time:"20/10/24,2:30pm", payment_type:"STC Pay", amount:50, staff:"Sarah J."},
    {id:3 , user_id: 4740, time:"19/10/24,11:20am", payment_type:"Wallet", amount:210, staff:"Ismail B."},
    {id:4 , user_id: 4725, time:"15/10/24,7:30pm", payment_type:"Manual Credit", amount:15, staff:"Khalid M."},
    {id:5 , user_id: 4701, time:"10/10/24,06:00pm", payment_type:"Apple Pay", amount:100, staff:"System"}
]

export default function UsersPayment() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const renderCellContent = (Heading:TableHeading, value:any)=>{
    if(!value || value === "-"){
      return (
        <span className='text-slate-400'>-</span>
      );
    }

    switch (Heading.id){
      case "user_id":
        return(
          <span className='text-slate-700  font-medium'>{value}</span>
        );
      case "amount":
        return(
          <span className='text-slate-800 font-bold'>SAR {value}</span>
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
        },200);
    },[]);


  return (
    <div className='flex-1 overflow-y-auto px-8 py-4 bg-white '>
        <div className='flex items-center justify-between'>
            <div className='flex flex-col'>
                <h2 className='text-slate-700 text-xl font-bold'>Payment History</h2>
                <p className='text-slate-400 text-sm font-medium'>Manage customer transactions and wallet credits.</p>
            </div>
            <div className='flex gap-2 items-center'>
                <button className='flex items-center gap-1 px-3 py-2 bg-slate-100 text-xs rounded-lg shadow cursor-pointer'>
                    <Timer className='h-3 w-3' />
                    Process Refund
                </button>
                <button className='flex items-center gap-1 px-3 py-2 bg-[#02d0FF] text-white font-bold text-xs rounded-lg shadow cursor-pointer'>
                    <Timer className='h-3 w-3' />
                    Add Manual Credit
                </button>
            </div>
        </div>
        {/* stat cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6'>
            <div className='flex flex-col bg-green-100 border border-green-200 px-6 py-4 rounded-xl gap-2'>
                <p className='text-sm font-semibold text-green-600 tracking-wide uppercase' >TOTAL PAID</p>
                <p className='text-lg font-bold text-slate-700'>SAR 1,240</p>
                <div className='text-slate-500 text-xs flex gap-2 items-center'>
                    <TrendingUp className='h-4 w-4 text-slate-500'/>
                    +12% from last month
                </div>
            </div>
            <div className='flex flex-col bg-red-100 border border-red-200 px-6 py-4 rounded-xl gap-2'>
                <p className='text-sm font-semibold text-red-600 tracking-wide uppercase' >TOTAL DUE</p>
                <p className='text-lg font-bold text-red-700'>SAR 0.00</p>
                <div className='text-red-600 text-xs flex gap-2 items-center'>
                    <CircleCheck className='h-4 w-4 text-red-500'/>
                    Fully settled
                </div>
            </div>
            <div className='flex flex-col bg-purple-200 border border-purple-100 px-6 py-4 rounded-xl gap-2'>
                <p className='text-sm font-semibold text-purple-600 tracking-wide uppercase' >TOTAL DUE</p>
                <p className='text-lg font-bold text-slate-700'>SAR 45.00</p>
                <div className='text-purple-600 text-xs flex gap-2 items-center'>
                    <Wallet className='h-4 w-4 text-purple-500'/>
                    Ready for next order
                </div>
            </div>

        </div>
        {/* table */}
        {loading ? (
        <TableSkeleton tableHeadings={paymentHeadings} />
       ):(
        <table className='w-full'>
            <thead className='bg-slate-100'>
                <tr>
                    {paymentHeadings.map((heading)=>(
                        <th key={heading.id} className='px-6 py-3 text-left text-sm font-semibold text-slate-700 first:rounded-tl-lg last:rounded-tr-lg'>{heading.title} </th>
                    ))}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
                {data.length === 0 ? (
                        <tr>
                            <td colSpan={paymentHeadings.length}
                            className="px-6 py-12 text-center text-sm text-slate-500 ">
                                No data available
                            </td>
                        </tr>
                    ):(
                        data.map((row,index)=>(
                            <tr key={row.id || index} className="hover:bg-slate-50 transition-colors">
                            {paymentHeadings.map((heading)=>(
                                <td key={heading.id}
                                className={`px-6 py-3 text-sm text-slate-700`}>
                                    {renderCellContent(heading, row[heading.id])}
                                </td>
                            ))}
                            </tr>
                        ))
                    )}
            </tbody>
            <tfoot className='bg-slate-100'>
                <tr>
                    <td colSpan={paymentHeadings.length} className='px-6 py-3 first:rounded-bl-lg last:rounded-br-lg'>
                        <div className='flex items-center justify-between'>
                            {/* left : showing text */}
                            <div className='text-left text-sm text-slate-600'>
                                showing <b>1</b>-<b>5</b> of <b>{data.length}</b> orders
                            </div>
                            {/* Right: pagination controls */}
                            <div className='flex items-center gap-2'>
                                <button className='bg-white p-0.5 border border-slate-300 rounded-md'>
                                    <ChevronLeft className='h-3 w-3 text-slate-700' />
                                </button>
                                <button className='bg-white p-0.5 border border-slate-300 rounded-md'>
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
  )
}
