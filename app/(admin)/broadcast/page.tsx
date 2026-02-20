"use client";
import Header from "@/components/Header";
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { broadcastHeadings } from "@/constants/headings";
import { TableHeading } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";


const mockData = [
{
  id:1,
  date_time: "#4627",
  msg_details: "ORD-7953",
  target: "4h",
  reach:"Address Issue",
  engagement: "96",
  actions: "",
},
{
  id:2,
  date_time: "#5251",
  msg_details: "ORD-623G",
  target: "1h",
  reach:"Customer Request",
  engagement: "63",
  actions: "",
},
{
  id:3,
  date_time: "#7252",
  msg_details: "ORD-32QQ",
  target: "2h",
  reach:"Damaged Pkg",
  engagement: "99",
  actions: "",
}]


export default function Broadcast() {
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");
  const searchParams = useSearchParams()
  const selectedTarget = searchParams.get('target');
  const [target, setTarget] = useState(selectedTarget ?? "ALL USERS");
  const [heading, setHeading] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(()=>{
    setLoading(true);
    setTimeout(()=>{
      setData(mockData);
      setLoading(false);
    },2000)
  },[]);

  const renderCellContent = (Heading:TableHeading, value:any)=>{
    if(!value || value === "-"){
      return (
        <span className='text-slate-400'>-</span>
      );
    }

    switch (Heading.id){
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

  

  // Placeholder handlers
  const handleSaveDraft = () => {
    console.log("Draft saved:", { target, priority, heading, body });
    alert("Draft saved");
  };

  const handleSend = () => {
    console.log("Broadcast sent:", { target, priority, heading, body });
    alert("Broadcast sent");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Broadcast Center" />

      <main className="flex flex-col min-h-screen pt-18 pl-60">
        <section className="px-8 pb-6">
          {/* CARD */}
          <form className="bg-white border border-blue-500/30 rounded-2xl shadow-sm">

            {/* HEADER */}
            <div className="px-6 py-4 text-xl font-semibold">
              New Broadcast
            </div>

            <div className="border-t border-slate-200" />

            {/* BODY */}
            <div className="p-6 space-y-4">

              {/* TOP ROW */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">

                {/* TARGET */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-600">
                      TARGET AUDIENCE
                    </label>
                  
                    <Select value={target} onValueChange={setTarget}>
                      <SelectTrigger className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-5.5 text-sm font-medium focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all">
                        <SelectValue placeholder="Select target audience" />
                      </SelectTrigger>
                      
                      <SelectContent className="rounded-xl border border-slate-200 bg-white shadow-lg">
                        <SelectItem 
                          value="ALL USERS" 
                          className="rounded-lg cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                        >
                          ALL USERS
                        </SelectItem>
                        <SelectItem 
                          value="ACTIVE USERS" 
                          className="rounded-lg cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                        >
                          ACTIVE USERS
                        </SelectItem>
                        <SelectItem 
                          value="DRIVERS" 
                          className="rounded-lg cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                        >
                          DRIVERS
                        </SelectItem>
                        <SelectItem 
                          value="ADMINS" 
                          className="rounded-lg cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                        >
                          ADMINS
                        </SelectItem>
                      </SelectContent>
                    </Select>
                </div>

                {/* PRIORITY */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-600">
                    PRIORITY LEVEL
                  </label>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setPriority("normal")}
                      className={`flex-1 py-3 rounded-xl border text-sm font-medium transition
                        ${
                          priority === "normal"
                            ? "border-purple-500 text-purple-600 bg-purple-50"
                            : "border-slate-300 text-slate-600 bg-slate-100"
                        }`}
                    >
                      Normal
                    </button>

                    <button
                      type="button"
                      onClick={() => setPriority("urgent")}
                      className={`flex-1 py-3 rounded-xl border text-sm font-medium transition
                        ${
                          priority === "urgent"
                            ? "border-purple-500 text-purple-600 bg-purple-50"
                            : "border-slate-300 text-slate-600 bg-slate-100"
                        }`}
                    >
                      Urgent
                    </button>
                  </div>
                </div>
              </div>

              {/* HEADING */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-600">
                  MESSAGE HEADING
                </label>

                <input
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  maxLength={20}
                  placeholder="e.g System Maintenance Notice"
                  className="w-full text-sm rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 outline-none"
                />

                <div className="text-right text-xs text-slate-400">
                  {heading.length}/20 characters
                </div>
              </div>

              {/* BODY */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-600">
                  MESSAGE BODY
                </label>

                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={160}
                  rows={5}
                  placeholder="Enter your message here..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 outline-none resize-none"
                />

                <div className="text-right text-xs text-slate-400">
                  {body.length}/160 characters
                </div>
              </div>
            </div>
            <hr className="text-slate-200 mx-6" />
            {/* FOOTER */}
            <div className="flex justify-end gap-4 px-6 py-4 ">
             
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-5 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium cursor-pointer"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={handleSend}
                className="px-6 py-3 rounded-xl bg-linear-to-r from-purple-500 to-purple-600 text-white text-sm font-medium shadow cursor-pointer"
              >
                Send Broadcast
              </button>

            </div>
          </form>
        </section>
        <section className='px-8 pb-6'>
                <div className='flex gap-3 mb-4 justify-between'>
                    <div>
                        <h2 className='text-xl font-bold text-slate-800'>Sent History</h2>
                        <p className='text-sm text-slate-500'>Review previously broadcasted messages</p>
                    </div>
                    
                </div>
                <div>
                    {loading ? (
                        <TableSkeleton tableHeadings={broadcastHeadings}/>
                    ):(
                        <table className='w-full'>
                            <thead className='bg-slate-200/50'>
                                <tr>
                                    {broadcastHeadings.map((heading)=>(
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
                                        <td colSpan={broadcastHeadings.length}
                                        className="px-6 py-12 text-center text-sm text-slate-500 ">
                                            No data available
                                        </td>
                                    </tr>
                                ):(
                                    data.map((row,index)=>(
                                        <tr key={row.id || index} className="hover:bg-slate-50 transition-colors">
                                        {broadcastHeadings.map((heading)=>(
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
                                <td colSpan={broadcastHeadings.length} className='px-6 py-3 first:rounded-bl-lg last:rounded-br-lg'>
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
  );
}

