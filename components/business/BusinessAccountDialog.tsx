"use client";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Business, CatalogItem } from "@/lib/models/business.model";
import {
  createBusiness, updateBusiness, regenerateBusinessJoinCode,
  getCatalog, upsertCatalogItem, deleteCatalogItem,
  seedCatalogFromGlobal, getBusinessMembers, removeBusinessMember,
  BusinessMember,
  applyCatalogDiscount,
} from "@/lib/firebase/business";
import {
  X, Plus, Loader2, Copy, RefreshCw, Check,
  Trash2, Pencil, Users, BookOpen, Info,
  Percent,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import ConfirmActionDialog from "@/components/ConfirmActionDialog";
import { useToast } from "@/lib/providers/ToastProvider";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

import { UserAddress } from "@/lib/models/user.model";

const TABS = ["Details", "Catalog", "Members"] as const;
type Tab = typeof TABS[number];

const inputCls = "h-10 w-full px-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition placeholder:text-slate-400";

interface Props {
  mode:       "add" | "edit";
  business?:  Business;
  children:   React.ReactNode;
  onSuccess?: () => void;
}

export default function BusinessAccountDialog({ mode, business, children, onSuccess }: Props) {
  const isEdit = mode === "edit";

  const [open,    setOpen]    = useState(false);
  const [tab,     setTab]     = useState<Tab>("Details");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const { showToast } = useToast();

  // Details form 
  const [name,          setName]          = useState(business?.name         ?? "");
  const [contactName,   setContactName]   = useState(business?.contactName  ?? "");
  const [contactPhone,  setContactPhone]  = useState(business?.contactPhone ?? "");
  const [isActive,      setIsActive]      = useState(business?.isActive     ?? true);
  const [joinCode,      setJoinCode]      = useState(business?.joinCode     ?? "");
  const [seedFromGlobal, setSeedFromGlobal] = useState(true);
  const [copied,        setCopied]        = useState(false);
  const [regenerating,  setRegenerating]  = useState(false);
  const [address, setAddress] = useState<UserAddress | null>(
  business?.address ?? null
);

const [marker, setMarker] = useState<{
  lat: number;
  lng: number;
} | null>(
  business?.address?.lat && business?.address?.lng
    ? {
        lat: business.address.lat,
        lng: business.address.lng,
      }
    : null
);

  // Catalog 
  const [catalog,        setCatalog]        = useState<CatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [seeding,        setSeeding]        = useState(false);
  const [editingItem,    setEditingItem]    = useState<CatalogItem | null>(null);
  const [editName,       setEditName]       = useState("");
  const [editPrice,      setEditPrice]      = useState("");
  const [editCategory,   setEditCategory]   = useState("");
  const [editSvcType,    setEditSvcType]    = useState("");
  const [savingItem,     setSavingItem]     = useState(false);
  const [addingNew,      setAddingNew]      = useState(false);
  const [newName,        setNewName]        = useState("");
  const [newPrice,       setNewPrice]       = useState("");
  const [newCategory,    setNewCategory]    = useState("");
  const [newSvcType,     setNewSvcType]     = useState("");
  const [discountPct,      setDiscountPct]      = useState<string>("0");
  const [applyingDiscount, setApplyingDiscount]  = useState(false);

  // Members 
  const [members,        setMembers]        = useState<BusinessMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Seed confirm 
  const [seedReplaceOpen, setSeedReplaceOpen] = useState(false);

  const { isLoaded } = useJsApiLoader({
  id: "google-map-script",
  googleMapsApiKey:
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
});

  //Load data 

  // const loadCatalog = useCallback(async () => {
  //   if (!business?.id) return;
  //   setCatalogLoading(true);
  //   try {
  //     const items = await getCatalog(business.id);
  //     setCatalog(items);
  //   } catch (e) {
  //     console.error("getCatalog failed:", e);
  //   } finally {
  //     setCatalogLoading(false);
  //   }
  // }, [business?.id]);

  // const loadMembers = useCallback(async () => {
  //   if (!business?.id) return;
  //   setMembersLoading(true);
  //   try {
  //     const list = await getBusinessMembers(business.id);
  //     setMembers(list);
  //   } finally {
  //     setMembersLoading(false);
  //   }
  // }, [business?.id]);
  const loadCatalog = async () => {
  if (!business?.id) return;

  setCatalogLoading(true);

  try {
    const items = await getCatalog(
      business.id
    );

    setCatalog(items);
  } finally {
    setCatalogLoading(false);
  }
};

const loadMembers = async () => {
  if (!business?.id) return;

  setMembersLoading(true);

  try {
    const list = await getBusinessMembers(
      business.id
    );

    setMembers(list);
  } finally {
    setMembersLoading(false);
  }
};

 useEffect(() => {
  if (!open || !isEdit) return;

  loadCatalog();
  loadMembers();
}, [
  open,
  isEdit,
  business?.id,
]);

  //Reset on close

  const resetForm = () => {
    setName(business?.name         ?? "");
    setContactName(business?.contactName  ?? "");
    setContactPhone(business?.contactPhone ?? "");
    setIsActive(business?.isActive     ?? true);
    setJoinCode(business?.joinCode     ?? "");
    setSeedFromGlobal(true);
    setTab("Details");
    setError("");
    setCatalog([]);
    setMembers([]);
    setEditingItem(null);
    setAddingNew(false);
    setSeedReplaceOpen(false);
    setDiscountPct("0");
  };

  //Join code helpers

  const handleCopy = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRegenerate = async () => {
    if (!business?.id) return;
    setRegenerating(true);
    try {
      const newCode = await regenerateBusinessJoinCode(business.id);
      setJoinCode(newCode);
      showToast("Join code regenerated", "success");
    } catch {
      showToast("Failed to regenerate code", "error");
    } finally {
      setRegenerating(false);
    }
  };

  const handleMapClick = async (
  e: google.maps.MapMouseEvent
) => {
  if (!e.latLng) return;

  const lat = e.latLng.lat();
  const lng = e.latLng.lng();

  setMarker({ lat, lng });

  try {
    const geocoder = new google.maps.Geocoder();

    const result = await geocoder.geocode({
      location: { lat, lng },
    });

    const first = result.results?.[0];

    setAddress({
      id: "",
      userId: "",
      type: "Business",
      formattedAddress:
        first?.formatted_address ?? "",
      lat,
      lng,
      isDefault: true,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.error(err);
  }
};

const handleApplyDiscount = async () => {
    if (!business?.id) return;
    const pct = parseFloat(discountPct);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      showToast("Enter a valid percentage between 0 and 100", "error");
      return;
    }
    setApplyingDiscount(true);
    try {
      const { updated, skipped } = await applyCatalogDiscount(business.id, pct);
      showToast(
        skipped > 0
          ? `${pct}% discount applied to ${updated} item(s) — ${skipped} skipped (no matching price list item)`
          : `${pct}% discount applied to ${updated} item(s)`,
        "success"
      );
      await loadCatalog();
    } catch (e) {
      console.error("applyDiscount failed:", e);
      showToast("Failed to apply discount", "error");
    } finally {
      setApplyingDiscount(false);
    }
  };

  // Details submit 

  const handleSubmit = async () => {
    setError("");
    if (!name.trim())         { setError("Business name is required.");  return; }
    if (!contactName.trim())  { setError("Contact name is required.");   return; }
    if (!contactPhone.trim()) { setError("Contact phone is required.");  return; }

    setSaving(true);
    try {
      const payload: Partial<Business> = {
        name: name.trim(), contactName: contactName.trim(),
        contactPhone: contactPhone.trim(), isActive, address,
      };
      if (isEdit && business?.id) {
        await updateBusiness(business.id, payload);
        showToast(`${name} updated`, "success");
      } else {
        const newId = await createBusiness(payload);
        if (seedFromGlobal) {
          await seedCatalogFromGlobal(newId, false);
          showToast(`${name} created with default catalog`, "success");
        } else {
          showToast(`${name} created`, "success");
        }
      }
      onSuccess?.();
      setOpen(false);
      resetForm();
    } catch (e: any) {
      console.error(e);
      setError("Failed to save business. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  //  Catalog helpers 

  const startEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditCategory(item.category ?? "");
    setEditSvcType(item.serviceType ?? "");
  };

  const cancelEdit = () => setEditingItem(null);

  const saveEdit = async () => {
    if (!business?.id || !editingItem) return;
    const updated = {
      ...editingItem,
      name:        editName.trim(),
      price:       parseFloat(editPrice) || 0,
      category:    editCategory.trim() || null,
      serviceType: editSvcType.trim()  || null,
    };
    
    setCatalog((prev) => prev.map((c) => (c.id === editingItem.id ? updated : c)));
    setEditingItem(null);
    setSavingItem(true);
    try {
      await upsertCatalogItem(business.id, updated, editingItem.id);
    } catch (e) {
      console.error("saveEdit failed:", e);
      await loadCatalog(); 
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!business?.id) return;
  
    setCatalog((prev) => prev.filter((c) => c.id !== itemId));
    try {
      await deleteCatalogItem(business.id, itemId);
    } catch (e) {
      console.error("deleteItem failed:", e);
      await loadCatalog();
    }
  };

  const handleToggleItem = async (item: CatalogItem) => {
    if (!business?.id) return;
    const toggled = { ...item, isActive: !item.isActive };
   
    setCatalog((prev) => prev.map((c) => (c.id === item.id ? toggled : c)));
    try {
      await upsertCatalogItem(business.id, toggled, item.id);
    } catch (e) {
      console.error("toggleItem failed:", e);
      await loadCatalog();
    }
  };

  const saveNewItem = async () => {
    if (!business?.id || !newName.trim()) return;
    const newItem: Omit<CatalogItem, "id"> = {
      name:        newName.trim(),
      price:       parseFloat(newPrice) || 0,
      category:    newCategory.trim() || null,
      serviceType: newSvcType.trim()  || null,
      isActive:    true,
      sortOrder:   catalog.length,
      unit:        null,
      imageUrl:    null,
    };
    setSavingItem(true);
    setAddingNew(false);
    setNewName(""); setNewPrice(""); setNewCategory(""); setNewSvcType("");
    try {
      const id = await upsertCatalogItem(business.id, newItem);
      
      setCatalog((prev) => [...prev, { id, ...newItem }]);
    } catch (e) {
      console.error("saveNewItem failed:", e);
      await loadCatalog(); // fall back to authoritative data
    } finally {
      setSavingItem(false);
    }
  };

  const handleSeedFromGlobal = async (replace: boolean) => {
    if (!business?.id) return;
    setSeeding(true);
    setSeedReplaceOpen(false);
    try {
      await seedCatalogFromGlobal(business.id, replace);
      showToast("Catalog seeded from global price list", "success");
      await loadCatalog();
    } catch {
      showToast("Failed to seed catalog", "error");
    } finally {
      setSeeding(false);
    }
  };

  // Member helpers 

  const handleRemoveMember = async (userId: string, memberName: string) => {
    await removeBusinessMember(userId);
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
    showToast(`${memberName} removed from business`, "success");
  };

  //  Render 

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="!max-w-2xl rounded-2xl p-0 overflow-hidden gap-0">

        {/* Header */}
        <div className="bg-white px-6 pt-5 pb-0 border-b border-slate-100">
          <DialogHeader className="flex flex-row items-center justify-between mb-4">
            <DialogTitle className="text-slate-700 text-base font-bold">
              {isEdit ? `Edit · ${business?.name}` : "Add New Business"}
            </DialogTitle>
            <DialogClose onClick={resetForm}>
              <X size={18} className="text-slate-400 hover:text-slate-600 transition" />
            </DialogClose>
          </DialogHeader>

          <div className="flex gap-1 pb-0">
            {TABS.filter((t) => isEdit || t === "Details").map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 rounded-t-lg text-sm font-semibold transition-all border-b-2 ${
                  tab === t
                    ? "border-[#7F50F4] text-[#7F50F4] bg-purple-50/50"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {t === "Catalog" && <BookOpen size={13} className="inline mr-1.5 -mt-0.5" />}
                {t === "Members" && <Users     size={13} className="inline mr-1.5 -mt-0.5" />}
                {t}
                {t === "Catalog" && isEdit && !catalogLoading && (
                  <span className="ml-1.5 text-[10px] opacity-50">{catalog.length}</span>
                )}
                {t === "Members" && isEdit && !membersLoading && (
                  <span className="ml-1.5 text-[10px] opacity-50">{members.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[65vh]">

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/*  Details Tab ─ */}
          {tab === "Details" && (
            <div className="flex flex-col gap-4">

              <Field label="Business Name *">
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Hilton Riyadh" />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Contact Name *">
                  <input className={inputCls} value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Ahmed Al Mansoori" />
                </Field>
                <Field label="Contact Phone *">
                  <input className={inputCls} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+966 50 000 0000" />
                </Field>
              </div>

              <Field label="Business Address">
                  <div className="flex flex-col gap-3">                

                    <textarea
                      value={address?.formattedAddress ?? ""}
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...(prev as UserAddress),
                          formattedAddress: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Select location on map"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none"
                    />                

                    <div className="h-[300px] rounded-xl overflow-hidden border border-slate-200">                

                      {isLoaded && (
                        <GoogleMap
                          mapContainerStyle={{
                            width: "100%",
                            height: "100%",
                          }}
                          center={
                            marker ?? {
                              lat: 24.7136,
                              lng: 46.6753,
                            }
                          }
                          zoom={marker ? 16 : 11}
                          onClick={handleMapClick}
                          options={{
                            disableDefaultUI: true,
                            zoomControl: true,
                          }}
                        >
                          {marker && (
                            <Marker
                              position={marker}
                            />
                          )}
                        </GoogleMap>
                      )}                

                    </div>                

                    {marker && (
                      <div className="text-xs text-slate-500">
                        Lat: {marker.lat.toFixed(6)}
                        <br />
                        Lng: {marker.lng.toFixed(6)}
                      </div>
                    )}
                  </div>
                </Field>

              {/* Join code — always shown in edit mode, no joinCode guard */}
              {isEdit && (
                <Field label="Join Code">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-10 px-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center font-mono text-sm font-bold text-slate-700 tracking-widest select-all">
                      {joinCode || <span className="text-slate-300 font-normal text-xs">No code set</span>}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={!joinCode}
                      title="Copy code"
                      className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-slate-500 disabled:opacity-40"
                    >
                      {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                    </button>
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      disabled={regenerating}
                      title="Regenerate code — invalidates the current one"
                      className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-slate-500 disabled:opacity-50"
                    >
                      {regenerating
                        ? <Loader2 size={14} className="animate-spin" />
                        : <RefreshCw size={14} />
                      }
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Info size={11} /> Regenerating invalidates the old code immediately — employees will need the new one.
                  </p>
                </Field>
              )}

              {/* Active toggle */}
              <Field label="Account Status">
                <div className="flex items-center gap-3 h-10">
                  <Switch
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    className="cursor-pointer data-[state=checked]:bg-purple-600!"
                  />
                  <span className={`text-sm font-semibold ${isActive ? "text-green-600" : "text-slate-400"}`}>
                    {isActive
                      ? "Active — join code works, members see business prices"
                      : "Inactive — join code paused, members fall back to standard prices"}
                  </span>
                </div>
              </Field>

              {/* Module A checkbox — add mode only */}
              {!isEdit && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <input
                    type="checkbox"
                    id="seedCheckbox"
                    checked={seedFromGlobal}
                    onChange={(e) => setSeedFromGlobal(e.target.checked)}
                    className="mt-0.5 accent-indigo-600 w-4 h-4 shrink-0"
                  />
                  <label htmlFor="seedCheckbox" className="text-sm text-indigo-700 font-medium cursor-pointer">
                    <span className="font-bold">Start from the default price list</span>
                    <span className="block text-xs text-indigo-500 mt-0.5 font-normal">
                      Pre-fills this business's catalog from your global Categories → Services → Items. You can edit individual prices after creating.
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/*  Catalog Tab  */}
          {tab === "Catalog" && isEdit && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {catalog.length} item{catalog.length !== 1 ? "s" : ""} in catalog
                </p>
                <button
                  type="button"
                  onClick={() => catalog.length > 0 ? setSeedReplaceOpen(true) : handleSeedFromGlobal(false)}
                  disabled={seeding}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition disabled:opacity-50"
                >
                  {seeding ? <Loader2 size={12} className="animate-spin" /> : <BookOpen size={12} />}
                  Copy default price list
                </button>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 border border-purple-100">
                <div className="w-8 h-8 rounded-lg bg-white border border-purple-200 flex items-center justify-center shrink-0">
                  <Percent size={14} className="text-[#7F50F4]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700">Catalog Discount</p>
                  <p className="text-[11px] text-slate-400">
                    Applies a % discount off the standard price list. Items not in the global price list (added manually) are skipped.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      value={discountPct}
                      onChange={(e) => setDiscountPct(e.target.value)}
                      className="h-9 w-20 pl-3 pr-6 rounded-lg border border-slate-200 bg-white text-sm text-right outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    disabled={applyingDiscount || catalog.length === 0}
                    className="h-9 px-4 rounded-lg bg-[#7F50F4] text-white text-xs font-bold hover:bg-[#6B3FD4] disabled:opacity-50 transition flex items-center gap-1.5"
                  >
                    {applyingDiscount ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    Apply
                  </button>
                </div>
              </div>

              {seedReplaceOpen && (
                <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col gap-2">
                  <p className="text-sm text-amber-700 font-medium">
                    The catalog already has {catalog.length} items. Replace everything with the default price list?
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => handleSeedFromGlobal(true)} className="px-4 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition">
                      Replace all
                    </button>
                    <button onClick={() => setSeedReplaceOpen(false)} className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {catalogLoading ? (
                <div className="flex justify-center py-12 text-slate-400 gap-2">
                  <Loader2 size={16} className="animate-spin" /> Loading catalog…
                </div>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {["Item", "Category", "Service", "Price", "Active", ""].map((h) => (
                          <th key={h} className="pb-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 first:pl-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {catalog.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition group">
                          {editingItem?.id === item.id ? (
                            <>
                              <td className="py-2 px-2 first:pl-0">
                                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 w-full px-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-indigo-400" />
                              </td>
                              <td className="py-2 px-2">
                                <input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="h-8 w-full px-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-indigo-400" placeholder="Category" />
                              </td>
                              <td className="py-2 px-2">
                                <input value={editSvcType} onChange={(e) => setEditSvcType(e.target.value)} className="h-8 w-full px-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-indigo-400" placeholder="Service" />
                              </td>
                              <td className="py-2 px-2">
                                <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="h-8 w-20 px-2 rounded-lg border border-slate-200 text-xs text-right outline-none focus:border-indigo-400" />
                              </td>
                              <td colSpan={2} className="py-2 px-2">
                                <div className="flex gap-2">
                                  <button onClick={saveEdit} disabled={savingItem} className="px-3 py-1 bg-[#7F50F4] text-white rounded-lg text-xs font-bold hover:bg-[#6B3FD4] disabled:opacity-50 flex items-center gap-1">
                                    {savingItem ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Save
                                  </button>
                                  <button onClick={cancelEdit} className="px-3 py-1 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold hover:bg-slate-50">Cancel</button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-2.5 px-2 first:pl-0 font-medium text-slate-700 text-xs">{item.name}</td>
                              <td className="py-2.5 px-2 text-slate-400 text-xs">{item.category ?? "—"}</td>
                              <td className="py-2.5 px-2 text-slate-400 text-xs">{item.serviceType ?? "—"}</td>
                              <td className="py-2.5 px-2 text-xs font-bold text-slate-700">SAR {item.price.toFixed(2)}</td>
                              <td className="py-2.5 px-2">
                                <Switch
                                  checked={item.isActive}
                                  onCheckedChange={() => handleToggleItem(item)}
                                  className="data-[state=checked]:bg-purple-600! scale-75"
                                />
                              </td>
                              <td className="py-2.5 px-2">
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                  <button onClick={() => startEdit(item)} className="text-slate-400 hover:text-[#7F50F4]"><Pencil size={13} /></button>
                                  <ConfirmActionDialog
                                    title="Remove item"
                                    description={`Remove "${item.name}" from this business's catalog?`}
                                    confirmLabel="Remove"
                                    onConfirm={() => handleDeleteItem(item.id)}
                                  >
                                    <button className="text-slate-400 hover:text-red-500"><Trash2 size={13} /></button>
                                  </ConfirmActionDialog>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}

                      {addingNew && (
                        <tr>
                          <td className="py-2 pl-0">
                            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Item name" autoFocus className="h-8 w-full px-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-indigo-400" />
                          </td>
                          <td className="py-2 px-2">
                            <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Category" className="h-8 w-full px-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-indigo-400" />
                          </td>
                          <td className="py-2 px-2">
                            <input value={newSvcType} onChange={(e) => setNewSvcType(e.target.value)} placeholder="Service" className="h-8 w-full px-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-indigo-400" />
                          </td>
                          <td className="py-2 px-2">
                            <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0.00" className="h-8 w-20 px-2 rounded-lg border border-slate-200 text-xs text-right outline-none focus:border-indigo-400" />
                          </td>
                          <td colSpan={2} className="py-2 px-2">
                            <div className="flex gap-2">
                              <button onClick={saveNewItem} disabled={savingItem || !newName.trim()} className="px-3 py-1 bg-[#7F50F4] text-white rounded-lg text-xs font-bold hover:bg-[#6B3FD4] disabled:opacity-50 flex items-center gap-1">
                                {savingItem ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Add
                              </button>
                              <button onClick={() => setAddingNew(false)} className="px-3 py-1 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold hover:bg-slate-50">Cancel</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {!addingNew && (
                    <button
                      onClick={() => setAddingNew(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#7F50F4] hover:text-[#6B3FD4] transition mt-1"
                    >
                      <Plus size={13} /> Add item manually
                    </button>
                  )}

                  {catalog.length === 0 && !addingNew && (
                    <p className="text-sm text-slate-400 text-center py-8">
                      No items yet — seed from the default price list or add manually.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/*  Members Tab ─ */}
          {tab === "Members" && isEdit && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-400">
                {members.length} member{members.length !== 1 ? "s" : ""} linked to this business
              </p>
              {membersLoading ? (
                <div className="flex justify-center py-12 text-slate-400 gap-2">
                  <Loader2 size={16} className="animate-spin" /> Loading members…
                </div>
              ) : members.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-12">
                  No members yet — employees join using the business's join code in the app.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Name", "Email", "Phone", "Joined", ""].map((h) => (
                        <th key={h} className="pb-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 first:pl-0">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {members.map((m) => (
                      <tr key={m.userId} className="hover:bg-slate-50 transition group">
                        <td className="py-3 px-2 first:pl-0 font-semibold text-slate-700 text-xs">{m.name}</td>
                        <td className="py-3 px-2 text-slate-400 text-xs">{m.email}</td>
                        <td className="py-3 px-2 text-slate-400 text-xs">{m.phone ?? "—"}</td>
                        <td className="py-3 px-2 text-slate-400 text-xs">
                          {new Date(m.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-3 px-2">
                          <ConfirmActionDialog
                            title="Remove member"
                            description={`Remove ${m.name} from this business? They will return to standard pricing.`}
                            confirmLabel="Remove"
                            onConfirm={() => handleRemoveMember(m.userId, m.name)}
                          >
                            <button className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-red-500">
                              <Trash2 size={13} />
                            </button>
                          </ConfirmActionDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Footer — only on Details tab */}
        {tab === "Details" && (
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
              className="flex-1 h-10 rounded-xl bg-[#7F50F4] text-white text-sm font-semibold hover:bg-[#6B3FD4] disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : isEdit ? "Save Changes" : <><Plus size={15} /> Add Business</>
              }
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}