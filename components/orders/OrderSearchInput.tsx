import { Search } from "lucide-react";

interface OrderSearchInputProps { value: string; onChange: (v: string) => void; }

export function OrderSearchInput({ value, onChange }: OrderSearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search anything..."
        className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
      />
    </div>
  );
}