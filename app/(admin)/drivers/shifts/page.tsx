"use client";

import { useState } from "react";
import Header from "@/components/Header";
import TimesheetPanel from "@/components/drivers/TimesheetPanel";
import OpenShiftsPanel from "@/components/drivers/OpenShiftsPanel";

export default function DriverShiftsPage() {
  const [tab, setTab] = useState<"live" | "timesheet">("live");

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex flex-col pt-16 pl-60 min-h-screen">
        <section className="flex justify-between items-center px-8 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-semibold">Driver Shifts</h2>
            <p className="text-sm text-slate-500">Live availability and historical hours worked</p>
          </div>
        </section>

        <section className="flex gap-6 px-8 pt-4 border-b border-slate-100">
          {(["live", "timesheet"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === t ? "border-purple-600 text-purple-600" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {t === "live" ? "Right Now" : "Timesheet"}
            </button>
          ))}
        </section>

        <section className="px-8 py-6">
          {tab === "live" ? <OpenShiftsPanel /> : <TimesheetPanel />}
        </section>
      </main>
    </div>
  );
}