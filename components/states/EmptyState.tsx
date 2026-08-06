import { LucideIcon, SearchX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title = "Nothing here yet",
  description = "There's no data to display right now.",
  icon: Icon = SearchX,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex h-60 w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 bg-white ${className}`}>
      <Icon className="mb-3 h-9 w-9 text-slate-300" strokeWidth={1.5} />
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <p className="max-w-sm text-center text-xs text-slate-400">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}