import {
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  ShieldAlert,
  MapPin,
  MessageCircle,
  Users,
} from "lucide-react"
import { Order } from "@/lib/models/order.model"
import { Business } from "@/lib/models/business.model"

interface BusinessStatsProps {
  orders: Order[];
  business?: Business;
}

export default function BusinessStats({ orders, business }: BusinessStatsProps) {

  // ── Derived stats from orders ──
  const totalOrders   = orders.length;
  const totalSales    = orders.reduce((acc, o) => acc + o.totalPrice, 0);
  const paidOrders    = orders.filter((o) => o.isPaid);
  const unpaidOrders  = orders.filter((o) => !o.isPaid && !o.isCancelled);
  const totalPaid     = paidOrders.reduce((acc, o) => acc + o.totalPrice, 0);
  const totalUnpaid   = unpaidOrders.reduce((acc, o) => acc + o.totalPrice, 0);
  const avgSpend      = totalOrders > 0 ? totalSales / totalOrders : 0;

  // First order — earliest createdAt (fallback if no orders)
  const earliestOrder = orders.length > 0
    ? orders.reduce((a, b) => a.createdAt < b.createdAt ? a : b)
    : null;

  // Last order — most recent createdAt
  const latestOrder = orders.length > 0
    ? orders.reduce((a, b) => a.createdAt > b.createdAt ? a : b)
    : null;

  // Avg frequency — days between first and last order divided by order count
  const frequencyDays = orders.length > 1 && earliestOrder && latestOrder
    ? Math.round(
        (latestOrder.createdAt - earliestOrder.createdAt) /
        (1000 * 60 * 60 * 24 * (orders.length - 1))
      )
    : 0;

  // Service preferences — top items by total count across all orders
  const itemCountMap = orders.flatMap((o) => o.items).reduce<Record<string, { name: string; arabicName: string; count: number }>>((acc, item) => {
    if (acc[item.name]) { acc[item.name].count += item.count; }
    else { acc[item.name] = { name: item.name, arabicName: item.arabicName, count: item.count }; }
    return acc;
  }, {});

  const topItems = Object.values(itemCountMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Favourite service type
  const expressCount  = orders.filter((o) => o.serviceType === "express").length;
  const ordinaryCount = orders.filter((o) => o.serviceType === "ordinary").length;
  const favouriteService = expressCount >= ordinaryCount ? "Express" : "Ordinary";

  // Unique placing members — distinct userId across orders (how many employees are actually ordering)
  const uniqueOrderingMembers = new Set(orders.map((o) => o.userId)).size;

  // Delivery address — prefer business's own address, fall back to last order's delivery address
  const lastAddress = business?.address?.formattedAddress
    ?? latestOrder?.deliveryAddress?.formattedAddress
    ?? null;

  return (
    <div className="h-full overflow-y-auto px-6 py-3 space-y-4">

      {/*  TOP STATS  */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden grid grid-cols-4 divide-x divide-slate-200">

        {/* ORDERS */}
        <div className="p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <p className="text-[11px] tracking-widest text-slate-400 font-semibold">ORDERS</p>
            <p className="text-xl font-bold text-slate-900">{totalOrders}</p>
          </div>
        </div>

        {/* TOTAL SALES */}
        <div className="p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] tracking-widest text-slate-400 font-semibold">TOTAL SALES</p>
            <p className="text-xl font-bold text-emerald-600">SAR {totalSales.toFixed(2)}</p>
          </div>
        </div>

        {/* PAID */}
        <div className="p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] tracking-widest text-slate-400 font-semibold">PAID</p>
            <p className="text-xl font-bold text-emerald-600">SAR {totalPaid.toFixed(2)}</p>
          </div>
        </div>

        {/* UNPAID */}
        <div className="p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-[11px] tracking-widest text-slate-400 font-semibold">UNPAID</p>
            <p className="text-xl font-bold text-red-500">SAR {totalUnpaid.toFixed(2)}</p>
            {unpaidOrders.length > 0 && (
              <p className="text-xs text-red-400 font-medium">({unpaidOrders.length}) PENDING</p>
            )}
          </div>
        </div>
      </div>

      {/*  META ROW  */}
      <div className="grid grid-cols-4 text-center border-b border-slate-200 pb-6 text-sm">

        <div>
          <p className="text-[11px] tracking-widest text-slate-400 font-semibold">FIRST ORDER</p>
          <p className="font-semibold text-slate-800 mt-1">
            {earliestOrder
              ? new Date(earliestOrder.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
              : "—"}
          </p>
        </div>

        <div className="border-l border-slate-200">
          <p className="text-[11px] tracking-widest text-slate-400 font-semibold">LAST ORDER</p>
          <p className="font-semibold text-slate-800 mt-1">
            {latestOrder
              ? new Date(latestOrder.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })
              : "—"}
          </p>
        </div>

        <div className="border-l border-slate-200">
          <p className="text-[11px] tracking-widest text-slate-400 font-semibold">FREQUENCY</p>
          <p className="font-semibold text-slate-800 mt-1">
            {orders.length > 1 ? `~${frequencyDays}d / order` : "—"}
          </p>
        </div>

        <div className="border-l border-slate-200">
          <p className="text-[11px] tracking-widest text-slate-400 font-semibold">AVG SPEND</p>
          <p className="font-semibold text-slate-800 mt-1">
            {totalOrders > 0 ? `SAR ${avgSpend.toFixed(2)}` : "—"}
          </p>
        </div>
      </div>

      {/*  SERVICE PREF  */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-3 h-3" />
          <h3 className="text-sm font-semibold text-slate-900">Service Preferences</h3>
        </div>

        <div className="rounded-2xl bg-slate-100 p-5 space-y-4 text-sm">
          {topItems.length > 0 ? (
            <>
              <p className="text-slate-600">
                Business frequently uses{" "}
                <span className="text-sky-500 font-semibold">{favouriteService}</span> service.
                Most popular items include:
              </p>
              <div className="flex gap-3 flex-wrap">
                {topItems.map((item) => (
                  <div key={item.name} className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-medium shadow-sm">
                    {item.name} × {item.count}
                    {item.arabicName && (
                      <span className="text-sky-500 ml-1">· {item.arabicName}</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-xs">No order history to derive preferences.</p>
          )}
        </div>
      </div>

      {/*  BOTTOM GRID  */}
      <div className="grid grid-cols-2 gap-8 pt-2">

        {/* Geographic */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Geographic Context</h3>

          <div className="rounded-xl border border-slate-200 h-12 flex items-center px-4 text-sm text-slate-600 gap-2 overflow-hidden">
            <MapPin className="w-4 h-4 shrink-0 text-purple-500" />
            {lastAddress
              ? <span className="truncate text-xs">{lastAddress}</span>
              : <span className="text-slate-400 text-xs">No address on record</span>
            }
          </div>
        </div>

        {/* Active ordering members */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Active Ordering Members</h3>
          <div className="rounded-xl border border-slate-200 h-12 flex items-center px-4 text-sm text-slate-600 gap-2">
            <Users className="w-4 h-4 shrink-0 text-purple-500" />
            {orders.length > 0
              ? <span className="text-xs">{uniqueOrderingMembers} employee{uniqueOrderingMembers !== 1 ? "s" : ""} have placed orders</span>
              : <span className="text-slate-400 text-xs">No orders placed yet</span>
            }
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-3 pt-1">
        <h3 className="text-sm font-semibold text-slate-900">Internal Notes</h3>
        <div className="rounded-2xl bg-slate-100 h-22 flex flex-col items-center justify-center text-slate-400 text-sm text-center p-4">
          <MessageCircle className="w-6 h-6 mb-2" />
          No private administrative notes recorded.
        </div>
      </div>
    </div>
  )
}