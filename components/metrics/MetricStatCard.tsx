import { ArrowUpRight } from "lucide-react";

export function StatCard({ label, value, sub, icon, iconBg, trend, trendColor = "text-emerald-500" }: {
  label: string; value: string; sub: string; icon: React.ReactNode;
  iconBg: string; trend: string; trendColor?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
      <div className={`absolute top-4 right-4 p-2 rounded-lg ${iconBg}`}>{icon}</div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pr-8">{label}</p>
      <p className="text-xl font-bold text-slate-800 mt-1">{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
      <p className={`text-[10px] font-semibold mt-1.5 flex items-center gap-1 ${trendColor}`}>
        <ArrowUpRight size={11} /> {trend}
      </p>
    </div>
  );
}


// function StatCard({ title, value, subValue, trend, icon, iconBg }: {
//   title: string; value: string; subValue: string; trend: string;
//   icon: React.ReactNode; iconBg: string;
// }) {
//   return (
//     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
//       <div className={`absolute top-6 right-6 p-2 rounded-lg ${iconBg}`}>{icon}</div>
//       <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{title}</p>
//       <h2 className="text-2xl font-bold text-slate-800 mt-2 truncate pr-10">{value}</h2>
//       <div className="flex items-center justify-between mt-1">
//         <p className="text-sm text-slate-500">{subValue}</p>
//         <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
//           <ArrowUpRight size={14} /> {trend}
//         </span>
//       </div>
//     </div>
//   );
// }