"use client";
import Header from '@/components/Header'
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, EllipsisVertical, Mail, Phone, Search, User, } from "lucide-react";
import TableSkeleton from '@/components/skeleton/TableSkeleton';
import { TableHeading } from '@/lib/types';
import { ActionsDropdown } from '@/components/ActionsDropdown';
import { useDeleteToast } from '@/hooks/useDeleteToast';
import { DeleteToastContainer } from '@/components/users/DeleteToast';
import UserInfoDialog from '@/components/users/UserInfoDialog';


const userHeadings : TableHeading[]= [
{
    id: "customer",
    title: "CUSTOMER"
},
{
    id: "contact",
    title: "CONTACT"
},
{
    id: "orders",
    title: "ORDERS"
},
{
    id:"total_spent",
    title:"TOTAL SPENT"
},
{
  id:"status",
  title:"STATUS"
},
{
  id:"actions",
  title:""
}
]
const mockData = [
{
  id:1,
  customer:{
    first_name:"Ahmed",
    last_name:"Khalid",
    id:"CUST-001"
  },
  contact:{
    email:"ahmed.khalid@email.com",
    phone:"+966 5 1234 5678"
  },
  orders: 7,
  total_spent: 84,
  status: "Active"
},
{
  id:2,
  customer:{
    first_name:"Sara",
    last_name:"Mohammed",
    id:"CUST-002"
  },
  contact:{
    email:"sara.mohammed@email.com",
    phone:"+966 5 2234 4478"
  },
  orders: 5,
  total_spent: 154,
  status: "Active"
},
{
 id:3,
  customer:{
    first_name:"Omar",
    last_name:"Hassan",
    id:"CUST-003"
  },
  contact:{
    email:"omar.hassan@email.com",
    phone:"+966 5 4321 5678"
  },
  orders: 67,
  total_spent: 261,
  status: "Inactive"
},
{
  id:4,
  customer:{
    first_name:"Laila",
    last_name:"Ali",
    id:"CUST-004"
  },
  contact:{
    email:"laila.ali@email.com",
    phone:"+966 5 5225 5998"
  },
  orders: 125,
  total_spent: 627,
  status: "Blocked"
},
]


export default function Users() {
  const [loading , setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const filteredData = useMemo(() => {
      return data.filter((user) => {
        // Category filtering
        const matchesCategory =
          activeFilter === "All" ||
          user.status.toLowerCase() === activeFilter.toLowerCase();
  
        // Search filtering (EN + AR)
        const matchesSearch =
          user.customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.contact.phone.includes(searchTerm);
  
        return matchesCategory && matchesSearch;
      });
    }, [activeFilter, searchTerm,data]);

  const {toasts, showDeleteToast } = useDeleteToast();

  const renderCellContent = (heading: TableHeading, row: any) => {
  switch (heading.id) {
    case "customer":
      return (
        <UserInfoDialog user={row} >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
            {row.customer.first_name[0]}
            {row.customer.last_name[0]}
          </div>

          <div className="flex flex-col">
            <span className="font-bold text-slate-900 tracking-wide">
              {row.customer.first_name} {row.customer.last_name}
            </span>
            <span className="text-xs text-slate-500">
              ID: {row.customer.id}
            </span>
          </div>
        </div>
        </UserInfoDialog>
      )

    case "contact":
      return (
        <div className="flex flex-col gap-1 text-sm">
          <div className='flex items-center whitespace-nowrap gap-2'>
            <Mail className='h-3 w-3' />
            <span className="text-slate-700">
               {row.contact.email}
            </span>
          </div>
          <div className='flex items-center whitespace-nowrap gap-2'>
            <Phone className='h-3 w-3' />
            <span className="text-slate-700">
               {row.contact.phone}
            </span>
          </div>
        </div>
      )

    case "orders":
      return (
        <span className="font-semibold text-slate-900">
          {row.orders}
        </span>
      )

    case "total_spent":
      return (
        <div className="flex flex-col">
          <span className="text-xs text-cyan-500 font-semibold">
            SAR
          </span>
          <span className="font-semibold text-slate-900">
            {row.total_spent.toFixed(2)}
          </span>
        </div>
      )

    case "status":
      return (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            row.status === "Active"
              ? "bg-green-100 text-green-700"
              : row.status === "Inactive"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-red-100 text-red-600"
              
          }`}
        >
          {row.status.toUpperCase()}
        </span>
      )

    case "actions":
      return (
        <div className="flex justify-end">
           <ActionsDropdown
             onView={() => console.log("View", row.id)}
             onEdit={() => console.log("Edit", row.id)}
             onDelete={() => {
              setData((prevData) => prevData.filter((user) => user.id !== row.id));
              showDeleteToast(`Deleted ${row.customer.first_name} ${row.customer.last_name}`)
             }}
            />
        </div>
      )

    default:
      return "-"
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
    <div className='min-h-screen bg-white'>
        <Header />
        <main className='flex flex-col pt-16 pl-60 min-h-screen'>
            {/* cards to display stats */}
            <section className='flex  justify-between px-8 pb-6'>
              <div className='flex flex-col gap-1'>
                <h2 className='text-xl font-semibold'>Users</h2>
                <p className='text-sm text-slate-700'>Manage your user base and their orderhistory</p>
              </div>
              <div className='flex gap-3 items-center'>
                  <button className='flex gap-2 items-center bg-white px-5 py-3 border border-slate-500/30 text-sm font-medium rounded-md '>
                    <Download className='h-3 w-3' />
                      Export CSV
                  </button>
                  <button className='flex gap-2 items-center bg-[#7F50F4] px-5 py-3 text-white text-sm font-medium rounded-md'>
                        + Add New User
                  </button>
                </div>
                <DeleteToastContainer toasts={toasts} />
            </section>
            <section className='flex justify-between px-8 pb-6'>
              <div className='flex bg-slate-50 border border-slate-100 shadow-inner items-center gap-3 rounded-lg p-1'>
                    {["All", "Active", "Inactive", "Blocked"].map((filter) => (
                      <FilterButtonWithBadge
                        key={filter}
                        label={filter}
                        count={
                          filter === "All"
                            ? data.length
                            : data.filter((user) => user.status === filter).length
                        }
                        active={activeFilter === filter}
                        onClick={() => setActiveFilter(filter)}
                      />
                    ))}
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg shadow-sm w-100">
              <Search size={16} className="text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="bg-transparent outline-none text-xs text-slate-600 placeholder:text-[#94A3B8] placeholder:font-semibold w-full"
              />
            </div>
            </section>
            {/* users table */}
            <section>
              <div className='px-8 pb-6'>
                   {loading ? (
                    <TableSkeleton tableHeadings={userHeadings} />
                   ):(
                    <table className='w-full'>
                        <thead className='bg-slate-100'>
                            <tr>
                                {userHeadings.map((heading)=>(
                                    <th key={heading.id} className='px-6 py-4 text-left text-sm font-bold text-slate-500 first:rounded-tl-lg last:rounded-tr-lg'>{heading.title} </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={userHeadings.length}
                                        className="px-6 py-12 text-center text-sm text-slate-500 ">
                                            No data available
                                        </td>
                                    </tr>
                                ):(
                                    filteredData.map((row,index)=>(
                                        <tr key={row.id || index} className="hover:bg-slate-50 transition-colors">
                                        {userHeadings.map((heading)=>(
                                            <td key={heading.id}
                                            className={`px-6 py-3 text-sm text-slate-700`}>
                                                {renderCellContent(heading, row)}
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
                                            showing <b>1</b>-<b>4</b> of <b>{data.length}</b> orders
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

// helper
function FilterButtonWithBadge({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
        active
          ? "bg-white shadow text-purple-600"
          : "text-slate-600 hover:bg-white"
      }`}
    >
      {label}
      <span
        className={`px-1.5 rounded-full text-xs ${
          active
            ? "bg-purple-100 text-purple-600"
            : "bg-slate-200"
        }`}
      >
        {count}
      </span>
    </button>
  )
}
