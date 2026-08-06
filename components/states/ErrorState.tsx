import { AlertTriangle, RotateCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this data. Please try again.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`flex h-60 w-full flex-col items-center justify-center gap-1 rounded-xl border border-red-100 bg-red-50/40 ${className}`}>
      <AlertTriangle className="mb-3 h-8 w-8 text-red-400" strokeWidth={1.75} />
      <h3 className="text-sm font-semibold text-red-600">{title}</h3>
      <p className="max-w-sm text-center text-xs text-red-400">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-600"
        >
          <RotateCw className="h-3 w-3" /> Retry
        </button>
      )}
    </div>
  );
}