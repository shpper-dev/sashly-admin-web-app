import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Eye, Pencil, Trash2, EllipsisVertical } from "lucide-react"

// ── Types
interface ActionsDropdownProps  {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// ── Component 
export function ActionsDropdown({ onView, onEdit, onDelete }: ActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <EllipsisVertical className="h-4 w-4 text-slate-500" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className=" rounded-2xl shadow-xl px-4 py-3"
      >
        <DropdownMenuItem
          onClick={onView}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Eye className="h-4 w-4 text-slate-500" />
          <span>View Details</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onEdit}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Pencil className="h-4 w-4 text-slate-500" />
          <span>Edit Customer</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onDelete}
          className="flex items-center gap-3 text-red-600 focus:text-red-600 cursor-pointer"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
          <span>Delete entry</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

