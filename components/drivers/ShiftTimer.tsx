"use client";

import { useEffect, useState } from "react";
import { formatHours } from "@/lib/shift-time";

export function ShiftTimer({ startedAtMs }: { startedAtMs: number }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  return <span>{formatHours(now - startedAtMs)}</span>;
}