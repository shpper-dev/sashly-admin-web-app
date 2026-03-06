"use client"

import { Printer, Pencil, TextSearch, Pencil as PencilIcon, X, SquarePen, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface OrderItem {
  name: string
  qty: number
}

interface Order {
  id: string
  customer: string
  email: string
  phone: string
  placed: string
  ready: string
  items: OrderItem[]
  pickedBy: string
  cleanedBy: string
  notes?: string
  status: string
  payment: string
  amount: number
}

type SearchFilters = {
  name: string
  phone: string
  email: string
  route: string
  rack: string
  customerGroup: string
  orderId: string
  summary: string
  notes: string
  placedAfter: string
  placedBefore: string
  payment: string
  paidAfter: string
  paidBefore: string
  cleanedAfter: string
  cleanedBefore: string
}

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

interface Props {
  orders: Order[]
  activeFilters: SearchFilters
  onEditSearch: () => void
  onRemoveFilter: (field: keyof SearchFilters) => void
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

function renderCellContent(col: string, order: Order) {
  switch (col) {
    case "id":
      return <span className="font-semibold text-slate-800">#{order.id}</span>

    case "customer":
      return (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800">{order.customer}</span>
          <span className="text-slate-500">{order.email}</span>
          <span className="text-slate-500">{order.phone}</span>
        </div>
      )

    case "timeline":
      return (
        <div className="flex flex-col">
          <span className="text-slate-400">PLACED</span>
          <span className="text-slate-700">{order.placed}</span>
          <span className="text-blue-500 font-semibold">READY {order.ready}</span>
        </div>
      )

    case "items":
      return (
        <div className="flex flex-col gap-1 px-3 bg-slate-50 py-1 rounded-md border border-slate-200">
          {order.items.slice(0, 3).map((item, i) => (
            <div key={i} className="flex justify-between">
              <span>{item.name}</span>
              <span>x{item.qty}</span>
            </div>
          ))}
          {order.items.length > 3 && (
            <span className="text-blue-500 text-[11px] cursor-pointer hover:underline">
              View All {order.items.length} Items
            </span>
          )}
        </div>
      )

    case "staff":
      return (
        <div className="flex flex-col gap-1 text-[11px]">
          <span><b>PICKED:</b> {order.pickedBy}</span>
          <span><b>CLEANED:</b> {order.cleanedBy || '—'}</span>
          {order.notes && (
            <span className="text-slate-400">NOTES: {order.notes}</span>
          )}
        </div>
      )

    case "status":
      return (
        <span className={`px-2 py-1 text-[10px] font-semibold rounded-full ${
          order.status === 'DELIVERED'
            ? 'bg-green-100 text-green-700'
            : order.status === 'PROCESSING'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {order.status}
        </span>
      )

    case "payment":
      return (
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-slate-800">SAR {order.amount}</span>
          <span className="text-[11px] text-slate-500">{order.payment}</span>
          <div className="flex gap-2">
            <button className="p-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors">
              <Printer size={14} />
            </button>
            <button className="p-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors">
              <Pencil size={14} />
            </button>
          </div>
        </div>
      )

    default:
      return null
  }
}

export default function SearchResults({ orders, activeFilters, onEditSearch, onRemoveFilter }: Props) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalRows = orders.length
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE))
  const paginatedOrders = orders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const rowStart = totalRows === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const rowEnd = Math.min(currentPage * PAGE_SIZE, totalRows)

  const activePills = (Object.entries(activeFilters) as [keyof SearchFilters, string][]).filter(
    ([_, value]) => value !== ''
  )

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (currentPage <= 3) return [1, 2, 3, '...', totalPages]
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages]
    return [1, '...', currentPage, '...', totalPages]
  }

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
      {orders.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-2 py-10 bg-white rounded-xl border border-slate-200'>
          <div className='bg-red-50 rounded-full p-5'>
            <TextSearch className='h-5 w-5 text-red-400' strokeWidth={3} />
          </div>
          <h2 className='text-slate-900 text-sm font-semibold'>No Results Found</h2>
          <p className='text-slate-500 text-xs text-center max-w-xs'>
            No orders matched your search criteria. Try adjusting your filters and searching again.
          </p>
        </div>
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
                      {renderCellContent(col.key, order)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-row justify-between items-center px-4 border-t border-slate-200 bg-white h-16.25">

                    {/* Left: row count */}
                    <span className="text-[11px] text-slate-500 shrink-0">
                      Showing{' '}
                      <span className="font-semibold text-slate-700">{rowStart}–{rowEnd}</span>
                      {' '}of{' '}
                      <span className="font-semibold text-slate-700">{totalRows}</span>
                      {' '}results
                    </span>

                    {/* Right: pagination */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"
                      >
                        <ChevronLeft size={14} />
                      </button>

                      {getPageNumbers().map((page, i) =>
                        page === '...' ? (
                          <span key={`ellipsis-${i}`} className="px-1.5 text-slate-400 text-[11px] select-none">…</span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(Number(page))}
                            className={`w-7 h-7 rounded-md text-[11px] font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-[#02d0ff] text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
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