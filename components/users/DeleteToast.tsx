"use client";

import { Toast } from "@/lib/types";
import { useEffect, useState } from "react";
import { CircleAlert } from "lucide-react";

export function DeleteToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed top-8 right-8 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <DeleteToast key={toast.id} name={toast.name} />
      ))}
    </div>
  )
}

// ── Single toast ──────────────────────────────────────────────────────────────
function DeleteToast({ name }: { name: string }) {
  const [visible, setVisible] = useState(false)

  // Trigger enter animation on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <div
      className={`lg:w-100 w-60
        flex items-center gap-2
        px-6 py-3
        bg-red-50 border border-red-100
        rounded-lg
        shadow-[0px_8px_24px_rgba(0,0,0,0.12)]
        pointer-events-auto
        transition-all duration-300 ease-out
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
      `}
    >
    <CircleAlert className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />
    <span className="text-sm font-semibold text-red-600 tracking-wider ">
          {name}
        </span>
    </div>
  )
}