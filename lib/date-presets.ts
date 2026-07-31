export type Preset = "today" | "3d" | "7d" | "30d" | "90d" | "365d" | "custom";

export const PRESETS: { key: Preset; label: string }[] = [
  { key: "today",  label: "Today"        },
  { key: "3d",     label: "Last 3 days"  },
  { key: "7d",     label: "Last 7 days"  },
  { key: "30d",    label: "Last 30 days" },
  { key: "90d",    label: "Last 90 days" },
  { key: "365d",   label: "Last year"    },
  { key: "custom", label: "Custom range" },
];

export function presetToRange(preset: Preset): { startMs: number; endMs: number } {
  const now = Date.now();

  // "Today" means the calendar day so far — midnight local time through now 
  if (preset === "today") {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return { startMs: startOfToday.getTime(), endMs: now };
  }

  if (preset === "custom") return { startMs: now - 30 * 86400000, endMs: now };

  // Covers "3d", "7d", "30d", "90d", "365d" 
  return { startMs: now - parseInt(preset) * 86400000, endMs: now };
}

export function getPresetLabel(
  preset: Preset,
  customStart?: string,
  customEnd?: string
): string {
  if (preset === "custom" && customStart && customEnd) {
    return `${customStart} → ${customEnd}`;
  }
  return PRESETS.find((p) => p.key === preset)?.label ?? "Last 30 days";
}

export function resolveRange(
  preset: Preset,
  customStart?: string,
  customEnd?: string
): { startMs: number; endMs: number } {
  if (preset === "custom" && customStart && customEnd) {
    return {
      startMs: new Date(customStart).getTime(),
      endMs:   new Date(customEnd).getTime() + 86400000 - 1, 
    };
  }
  return presetToRange(preset);
}