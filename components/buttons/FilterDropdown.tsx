"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

interface FilterOption {
  label: string
  value: string
  href?: string
}

interface FilterDropdownProps {
  label: string
  options?: FilterOption[]
  // NOTE: despite the name, this now acts as the current controlled value,
  // not just an initial one — the parent is the single source of truth.
  // Kept as `defaultValue` to avoid touching every existing call site;
  // consider renaming to `value` for clarity next time this is touched.
  defaultValue?: string
  onChange?: (value: string) => void
}

export default function FilterDropdown({
  label,
  options,
  defaultValue,
  onChange,
}: FilterDropdownProps) {
  const router = useRouter();

  // Fully controlled by the parent now — previously this was seeded into
  // local useState once on mount, which meant an external reset (e.g. the
  // parent clearing the filter after a new search) never updated what the
  // dropdown visually showed as selected.
  const selected = defaultValue;

  const handleSelect = (option: FilterOption) => {
    // Toggle off if the same option is clicked again — lets users clear the filter
    const isDeselecting = selected === option.value;
    const nextValue = isDeselecting ? undefined : option.value;

    onChange?.(nextValue ?? "");

    if (option.href && !onChange) {
      router.push(option.href);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
          {label}
          {selected && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#1EB4D4] text-white text-[10px] font-bold">
              1
            </span>
          )}
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="
          p-0
          overflow-hidden
          rounded-lg
          bg-white
          shadow-[0_20px_40px_rgba(0,0,0,0.25)]
          border-none
        "
      >
        {options?.map((option, index) => {
          const isSelected = selected === option.value

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`
                px-4 py-2 text-sm font-medium cursor-pointer
                rounded-none transition-colors
                ${isSelected
                  ? "bg-[#1EB4D4]! text-white!"
                  : "text-slate-600 hover:bg-[#1EB4D4]!  hover:text-white!"}
                ${index !== options.length - 1 ? "border-b border-slate-300/40" : ""}
              `}
            >
              {option.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}