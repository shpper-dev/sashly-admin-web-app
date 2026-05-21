"use client";
import { PencilLine, Search } from "lucide-react";
import React, { useState } from "react";
import { Order } from "@/lib/models/order.model";
import { TableHeading } from "@/lib/types";
import FilterDropdown from "@/components/buttons/FilterDropdown";
// import CustomerCell from "@/components/orders/CustomerCell";
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import UpdateOrderDialog from "@/components/orders/UpdateOrderDialog";
import { OrderStatuses } from "@/lib/models/order.model";
import { OrderSearchInput } from "@/components/orders/OrderSearchInput";
import { OrderTable } from "@/components/orders/OrderTable";
import CustomerCell from "@/components/orders/CustomerCell";
import { useToast } from "@/lib/providers/ToastProvider";
import { OrderTabProps } from "./OrdersPageClient";

const orderHeadings: TableHeading[] = [
  { id: "id",           title: "ID"           },
  { id: "ready_by",     title: "READY BY"     },
  { id: "placed",       title: "PLACED"       },
  { id: "customer",     title: "CUSTOMER"     },
  { id: "address",      title: "ADDRESS"      },
  { id: "order_details",title: "ORDER DETAILS"},
  // { id: "bags",         title: "BAGS"         },
  { id: "pcs",          title: "PCS"          },
  { id: "paid",         title: "PAID"         },
  { id: "total",        title: "TOTAL"        },
  { id: "actions",      title: ""             },
];

const cleaningReportOptions = [
  { label: "To Clean",            value: "to-clean",   href: "/orders/reports/to-clean"   },
  { label: "To Clean (No dates)", value: "no-dates",   href: "/orders/reports/no-dates"   },
  { label: "Cleaned Today",       value: "today",      href: "/orders/reports/today"      },
  { label: "Cleaned Yesterday",   value: "yesterday",  href: "/orders/reports/yesterday"  },
  { label: "Detailed Today",      value: "detailed",   href: "/orders/reports/detailed"   },
];

export default function OrderCleaning({ orders, loading, onStatusUpdate, currentPage, hasNextPage, onNext, onPrev, pageSize }: OrderTabProps) {
  const [search, setSearch] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const {showToast} = useToast();

  const filtered = orders.filter((o) =>
    !search ||
    o.userName.toLowerCase().includes(search.toLowerCase()) ||
    o.id.includes(search)
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
        return <span className="text-xs font-mono text-slate-500">#{row.id.slice(0,6)}</span>;

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
            <span className={`${row.serviceType === "ordinary" ? "bg-[#02d0ff]": "bg-purple-600"} p-1.5 text-[10px] text-white rounded-lg`}>{row.serviceType}</span>
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

      case "address":
        return (
          <div className="flex flex-col text-xs">
            <span className="font-semibold text-slate-400">DELIVERY</span>
            <span className="text-slate-600">{row.deliveryAddress.formattedAddress ?? "—"}</span>
          </div>
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

      case "paid":
        return row.isPaid ? (
          <div className="flex flex-col gap-1">
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">PAID</span>
            <span className="text-xs">
              {new Date(row?.paymentDate ?? 0).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })}
            </span>
          </div>
        ) : (
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-500">UNPAID</span>
        );

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
            <UpdateOrderDialog
              orderId={row.id}
              currentStatus={row.latestStatus.status as OrderStatuses}
              onSuccess={onStatusUpdate}
            >
              <button className="px-3 py-1.5 flex items-center gap-2 text-xs font-medium text-white bg-[#02D0FF] rounded-lg hover:bg-blue-200 transition-colors">
                <PencilLine className="w-4 h-4 text-white" />
                CLEANING
              </button>
            </UpdateOrderDialog>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 px-8">
        <div className="flex gap-3">
          <FilterDropdown label="Reports" options={cleaningReportOptions} />
          <FilterDropdown label="Sections" />
          <FilterDropdown label="Order Type" />
          <FilterDropdown label="Date" />
        </div>
        <OrderSearchInput value={search} onChange={setSearch} />
      </div>

      {loading ? <TableSkeleton tableHeadings={orderHeadings} /> : (
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
      )}
    </div>
  );
}