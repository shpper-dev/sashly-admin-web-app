import { Timestamp } from "firebase/firestore";
import { DriverShift, EndedReason } from "../models/driver.model";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export function mapDriverShift(doc: QueryDocumentSnapshot<DocumentData>): DriverShift {
    const data = doc.data();
    if(!data) {
        throw new Error(`Driver Shift document ${doc.id} is empty.`);
    }
  return {
    id: doc.id,
    driverId: data.driverId ?? "",
    driverName: data.driverName ?? null,
    driverPhone: data.driverPhone ?? null,

    startedAt: data.startedAt as Timestamp,
    endedAt: data.endedAt ?? null,

    durationMs: data.durationMs ?? null,

    isOpen: data.isOpen ?? false,

    endedReason: isValidEndedReason(data.endedReason)
      ? data.endedReason
      : null,
  };
}

function isValidEndedReason(
  value: unknown
): value is EndedReason {
  return (
    value === "went_offline" ||
    value === "auto_closed_stale"
  );
}