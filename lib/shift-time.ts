// Riyadh has no DST, so a fixed +3 offset is safe year-round.
const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000;

export function riyadhDayRange(date: Date) {
  const shifted = new Date(date.getTime() + RIYADH_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  const start = new Date(shifted.getTime() - RIYADH_OFFSET_MS);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { start, end };
}

export function riyadhDayKey(ms: number) {
  return new Date(ms + RIYADH_OFFSET_MS).toISOString().slice(0, 10);
}

export function totalMs(
  shifts: { isOpen: boolean; durationMs: number | null; startedAtMs: number }[]
) {
  return shifts.reduce((sum, s) => {
    if (!s.isOpen) return sum + (s.durationMs ?? 0);
    return sum + (Date.now() - s.startedAtMs);
  }, 0);
}

export function formatHours(ms: number) {
  const mins = Math.round(ms / 60000);
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
}

export const riyadhTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Riyadh",
  dateStyle: "medium",
  timeStyle: "short",
});