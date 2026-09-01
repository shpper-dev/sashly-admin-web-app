"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { DriverShiftDTO } from "@/lib/models/driver.model";
import { totalMs, formatHours, riyadhTimeFormatter } from "@/lib/shift-time";
import { LoadingState, EmptyState, ErrorState } from "@/components/states";
import DateRangePicker, { DateRangeChangePayload } from "@/components/metrics/DateRangePicker";
import { presetToRange } from "@/lib/date-presets";

interface DriverGroup {
  driverId: string;
  driverName: string | null;
  shifts: DriverShiftDTO[];
  totalMs: number;
}

export default function TimesheetPanel() {
  const [shifts, setShifts] = useState<DriverShiftDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [rangeLabel, setRangeLabel] = useState("Last 30 days");
  const [lastRange, setLastRange] = useState(() => presetToRange("30d"));
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const fetchShifts = useCallback(async (startMs: number, endMs: number) => {
    setLoading(true);
    setFetchError(false);
    setLastRange({ startMs, endMs });
    try {
      const params = new URLSearchParams({
        from: new Date(startMs).toISOString(),
        to: new Date(endMs).toISOString(),
      });
      const res = await fetch(`/api/shifts?${params.toString()}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data: { shifts: DriverShiftDTO[] } = await res.json();
      setShifts(data.shifts);
    } catch (e) {
      console.error("Failed to load timesheet:", e);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { startMs, endMs } = presetToRange("30d");
    fetchShifts(startMs, endMs);
  }, [fetchShifts]);

  const handleRangeChange = ({ startMs, endMs, label }: DateRangeChangePayload) => {
    setRangeLabel(label);
    fetchShifts(startMs, endMs);
  };

  const toggleExpanded = (driverId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(driverId) ? next.delete(driverId) : next.add(driverId);
      return next;
    });
  };

  // Group by driver — a driver may appear across many shift documents in range.
  const groups: DriverGroup[] = Object.values(
    shifts.reduce<Record<string, DriverGroup>>((acc, s) => {
      if (!acc[s.driverId]) {
        acc[s.driverId] = { driverId: s.driverId, driverName: s.driverName, shifts: [], totalMs: 0 };
      }
      acc[s.driverId].shifts.push(s);
      return acc;
    }, {})
  )
    .map((g) => ({
      ...g,
      totalMs: totalMs(g.shifts.map((s) => ({ isOpen: s.isOpen, durationMs: s.durationMs, startedAtMs: s.startedAtMs }))),
    }))
    .sort((a, b) => b.totalMs - a.totalMs);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{rangeLabel} · times shown in Asia/Riyadh</p>
        <DateRangePicker defaultPreset="30d" onRangeChange={handleRangeChange} />
      </div>

      {loading ? (
        <LoadingState title="Loading timesheet" />
      ) : fetchError ? (
        <ErrorState
          description="We couldn't load the timesheet."
          onRetry={() => fetchShifts(lastRange.startMs, lastRange.endMs)}
        />
      ) : groups.length === 0 ? (
        <EmptyState title="No shifts in this range" description="No driver activity was logged for this period." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wide w-8" />
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wide">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wide">Shifts</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wide">Total Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groups.map((g) => {
                const isOpen = expanded.has(g.driverId);
                return (
                  <Fragment key={g.driverId}>
                    <tr
                      onClick={() => toggleExpanded(g.driverId)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{g.driverName ?? "Unknown driver"}</td>
                      <td className="px-4 py-3 text-slate-500">{g.shifts.length}</td>
                      <td className="px-4 py-3 font-bold text-purple-600">{formatHours(g.totalMs)}</td>
                    </tr>
                    {isOpen &&
                      g.shifts.map((s) => (
                        <tr key={s.id} className="bg-slate-50/60">
                          <td className="px-4 py-2" />
                          <td className="px-4 py-2 text-xs text-slate-500" colSpan={3}>
                            <div className="flex items-center justify-between">
                              <span>
                                {riyadhTimeFormatter.format(new Date(s.startedAtMs))} →{" "}
                                {s.endedAtMs ? riyadhTimeFormatter.format(new Date(s.endedAtMs)) : "still open"}
                              </span>
                              <span className="flex items-center gap-2">
                                {s.endedReason === "auto_closed_stale" && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                    <AlertTriangle size={10} /> Estimated clock-out
                                  </span>
                                )}
                                <span className="font-semibold text-slate-700">
                                  {formatHours(
                                    totalMs([{ isOpen: s.isOpen, durationMs: s.durationMs, startedAtMs: s.startedAtMs }])
                                  )}
                                </span>
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}