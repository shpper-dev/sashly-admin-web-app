import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin-config";
import { DriverShiftDTO } from "@/lib/models/driver.model";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ driverId: string }> }) {
  const { driverId } = await params;

  try {
    const snap = await adminDb
      .collection("driver_shifts")
      .where("driverId", "==", driverId)
      .orderBy("startedAt", "desc")
      .limit(50)
      .get();

    const shifts: DriverShiftDTO[] = snap.docs.map((d) => {
      const s = d.data();
      return {
        id: d.id,
        driverId: s.driverId ?? "",
        driverName: s.driverName ?? null,
        driverPhone: s.driverPhone ?? null,
        startedAtMs: s.startedAt.toMillis(),
        endedAtMs: s.endedAt ? s.endedAt.toMillis() : null,
        durationMs: s.durationMs ?? null,
        isOpen: s.isOpen ?? false,
        endedReason:
          s.endedReason === "went_offline" || s.endedReason === "auto_closed_stale"
            ? s.endedReason
            : null,
      };
    });

    return NextResponse.json({ shifts });
  } catch (err) {
    console.error(`Failed to fetch shifts for driver ${driverId}:`, err);
    return NextResponse.json({ error: "Failed to fetch driver shifts" }, { status: 500 });
  }
}