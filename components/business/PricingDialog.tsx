"use client";
import { MapPin, X } from "lucide-react";
import {
  Dialog, DialogClose, DialogContent,
  DialogHeader, DialogTitle, DialogTrigger,
} from "../ui/dialog";
import { Business } from "@/lib/models/business.model";


export function PricingDialog({ business }: { business: Business }) {
  // Total enabled service entries across all items
  const enabledCount = business.pricing.reduce(
    (acc, item) => acc + item.services.filter((s) => s.enabled).length, 0
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all">
          <span>{business.pricing.length} items</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-400">{enabledCount} services</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden">

        {/* Header */}
        <div className="bg-purple-600 px-6 pt-6 pb-5 shrink-0">
          <DialogHeader className="flex flex-row items-start justify-between">
            <div>
              <DialogTitle className="text-white text-lg font-bold">{business.name}</DialogTitle>
              <p className="text-purple-200 text-sm mt-0.5">{business.arabicName}</p>
              <div className="flex items-center gap-1.5 mt-2 text-purple-100 text-xs">
                <MapPin size={12} /> {business.address}, 
              </div>
            </div>
            <DialogClose className="text-white/60 hover:text-white mt-1">
              <X size={18} />
            </DialogClose>
          </DialogHeader>
        </div>

        {/* Pricing list — scrollable */}
        <div className="px-6 py-5 overflow-y-auto max-h-[60vh] flex flex-col gap-5">
          {business.pricing.map((item) => (
            <div key={item.itemId}>

              {/* Item header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {item.itemName}
                </span>
                {item.arabicName && (
                  <span className="text-xs text-slate-400">{item.arabicName}</span>
                )}
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-auto">
                  per item
                </span>
              </div>

              {/* Services under this item */}
              <div className="flex flex-col gap-1.5 pl-2 border-l-2 border-slate-100">
                {item.services.map((svc) => (
                  <div
                    key={svc.serviceId}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all ${
                      svc.enabled
                        ? "bg-white border-slate-200"
                        : "bg-slate-50 border-slate-100 opacity-50"
                    }`}
                  >
                    <span className="text-sm text-slate-600 font-medium">{svc.serviceName}</span>
                    {svc.enabled ? (
                      <span className="text-sm font-bold text-slate-800">
                        AED {svc.price.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Disabled
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 shrink-0">
          <span className="text-xs text-slate-400">
            {business.pricing.length} items · {enabledCount} enabled services
          </span>
          <DialogClose className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition">
            Close
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}