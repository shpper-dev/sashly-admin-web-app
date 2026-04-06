"use client";

import { Toast } from "@/lib/types";
import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from "lucide-react";
import { useState, useEffect } from "react";

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: number) => void;
}) {
  return (
    <div className="fixed top-8 right-8 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}


const styles = {
  success: "bg-green-50 border-green-200 text-green-600",
  error: "bg-red-50 border-red-200 text-red-600",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-600",
  info: "bg-blue-50 border-blue-200 text-blue-600",
};

const icons = {
  success: <CheckCircle2 className="h-4 w-4" />,
  error: <CircleAlert className="h-4 w-4" />,
  warning: <TriangleAlert className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
};

export function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: number) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      className={`lg:w-96 w-64 flex items-center justify-between gap-3 px-4 py-3 rounded-lg border shadow-lg
      transition-all duration-300 ease-out
      ${styles[toast.type]}
      ${
        toast.leaving
          ? "opacity-0 translate-x-8"
          : visible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-8"
      }
      `}
    >
      <div className="flex items-center gap-2">
        {icons[toast.type]}
        <span className="text-sm font-semibold tracking-wide">
          {toast.message}
        </span>
      </div>

      {/* Close button */}
      <button onClick={() => onRemove(toast.id)}>
        <X className="h-4 w-4 opacity-60 hover:opacity-100" />
      </button>
    </div>
  );
}