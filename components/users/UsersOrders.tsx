"use client";
import { Order } from '@/lib/models/order.model';
import { Calendar, ClockCheck, ClockIcon, Loader2, LucideIcon, ShoppingBag, Timer, Truck } from 'lucide-react';
import  { useState } from 'react';

interface UsersOrdersProps {
  orders?: Order[];
  loading?: boolean;
}

export default function UsersOrders({ orders, loading }: UsersOrdersProps) {
  const [activeFilter, setActiveFilter] = useState<"All" | "Active" | "Drafts">("Active");

  const readyForPickup = orders?.filter((o) =>
    o.latestStatus.status === "confirmed"
  ) ?? [];

  const readyForDelivery = orders?.filter((o) =>
    o.latestStatus.status === "readyToDeliver"
  ) ?? [];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 bg-white">

      {/* Top filter row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-slate-100 shadow-inner rounded-lg p-1 gap-1">
          <FilterButton label="Active"  active={activeFilter === "Active"}  onclick={() => setActiveFilter("Active")}  />
          <FilterButton label="All"     active={activeFilter === "All"}     onclick={() => setActiveFilter("All")}     />
          <FilterButton label="Drafts"  active={activeFilter === "Drafts"}  onclick={() => setActiveFilter("Drafts")}  />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Timer className="h-3.5 w-3.5" />
          Showing {activeFilter !== "Drafts" ? `${activeFilter} orders` : "Drafts"}
        </div>
      </div>

      {/* Section label */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">In Progress</span>
      </div>

      {/* Order Cards */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
          </div>
        ) : activeFilter === "Drafts" ? (
          <div className="text-center py-10 text-slate-400 text-sm">No Drafts Available</div>
        ) : orders && orders.length > 0 ? (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm">No orders found</div>
        )}
      </div>

      {/* Bottom section  */}
      <div className="grid grid-cols-2 gap-4 mt-8">

        {/* Ready for Pickup — confirmed orders */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              Ready for Pickup
            </span>
          </div>
          {readyForPickup.length === 0 ? (
            <EmptyStateCard
              title="Ready for Pickup"
              description="No orders awaiting pickup"
              icon={ClockCheck}
            />
          ) : (
            <div className="flex flex-col gap-2">
              {readyForPickup.map((order) => (
                <PickupDeliveryCard key={order.id} order={order} accentColor="green" />
              ))}
            </div>
          )}
        </div>

        {/* Ready for Delivery — readyToDeliver orders */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              Ready for Delivery
            </span>
          </div>
          {readyForDelivery.length === 0 ? (
            <EmptyStateCard
              title="Ready for Delivery"
              description="No orders ready to deliver"
              icon={ClockIcon}
            />
          ) : (
            <div className="flex flex-col gap-2">
              {readyForDelivery.map((order) => (
                <PickupDeliveryCard key={order.id} order={order} accentColor="blue" />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// OrderCard (in progress) 
function OrderCard({ order }: { order: Order }) {
  const groupedItems = Object.values(
    order.items.reduce<Record<string, { name: string; arabicName: string; count: number }>>((acc, item) => {
      const key = item.name;
      if (acc[key]) { acc[key].count += item.count; }
      else { acc[key] = { name: item.name, arabicName: item.arabicName, count: item.count }; }
      return acc;
    }, {})
  );

  const totalPieces = order.items.reduce((acc, item) => acc + item.count, 0);

  return (
    <div className="bg-white text-[#101828] rounded-2xl p-5 flex items-start justify-between shadow-md border border-slate-100">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-[#F2EDFF] flex items-center justify-center shrink-0">
          <Truck className="h-5 w-5 text-[#7F50F4]" />
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-sm">Order #{order.id.slice(-6)}</h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${
              order.latestStatus.status === "cancelled"
                ? "bg-red-50 text-red-600"
                : "bg-purple-50 text-purple-600"
            }`}>
              {order.latestStatus.status}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            Ready by:{" "}
            {order.expectedDeliveryTime
              ? new Date(order.expectedDeliveryTime).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
              : "—"}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {groupedItems.map((item) => (
              <span key={item.name} className="px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600 whitespace-nowrap">
                {item.name} x{item.count}
                {item.arabicName && <span className="text-slate-400 ml-1">· {item.arabicName}</span>}
              </span>
            ))}
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-400">
              <ShoppingBag className="h-3 w-3" />
              {totalPieces} pcs
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 ml-4 shrink-0">
        <button className="px-6 py-2 rounded-xl text-xs bg-[#7F50F4] hover:bg-[#6B3FD4] text-white font-bold transition-colors">
          Mark Cleaned
        </button>
        <button className="px-6 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
          Details
        </button>
      </div>
    </div>
  );
}

// MiniOrderCard (bottom section) 
function PickupDeliveryCard({ order, accentColor }: { order: Order; accentColor: "green" | "blue" }) {
  const totalPieces = order.items.reduce((acc, item) => acc + item.count, 0);

  const accent = {
    green: { bg: "bg-green-50",   text: "text-green-700",  dot: "bg-green-400"  },
    blue:  { bg: "bg-blue-50",    text: "text-blue-700",   dot: "bg-blue-400"   },
  }[accentColor];

  return (
    <div className={`rounded-xl px-4 py-3 border border-slate-100 ${accent.bg} flex items-center justify-between gap-3`}>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-bold text-xs text-slate-800">
          Order #{order.id.slice(-6)}
        </span>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Calendar className="h-3 w-3 shrink-0" />
          {order.expectedDeliveryTime
            ? new Date(order.expectedDeliveryTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "—"}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <ShoppingBag className="h-3 w-3 text-slate-400" />
        <span className={`text-xs font-bold ${accent.text}`}>{totalPieces} pcs</span>
      </div>
    </div>
  );
}

// EmptyStateCard 
function EmptyStateCard({ title, description, icon: Icon }: {
  title: string; description: string; icon: LucideIcon;
}) {
  return (
    <div className="border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center bg-transparent">
      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
        <Icon className="h-4 w-4" />
      </div>
      <h4 className="uppercase text-xs font-bold tracking-wider text-slate-300">{title}</h4>
      <p className="text-slate-400 text-xs mt-1">{description}</p>
    </div>
  );
}

// FilterButton 
function FilterButton({ label, active, onclick }: { label: string; active?: boolean; onclick?: () => void }) {
  return (
    <button
      onClick={onclick}
      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
        active ? "bg-white shadow text-purple-600" : "text-slate-500 hover:bg-white/60"
      }`}
    >
      {label}
    </button>
  );
}