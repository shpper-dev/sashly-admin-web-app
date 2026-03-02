"use client"

import { Toast } from "@/lib/types";
import { useState } from "react";
// ── useDeleteToast hook ───────────────────────────────────────────────────────
// Usage: const { toasts, showDeleteToast } = useDeleteToast()
// Call:  showDeleteToast("Abdullah Q")  →  toast appears for 3s then fades out

export function useDeleteToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showDeleteToast = (name: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, name }])
    // Auto-remove after 3.2s (leaves 200ms for fade-out animation)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }

  return { toasts, showDeleteToast }
}

