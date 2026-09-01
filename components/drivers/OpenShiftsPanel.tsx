"use client";

import { Radio, Phone } from "lucide-react";
import { useOpenShifts } from "@/hooks/useOpenShifts";
import { ShiftTimer } from "./ShiftTimer";
import { LoadingState, EmptyState, ErrorState } from "@/components/states";
import { riyadhTimeFormatter } from "@/lib/shift-time";

export default function OpenShiftsPanel() {
  const { shifts, loading, error } = useOpenShifts();

  if (loading) return <LoadingState title="Loading who's online" />;
  if (error) {
    return (
      <ErrorState
        description="Couldn't load live driver status. This view requires an admin to be signed in."
        // onSnapshot re-subscribes on its own; nothing extra to retry manually here
      />
    );
  }
  if (shifts.length === 0) {
    return <EmptyState title="No drivers online" description="Nobody has an open shift right now." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {shifts.map((shift) => (
        <div key={shift.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 text-sm">{shift.driverName ?? "Unknown driver"}</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <Radio size={10} /> ONLINE
            </span>
          </div>
          {shift.driverPhone && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Phone size={11} /> {shift.driverPhone}
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Online for</span>
            <span className="text-sm font-bold text-purple-600">
              <ShiftTimer startedAtMs={shift.startedAt.toMillis()} />
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Since {riyadhTimeFormatter.format(shift.startedAt.toDate())}
          </span>
        </div>
      ))}
    </div>
  );
}