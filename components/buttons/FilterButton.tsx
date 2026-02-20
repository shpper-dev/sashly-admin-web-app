import { ChevronDown } from "lucide-react";

interface FilterButtonProps{
    label: string
}

export default function FilterButton({ label }: FilterButtonProps) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
      {label}
      <ChevronDown className="w-4 h-4" />
    </button>
  );
}