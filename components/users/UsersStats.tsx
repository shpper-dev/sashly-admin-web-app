import {
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  ShieldAlert,
  MapPin,
  Eye,
  MessageCircle,
} from "lucide-react"

export default function UsersStats() {
  return (
    <div className="h-full overflow-y-auto px-6 py-3 space-y-4">

      {/* ================= TOP STATS ================= */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden grid grid-cols-4 divide-x divide-slate-200">

        {/* ORDERS */}
        <div className="p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <p className="text-[11px] tracking-widest text-slate-400 font-semibold">ORDERS</p>
            <p className="text-xl font-bold text-slate-900">12</p>
          </div>
        </div>

        {/* TOTAL SALES */}
        <div className="p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] tracking-widest text-slate-400 font-semibold">TOTAL SALES</p>
            <p className="text-xl font-bold text-emerald-600 ">SAR 450</p>
          </div>
        </div>

        {/* PAID */}
        <div className="p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] tracking-widest text-slate-400 font-semibold">PAID</p>
            <p className="text-xl font-bold text-emerald-600 ">SAR 0</p>
          </div>
        </div>

        {/* UNPAID */}
        <div className="p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-[11px] tracking-widest text-slate-400 font-semibold">UNPAID</p>
            <p className="text-xl font-bold text-red-500 ">SAR 450</p>
            <p className="text-xs text-red-400 font-medium">(12) PENDING</p>
          </div>
        </div>
      </div>

      {/* ================= META ROW ================= */}
      <div className="grid grid-cols-4 text-center border-b border-slate-200 pb-6 text-sm">

        <div>
          <p className="text-[11px] tracking-widest text-slate-400 font-semibold">SIGNED UP</p>
          <p className="font-semibold text-slate-800 mt-1">Jan 2024</p>
        </div>

        <div className="border-l border-slate-200">
          <p className="text-[11px] tracking-widest text-slate-400 font-semibold">LAST ORDER</p>
          <p className="font-semibold text-slate-800 mt-1">20/02/26</p>
        </div>

        <div className="border-l border-slate-200">
          <p className="text-[11px] tracking-widest text-slate-400 font-semibold">FREQUENCY</p>
          <p className="font-semibold text-slate-800 mt-1">0 days</p>
        </div>

        <div className="border-l border-slate-200">
          <p className="text-[11px] tracking-widest text-slate-400 font-semibold">AVG SPEND</p>
          <p className="font-semibold text-slate-800 mt-1">SAR 38</p>
        </div>
      </div>

      {/* ================= SERVICE PREF ================= */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">
          Service Preferences
        </h3>

        <div className="rounded-2xl bg-slate-100 p-5 space-y-4 text-sm">
          <p className="text-slate-600">
            User frequently requests{" "}
            <span className="text-sky-500 font-semibold">Extra24Hrs</span> priority.
            Most popular items include:
          </p>

          <div className="flex gap-3 flex-wrap">
            <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-medium shadow-sm">
              Mattress topper • <span className="text-sky-500">لباد</span>
            </div>

            <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-medium shadow-sm">
              Pillow • <span className="text-sky-500">مخدة</span>
            </div>

            <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-medium shadow-sm">
              Double Blanket • <span className="text-sky-500">لحاف مزدوج</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM GRID ================= */}
      <div className="grid grid-cols-2 gap-8 pt-2">

        {/* Geographic */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Geographic Context
          </h3>

          <div className="rounded-xl border border-slate-200 h-12 flex items-center px-4 text-sm text-slate-600">
            <MapPin className="w-4 h-4 mr-2 text-purple-500" />
            24.7924  //  46.6870
          </div>

          <button className="w-full h-10 rounded-full border border-slate-300 flex items-center justify-center gap-2 text-sm font-medium hover:bg-slate-50 transition">
            <Eye className="w-4 h-4" />
            View on Logistics Map
          </button>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Internal Notes
          </h3>
          {/* later adjust to text area if there are notes */}
          <div className="rounded-2xl bg-slate-100 h-22 flex flex-col items-center justify-center text-slate-400 text-sm text-center p-4">
            <MessageCircle className="w-6 h-6 mb-2" />
            No private administrative notes recorded.
          </div>
        </div>
      </div>
    </div>
  )
}