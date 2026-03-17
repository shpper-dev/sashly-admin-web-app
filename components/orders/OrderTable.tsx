import { Order } from "@/lib/models/order.model";
import { TableHeading } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface OrderTableProps {
  headings: TableHeading[];
  rows: Order[];
  renderCell: (heading: TableHeading, row: Order) => React.ReactNode;
  // pagination
  currentPage: number;
  hasNextPage: boolean;
  onNext: () => void;
  onPrev: () => void;
  pageSize: number;
  loading?: boolean;
}

export function OrderTable({ headings, rows, renderCell, currentPage, hasNextPage, onNext, onPrev, pageSize, loading }: OrderTableProps) {
  const rangeStart = (currentPage - 1) * pageSize + 1;
  const rangeEnd   = (currentPage - 1) * pageSize + rows.length;

  return (
    <div className="bg-white border overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200">
          <tr>
            {headings.map((h) => (
              <th key={h.id} className="text-left first:pl-4 px-3 py-3 text-sm font-semibold text-slate-500 whitespace-nowrap">
                {h.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headings.length} className="px-6 py-12 text-center text-sm text-slate-400">
                No orders found
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                {headings.map((h) => (
                  <td key={h.id} className="first:pl-4 px-3 py-4 text-sm text-slate-700">
                    {renderCell(h, row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
        <tfoot className="bg-slate-200/50">
          <tr>
            <td colSpan={headings.length} className="px-6 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Showing <b>{rangeStart}</b>–<b>{rangeEnd}</b> orders
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onPrev}
                    disabled={currentPage <= 1 || loading}
                    className="p-1 rounded hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 text-slate-700" />
                  </button>
                  <span className="text-sm text-slate-600 px-1">Page {currentPage}</span>
                  <button
                    onClick={onNext}
                    disabled={!hasNextPage || loading}
                    className="p-1 rounded hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-slate-700" />
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}