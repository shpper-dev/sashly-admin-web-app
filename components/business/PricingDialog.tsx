import { MapPin, Package, Shirt, Sparkles, WashingMachine, Wind, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Business } from "@/app/(admin)/business-accounts/page";

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  wash_fold: <WashingMachine size={14} />,
  dry_clean: <Sparkles size={14} />,
  ironing:   <Shirt size={14} />,
  dryer:     <Wind size={14} />,
  express:   <Package size={14} />,
};
export function PricingDialog({ business }: { business: Business }) {
  const enabledCount = business.pricing.filter((p) => p.enabled).length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all">
          <span>{enabledCount} services</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-400">View</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-purple-600 px-6 pt-6 pb-5">
          <DialogHeader className="flex flex-row items-start justify-between">
            <div>
              <DialogTitle className="text-white text-lg font-bold">{business.name}</DialogTitle>
              <p className="text-purple-200 text-sm mt-0.5">{business.arabicName}</p>
              <div className="flex items-center gap-1.5 mt-2 text-purple-100 text-xs">
                <MapPin size={12} /> {business.area}, {business.city}
              </div>
            </div>
            <DialogClose className="text-white/60 hover:text-white mt-1">
              <X size={18} />
            </DialogClose>
          </DialogHeader>
        </div>

        {/* Pricing list */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Service Pricing</p>
          <div className="flex flex-col gap-2">
            {business.pricing.map((p) => (
              <div
                key={p.serviceId}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  p.enabled
                    ? "bg-white border-slate-200"
                    : "bg-slate-50 border-slate-100 opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.enabled ? "bg-purple-50 text-purple-600" : "bg-slate-100 text-slate-400"}`}>
                    {SERVICE_ICONS[p.serviceId]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{p.serviceName}</p>
                    <p className="text-xs text-slate-400">{p.unit}</p>
                  </div>
                </div>
                <div className="text-right">
                  {p.enabled ? (
                    <span className="text-sm font-bold text-slate-800">AED {p.price.toFixed(2)}</span>
                  ) : (
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Disabled</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-1 flex items-center justify-between border-t border-slate-100">
          <div className="text-xs text-slate-400">
            {business.pricing.filter((p) => p.enabled).length} of {business.pricing.length} services enabled
          </div>
          <DialogClose className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition">
            Close
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}