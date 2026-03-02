"use client";
import { Calendar, ClockCheck, ClockIcon, LucideIcon, ShoppingBag, Timer, Truck } from 'lucide-react';
import React, { useState } from 'react';


export default function UsersOrders() {
    const [activeFilter, setActiveFilter] = useState<"All" | "Active" | "Drafts">("Active");
  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 bg-white ">
                  
                      {/* Top filter row */}
                      <div className="flex items-center justify-between mb-8">
                  
                        {/* Segmented Control */}
                        <div className="flex bg-slate-100 shadow-inner rounded-lg p-1 gap-1 ">
                            <FilterButton label="Active" active={activeFilter === "Active"} onclick={() => setActiveFilter("Active")} />
                            <FilterButton label="All" active={activeFilter === "All"} onclick={() => setActiveFilter("All")} />
                            <FilterButton label="Drafts" active={activeFilter === "Drafts"} onclick={() => setActiveFilter("Drafts")} />
                        </div>
                       
                        {/* Showing active */}
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Timer className="h-4 w-4" />
                          Showing {activeFilter !== "Drafts" ? `${activeFilter} orders` : `Drafts`}
                        </div>
                      </div>
                  
                      {/* In Progress label */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                          In Progress
                        </span>
                      </div>
                  
                      {/* Order Card */}
                      <div className='flex flex-col gap-2 pr-2 min-h-40 max-h-50 overflow-y-auto'>
                        {activeFilter !== "Drafts" && <OrderCard />}
                        {activeFilter == "Drafts" && (
                            <div className="text-center py-10 text-slate-400">
                              No Drafts Available
                            </div>
                        )} 
                      </div>
                  
                      {/* Bottom section */}
                      <div className="grid grid-cols-2 gap-6 mt-10">
                  
                        <EmptyStateCard
                          title="Ready for Delivery"
                          description="No orders ready for pickup"
                          icon={ClockCheck}
                        />
                  
                        <EmptyStateCard
                          title="Upcoming Collections"
                          description="No scheduled pickups"
                          icon={ClockIcon}
                        />
                  
                      </div>
                  
                    </div>
  )
}

// helpers
function OrderCard() {
  return (
    <div className="bg-white text-[#101828] rounded-3xl p-6 flex items-center justify-between shadow-md">

      {/* Left section */}
      <div className="flex items-start gap-4">

        <div className="w-12 h-12 rounded-xl bg-[#F2EDFF] px-3 flex items-center justify-center">
          <Truck className="h-6 w-6 text-[#7F50F4]" />
        </div>

        <div className="flex flex-col gap-2 w-full px-5">

          <div className="flex items-center justify-between">
            <h3 className="font-bold text-md">Order #4711</h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F2EDFF] text-[#7F50F4]">
              Cleaning
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="h-4 w-4" />
            Ready By: 20 Feb, 1:00 PM
          </div>

          <div className="flex items-center gap-3 mt-2">

            <span className="px-4 py-1 rounded-full bg-slate-100 text-xs font-medium">
              Abaya (S) x 5
            </span>

            <span className="px-4 py-1 rounded-full bg-slate-100 text-xs font-medium">
              Tarha (S) x 5 - طرحة
            </span>

            <div className="flex items-center gap-1 text-xs text-slate-500">
              <ShoppingBag className="h-3.5 w-3.5" />
              10 Pieces
            </div>

          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex flex-col gap-3">

        <button className="px-8 py-3 rounded-xl text-xs bg-[#7F50F4] hover:bg-[#6B3FD4] text-white font-bold transition-colors cursor-pointer">
          Mark Cleaned
        </button>

        <button className="px-8 py-3 rounded-xl text-xs font-bold border border-slate-200 text-slate-600  hover:bg-slate-50 transition-colors cursor-pointer">
          Details
        </button>

      </div>

    </div>
  );
}

function EmptyStateCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="border border-slate-200 rounded-3xl p-5 flex flex-col items-center justify-center text-center bg-transparent shadow-sm">

      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5" />
      </div>

      <h4 className="uppercase text-sm font-bold tracking-wider text-slate-300">
        {title}
      </h4>

      <p className="text-slate-500 text-sm mt-2">
        {description}
      </p>

    </div>
  );
}

function FilterButton({label, active, onclick}: {label:string, active?:boolean, onclick?: () => void}) {
  return (
    <button className={`px-5 py-1 rounded-lg text-xs font-medium transition ${
        active
          ? "bg-white shadow text-purple-600"
          : "text-slate-600 hover:bg-white"
      }`} onClick={onclick}>
        {label}
    </button>
  );
}