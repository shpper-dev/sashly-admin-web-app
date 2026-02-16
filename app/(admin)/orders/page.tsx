"use client";
import Header from '@/components/Header'
import TableSkeleton from '@/components/skeleton/TableSkeleton';
import { TableHeading } from '@/lib/types';
import { ChevronLeft, ChevronRight, Download, ListFilter } from 'lucide-react';
import { useEffect, useState} from "react";

const orderHeadings : TableHeading[]= [
{
    id: "order_id",
    title: "ORDER ID"
},
{
    id: "order_date",
    title: "ORDER DATE"
},
{
    id: "service_type",
    title: "SERVICE TYPE"
},
{
    id: "categories",
    title: "CATEGORIES"
},
{
    id:"total_amount",
    title:"TOTAL AMOUNT"
},
{
    id:"status",
    title:"STATUS"
}
]
const mockData = [{
  id:1,
  order_id: "#4267",
  order_date:"17 Feb 2026",
  service_type: "Ordinary",
  categories:"ORD-7953",
  total_amount: "45.00",
  status:"Pickup",

},
{
  id:2,
  order_id: "#5251",
  order_date:"11 Mar 2026",
  service_type: "Express",
  categories:  "ORD-623G",
  total_amount:"55.00",
  status: "Delivered",
},
{
  id:3,
  order_id: "#7262",
  order_date:"28 Apr 2026",
  service_type: "Ordinary",
  categories:"ORD-32QQ",
  total_amount: "61.00",
  status:"Pickup",
}]
export default function Orders() {
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<any[]>([]);

    // helper function to render cell content with styling
    const renderCellContent = (heading:TableHeading, value:any) =>{
        if(!value || value ==="-"){
            return <span className='text-slate-400'>-</span>
        }

        switch(heading.id) {
            case "service_type":
                return(
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium text-white ${
                        value.toLowerCase() === "ordinary" ? "bg-blue-400" : "bg-linear-to-r from-purple-800 to-blue-400"
                    }`}>
                        {value}
                    </span>
                );
            case "status":
                const statusColours: Record<string,string> ={
                    pickup : "bg-purple-100/50 text-purple-700",
                    delivered: "bg-green-100/50 text-green-700",
                    cancelled: "bg-red-100/50 text-red-700"
                };
                const colourClass = statusColours[value.toLowerCase()] || "bg-slate-100 text-slate-700";

                return (
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs  ${colourClass}`}>
                        {value}
                    </span>
                );

            case "total_amount":
                return (
                    <span className='font-semibold text-purple-600'>
                        {value} SAR
                    </span>
                );
            default :
            return value;
        }
    }

    useEffect(()=>{
        setLoading(true);
        setTimeout(()=>{
           setData(mockData);
           setLoading(false)
        },2000);
    ;
  },[])
  return (
    <div className='min-h-screen bg-slate-50'>
        <Header title="Orders" />
        <main className='flex flex-col pt-16 pl-60 min-h-screen gap-3'>
            <section className='px-6 pb-6'>
                <div className='flex gap-3 mb-4 justify-between'>
                    <div>
                        <h2 className='text-xl font-bold text-slate-800'>Manage Orders</h2>
                        <p className='text-sm text-slate-500'>Reviewing 1248 active operational requests from all regions</p>
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
                        <TableSkeleton tableHeadings={orderHeadings}/>
                    ):(
                        <table className='w-full'>
                            <thead className='bg-slate-200/50'>
                                <tr>
                                    {orderHeadings.map((heading)=>(
                                        <th key={heading.id}
                                        className='px-6 py-3 text-left text-sm font-semibold text-slate-700 first:rounded-tl-lg last:rounded-tr-lg'>
                                            {heading.title}
                                        </th>

                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={orderHeadings.length}
                                        className="px-6 py-12 text-center text-sm text-slate-500 ">
                                            No data available
                                        </td>
                                    </tr>
                                ):(
                                    data.map((row,index)=>(
                                        <tr key={row.id || index} className="hover:bg-slate-50 transition-colors">
                                        {orderHeadings.map((heading)=>(
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
                                <td colSpan={orderHeadings.length} className='px-6 py-3 first:rounded-bl-lg last:rounded-br-lg'>
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
