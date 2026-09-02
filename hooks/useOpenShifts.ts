"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { mapDriverShift } from "@/lib/mappers/driver-shift.mapper";
import { DriverShift } from "@/lib/models/driver.model";

export function useOpenShifts() {
  const [shifts, setShifts] = useState<DriverShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, "driver_shifts"), where("isOpen", "==", true));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setShifts(snap.docs.map(mapDriverShift));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("useOpenShifts snapshot error:", err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return unsub;
  }, []);

  return { shifts, loading, error };
}