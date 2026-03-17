
"use client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useState } from "react";

interface Props {
  children: React.ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;  // the firebase call
  onSuccess?: () => void;          // refetch
}

export default function ConfirmActionDialog({ children, title, description, confirmLabel, onConfirm, onSuccess }: Props) {
  const [open, setOpen]     = useState(false);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onConfirm();
      setOpen(false);
      onSuccess?.();
    } catch (e) {
      console.error(`${title} failed:`, e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl p-6">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-slate-700">{title}</DialogTitle>
          <DialogClose><X className="w-5 h-5 text-slate-400 cursor-pointer" /></DialogClose>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <p className="text-sm text-slate-600">{description}</p>
          <div className="flex gap-3">
            <DialogClose className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition">
              Cancel
            </DialogClose>
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[#02D0FF] text-white text-sm font-semibold hover:bg-blue-400 disabled:opacity-50 transition"
            >
              {saving ? "..." : confirmLabel}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}