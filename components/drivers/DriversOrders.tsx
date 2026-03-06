"use client";

import {
  Calendar,
  ClockCheck,
  ClockIcon,
  LucideIcon,
  ShoppingBag,
  Timer,
  Truck,
} from "lucide-react";
import { useState } from "react";

// Types 
type FilterType = "All" | "Active" | "Drafts";

type OrderStatus = "cleaning" | "pickup" | "out-for-delivery";

interface OrderCardProps {
  status: OrderStatus;
  action: string;
}

// Status config
const STATUS_CONFIG: Record<OrderStatus, { label: string; css: string }> = {
  cleaning:          { label: "Cleaning",       css: "bg-[#F2EDFF] text-[#7F50F4]" },
  pickup:            { label: "Picking Up",      css: "bg-amber-100 text-amber-600"  },
  "out-for-delivery": { label: "Out for Delivery", css: "bg-cyan-50 text-[#02D0FF]"   },
};

// Page
export default function DriversOrders() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("Active");

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 bg-white">

      {/* Filter row */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex bg-slate-100 shadow-inner rounded-lg p-1 gap-1">
          {(["Active", "All", "Drafts"] as FilterType[]).map((f) => (
            <FilterButton
              key={f}
              label={f}
              active={activeFilter === f}
              onClick={() => setActiveFilter(f)}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
          <Timer className="h-4 w-4" />
          Showing {activeFilter !== "Drafts" ? `${activeFilter} orders` : "Drafts"}
        </div>
      </div>

      {/* In Progress label */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
          In Progress
        </span>
      </div>

      {/* Order cards */}
      <div className="flex flex-col gap-3">
        {activeFilter !== "Drafts" ? (
          <>
            <OrderCard status="pickup"            action="Mark Cleaned"   />
            <OrderCard status="out-for-delivery"  action="Mark Delivered" />
          </>
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm">
            No Drafts Available
          </div>
        )}
      </div>

      {/* Bottom grid */}
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
  );
}

// OrderCard 
function OrderCard({ status, action }: OrderCardProps) {
  const { label, css } = STATUS_CONFIG[status];
  const isDelivery = action === "Mark Delivered";

  return (
    <div className="bg-white text-[#101828] rounded-3xl p-6 flex items-center justify-between shadow-md border border-slate-100">

      {/* Left */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#F2EDFF] flex items-center justify-center shrink-0">
          <Truck className="h-6 w-6 text-[#7F50F4]" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-sm">Order #4711</h3>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${css} uppercase`}>
              {label}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            Ready By: 20 Feb, 1:00 PM
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-1">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
              Abaya (S) x 5
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
              Tarha (S) x 5 — طرحة
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <ShoppingBag className="h-3.5 w-3.5" />
              10 Pieces
            </div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col gap-2 shrink-0">
        <button
          className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer text-white ${
            isDelivery
              ? "bg-green-600 hover:bg-green-700"
              : "bg-[#7F50F4] hover:bg-[#6B3FD4]"
          }`}
        >
          {action}
        </button>
        <button className="px-8 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
          Details
        </button>
      </div>

    </div>
  );
}

//  EmptyStateCard 
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
    <div className="border border-slate-200 rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <h4 className="text-xs font-bold tracking-widest text-slate-300 uppercase">{title}</h4>
      <p className="text-slate-400 text-xs mt-1.5">{description}</p>
    </div>
  );
}

// FilterButton 
function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        active
          ? "bg-white shadow text-[#7F50F4]"
          : "text-slate-500 hover:bg-white/60"
      }`}
    >
      {label}
    </button>
  );
}