"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { DriverShiftDTO } from "@/lib/models/driver.model";
import { totalMs, formatHours, riyadhTimeFormatter } from "@/lib/shift-time";
import { LoadingState, EmptyState, ErrorState } from "@/components/states";

interface DriversShiftHistoryProps {
  driverId: string;
}

export default function DriversShiftHistory({ driverId }: DriversShiftHistoryProps) {
  const [shifts, setShifts] = useState<DriverShiftDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch(`/api/shifts/driver/${driverId}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data: { shifts: DriverShiftDTO[] } = await res.json();
      setShifts(data.shifts);
    } catch (e) {
      console.error(`Failed to load shift history for driver ${driverId}:`, e);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [driverId]);

  if (loading) return <LoadingState title="Loading shift history" />;
  if (fetchError) {
    return <ErrorState description="Couldn't load this driver's shift history." onRetry={fetchHistory} />;
  }
  if (shifts.length === 0) {
    return <EmptyState title="No shifts recorded" description="This driver hasn't gone online yet." />;
  }

  const overallTotal = totalMs(
    shifts.map((s) => ({ isOpen: s.isOpen, durationMs: s.durationMs, startedAtMs: s.startedAtMs }))
  );

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-purple-500" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total (last 50 shifts)</span>
        </div>
        <span className="text-sm font-bold text-purple-600">{formatHours(overallTotal)}</span>
      </div>

      <div className="flex flex-col gap-2">
        {shifts.map((s) => (
          <div key={s.id} className="flex items-center justify-between border border-slate-100 rounded-lg px-4 py-3 bg-white">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-slate-700">
                {riyadhTimeFormatter.format(new Date(s.startedAtMs))}
              </span>
              <span className="text-[11px] text-slate-400">
                {s.endedAtMs ? `Ended ${riyadhTimeFormatter.format(new Date(s.endedAtMs))}` : "Still online"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {s.endedReason === "auto_closed_stale" && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  <AlertTriangle size={10} /> Estimated
                </span>
              )}
              {s.isOpen && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  ONLINE
                </span>
              )}
              <span className="text-sm font-bold text-slate-800">
                {formatHours(totalMs([{ isOpen: s.isOpen, durationMs: s.durationMs, startedAtMs: s.startedAtMs }]))}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}