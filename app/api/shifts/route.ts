import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { DriverShiftDTO } from "@/lib/models/driver.model";
import { adminDb } from "@/lib/firebase/admin-config";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  if (!fromParam || !toParam) {
    return NextResponse.json({ error: "Missing from/to query params" }, { status: 400 });
  }

  const from = new Date(fromParam);
  const to = new Date(toParam);

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return NextResponse.json({ error: "Invalid from/to date" }, { status: 400 });
  }

  try {
    const snap = await adminDb
      .collection("driver_shifts")
      .where("startedAt", ">=", Timestamp.fromDate(from))
      .where("startedAt", "<=", Timestamp.fromDate(to))
      .orderBy("startedAt", "desc")
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
    console.error("Failed to fetch driver shifts:", err);
    return NextResponse.json({ error: "Failed to fetch shifts" }, { status: 500 });
  }
}