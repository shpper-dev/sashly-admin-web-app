"use client";
import { PencilLine, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Order } from "@/lib/models/order.model";
import { TableHeading } from "@/lib/types";
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import { OrderTable } from "@/components/orders/OrderTable";
import { OrderSearchInput } from "@/components/orders/OrderSearchInput";
import OrderDetailsDialog from "@/components/orders/OrderDetailsDialog";
import CustomerCell from "@/components/orders/CustomerCell";
import FilterButton from "@/components/buttons/FilterDropdown";
import { useOrderSearch } from "@/hooks/useOrderSearch";
import { getOrderById } from "@/lib/firebase/order";
import { exportToCsv } from "@/lib/utils";

const archiveHeadings: TableHeading[] = [
  { id: "id",       title: "ID"      },
  { id: "placed",   title: "PLACED"  },
  { id: "customer", title: "CUSTOMER"},
  { id: "status",   title: "STATUS"  },
  { id: "total",    title: "TOTAL"   },
  { id: "actions",  title: ""        },
];

const ARCHIVE_STATUS_STYLE: Record<string, string> = {
  delivered: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
};

// Base archive scope: any order that is either delivered or cancelled.
const ARCHIVE_BASE_FILTER = "isDelivered = true OR isCancelled = true";

const ARCHIVE_PAGE_SIZE = 50;

const ArchiveStatusOptions = [
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

interface OrderArchiveProps {
  autoOpenOrderId?: string | null;
}

export default function OrderArchive({ autoOpenOrderId }: OrderArchiveProps) {
  const [statusFilter, setStatusFilter] = useState<string>(""); // "" = both

  const extraFilter =
    statusFilter === "delivered" ? "isDelivered = true" :
    statusFilter === "cancelled" ? "isCancelled = true" :
    ARCHIVE_BASE_FILTER;

  const {
    search, setSearch, searchLoading,
    searchResults, searchPage, searchHasNextPage,
    onSearchNext, onSearchPrev, refresh,
  } = useOrderSearch({
    extraFilter,
    pageSize: ARCHIVE_PAGE_SIZE,
  });

  
  const rows = [...searchResults].sort((a, b) => b.createdAt - a.createdAt);

  const [autoOrder, setAutoOrder] = useState<Order | null>(null);
  useEffect(() => {
    if (!autoOpenOrderId) return;
    const found = rows.find((o) => o.id === autoOpenOrderId);
    if (found) {
      setAutoOrder(found);
    } else {
      getOrderById(autoOpenOrderId).then(setAutoOrder).catch(console.error);
    }
  }, [autoOpenOrderId, rows]);

  const handleCsv = () => {
    exportToCsv(
      rows.map((o) => ({
        ID: o.id,
        UserName: o.userName,
        Email: o.userEmail,
        Phone: `'${o.userPhone}`,
        TotalPrice: o.totalPrice,
        Status: o.latestStatus?.status ?? "-",
        Items: o.items?.map((i) => `${i.name} x${i.count}`).join(" | ") ?? "-",
        Paid: o.isPaid ? "Yes" : "No",
        Delivered: o.isDelivered ? "Yes" : "No",
        Cancelled: o.isCancelled ? "Yes" : "No",
        ServiceType: o.serviceType,
        CreatedAt: new Date(o.createdAt).toLocaleString(),
      })),
      `archive-page${searchPage}-orders.csv`
    );
  };

  const renderCell = (heading: TableHeading, row: Order): React.ReactNode => {
    switch (heading.id) {
      case "id":
        return (
          <OrderDetailsDialog order={row} onStatusUpdate={refresh}>
            <span className="text-xs text-slate-500 hover:text-purple-600 cursor-pointer">
              #{row?.orderNumber ?? row.id.slice(6, 13)}
            </span>
          </OrderDetailsDialog>
        );

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
        return <CustomerCell userId={row.userId} userName={row.userName} userPhone={row.userPhone} />;

      case "status": {
        const style = ARCHIVE_STATUS_STYLE[row.latestStatus.status] ?? "bg-slate-100 text-slate-500";
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${style}`}>
            {row.latestStatus.status === "disputeResolved" ? "Dispute Resolved" : row.latestStatus.status}
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
      {autoOrder && (
        <OrderDetailsDialog
          order={autoOrder}
          open={true}
          onOpenChange={(open) => { if (!open) setAutoOrder(null); }}
          onStatusUpdate={refresh}
        >
          <span />
        </OrderDetailsDialog>
      )}

      <div className="flex justify-between items-center mb-4 px-8">
        <FilterButton
          label="Status"
          options={ArchiveStatusOptions}
          defaultValue={statusFilter || undefined}
          onChange={setStatusFilter}
        />
        <div className="flex items-center gap-3">
          <OrderSearchInput value={search} onChange={setSearch} />
          <button
            onClick={handleCsv}
            className="flex gap-2 items-center bg-white px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg shadow-sm cursor-pointer hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {searchLoading && rows.length === 0 ? (
        <TableSkeleton tableHeadings={archiveHeadings} />
      ) : (
        <div className={searchLoading ? "opacity-50 pointer-events-none" : ""}>
          <OrderTable
            headings={archiveHeadings}
            rows={rows}
            renderCell={renderCell}
            currentPage={searchPage}
            hasNextPage={searchHasNextPage}
            onNext={onSearchNext}
            onPrev={onSearchPrev}
            pageSize={ARCHIVE_PAGE_SIZE}
            loading={searchLoading}
          />
        </div>
      )}
    </div>
  );
}