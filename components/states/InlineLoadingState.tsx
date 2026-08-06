import { Loader2 } from "lucide-react";

interface InlineLoadingStateProps {
  label?: string;
  className?: string;
}

export default function InlineLoadingState({
  label = "Loading…",
  className = "",
}: InlineLoadingStateProps) {
  return (
    <div className={`flex items-center gap-2 px-4 py-3 text-xs text-slate-400 ${className}`}>
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      {label}
    </div>
  );
}