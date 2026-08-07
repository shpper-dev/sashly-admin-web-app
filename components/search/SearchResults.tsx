"use client"

import { SearchFilters } from "@/app/(admin)/search/page"
import { Order } from "@/lib/models/order.model"
import { Printer, Pencil, TextSearch, Pencil as PencilIcon, X, SquarePen, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import OrderDetailsDialog from "@/components/orders/OrderDetailsDialog"
import OrderInvoiceDialog from "@/components/orders/OrderInvoiceDialog"
import { fmtDate } from "@/lib/utils"
import { EmptyState, LoadingState } from "../states"

const filterLabels: Record<keyof SearchFilters, string> = {
  name: "Name",
  phone: "Phone",
  email: "Email",
  route: "Route #",
  rack: "Rack #",
  customerGroup: "Customer Group",
  orderId: "Order ID",
  summary: "Summary",
  notes: "Notes",
  placedAfter: "Placed After",
  placedBefore: "Placed Before",
  payment: "Payment",
  paidAfter: "Paid After",
  paidBefore: "Paid Before",
  cleanedAfter: "Cleaned After",
  cleanedBefore: "Cleaned Before",
} 

const STATUS_CONFIG: Record<string, { label: string; color: string;}> = {
  confirmed:      { label: "Confirmed",        color: "text-blue-600 bg-blue-50"   },
  pickedUp:       { label: "Picked Up",        color: "text-indigo-600 bg-indigo-50" },
  sorting:        { label: "Sorting",          color: "text-yellow-600 bg-yellow-50" },
  detailing:      { label: "detailing",        color: "text-pink-600 bg-pink-50"   },
  cleaning:       { label: "Cleaning",         color: "text-orange-600 bg-orange-50" },
  readyToDeliver: { label: "Ready to Deliver", color: "text-purple-600 bg-purple-50" },
  delivered:      { label: "Delivered",        color: "text-green-600 bg-green-50"  },
  disputed:       { label: "Disputed",         color: "text-red-500 bg-red-50"  },
  disputeResolved:{ label: "Dispute Resolved", color: "text-green-500 bg-green-50"  },
  cancelled:      { label: "Cancelled",        color: "text-red-600 bg-red-50"    },
};

interface SearchResultsProps {
  orders: Order[]
  activeFilters: SearchFilters
  onEditSearch: () => void
  onRemoveFilter: (field: keyof SearchFilters) => void
 
  onStatusUpdate: () => void

  currentPage: number
  hasNext: boolean
  onPageChange: (page: number) => void
  loading?: boolean
}

const PAGE_SIZE = 10

const columns: { key: string; label: string }[] = [
  { key: "id", label: "ID" },
  { key: "customer", label: "Customer & Contact" },
  { key: "timeline", label: "Timeline" },
  { key: "items", label: "Order Items" },
  { key: "staff", label: "Staff Log & Notes" },
  { key: "status", label: "Status" },
  { key: "payment", label: "Payment" },
]

function renderCellContent(
  col: string,
  order: Order,
  onStatusUpdate: () => void,
  isItemsExpanded: boolean,
  onToggleItems: () => void,
) {
  switch (col) {
    case "id":
      return <span className="font-semibold text-slate-800">#{order.id.slice(-13)}</span>

    case "customer":
      return (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800">{order.userName}</span>
          <span className="text-slate-500">{order.userEmail}</span>
          <span className="text-slate-500">{order.userPhone}</span>
        </div>
      )

    case "timeline":
      return (
        <div className="flex flex-col">
          <span className="text-slate-400">PLACED</span>
          <span className="text-slate-700">{fmtDate(order.createdAt)}</span>
          <span className="text-blue-500 font-semibold">READY {fmtDate(order.expectedDeliveryTime)}</span>
        </div>
      )

    case "items": {
      const visibleCount = 3;
      const itemsToShow = isItemsExpanded ? order.items : order.items.slice(0, visibleCount);
      const hiddenCount = order.items.length - visibleCount;

      return (
        <div className="flex flex-col gap-1 px-3 bg-slate-50 py-1 rounded-md border border-slate-200">
          {itemsToShow.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span>{item.name}</span>
              <span>x{item.count}</span>
            </div>
          ))}
          {!isItemsExpanded && hiddenCount > 0 && (
            <button
              onClick={onToggleItems}
              className="text-blue-500 text-[11px] cursor-pointer hover:underline text-left"
            >
              View All {order.items.length} Items
            </button>
          )}
          {isItemsExpanded && order.items.length > visibleCount && (
            <button
              onClick={onToggleItems}
              className="text-slate-500 text-[11px] cursor-pointer hover:underline text-left"
            >
              Show less
            </button>
          )}
        </div>
      )
    }

    case "staff":
      return (
        <div className="flex flex-col gap-1 text-[11px]">
          {/* <span><b>PICKED:</b> {order.pickedB}</span>
          <span><b>CLEANED:</b> {order.cleanedBy || '—'}</span> */}
          {/* {order.notes && (
            <span className="text-slate-400">NOTES: {order.notes}</span>
          )} */}
        </div>
      )

    case "status":
      return (
        <span className={`px-2 py-1 text-[10px] font-semibold rounded-full ${STATUS_CONFIG[order.latestStatus?.status]?.color ?? "text-slate-500 bg-slate-50"}`}>
          {STATUS_CONFIG[order.latestStatus?.status]?.label ?? order.latestStatus.status}
        </span>
      )

    case "payment":
      return (
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-slate-800">SAR {order.totalPrice}</span>
          <span className="text-[11px] text-slate-500">{order.isPaid ? "Paid" : "Unpaid"}</span>
          <div className="flex gap-2">
            {/* Print invoice  */}
            <OrderInvoiceDialog order={order}>
              <button
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                aria-label={`Print invoice for order ${order.orderNumber ?? order.id}`}
              >
                <Printer size={14} />
              </button>
            </OrderInvoiceDialog>

            {/* Edit */}
            <OrderDetailsDialog order={order} onStatusUpdate={onStatusUpdate}>
              <button
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                aria-label={`Edit order ${order.orderNumber ?? order.id}`}
              >
                <Pencil size={14} />
              </button>
            </OrderDetailsDialog>
          </div>
        </div>
      )

    default:
      return null
  }
}

export default function SearchResults({ orders, activeFilters, onEditSearch, onRemoveFilter, onStatusUpdate, currentPage, hasNext, onPageChange, loading }: SearchResultsProps) {
  const paginatedOrders = orders;

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const toggleItems = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activePills = (Object.entries(activeFilters) as [keyof SearchFilters, string][]).filter(
    ([_, value]) => value !== ''
  );

  return (
    <section className="px-8 flex flex-col gap-3">

      {/* Filter Pills Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-4 rounded-md border border-slate-200 shadow">
        <div className="flex items-center gap-2 flex-wrap">
          {activePills.length > 0 ? (
            <>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Active Filters:</span>
              {activePills.map(([field, value]) => (
                <span
                  key={field}
                  className="inline-flex items-center gap-1.5 px-1.5 py-1 rounded-full bg-slate-50 border border-slate-300 text-slate-900 text-[11px] font-bold"
                >
                  <span >{filterLabels[field]}:</span>
                  <span>{value}</span>
                  <button
                    onClick={() => onRemoveFilter(field)}
                    className="ml-0.5 hover:text-[#007a99] transition-colors"
                    aria-label={`Remove ${filterLabels[field]} filter`}
                  >
                    <X size={11} strokeWidth={2.5} />
                  </button>
                </span>
              ))}
            </>
          ) : (
            <span className="text-[11px] text-slate-400">No active filters</span>
          )}
        </div>

        <button
          onClick={onEditSearch}
          className="flex items-center gap-1.5 text-cyan-500 hover:text-cyan-600 text-xs font-medium transition-colors shrink-0 cursor-pointer"
        >
          <SquarePen size={13} strokeWidth={2} />
          Edit Search
        </button>
      </div>

      {/* No results state */}
      {loading ? (
         <LoadingState title="Searching orders" description="Applying your filters…" />
       ) : orders.length === 0 ? (
         <EmptyState
           icon={TextSearch}
           title="No results found"
           description="No orders matched your search criteria. Try adjusting your filters and searching again."
         />
       ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs border-collapse">

            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {columns.map(col => (
                  <th
                    key={col.key}
                    className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="border-b last:border-b-0 align-top">
                  {columns.map(col => (
                    <td key={col.key} className="px-6 py-4">
                      {renderCellContent(
                        col.key,
                        order,
                        onStatusUpdate,
                        !!expandedItems[order.id],
                        () => toggleItems(order.id),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-row justify-end items-center px-4 border-t border-slate-200 bg-white h-16.25">

                    {/* Right: pagination */}
                    <div className="flex items-center  gap-1">
                      <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"
                      >
                        <ChevronLeft size={14} />
                      </button>

                      <span className="text-[11px] text-white">
                       <span className="font-semibold px-2.5 py-1 rounded-sm bg-[#02d0ff]">{currentPage}</span>
                      </span>

                      <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={!hasNext || loading}
                        className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>

                  </div>
                </td>
              </tr>
            </tfoot>

          </table>
        </div>
      )}
    </section>
  )
}