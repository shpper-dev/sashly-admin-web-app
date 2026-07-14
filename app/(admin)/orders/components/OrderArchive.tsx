"use client";
import { PencilLine } from "lucide-react";
import React, { useState } from "react";
import { Order } from "@/lib/models/order.model";
import { TableHeading } from "@/lib/types";
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import { OrderTable } from "@/components/orders/OrderTable";
import { OrderSearchInput } from "@/components/orders/OrderSearchInput";
import OrderDetailsDialog from "@/components/orders/OrderDetailsDialog";
import { OrderTabProps } from "./OrdersPageClient";
import CustomerCell from "@/components/orders/CustomerCell";
import { useOrderSearch } from "@/hooks/useOrderSearch";
import { refresh } from "next/cache";

const archiveHeadings: TableHeading[] = [
  { id: "id",       title: "ID"      },
  { id: "placed",   title: "PLACED"  },
  { id: "customer", title: "CUSTOMER"},
  { id: "status",   title: "STATUS"  },
  { id: "total",    title: "TOTAL"   },
  { id: "actions",  title: ""        },
];

// Status badge colours for terminal states
const ARCHIVE_STATUS_STYLE: Record<string, string> = {
  delivered: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
};


const ARCHIVE_TAB_FILTER = "isDelivered = true OR isCancelled = true";

export default function OrderArchive({
  orders, loading, onStatusUpdate,
  currentPage, hasNextPage, onNext, onPrev, pageSize,
  autoOpenOrderId,
}: OrderTabProps) {
  const [autoOrder, setAutoOrder] = useState<Order | null>(null);
  const [autoDialogOpen, setAutoDialogOpen] = useState(false);

  const {
    search, setSearch, isSearchActive, searchLoading,
    searchResults, searchPage, searchHasNextPage, onSearchNext, onSearchPrev,refresh
  } = useOrderSearch({ filter: ARCHIVE_TAB_FILTER, pageSize });

  const filtered = isSearchActive ? searchResults : orders;

  const effectiveLoading = isSearchActive ? searchLoading : loading;
  const effectiveCurrentPage = isSearchActive ? searchPage : currentPage;
  const effectiveHasNextPage = isSearchActive ? searchHasNextPage : hasNextPage;
  const effectiveOnNext = isSearchActive ? onSearchNext : onNext;
  const effectiveOnPrev = isSearchActive ? onSearchPrev : onPrev;

  const renderCell = (heading: TableHeading, row: Order): React.ReactNode => {
    switch (heading.id) {
      // case "id":
      //   return <span className="text-xs text-slate-500">#{row?.orderNumber ?? row.id.slice(6,13)}</span>;
      case "id":
              return (
              <OrderDetailsDialog order={row} onStatusUpdate={refresh}>
                  <span className="text-xs text-slate-500 hover:text-purple-600 cursor-pointer">#{row?.orderNumber ?? row.id.slice(6,13)}</span>
              </OrderDetailsDialog>);

      case "placed":
        return (
          <div className="flex flex-col gap-1 items-start">
            <span className="text-xs">
              {new Date(row.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })}
            </span>
            <span className={`${row.serviceType === "ordinary" ? "bg-[#02d0ff]" : "bg-purple-600"} py-1 px-1.5 text-[10px] text-white rounded-xl`}>
              {row.serviceType}
            </span>
          </div>
        );

      case "customer":
        return (
           <CustomerCell
           userId={row.userId}
           userName={row.userName}
           userPhone={row.userPhone}
         
         />
           
         );

      case "status": {
        const style = ARCHIVE_STATUS_STYLE[row.latestStatus.status] ?? "bg-slate-100 text-slate-500";
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${style}`}>
            {row.latestStatus.status === "disputeResolved" ? "Dispute Resolved" : row.latestStatus.status }
          </span>
        );
      }

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
            <OrderDetailsDialog order={row} onStatusUpdate={refresh}>
              <button className="px-3 py-1.5 flex items-center gap-2 text-xs font-medium bg-blue-200/30 text-[#02D0FF] rounded-md hover:bg-blue-200 transition-colors cursor-pointer">
                <PencilLine className="w-4 h-4 text-slate-400" />
                DETAILS
              </button>
            </OrderDetailsDialog>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Auto-open dialog triggered by notification link */}
      {autoOrder && (
        <OrderDetailsDialog
          order={autoOrder}
          open={autoDialogOpen}
          onOpenChange={(val) => { setAutoDialogOpen(val); if (!val) setAutoOrder(null); }}
          onStatusUpdate={refresh}
        >
          <span />
        </OrderDetailsDialog>
      )}

      {/* Search bar */}
      <div className="flex justify-end items-center mb-4 px-8">
        <OrderSearchInput value={search} onChange={setSearch} />
      </div>

      {effectiveLoading && filtered.length === 0 ? (
        <TableSkeleton tableHeadings={archiveHeadings} />
      ) : (
        <div className={effectiveLoading ? "opacity-50 pointer-events-none" : ""}>
          <OrderTable
            headings={archiveHeadings}
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