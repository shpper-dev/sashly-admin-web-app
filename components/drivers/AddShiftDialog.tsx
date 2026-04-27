"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const days = ["M", "T", "W", "T", "F", "S", "S"];

export default function AddShiftDialog({
  children,
  onSuccess,
}: {
  children: React.ReactNode;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(["M0", "T1", "W2", "T3", "F4"]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleClose = () => {
    setSelectedDays(["M0", "T1", "W2", "T3", "F4"]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">

        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">Add New Shift</DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Shift Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
              Shift Name
            </label>
            <input
              type="text"
              placeholder="Morning Rush"
              className="w-full px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-sm focus:outline-none"
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Start Time
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                End Time
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-sm"
              />
            </div>
          </div>

          {/* Days */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
              Frequency Schedule
            </label>
            <div className="flex gap-2">
              {days.map((day, i) => {
                const key = day + i;
                const active = selectedDays.includes(key);
                return (
                  <button
                    key={i}
                    onClick={() => toggleDay(key)}
                    className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all ${
                      active ? "bg-purple-600 text-white shadow" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <DialogClose asChild>
            <Button variant="ghost" className="text-slate-500 hover:text-slate-700">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={() => { onSuccess?.(); handleClose(); }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Add Shift
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}