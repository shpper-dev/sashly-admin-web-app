"use client";
import { FileText, PencilLine, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Order, OrderStatuses } from "@/lib/models/order.model";
import { TableHeading } from "@/lib/types";
import { OrderTabProps } from "./OrdersPageClient";
import FilterButton from "@/components/buttons/FilterDropdown";
import OrderDetailsDialog from "@/components/orders/OrderDetailsDialog";
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import { OrderSearchInput } from "@/components/orders/OrderSearchInput";
import { OrderTable } from "@/components/orders/OrderTable";
import CustomerCell from "@/components/orders/CustomerCell";
import { useToast } from "@/lib/providers/ToastProvider";
import { getOrderById } from "@/lib/firebase/order";
import { useOrderSearch } from "@/hooks/useOrderSearch";

const orderHeadings: TableHeading[] = [
  { id: "id",           title: "ID"           },
  { id: "ready_by",     title: "READY BY"     },
  { id: "placed",       title: "PLACED"       },
  { id: "customer",     title: "CUSTOMER"     },
  { id: "order_details",title: "ORDER DETAILS"},
  { id: "status",       title: "STATUS"       },
  { id: "paid",         title: "PAID"         },
  { id: "pcs",          title: "PCS"          },
  { id: "total",        title: "TOTAL"        }
];

// Status badge colours 
const STATUS_CONFIG: Record<string, {label:string, style:string}> = {
  confirmed:       {label:"Confirmed", style:"bg-blue-50 text-blue-600"},
  pickedUp:        {label:"Picked Up", style:"bg-indigo-50 text-indigo-600"},
  sorting:         {label:"Sorting",   style:"bg-yellow-50 text-yellow-600"},
  detailing:       {label:"Detailing", style:"bg-pink-50 text-pink-600"},
  cleaning:        {label:"Cleaning", style:"bg-orange-50 text-orange-600"},
  readyToDeliver:  {label:"Ready To Deliver", style:"bg-purple-50 text-purple-600"},
  delivered:       {label:"Delivered", style:"bg-green-50 text-green-600"},  
  disputed:        {label:"Disputed", style:"bg-red-50 text-red-500"},    
  disputeResolved: {label:"Dispute resolved", style:"bg-green-50 text-green-500"},  
  cancelled:       {label:"Cancelled", style:"bg-red-50 text-red-600"},    
};


const OrderStatusOptions = [
  { label: "Confirmed",         value: "confirmed"        },
  { label: "Picked Up",         value: "pickedUp"         },
  { label: "Sorting",           value: "sorting"          },
  { label: "Detailing",         value: "detailing"        },
  { label: "Cleaning",          value: "cleaning"         },
  { label: "Ready To Deliver",  value: "readyToDeliver"   },
  { label: "Delivered",         value: "delivered"        },
  { label: "Disputed",          value: "disputed"         },
  { label: "Dispute Resolved",  value: "disputeResolved"  },
  { label: "Cancelled",         value: "cancelled"        },
];

export default function OrderAll({ orders, loading, onStatusUpdate, currentPage, hasNextPage, onNext, onPrev, pageSize, autoOpenOrderId }: OrderTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>(""); // "" = no filter applied
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const { showToast } = useToast();


  const {
    search, setSearch, isSearchActive, searchLoading,
    searchResults, searchPage, searchHasNextPage, onSearchNext, onSearchPrev,
  } = useOrderSearch({ pageSize });

  // Auto-open dialog state
  const [autoOrder, setAutoOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!autoOpenOrderId) return;

    const found = orders.find((o) => o.id === autoOpenOrderId);
    if (found) {
      setAutoOrder(found);
    } else if (!loading) {
      getOrderById(autoOpenOrderId)
        .then(setAutoOrder)
        .catch(console.error);
    }
  }, [autoOpenOrderId, orders, loading]);

  // Source rows: Meilisearch results while actively searching, Firestore-loaded page otherwise.
  // Status filter still applies on top, client-side, either way.
  const baseRows = isSearchActive ? searchResults : orders;
  const filtered = baseRows.filter((order) => !statusFilter || order.latestStatus.status === statusFilter);

  const effectiveLoading = isSearchActive ? searchLoading : loading;
  const effectiveCurrentPage = isSearchActive ? searchPage : currentPage;
  const effectiveHasNextPage = isSearchActive ? searchHasNextPage : hasNextPage;
  const effectiveOnNext = isSearchActive ? onSearchNext : onNext;
  const effectiveOnPrev = isSearchActive ? onSearchPrev : onPrev;

  const toggleItems = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderCell = (heading: TableHeading, row: Order): React.ReactNode => {
    switch (heading.id) {
      case "id":
        return (
        <OrderDetailsDialog order={row} onStatusUpdate={onStatusUpdate}>
            <span className="text-xs text-slate-500 hover:text-purple-600 cursor-pointer">#{row?.orderNumber ?? row.id.slice(6,13)}</span>
        </OrderDetailsDialog>);

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

      // case "customer":
      //   return (
      //     <div className="flex flex-col gap-0.5">
      //       <span className="text-xs font-semibold text-slate-800">{row.userName}</span>
      //       <span className="text-[10px] text-slate-400">{row.userPhone}</span>
      //     </div>
      //   );

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

      case "status": {
        const style = STATUS_CONFIG[row.latestStatus.status]?.style ?? "bg-slate-100 text-slate-500";
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${style}`}>
            {STATUS_CONFIG[row.latestStatus.status]?.label ?? row.latestStatus.status}
          </span>
        );
      }

      case "paid":
        return row.isPaid ? (
          <div className="flex flex-col gap-1 items-center">
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">PAID</span>
            <span className="text-xs">
              {new Date(row?.paymentDate ?? 0).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })}
            </span>
          </div>
        ) : (
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-500">UNPAID</span>
        );

      case "pcs":
        return <span className="font-semibold">{row.items.reduce((s, i) => s + i.count, 0)}</span>;

      case "total":
        return (
          <div>
            <div className="text-blue-500 text-xs font-medium">SAR</div>
            <div className="font-semibold text-slate-800">{row.totalPrice.toFixed(2)}</div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div>
      {autoOrder && (
        <OrderDetailsDialog
          order={autoOrder}
          open={true}
          onOpenChange={(open) => { if (!open) setAutoOrder(null); }}
          onStatusUpdate={onStatusUpdate}
        >
          <span />
        </OrderDetailsDialog>
      )}
      {/* Filter bar */}
      <div className="flex justify-between items-center mb-4 px-8">
        <div className="flex gap-3 items-center">
          <FilterButton
            label="Order Status"
            options={OrderStatusOptions}
            defaultValue={statusFilter || undefined}
            onChange={setStatusFilter}
          />
        </div>
        <OrderSearchInput value={search} onChange={setSearch} />
      </div>

      {effectiveLoading && filtered.length === 0 ? (
        <TableSkeleton tableHeadings={orderHeadings} />
      ) : (
        <div className={effectiveLoading ? "opacity-50 pointer-events-none" : ""}>
          <OrderTable
            headings={orderHeadings}
            rows={filtered}
            renderCell={renderCell}
            currentPage={effectiveCurrentPage}
            hasNextPage={effectiveHasNextPage}
            onNext={effectiveOnNext}
            onPrev={effectiveOnPrev}
            pageSize={pageSize}
            loading={effectiveLoading}
          />
        </div>
      )}
    </div>
  );
}