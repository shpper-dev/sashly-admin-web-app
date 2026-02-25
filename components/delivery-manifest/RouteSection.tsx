"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, Map } from "lucide-react";
import { Route } from "@/lib/types";
import OrderRow from "./OrderRow";

const TABLE_HEADERS = [
  { label: "Sel",                    className: "w-10 px-4"                        },
  { label: "Order Details",          className: "px-4 min-w-[120px]"               },
  { label: "Client Info",            className: "px-4 min-w-[140px]"               },
  { label: "Addresses & Logistics",  className: "px-4 min-w-[180px]"               },
  { label: "Summary",                className: "px-4 min-w-[100px]"               },
  { label: "Type",                   className: "px-4"                             },
  { label: "Notes / Instructions",   className: "px-4 min-w-[140px]"               },
  { label: "Financials",             className: "px-4 min-w-[100px] text-right"    },
];

export default function RouteSection({
  route,
  selected,
  onToggleOrder,
  onToggleRoute,
}: {
  route: Route;
  selected: Record<string, boolean>;
  onToggleOrder: (id: string) => void;
  onToggleRoute: (route: Route, checked: boolean) => void;
}) {
  const [open, setOpen] = useState(true);
  const checkboxRef = useRef<HTMLInputElement>(null);

  const routeSelectedCount = route.orders.filter((o) => selected[o.id]).length;
  const allSelected  = routeSelectedCount === route.orders.length;
  const noneSelected = routeSelectedCount === 0;

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = !allSelected && !noneSelected;
      checkboxRef.current.checked = allSelected;  
    }
  }, [allSelected, noneSelected]);

  return (
    <div className={`border border-slate-200 overflow-hidden `}>

      {/* ── Route header bar ── */}
      <div className={`flex items-center justify-between px-5 py-4 ${open ? "bg-[#F8FAFC]" : "bg-white"} border-b border-slate-100`}>

        {/* Left: chevron + badge + route info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(!open)}
            className={`flex items-center justify-center w-7 h-7 rounded-lg hover:bg-slate-100 transition-all duration-200 ${open ? "rotate-180" : ""}`}
          >
            <ChevronDown size={20} className="text-slate-400" />
          </button>

          <span className="px-3 py-1.5 bg-[#7F50F4] text-white text-xs font-bold rounded-lg tracking-wide">
            {route.id}
          </span>

          <div className="flex flex-col gap-0.5">
            <div className="font-bold text-[#101828] text-sm">
              ROUTE {route.id} — {route.driver}
            </div>
            <div className="text-[11px] font-semibold">
              <span className="text-[#E17100]">{route.pickups} PICKUPS</span>
              <span className="text-[#02D0FF] mx-1.5">•</span>
              <span className="text-[#7F50F4]">{route.deliveries} DELIVERIES</span>
            </div>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
            <Map size={12} className="text-slate-400" />
            PLANNER
          </button>

          <button className={`flex items-center gap-2 px-3 py-2  border border-slate-200 rounded-xl text-[11px] font-bold  shadow-sm hover:shadow-md hover:border-slate-300 ${allSelected ? "text-[#7F50F4] bg-slate-100" : "text-slate-600 bg-white"} transition-all`}>
            <input
              type="checkbox"
              ref={checkboxRef}
              className="w-3.5 h-3.5 accent-[#7F50F4] cursor-pointer"
              onChange={(e) => onToggleRoute(route, e.target.checked)}
              
            />
            {allSelected ? "DESELECT ALL" : "SELECT ALL"}
          </button>
        </div>
      </div>

      {/* ── Collapsible table ── */}
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">

            {/* Table header */}
            <thead className="bg-white">
              <tr className="border-t border-slate-200">
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h.label}
                    className={`
                      py-4 text-left
                      text-xs font-bold uppercase tracking-widest text-[#90A1B9]
                      ${h.className}
                    `}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {route.orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  checked={!!selected[order.id]}
                  onToggle={() => onToggleOrder(order.id)}
                />
              ))}
            </tbody>

          </table>
        </div>
      )}

    </div>
  );
}