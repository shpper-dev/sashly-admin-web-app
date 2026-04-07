"use client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { X, WashingMachine, Wind, Shirt, Sparkles, Package, Plus } from "lucide-react";
import { useState } from "react";

//Types 

interface ServicePrice {
  serviceId: string;
  serviceName: string;
  unit: string;
  price: number;
  enabled: boolean;
}

interface Business {
  id: string;
  name: string;
  arabicName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  area: string;
  logoUrl?: string;
  rating: number;
  totalOrders: number;
  status: "active" | "suspended" | "pending";
  joinedAt: string;
  pricing: ServicePrice[];
}

interface Props {
  mode: "add" | "edit";
  business?: Business;
  children: React.ReactNode;
  onSuccess?: () => void;
}

// Constants 

const DEFAULT_PRICING: ServicePrice[] = [
  { serviceId: "wash_fold", serviceName: "Wash & Fold",    unit: "per kg",   price: 0, enabled: true  },
  { serviceId: "dry_clean", serviceName: "Dry Cleaning",   unit: "per item", price: 0, enabled: false },
  { serviceId: "ironing",   serviceName: "Ironing",        unit: "per item", price: 0, enabled: false },
  { serviceId: "dryer",     serviceName: "Dryer Only",     unit: "per kg",   price: 0, enabled: false },
  { serviceId: "express",   serviceName: "Express (4 hr)", unit: "per kg",   price: 0, enabled: false },
];

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  wash_fold: <WashingMachine size={14} />,
  dry_clean: <Sparkles size={14} />,
  ironing:   <Shirt size={14} />,
  dryer:     <Wind size={14} />,
  express:   <Package size={14} />,
};

const UAE_CITIES = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];

const TABS = ["Details", "Pricing"] as const;
type Tab = typeof TABS[number];




const inputCls = "h-10 w-full px-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition placeholder:text-slate-400";
const selectCls = inputCls + " cursor-pointer";


export default function BusinessAccountDialog({ mode, business, children, onSuccess }: Props) {
  const [open, setOpen]     = useState(false);
  const [tab, setTab]       = useState<Tab>("Details");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  // Form state
  const [name,       setName]       = useState(business?.name       ?? "");
  const [arabicName, setArabicName] = useState(business?.arabicName ?? "");
  const [ownerName,  setOwnerName]  = useState(business?.ownerName  ?? "");
  const [email,      setEmail]      = useState(business?.email      ?? "");
  const [phone,      setPhone]      = useState(business?.phone      ?? "");
  const [city,       setCity]       = useState(business?.city       ?? UAE_CITIES[0]);
  const [area,       setArea]       = useState(business?.area       ?? "");
  const [status,     setStatus]     = useState<Business["status"]>(business?.status ?? "pending");
  const [pricing,    setPricing]    = useState<ServicePrice[]>(
    business?.pricing ?? DEFAULT_PRICING
  );

  const resetForm = () => {
    setName(business?.name       ?? "");
    setArabicName(business?.arabicName ?? "");
    setOwnerName(business?.ownerName  ?? "");
    setEmail(business?.email      ?? "");
    setPhone(business?.phone      ?? "");
    setCity(business?.city       ?? UAE_CITIES[0]);
    setArea(business?.area       ?? "");
    setStatus(business?.status   ?? "pending");
    setPricing(business?.pricing ?? DEFAULT_PRICING);
    setTab("Details");
    setError("");
  };

  const toggleService = (serviceId: string) => {
    setPricing((prev) =>
      prev.map((p) => p.serviceId === serviceId ? { ...p, enabled: !p.enabled } : p)
    );
  };

  const updatePrice = (serviceId: string, value: string) => {
    const num = parseFloat(value);
    setPricing((prev) =>
      prev.map((p) => p.serviceId === serviceId ? { ...p, price: isNaN(num) ? 0 : num } : p)
    );
  };

  const handleSubmit = async () => {
    setError("");

    if (!name.trim() || !ownerName.trim() || !email.trim() || !phone.trim() || !area.trim()) {
      setError("Please fill in all required fields.");
      setTab("Details");
      return;
    }

    const enabledWithNoPrice = pricing.filter((p) => p.enabled && p.price <= 0);
    if (enabledWithNoPrice.length > 0) {
      setError(`Set a price for: ${enabledWithNoPrice.map((p) => p.serviceName).join(", ")}`);
      setTab("Pricing");
      return;
    }

    try {
      setSaving(true);
      // Replace with actual Firebase call later & toasts too:
      await new Promise((res) => setTimeout(res, 1000));
      setOpen(false);
      onSuccess?.();
    } catch (e) {
      console.error("Save failed:", e);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden gap-0">
        {/*  Header  */}
        <div className="bg-white px-6 pt-5 pb-4">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-slate-700 text-base font-bold">
              {mode === "add" ? "Add New Business" : `Edit · ${business?.name}`}
            </DialogTitle>
            <DialogClose onClick={resetForm}>
              <X size={18} className="text-white/60 hover:text-white transition" />
            </DialogClose>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  tab === t
                    ? "bg-white text-purple-700 shadow"
                    : "text-slate-700 hover:text-slate-300"
                }`}
              >
                {t}
                {t === "Pricing" && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({pricing.filter((p) => p.enabled).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/*  Body  */}
        <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/*  Details Tab  */}
          {tab === "Details" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Business Name *">
                  <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Sparkle Laundry" />
                </Field>
                <Field label="Arabic Name">
                  <input className={inputCls} value={arabicName} onChange={(e) => setArabicName(e.target.value)} placeholder="غسيل سباركل" dir="rtl" />
                </Field>
              </div>

              <Field label="Owner / Manager Name *">
                <input className={inputCls} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Ahmed Al Mansoori" />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Email *">
                  <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@business.ae" />
                </Field>
                <Field label="Phone *">
                  <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 50 000 0000" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="City *">
                  <select className={selectCls} value={city} onChange={(e) => setCity(e.target.value)}>
                    {UAE_CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Area / District *">
                  <input className={inputCls} value={area} onChange={(e) => setArea(e.target.value)} placeholder="Al Barsha" />
                </Field>
              </div>

              <Field label="Account Status">
                <select
                  className={selectCls}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Business["status"])}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </Field>
            </div>
          )}

          {/*  Pricing Tab  */}
          {tab === "Pricing" && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-400 mb-1">Toggle services on/off and set prices in AED.</p>
              {pricing.map((p) => (
                <div
                  key={p.serviceId}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all ${
                    p.enabled ? "bg-white border-slate-200" : "bg-slate-50 border-slate-100"
                  }`}
                >
                  {/* Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleService(p.serviceId)}
                    className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${
                      p.enabled ? "bg-indigo-500" : "bg-slate-200"
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      p.enabled ? "left-5" : "left-0.5"
                    }`} />
                  </button>

                  {/* Icon + name */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    p.enabled ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400"
                  }`}>
                    {SERVICE_ICONS[p.serviceId]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${p.enabled ? "text-slate-700" : "text-slate-400"}`}>
                      {p.serviceName}
                    </p>
                    <p className="text-xs text-slate-400">{p.unit}</p>
                  </div>

                  {/* Price input */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-xs font-semibold ${p.enabled ? "text-slate-500" : "text-slate-300"}`}>AED</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      disabled={!p.enabled}
                      value={p.price === 0 ? "" : p.price}
                      onChange={(e) => updatePrice(p.serviceId, e.target.value)}
                      placeholder="0.00"
                      className="w-20 h-9 px-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 text-right outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/*  Footer  */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <DialogClose
            onClick={resetForm}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition"
          >
            Cancel
          </DialogClose>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 h-10 rounded-xl bg-[#02d0ff] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {saving ? (
              <span>Saving...</span>
            ) : (
              <>
                {mode === "add" && <Plus size={16} />}
                {mode === "add" ? "Add Business" : "Save Changes"}
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// helpers
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}