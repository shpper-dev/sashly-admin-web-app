"use client";
import { FileText, PencilLine, Search } from "lucide-react";
import React, { useState } from "react";
import { Order } from "@/lib/models/order.model";
import { TableHeading } from "@/lib/types";
import { OrderTabProps } from "../page";
import FilterButton from "@/components/buttons/FilterDropdown";
import OrderDetailsDialog from "@/components/orders/OrderDetailsDialog";
// import CustomerCell from "@/components/orders/CustomerCell";
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import { OrderSearchInput } from "@/components/orders/OrderSearchInput";
import { OrderTable } from "@/components/orders/OrderTable";
import CustomerCell from "@/components/orders/CustomerCell";
import { useToast } from "@/lib/providers/ToastProvider";

const orderHeadings: TableHeading[] = [
  { id: "id",           title: "ID"           },
  { id: "ready_by",     title: "READY BY"     },
  { id: "placed",       title: "PLACED"       },
  { id: "customer",     title: "CUSTOMER"     },
  { id: "order_details",title: "ORDER DETAILS"},
  { id: "pcs",          title: "PCS"          },
  { id: "total",        title: "TOTAL"        },
  { id: "actions",      title: ""             },
];

export default function OrderDetails({ orders, loading, onStatusUpdate, currentPage, hasNextPage, onNext, onPrev, pageSize }: OrderTabProps) {
  const [search, setSearch] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const { showToast } = useToast();

  const filtered = orders.filter((order) =>
    !search ||
    order.userName.toLowerCase().includes(search.toLowerCase()) ||
    order.id.includes(search)
  );

  const toggleItems = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };


  const renderCell = (heading: TableHeading, row: Order): React.ReactNode => {
    switch (heading.id) {
      case "id":
        return <span className="text-xs text-slate-500">#{row.id.slice(-6)}</span>;

      case "ready_by":
        return (
          <div className="flex flex-col items-start">
            <span className="text-xs font-semibold">
              {row.expectedDeliveryTime
                ? new Date(row.expectedDeliveryTime).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })
                : "—"}
            </span>
          </div>
        );

      case "placed":
        return (
          <div className="flex flex-col gap-1 items-start">
            <span className="text-xs">
              {new Date(row.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })}
            </span>
            <span className={`${row.serviceType === "ordinary" ? "bg-[#02d0ff]": "bg-purple-600"} py-1 px-1.5 text-[10px] text-white rounded-xl`}>{row.serviceType}</span>
          </div>
        );

      case "customer":
        return (
          <CustomerCell
           userId={row.userId}
           userName={row.userName}
           userPhone={row.userPhone}
           onDelete={() => { showToast(`Deleted ${row.userName}`,"error")}}
         />
        );

      case "order_details": {
        const visibleCount = 3;
        const isExpanded = expandedItems[row.id];      

        const itemsToShow = isExpanded
          ? row.items
          : row.items.slice(0, visibleCount);      

        const hiddenCount = row.items.length - visibleCount;      

        return (
          <div className="flex flex-wrap gap-2 items-center">
            
            {itemsToShow.map((item, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-white text-xs text-slate-700 shadow-sm border border-slate-200"
              >
                {item.name} x{item.count}
              </span>
            ))}      

            {!isExpanded && hiddenCount > 0 && (
              <span
                onClick={() => toggleItems(row.id)}
                className="px-3 py-1 rounded-full text-purple-600 text-xs bg-purple-200/50 font-bold cursor-pointer hover:bg-purple-200"
              >
                +{hiddenCount} more
              </span>
            )}      

            {isExpanded && row.items.length > visibleCount && (
              <span
                onClick={() => toggleItems(row.id)}
                className="px-3 py-1 rounded-full text-slate-600 text-xs bg-slate-200 font-semibold cursor-pointer hover:bg-slate-300"
              >
                Show less
              </span>
            )}
          </div>
        );
      }

      case "pcs":
        return <span className="font-semibold">{row.items.reduce((s, i) => s + i.count, 0)}</span>;

      case "total":
        return (
          <div>
            <div className="text-blue-500 text-xs font-medium">SAR</div>
            <div className="font-semibold text-slate-800">{row.totalPrice.toFixed(2)}</div>
          </div>
        );

      case "actions":
        return (
          <div className="flex items-center gap-1 justify-end">
            <OrderDetailsDialog order={row} onStatusUpdate={onStatusUpdate}>
              <button className="px-3 py-1.5 flex items-center gap-2 text-xs font-medium bg-blue-200/30 text-[#02D0FF] rounded-md hover:bg-blue-200 transition-colors cursor-pointer">
               <PencilLine className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                DETAILS
              </button>
            </OrderDetailsDialog>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="flex justify-between items-center mb-4 px-8">
        <div className="flex gap-3">
          <FilterButton label="Filter Sections" />
          <FilterButton label="Order Type" />
          <FilterButton label="Date" />
        </div>
        <OrderSearchInput value={search} onChange={setSearch} />
      </div>

      {loading && filtered.length === 0 ? (
        <TableSkeleton tableHeadings={orderHeadings} />
      ) : (
        <div className={loading ? "opacity-50 pointer-events-none" : ""}>
          <OrderTable
            headings={orderHeadings}
            rows={filtered}
            renderCell={renderCell}
            currentPage={currentPage}
            hasNextPage={hasNextPage}
            onNext={onNext}
            onPrev={onPrev}
            pageSize={pageSize}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}