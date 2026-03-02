"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface FilterOption {
  label: string
  value: string
  href?: string
}

interface FilterDropdownProps {
  label: string
  options?: FilterOption[]
  defaultValue?: string
  onChange?: (value: string) => void
}

export default function FilterDropdown({
  label,
  options,
  defaultValue,
  onChange,
}: FilterDropdownProps) {
  const [selected, setSelected] = useState(defaultValue);
  const router = useRouter();

  const handleSelect = (option: FilterOption) => {
    setSelected(option.value);
    onChange?.(option.value);
    if (option.href) {
      router.push(option.href);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          {label}
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
                rounded-none
                ${isSelected
                  ? "bg-[#1EB4D4] text-white"
                  : "text-slate-600 hover:bg-[#1EB4D4] hover:text-white"}
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