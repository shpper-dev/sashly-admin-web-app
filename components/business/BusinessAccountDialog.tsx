"use client";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Business, ItemPricing, ItemServicePrice } from "@/lib/models/business.model";
import { getItems } from "@/lib/firebase/product";
import { X, Plus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createBusiness, updateBusiness } from "@/lib/firebase/business";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// Constants 

const UAE_CITIES = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];
const TABS = ["Details", "Pricing"] as const;
type Tab = typeof TABS[number];

const inputCls  = "h-10 w-full px-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition placeholder:text-slate-400";
const selectCls = inputCls + " cursor-pointer";

interface BusinessAccountDialogProps {
  mode:       "add" | "edit";
  business?:  Business;
  children:   React.ReactNode;
  onSuccess?: () => void;
}
 

export default function BusinessAccountDialog({ mode, business, children, onSuccess }: BusinessAccountDialogProps) {
  const [open, setOpen]       = useState(false);
  const [tab, setTab]         = useState<Tab>("Details");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  // Catalog data
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Form state — details
  const [name,       setName]       = useState(business?.name       ?? "");
  const [arabicName, setArabicName] = useState(business?.arabicName ?? "");
  const [ownerName,  setOwnerName]  = useState(business?.ownerName  ?? "");
  const [email,      setEmail]      = useState(business?.email      ?? "");
  const [phone,      setPhone]      = useState(business?.phone      ?? "");
  const [area,       setArea]       = useState(business?.address    ?? "");
  const [status,     setStatus]     = useState(business?.isDeleted ? "suspended" : "active");

  // Form state — nested pricing
  const [pricing, setPricing] = useState<ItemPricing[]>(business?.pricing ?? []);

  // Load catalog when dialog opens
  useEffect(() => {
    if (!open) return;
    setCatalogLoading(true);
    getItems()
      .then((items) => {

        // For add mode: seed pricing from catalog (all disabled, price 0)
        // For edit mode: merge existing pricing with any new catalog items
        setPricing((existing) => {
          return items.map((catalogItem) => {
            const existingItem = existing.find((p) => p.itemId === catalogItem.id);

            const services: ItemServicePrice[] = (catalogItem.services ?? []).map((svc) => {
              const existingSvc = existingItem?.services.find((s) => s.serviceId === svc.id);
              return {
                serviceId:   svc.id,
                serviceName: svc.name,
                price:       existingSvc?.price   ?? 0,
                enabled:     existingSvc?.enabled ?? false,
              };
            });

            return {
              itemId:     catalogItem.id,
              itemName:   catalogItem.name,
              arabicName: catalogItem.arabicName ?? "",
              enabled:    existingItem ? services.some((s) => s.enabled) : false,
              services,
            };
          });
        });
      })
      .catch(console.error)
      .finally(() => setCatalogLoading(false));
  }, [open]);

  const resetForm = () => {
    setName(business?.name       ?? "");
    setArabicName(business?.arabicName ?? "");
    setOwnerName(business?.ownerName  ?? "");
    setEmail(business?.email      ?? "");
    setPhone(business?.phone      ?? "");
    setArea(business?.address     ?? "");
    setStatus(business?.isDeleted ? "suspended" : "active");
    setPricing(business?.pricing  ?? []);
    setTab("Details");
    setError("");
  };

  //  Pricing helpers 

  // Toggle entire item on/off — disables all its services when turned off
  const toggleItem = (itemId: string, enabled: boolean) => {
    setPricing((prev) => prev.map((item) =>
      item.itemId !== itemId ? item : {
        ...item,
        enabled,
        // When disabling the item, disable all services too
        services: enabled ? item.services : item.services.map((s) => ({ ...s, enabled: false })),
      }
    ));
  };

  // Toggle individual service within an item
  const toggleService = (itemId: string, serviceId: string, enabled: boolean) => {
    setPricing((prev) => prev.map((item) =>
      item.itemId !== itemId ? item : {
        ...item,
        services: item.services.map((s) =>
          s.serviceId === serviceId ? { ...s, enabled } : s
        ),
      }
    ));
  };

  const updateServicePrice = (itemId: string, serviceId: string, value: string) => {
    const num = parseFloat(value);
    setPricing((prev) => prev.map((item) =>
      item.itemId !== itemId ? item : {
        ...item,
        services: item.services.map((s) =>
          s.serviceId === serviceId ? { ...s, price: isNaN(num) ? 0 : num } : s
        ),
      }
    ));
  };

  //  Validation + Submit 
const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const phoneRegex =
  /^\+?[0-9]{7,15}$/;

function validateBusinessForm() {
  const errors: string[] = [];

  if (!name.trim()) {
    errors.push("Business Name is required.");
  }

  if (!arabicName.trim()) {
    errors.push("Arabic Name is required.");
  }

  if (!ownerName.trim()) {
    errors.push("Owner / Manager Name is required.");
  }

  if (!email.trim()) {
    errors.push("Email is required.");
  } else if (!emailRegex.test(email.trim())) {
    errors.push("Please enter a valid email address.");
  }

  if (!phone.trim()) {
    errors.push("Phone number is required.");
  } else if (!phoneRegex.test(phone.trim())) {
    errors.push("Please enter a valid phone number.");
  }
  const enabledItems = pricing.filter((item) => item.enabled);

  const enabledServices = enabledItems.flatMap((item) =>
    item.services.filter((service) => service.enabled)
  );

  if (enabledServices.length === 0) {
    errors.push("Enable at least one service.");
  }

  enabledItems.forEach((item) => {
    item.services.forEach((service) => {
      if (service.enabled && service.price <= 0) {
        errors.push(
          `${item.itemName} → ${service.serviceName} must have a price greater than 0.`
        );
      }
    });
  });

  return errors;
}
  const buildBusinessPayload = (): Partial<Business> => ({
  name: name.trim(),
  arabicName: arabicName.trim(),
  ownerName: ownerName.trim(),
  email: email.trim().toLowerCase(),
  phone: phone.trim(),
  address: area.trim(),
  isDeleted: status === "suspended",

  pricing: pricing
  .filter((item) => item.enabled)
  .map((item) => ({
    ...item,
    services: item.services.filter((s) => s.enabled),
  })),
});

const handleSubmit = async () => {
  setError("");

  const validationErrors = validateBusinessForm();

  if (validationErrors.length > 0) {
    setError(validationErrors[0]);

    const pricingError = validationErrors.some(
      (e) =>
        e.includes("price") ||
        e.includes("item") ||
        e.includes("service")
    );

    setTab(pricingError ? "Pricing" : "Details");
    return;
  }

  try {
    setSaving(true);

    const payload = buildBusinessPayload();

    if (mode === "add") {
      await createBusiness(payload);
    } else {
      if (!business?.id) {
        throw new Error("Business ID missing");
      }

      await updateBusiness(
        business.id,
        payload
      );
    }

    setOpen(false);
    onSuccess?.();
  } catch (error) {
    console.error(error);
    setError("Failed to save business.");
  } finally {
    setSaving(false);
  }
};
  const enabledItemCount    = pricing.filter((p) => p.enabled).length;
  const totalEnabledServices = pricing.reduce(
    (acc, item) => acc + item.services.filter((s) => s.enabled).length, 0
  );


  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-xl rounded-2xl p-0 overflow-hidden gap-0">

        {/* Header */}
        <div className="bg-white px-6 pt-5 pb-4 border-b border-slate-100">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-slate-700 text-base font-bold">
              {mode === "add" ? "Add New Business" : `Edit · ${business?.name}`}
            </DialogTitle>
            <DialogClose onClick={resetForm}>
              <X size={18} className="text-slate-400 hover:text-slate-600 transition" />
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
                    ? "bg-purple-50 text-purple-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t}
                {t === "Pricing" && !catalogLoading && (
                  <span className="ml-1.5 text-xs opacity-60">
                    {enabledItemCount} items · {totalEnabledServices} services
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">

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
                  <input required className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Sparkle Laundry" />
                </Field>
                <Field label="Arabic Name">
                  <input required className={inputCls} value={arabicName} onChange={(e) => setArabicName(e.target.value)} placeholder="غسيل سباركل" dir="rtl" />
                </Field>
              </div>
              <Field label="Owner / Manager Name *">
                <input required className={inputCls} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Ahmed Al Mansoori" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email *">
                  <input required className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@business.ae" />
                </Field>
                <Field label="Phone *">
                  <input required className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 50 000 0000" />
                </Field>
              </div>
              <Field label="Area / District *">
                <input className={inputCls} value={area} onChange={(e) => setArea(e.target.value)} placeholder="Al Barsha" />
              </Field>
              <Field label="Account Status">
               <Select
                 value={status}
                 onValueChange={setStatus}
               >
                 <SelectTrigger className={inputCls}>
                   <SelectValue placeholder="Select status" />
                 </SelectTrigger>

                 <SelectContent>
                   <SelectItem value="active">
                     Active
                   </SelectItem>

                   <SelectItem value="suspended">
                     Suspended
                   </SelectItem>
                 </SelectContent>
               </Select>
              </Field>
            </div>
          )}

          {/*  Pricing Tab  */}
          {tab === "Pricing" && (
            catalogLoading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Loading catalog…</span>
              </div>
            ) : pricing.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">No items in catalog yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-400 mb-1">
                  Enable items this business offers, then set a price per service.
                </p>

                {pricing.map((item) => (
                  <div
                    key={item.itemId}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      item.enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    {/* Item row — switch + name */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Switch
                        className="data-[state=checked]:bg-purple-600"
                        checked={item.enabled}
                        onCheckedChange={(checked) => toggleItem(item.itemId, checked)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${item.enabled ? "text-slate-800" : "text-slate-400"}`}>
                          {item.itemName}
                        </p>
                        {item.arabicName && (
                          <p className="text-[10px] text-slate-400">{item.arabicName}</p>
                        )}
                      </div>
                      {item.enabled && (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                          {item.services.filter((s) => s.enabled).length} / {item.services.length} services
                        </span>
                      )}
                    </div>

                    {/* Services — only shown when item is enabled */}
                    {item.enabled && (
                      <div className="flex flex-col gap-1.5 px-4 pb-3 pl-14 border-t border-slate-100 pt-3">
                        {item.services.map((svc) => (
                          <div key={svc.serviceId} className="flex items-center gap-3">

                            {/* Service toggle */}
                            <Switch
                              checked={svc.enabled}
                              onCheckedChange={(checked) => toggleService(item.itemId, svc.serviceId, checked)}
                              className="data-[state=checked]:bg-purple-600"
                            />

                            {/* Service name */}
                            <span className={`flex-1 text-xs font-medium ${svc.enabled ? "text-slate-700" : "text-slate-400"}`}>
                              {svc.serviceName}
                            </span>

                            {/* Price input — only editable when service is enabled */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`text-xs font-semibold ${svc.enabled ? "text-slate-500" : "text-slate-300"}`}>
                                AED
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                disabled={!svc.enabled}
                                value={svc.price === 0 ? "" : svc.price}
                                onChange={(e) => updateServicePrice(item.itemId, svc.serviceId, e.target.value)}
                                placeholder="0.00"
                                className="w-20 h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 text-right outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3">
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
            {saving ? "Saving…" : mode === "add" ? <><Plus size={15} /> Add Business</> : "Save Changes"}
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