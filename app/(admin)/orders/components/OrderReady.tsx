import { OrderData, TableHeading } from '@/lib/types';
import { FileText, Pencil, Search } from 'lucide-react';
import React from 'react'
import { TabKey } from '../page';
import FilterButton from '@/components/buttons/FilterButton';
import OrderPaymentDialog from '@/components/orders/OrderPaymentDialog';
/* ---------------- TABLE HEADINGS ---------------- */
const orderHeadings: TableHeading[] = [
  { id: "id", title: "ID" },
  { id: "ready_by", title: "READY BY" },
  { id: "placed", title: "PLACED" },
  { id: "customer", title: "CUSTOMER" },
  { id: "contact", title: "CONTACT" },
  { id: "order_details", title: "ORDER DETAILS" },
  { id: "pcs", title: "PCS" },
  { id: "notes", title: "NOTES" },
  { id: "paid", title: "PAID"},
  { id: "total", title: "TOTAL"},
  { id: "actions", title: ""}
];


const baseRows = Array.from({ length: 5 }).map((_, i) => ({
  id: 3861 + i,
  ready_by: {date:"15/01/26", time: "8PM-10PM"},
  placed: "10/01/26",
  placed_badge: "1st",
  customer: "Abdullah Q",
  contact: {
    type: "DELIVERY",
    address: "24.805430307392644 // 46.76628251224954",
    email: "dhaialjameelsgs@gmail.com"
  },

  order_details: ["Laundry Bag x1", "Trousers x2", "T-Shirt x2","T-Shirt x1"],
  pcs: 6,
  paid: "NO",
  total: 84.0,
}));

const dataByTab: Record<TabKey, any[]> = {
  detail: baseRows,
  cleaning: baseRows,
  ready: baseRows,
  pickups: baseRows,
  all: baseRows,
};

export default function OrderReady() {
    const rows = dataByTab["ready"];
    
      // Helper function to render cell content
      const renderCellContent = (heading: TableHeading, row: any) : React.ReactNode => {
    
        switch (heading.id) {
          case "ready_by":
            return(
            <div className="flex flex-col items-start justify-start">
              <span className="text-left w-full text-xs font-semibold">
               {row.ready_by.date}
              </span>
              <span className="text-slate-500 text-xs font-medium whitespace-nowrap">
               {row.ready_by.time}
              </span>
             </div>
            )
    
          case "placed":
            return (
              <div className="flex flex-col items-start justify-start">
                <span>{row.placed}</span>
                {row.placed_badge && (
                  <span className="px-1 py-0.5 text-xs rounded-md bg-yellow-100 text-yellow-700">
                    {row.placed_badge}
                  </span>
                )}
              </div>
            );
    
          case "customer":
            return <span className="font-medium text-slate-800">{row.customer}</span>;
          
          case "contact":
             return (
               <div className="flex flex-col text-xs gap-1">
                <span className="font-semibold text-slate-400">
                     {row.contact.type}
                </span>

                <span className="text-slate-600">
                    {row.contact.address}
                </span>
                <span className='text-slate-600'>
                    {row.contact.email}
                </span>
               </div>
           );

    
          case "order_details": {
            const visibleCount = 3;
            const items = row.order_details ;
            const hiddenCount = items.length - visibleCount;
    
            return (
              <div className='flex flex-col'>
                <div className="flex flex-wrap gap-2">
                {items.slice(0, visibleCount).map((item:any, i:any) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-white text-xs text-slate-700 shadow-sm border border-slate-200"
                  >
                    {item}
                  </span>
                ))}
         
                {hiddenCount > 0 && (
                  <span className="px-3 py-1 rounded-full text-purple-600 text-xs bg-purple-200/50 font-bold cursor-pointer">
                    +{hiddenCount} more
                  </span>
                )}
              </div>

              </div>
              
            );
        } 
          case "notes":
            return(
                <button className='flex w-full items-center justify-center bg-white text-[#02D0FF]'>
                    <FileText className="h-5 w-5" />
                </button>
            ) 
          case "total":
            return (
              <div>
                <div className="text-blue-500 text-xs font-medium">SAR</div>
                <div className="font-semibold text-slate-800">
                  {row.total.toFixed(2)}
                </div>
              </div>
            );
    
          case "actions":
            return (
              <div className="flex items-center gap-1 justify-end">
                <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <Pencil className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                </button>
                <OrderPaymentDialog total={row.total}>
                  <button className="px-3 py-1.5 text-xs font-medium text-white bg-[#02D0FF] rounded-lg hover:bg-blue-200 transition-colors">
                  PAYMENT
                </button>
                </OrderPaymentDialog>
              </div>
            );
    
          default:
            const cellValue = row[heading.id as keyof OrderData];
            if (typeof cellValue === 'string' || typeof cellValue === 'number') {
            return cellValue;
          }
          return null;
        }
      };
    
  return (
     <div>
        <div className="flex justify-between items-center mb-4 px-8">
          <div className="flex gap-3">
            <FilterButton label="Reports" />
            <FilterButton label="Order Type" />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 text-slate-400" />
            <input
              placeholder="Search anything..."
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>
        </div>
         <div className="bg-white border overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                {orderHeadings.map((heading) => (
                  <th
                    key={heading.id}
                    className="text-left first:pl-2 px-4 py-3 text-sm font-semibold text-slate-500 "
                  >
                    {heading.title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-slate-200">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {orderHeadings.map((heading) => (
                    <td
                      key={heading.id}
                      className="first:pl-2 px-4 py-4 text-sm text-slate-700"
                    >
                      {renderCellContent(heading, row)}
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
