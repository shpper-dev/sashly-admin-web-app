import { TableHeading } from "@/lib/types";
import { Loader2 } from "lucide-react";


interface TableSkeletonProps {
  tableHeadings: TableHeading[];
  rowCount?: number; // Number of skeleton rows to show
}

export default function TableSkeleton({ 
  tableHeadings, 
  rowCount = 5 
}: TableSkeletonProps) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full">
        {/* Table Head */}
        <thead className="bg-slate-200/50">
          <tr>
            {tableHeadings.map((heading) => (
              <th
                key={heading.id}
                className="px-6 py-3 text-left text-sm text-slate-700 first:rounded-tl-lg last:rounded-tr-lg"
              >
                {heading.title}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body - Loading State */}
        <tbody className="bg-white">
          {/* Centered Loading Spinner Row */}
          <tr>
            <td
              colSpan={tableHeadings.length}
              className="py-20 text-center"
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-10 w-10 text-slate-500 animate-spin" />
                <p className="text-sm text-slate-500">Loading data...</p>
              </div>
            </td>
          </tr>
        </tbody>

        {/* Table Footer */}
        <tfoot className="bg-slate-200/50">
          <tr>
            <td
              colSpan={tableHeadings.length}
              className="px-6 py-3 text-center text-sm text-slate-600 first:rounded-bl-lg last:rounded-br-lg"
            >
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}