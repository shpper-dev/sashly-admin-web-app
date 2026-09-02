import { DriverShift } from "../models/driver.model";

export function serializeDriverShift(
  shift: DriverShift
) {
  return {
    driverId: shift.driverId,
    driverName: shift.driverName,
    driverPhone: shift.driverPhone,

    startedAt: shift.startedAt,
    endedAt: shift.endedAt,

    durationMs: shift.durationMs,

    isOpen: shift.isOpen,

    endedReason: shift.endedReason,
  };
}