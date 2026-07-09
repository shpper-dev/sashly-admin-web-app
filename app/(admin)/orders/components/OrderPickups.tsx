"use client";
import { FileText, PencilLine, Printer, ReceiptText } from "lucide-react";
import React, { useState } from "react";
import { Order, OrderStatuses } from "@/lib/models/order.model";
import { TableHeading } from "@/lib/types";
import { OrderTabProps } from "./OrdersPageClient";
import FilterButton from "@/components/buttons/FilterDropdown";
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import Link from "next/link";
import { OrderTable } from "@/components/orders/OrderTable";
import { OrderSearchInput } from "@/components/orders/OrderSearchInput";
import UpdateOrderDialog from "@/components/orders/UpdateOrderDialog";
import CustomerCell from "@/components/orders/CustomerCell";
import { useToast } from "@/lib/providers/ToastProvider";

const orderHeadings: TableHeading[] = [
  { id: "id",           title: "ID"           },
  { id: "placed",       title: "PLACED"       },
  { id: "customer",     title: "CUSTOMER"     },
  // { id: "route",        title: "ROUTE #"      },
  { id: "contact",      title: "CONTACT"      },
  { id: "order_details",title: "ORDER DETAILS"},
  { id: "pcs",          title: "PCS"          },
  { id: "notes",        title: "NOTES"        },
  { id: "paid",         title: "PAID"         },
  { id: "total",        title: "TOTAL"        },
  { id: "actions",      title: ""             },
];

export default function OrderPickups({ orders, loading, onStatusUpdate, currentPage, hasNextPage, onNext, onPrev, pageSize }: OrderTabProps) {
  const [search, setSearch] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const { showToast } = useToast();

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
        return <span className="text-xs font-mono text-slate-500">#{row?.orderNumber ?? row.id.slice(6,13)}</span>;

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
      // case "customer":
      //   return (
      //     <div className="flex flex-col gap-0.5">
      //       <span className="text-xs font-semibold text-slate-800">{row.userName}</span>
      //       <span className="text-[10px] text-slate-400">{row.userPhone}</span>
      //     </div>
      //   );

      // route is not on Order model yet - add when updated
      // case "route":
      //   return <span className="text-slate-500 text-xs">—</span>;

      case "contact":
        return (
          <div className="flex flex-col text-xs gap-1">
            <span className="font-semibold text-slate-400">PICKUP</span>
            <span className="text-slate-600">{row.deliveryAddress?.formattedAddress ?? "—"}</span>
            <span className="text-slate-600">{row.userEmail}</span>
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

      case "notes":
        return (
          <button className="flex w-full items-center justify-center text-[#02D0FF]">
            <FileText className="h-5 w-5" />
          </button>
        );

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
            <div className="text-[#02D0FF] text-xs font-bold">SAR</div>
            <div className="font-semibold text-slate-800">{row.totalPrice.toFixed(2)}</div>
          </div>
        );

      case "actions":
        return (
          <div className="flex items-center gap-0.5 justify-end">
              <UpdateOrderDialog
              orderId={row.id}
              currentStatus={row.latestStatus.status as OrderStatuses}
              onSuccess={onStatusUpdate}>
              <button className="px-2 py-1.5 text-xs flex items-center gap-2 font-medium bg-blue-200/50 text-[#02D0FF] rounded-md hover:bg-blue-200 transition-colors cursor-pointer">
              <PencilLine className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              PICKUP
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
          <FilterButton label="Filter Route(s)" />
          <Link href="orders/delivery-manifest" className="flex items-center gap-2 px-4 py-2 border border-purple-600 rounded-lg bg-white text-sm font-medium text-purple-600 hover:bg-slate-50 transition-colors">
            <Printer className="h-4 w-4" /> Delivery Printout
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#02D0FF] rounded-lg bg-white text-sm font-medium text-[#02D0FF] hover:bg-slate-50 transition-colors">
            <ReceiptText className="h-4 w-4" /> Print Receipts
          </button>
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