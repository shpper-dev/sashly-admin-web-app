"use client";

import {
  Calendar,
  ClockCheck,
  ClockIcon,
  Loader2,
  LucideIcon,
  ShoppingBag,
  Timer,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Order, OrderStatuses } from "@/lib/models/order.model";
import { advanceOrderStatus, getAllowedNextStatuses } from "@/lib/firebase/order";

// Types
type FilterType = "All" | "Active" | "Drafts";

interface DriversOrdersProps {
  orders?: Order[];
  loading?: boolean;
}

// Next-status button labels (same map as UsersOrders)
const NEXT_STATUS_LABEL: Partial<Record<OrderStatuses, string>> = {
  pickedUp:        "Mark Picked Up",
  sorting:         "Mark Sorting",
  detailing:       "Mark Detailing",
  cleaning:        "Mark Cleaning",
  readyToDeliver:  "Mark Ready",
  delivered:       "Mark Delivered",
  disputed:        "Mark Disputed",
  disputeResolved: "Mark Resolved",
  cancelled:       "Cancel Order",
};

// Page
export default function DriversOrders({ orders, loading }: DriversOrdersProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("Active");

  const activeOrders =
    orders?.filter((o) => !o.isDelivered && !o.isCancelled) ?? [];

  const allOrders = orders ?? [];

  const displayedOrders =
    activeFilter === "Active"
      ? activeOrders
      : activeFilter === "All"
      ? allOrders
      : [];

  const readyForDelivery = activeOrders.filter(
    (o) => o.latestStatus.status === "readyToDeliver"
  );

  const upcomingCollections = activeOrders.filter(
    (o) => o.latestStatus.status === "confirmed"
  );

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
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
          </div>
        ) : activeFilter === "Drafts" ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No Drafts Available
          </div>
        ) : displayedOrders.length > 0 ? (
          displayedOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm">
            No orders found
          </div>
        )}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-2 gap-6 mt-10">

        {/* Ready for Delivery */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              Ready for Delivery
            </span>
          </div>
          {readyForDelivery.length === 0 ? (
            <EmptyStateCard
              title="Ready for Delivery"
              description="No orders ready for delivery"
              icon={ClockCheck}
            />
          ) : (
            <div className="flex flex-col gap-2">
              {readyForDelivery.map((order) => (
                <MiniOrderCard key={order.id} order={order} accentColor="cyan" />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Collections */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              Upcoming Collections
            </span>
          </div>
          {upcomingCollections.length === 0 ? (
            <EmptyStateCard
              title="Upcoming Collections"
              description="No scheduled pickups"
              icon={ClockIcon}
            />
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingCollections.map((order) => (
                <MiniOrderCard key={order.id} order={order} accentColor="amber" />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// OrderCard (in-progress, full size)
function OrderCard({ order }: { order: Order }) {
  const [advancing, setAdvancing] = useState(false);

  const groupedItems = Object.values(
    order.items.reduce<Record<string, { name: string; arabicName: string; count: number }>>(
      (acc, item) => {
        const key = item.name;
        if (acc[key]) { acc[key].count += item.count; }
        else { acc[key] = { name: item.name, arabicName: item.arabicName, count: item.count }; }
        return acc;
      },
      {}
    )
  );

  const totalPieces = order.items.reduce((acc, item) => acc + item.count, 0);

  const currentStatus = order.latestStatus.status as OrderStatuses;
  const nextStatuses  = getAllowedNextStatuses(currentStatus);
  const nextStatus    = nextStatuses.find((s) => s !== "cancelled") ?? null;
  const nextLabel     = nextStatus ? (NEXT_STATUS_LABEL[nextStatus] ?? `Mark ${nextStatus}`) : null;
  const isDelivery    = nextStatus === "delivered";

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setAdvancing(true);
    try {
      await advanceOrderStatus(order.id, nextStatus);
    } catch (e) {
      console.error("Failed to advance order status:", e);
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="bg-white text-[#101828] rounded-3xl p-6 flex items-center justify-between shadow-md border border-slate-100">

      {/* Left */}
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-[#F2EDFF] flex items-center justify-center shrink-0">
          <Truck className="h-6 w-6 text-[#7F50F4]" />
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-sm">Order #{order.id.slice(-6)}</h3>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
              order.latestStatus.status === "cancelled"
                ? "bg-red-50 text-red-600"
                : "bg-[#F2EDFF] text-[#7F50F4]"
            }`}>
              {order.latestStatus.status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            Ready By:{" "}
            {order.expectedDeliveryTime
              ? new Date(order.expectedDeliveryTime).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric",
                })
              : "—"}
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-1">
            {groupedItems.map((item) => (
              <span
                key={item.name}
                className="px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600 whitespace-nowrap"
              >
                {item.name} x{item.count}
                {item.arabicName && (
                  <span className="text-slate-400 ml-1">· {item.arabicName}</span>
                )}
              </span>
            ))}
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <ShoppingBag className="h-3.5 w-3.5" />
              {totalPieces} Pieces
            </div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col gap-2 ml-4 shrink-0">
        {nextLabel && (
          <button
            onClick={handleAdvance}
            disabled={advancing}
            className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-colors text-white flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDelivery
                ? "bg-green-600 hover:bg-green-700"
                : "bg-[#7F50F4] hover:bg-[#6B3FD4]"
            }`}
          >
            {advancing
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…</>
              : nextLabel
            }
          </button>
        )}
        <Link
          href={`/orders?orderId=${order.id}`}
          className="px-8 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-center"
        >
          Details
        </Link>
      </div>

    </div>
  );
}

// MiniOrderCard (bottom section)
function MiniOrderCard({
  order,
  accentColor,
}: {
  order: Order;
  accentColor: "cyan" | "amber";
}) {
  const totalPieces = order.items.reduce((acc, item) => acc + item.count, 0);

  const accent = {
    cyan:  { bg: "bg-cyan-50",   text: "text-cyan-700"  },
    amber: { bg: "bg-amber-50",  text: "text-amber-700" },
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
            ? new Date(order.expectedDeliveryTime).toLocaleDateString("en-US", {
                month: "short", day: "numeric",
              })
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