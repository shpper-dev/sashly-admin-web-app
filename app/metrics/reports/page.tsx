"use client";
import Header from "@/components/Header";
import Link from "next/link";
import { Users, MapPin, ArrowRight, BarChart2 } from "lucide-react";

// helpers
export const fmtSAR = (n: number) =>
  `SAR ${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

const REPORTS = [
  {
    href:        "/metrics/reports/customers",
    icon:        <Users size={24} className="text-indigo-600" />,
    iconBg:      "bg-indigo-50",
    title:       "Customer Report",
    description: "Per-customer breakdown: completed orders, first/last order dates, spend, LTV, and customer type. Export for CRM or billing.",
    tags:        ["Customers", "LTV", "Retention"],
  },
  {
    href:        "/metrics/reports/geography",
    icon:        <MapPin size={24} className="text-cyan-600" />,
    iconBg:      "bg-cyan-50",
    title:       "Geographic Report",
    description: "Order and revenue aggregated by pickup area / neighbourhood. Identify high-value zones and expansion opportunities.",
    tags:        ["Areas", "AOV", "Express vs Ordinary"],
  },
];

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16 pl-60 pb-12">

        {/* Page header */}
        <section className="px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-1">
            <BarChart2 size={20} className="text-slate-400" />
            <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
          </div>
          <p className="text-sm text-slate-500 ml-8">
            Exportable data reports — download as CSV 
          </p>
        </section>

        {/* Report cards */}
        <section className="px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            {REPORTS.map(r => (
              <Link
                key={r.href}
                href={r.href}
                className="group flex flex-col gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
              >
                {/* Icon + title */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${r.iconBg} shrink-0`}>
                    {r.icon}
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <h2 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {r.title}
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {r.description}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 flex-wrap">
                    {r.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}