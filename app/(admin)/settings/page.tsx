"use client";

import Header from "@/components/Header";
import ViewAdminsDialog from "@/components/settings/ViewAdminsDialog";
import { Users, ChevronRight } from "lucide-react";


export default function Settings() {
  return (
    <div className="min-h-screen bg-white">

      <main className="flex flex-col pl-60 pt-8 gap-6 pb-8 overflow-y-auto">

        {/* Page Header */}
        <section className="px-8 pt-6 flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-900">Settings</h2>
            <p className="text-sm text-slate-500">Manage your admin panel preferences</p>
          </div>
        </section>

        {/* General card */}
        <section className="px-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">General</h3>
            </div>
            <div className="px-6">
              <SettingRow
                icon={<Users size={15} />}
                title="Admins"
                description="View and manage all admin accounts"
                action={
                  <ViewAdminsDialog>
                    <button className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg shadow-sm transition-colors">
                      View All
                      <ChevronRight size={13} className="text-slate-400" />
                    </button>
                  </ViewAdminsDialog>
                }
              />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

// helpers
function SettingRow({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-100 rounded-lg text-slate-500">{icon}</div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-800">{title}</span>
          <span className="text-xs text-slate-400">{description}</span>
        </div>
      </div>
      {action}
    </div>
  );
}

