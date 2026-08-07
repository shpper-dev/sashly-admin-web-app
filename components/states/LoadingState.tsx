import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function LoadingState({
  title = "Loading…",
  description,
  className = "",
}: LoadingStateProps) {
  return (
    <div className={`flex h-60 w-full flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white ${className}`}>
      <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        {description && (
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        )}
      </div>
    </div>
  );
}