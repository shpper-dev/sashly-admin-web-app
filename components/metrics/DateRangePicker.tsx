// @/components/ui/DateRangePicker.tsx
"use client";
import { useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Preset,
  PRESETS,
  getPresetLabel,
  resolveRange,
} from "@/lib/date-presets";

export interface DateRangeChangePayload {
  startMs:     number;
  endMs:       number;
  label:       string;
  preset:      Preset;
  customStart: string;
  customEnd:   string;
}

interface DateRangePickerProps {
  /** Initial preset shown on mount. Defaults to "30d". */
  defaultPreset?: Preset;
  /** Called immediately on mount and whenever the range changes. */
  onRangeChange: (payload: DateRangeChangePayload) => void;
  /** Accent colour class for the active preset and Apply button. Defaults to indigo. */
  accentClass?: string;
}

export default function DateRangePicker({
  defaultPreset = "30d",
  onRangeChange,
  accentClass = "indigo",
}: DateRangePickerProps) {
  const [pickerOpen,   setPickerOpen]   = useState(false);
  const [preset,       setPreset]       = useState<Preset>(defaultPreset);
  const [customStart,  setCustomStart]  = useState("");
  const [customEnd,    setCustomEnd]    = useState("");

  const currentLabel = getPresetLabel(preset, customStart, customEnd);

  // Shared emit helper
  const emit = (
    p: Preset,
    cStart: string = customStart,
    cEnd:   string = customEnd
  ) => {
    const { startMs, endMs } = resolveRange(p, cStart, cEnd);
    onRangeChange({
      startMs,
      endMs,
      label:       getPresetLabel(p, cStart, cEnd),
      preset:      p,
      customStart: cStart,
      customEnd:   cEnd,
    });
  };

  const handlePresetSelect = (p: Preset) => {
    setPreset(p);
    if (p !== "custom") {
      setPickerOpen(false);
      emit(p);
    }
    // "custom" keeps the dropdown open so the user can fill in dates
  };

  const handleApply = () => {
    if (!customStart || !customEnd) return;
    setPickerOpen(false);
    emit("custom", customStart, customEnd);
  };

  // Tailwind doesn't support dynamic class interpolation — map accent to static strings
  const ACCENT: Record<string, { active: string; ring: string; btn: string }> = {
    indigo: {
      active: "text-indigo-600 bg-indigo-50 focus:bg-indigo-50 focus:text-indigo-600",
      ring:   "focus:ring-indigo-400",
      btn:    "bg-indigo-600 hover:bg-indigo-700",
    },
    purple: {
      active: "text-purple-600 bg-purple-50 focus:bg-purple-50 focus:text-purple-600",
      ring:   "focus:ring-purple-400",
      btn:    "bg-purple-600 hover:bg-purple-700",
    },
  };
  const theme = ACCENT[accentClass] ?? ACCENT.indigo;

  return (
    <DropdownMenu open={pickerOpen} onOpenChange={setPickerOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 transition outline-none">
          <CalendarDays size={15} className="text-slate-400" />
          {currentLabel}
          <ChevronDown size={14} className="text-slate-400" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[220px] rounded-xl p-1">
        {/* Preset options */}
        {PRESETS.map((p) => (
          <DropdownMenuItem
            key={p.key}
            onSelect={(e) => {
              if (p.key === "custom") e.preventDefault(); // keep dropdown open
              handlePresetSelect(p.key);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-medium cursor-pointer ${
              preset === p.key ? theme.active : "text-slate-600"
            }`}
          >
            {p.label}
          </DropdownMenuItem>
        ))}

        {/* Custom date inputs — shown when "Custom range" is active */}
        {preset === "custom" && (
          <>
            <DropdownMenuSeparator className="my-1" />
            <div
              className="px-3 pb-2 pt-1 flex flex-col gap-2"
              onPointerDown={(e) => e.stopPropagation()} // prevent dropdown close on input interaction
            >
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  From
                </label>
                <input
                  type="date"
                  value={customStart}
                  max={customEnd || undefined}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className={`border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 ${theme.ring}`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  To
                </label>
                <input
                  type="date"
                  value={customEnd}
                  min={customStart || undefined}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className={`border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 ${theme.ring}`}
                />
              </div>
              <button
                onClick={handleApply}
                disabled={!customStart || !customEnd}
                className={`mt-0.5 w-full text-white text-xs font-bold py-2 rounded-lg transition disabled:opacity-40 ${theme.btn}`}
              >
                Apply Range
              </button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}