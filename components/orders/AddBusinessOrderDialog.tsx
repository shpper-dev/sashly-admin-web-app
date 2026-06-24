"use client";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import {
  Plus, X, Search, Minus, Trash2, ShoppingBasket,
  AlertCircle, Loader2, Building2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Business, CatalogItem } from "@/lib/models/business.model";
import { getBusinesses, getCatalog } from "@/lib/firebase/business";
import { createBusinessOrder } from "@/lib/firebase/order";
import { useToast } from "@/lib/providers/ToastProvider";

interface BasketEntry {
  item:  CatalogItem;
  count: number;
}

interface AddBusinessOrderDialogProps {
  children:   React.ReactNode;
  onSuccess?: () => void;
}

const PLACEHOLDER_ADDRESS = {
  id: "business", userId: "", type: "business",
  formattedAddress: "Business pickup — see notes",
  lat: null, lng: null, address1: null, address2: null,
  city: null, state: null, postalCode: null, country: null,
  isDefault: true, buildingName: null, floor: null,
  apartment: null, specialLandmark: null, createdAt: Date.now(),
};

export default function AddBusinessOrderDialog({ children, onSuccess }: AddBusinessOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();

  const [businesses,      setBusinesses]      = useState<Business[]>([]);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [bizSearch,       setBizSearch]       = useState("");
  const [showBizDrop,     setShowBizDrop]     = useState(false);
  const [selectedBiz,     setSelectedBiz]     = useState<Business | null>(null);

  const [catalog,        setCatalog]        = useState<CatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [itemSearch,     setItemSearch]     = useState("");
  const [basket,         setBasket]         = useState<BasketEntry[]>([]);

  const [serviceType,  setServiceType]  = useState<"ordinary" | "express">("ordinary");
  const [notes,        setNotes]        = useState("");
  const [pickupDate,   setPickupDate]   = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  useEffect(() => {
    if (!open) return;
    setBusinessLoading(true);
    getBusinesses()
      .then(rows => setBusinesses(rows.filter(b => b.isActive)))
      .finally(() => setBusinessLoading(false));
  }, [open]);

  useEffect(() => {
    if (!selectedBiz) { setCatalog([]); return; }
    setCatalogLoading(true);
    getCatalog(selectedBiz.id)
      .then(items => setCatalog(items.filter(i => i.isActive)))
      .finally(() => setCatalogLoading(false));
  }, [selectedBiz]);

  const resetForm = () => {
    setSelectedBiz(null); setBizSearch(""); setCatalog([]);
    setBasket([]); setItemSearch(""); setNotes("");
    setPickupDate(""); setDeliveryDate("");
    setServiceType("ordinary"); setError("");
  };

  const addItem = (item: CatalogItem) =>
    setBasket(prev => {
      const existing = prev.find(e => e.item.id === item.id);
      if (existing) return prev.map(e => e.item.id === item.id ? { ...e, count: e.count + 1 } : e);
      return [...prev, { item, count: 1 }];
    });

  const increment  = (id: string) => setBasket(prev => prev.map(e => e.item.id === id ? { ...e, count: e.count + 1 } : e));
  const decrement  = (id: string) => setBasket(prev => prev.map(e => e.item.id === id ? { ...e, count: e.count - 1 } : e).filter(e => e.count > 0));
  const removeEntry = (id: string) => setBasket(prev => prev.filter(e => e.item.id !== id));

  const subtotal   = basket.reduce((s, e) => s + e.item.price * e.count, 0);
  const totalItems = basket.reduce((s, e) => s + e.count, 0);
  const canCheckout = !!selectedBiz && basket.length > 0 && !!pickupDate;

  const filteredCatalog = catalog.filter(i =>
    !itemSearch ||
    i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    (i.category ?? "").toLowerCase().includes(itemSearch.toLowerCase())
  );

  const filteredBiz = businesses.filter(b =>
    !bizSearch || b.name.toLowerCase().includes(bizSearch.toLowerCase())
  );

  const handleCheckout = async () => {
    if (!selectedBiz || basket.length === 0) return;
    setError(""); setSaving(true);
    try {
      const now = Date.now();
      const pickupMs   = pickupDate   ? new Date(pickupDate).getTime()   : now + 86400000;
      const deliveryMs = deliveryDate ? new Date(deliveryDate).getTime() : pickupMs + 86400000;
      await createBusinessOrder({
        businessId:      selectedBiz.id,
        businessName:    selectedBiz.name,
        businessPhone:   selectedBiz.contactPhone,
        catalogItemIds:  basket.map(e => ({ itemId: e.item.id, count: e.count })),
        serviceType,
        pickUpStartTime: pickupMs,
        pickUpEndTime:   pickupMs + 3600000,
        pickUpAddress:   selectedBiz.address ?? PLACEHOLDER_ADDRESS,
        deliveryAddress: selectedBiz.address ?? PLACEHOLDER_ADDRESS,
        expectedDeliveryTime: deliveryMs,
        notes: notes.trim() || null,
      });
      showToast(`Business order created for ${selectedBiz.name}`, "success");
      onSuccess?.();
      setOpen(false);
      resetForm();
    } catch (e: any) {
      setError(e.message ?? "Failed to create order. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      
      <DialogContent className="p-0 gap-0 border-0 overflow-hidden !w-[80vw] !max-w-none !h-[95vh] rounded-3xl shadow-2xl flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>Add Business Order</DialogTitle>
        </DialogHeader>

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 py-2 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4">
            <DialogClose onClick={resetForm}>
              <div className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 rounded-[14px] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <X size={16} color="#62748E" strokeWidth={1.8} />
              </div>
            </DialogClose>
            <div className="flex flex-col gap-0.5">
              <h1 className="text-2xl font-bold text-[#101828] leading-8">New Business Order</h1>
              <p className="text-sm text-[#6A7282] font-normal">Select business → pick items from their catalog</p>
            </div>
          </div>

          {/* Service type toggle */}
          <div className="flex bg-slate-100 shadow-inner rounded-xl p-1 gap-1">
            {(["ordinary", "express"] as const).map(t => (
              <button
                key={t}
                onClick={() => setServiceType(t)}
                className={`px-5 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                  serviceType === t ? "bg-white shadow text-[#7F50F4]" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* ══ LEFT: Business selection + Catalog (wider, scrollable) ══ */}
          <div className="w-[60%] shrink-0 flex flex-col overflow-hidden border-r border-gray-100">

            {/* Error banner */}
            {error && (
              <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2 shrink-0">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {/* 1. Select Business — fixed height */}
            <div className="px-6 pt-5 pb-4 shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
                  <span className="text-xs font-bold text-[#101828] uppercase tracking-wider flex items-center gap-2">
                    <Building2 size={13} className="text-[#7F50F4]" />
                    1. Select Business
                  </span>
                  {selectedBiz && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Active</span>
                  )}
                </div>

                <div className="px-5 pt-3.5 pb-4 relative">
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                    <Search size={14} color="#94A3B8" strokeWidth={1.8} />
                    <input
                      value={bizSearch}
                      onChange={e => { setBizSearch(e.target.value); setShowBizDrop(true); }}
                      onFocus={() => setShowBizDrop(true)}
                      onBlur={() => setTimeout(() => setShowBizDrop(false), 150)}
                      placeholder="Search business name…"
                      className="bg-transparent outline-none text-sm font-semibold text-[#101828] placeholder:text-[#94A3B8] w-full"
                    />
                    {businessLoading && <Loader2 size={13} className="animate-spin text-slate-400 shrink-0" />}
                  </div>

                  {/* Business dropdown */}
                  {showBizDrop && filteredBiz.length > 0 && (
                    <div className="absolute left-5 right-5 top-[calc(100%-6px)] z-30 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                      {filteredBiz.map(b => (
                        <button
                          key={b.id}
                          onMouseDown={() => { setSelectedBiz(b); setBizSearch(""); setShowBizDrop(false); setBasket([]); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 transition text-left border-b border-slate-50 last:border-0"
                        >
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 text-purple-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {b.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#101828]">{b.name}</p>
                            <p className="text-xs text-[#94A3B8]">{b.contactName} · {b.joinCode}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selected chip */}
                  {selectedBiz && (
                    <div className="mt-3 flex items-center justify-between px-4 py-2.5 bg-[#FAF5FF] border border-purple-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 text-purple-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {selectedBiz.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#101828]">{selectedBiz.name}</p>
                          <p className="text-xs text-[#94A3B8]">{selectedBiz.contactName} · {selectedBiz.contactPhone}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setSelectedBiz(null); setBasket([]); setCatalog([]); }}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white transition"
                      >
                        <X size={13} color="#62748E" strokeWidth={2} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Catalog — takes all remaining height and scrolls internally */}
            <div className="flex-1 flex flex-col overflow-hidden px-6 pb-5 min-h-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden h-full">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 shrink-0">
                  <span className="text-xs font-bold text-[#101828] uppercase tracking-wider">2. Select Items</span>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl w-40">
                    <Search size={12} color="#94A3B8" strokeWidth={1.8} />
                    <input
                      value={itemSearch}
                      onChange={e => setItemSearch(e.target.value)}
                      placeholder="Filter items…"
                      className="bg-transparent outline-none text-[11px] font-medium text-[#94A3B8] placeholder:text-[#94A3B8] w-full"
                    />
                  </div>
                </div>

                {/* Scrollable catalog grid */}
                <div className="flex-1 overflow-y-auto p-5 min-h-0">
                  {!selectedBiz ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                      <Building2 size={32} className="opacity-20" />
                      <p className="text-sm text-center">Select a business above to see their catalog</p>
                    </div>
                  ) : catalogLoading ? (
                    <div className="flex justify-center py-10 gap-2 text-slate-400">
                      <Loader2 size={16} className="animate-spin" /> Loading catalog…
                    </div>
                  ) : filteredCatalog.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-10">
                      {catalog.length === 0 ? "This business has no catalog items yet." : "No items match your filter."}
                    </p>
                  ) : (() => {
                    const groups = filteredCatalog.reduce<Record<string, CatalogItem[]>>((acc, item) => {
                      const key = item.category ?? "Uncategorized";
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(item);
                      return acc;
                    }, {});

                    return Object.entries(groups).map(([category, items]) => (
                      <div key={category} className="mb-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 pl-0.5">{category}</p>
                        <div className="grid grid-cols-3 gap-3">
                          {items.map(item => {
                            const inBasket = basket.find(e => e.item.id === item.id);
                            return (
                              <button
                                key={item.id}
                                onClick={() => addItem(item)}
                                className={`relative flex flex-col items-start p-3 gap-1.5 rounded-2xl border transition-all text-left ${
                                  inBasket
                                    ? "border-[#7F50F4] bg-[#FAF5FF] shadow-sm"
                                    : "border-gray-100 bg-white hover:shadow-md hover:-translate-y-0.5"
                                }`}
                              >
                                {inBasket && (
                                  <span className="absolute top-2 right-2 w-5 h-5 bg-[#7F50F4] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {inBasket.count}
                                  </span>
                                )}
                                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center shrink-0">
                                  <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                                    <path d="M8 3L5 6v3h2v10h8V9h2V6l-3-3-2 2-2-2z" fill="#7F50F4" opacity="0.75" />
                                  </svg>
                                </div>
                                <p className="text-xs font-bold text-[#1D293D] leading-tight pr-5">{item.name}</p>
                                {item.serviceType && (
                                  <p className="text-[10px] text-slate-400 leading-none">{item.serviceType}</p>
                                )}
                                <p className="text-xs font-bold text-[#4F39F6]">SAR {item.price.toFixed(2)}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* ══ RIGHT: Order Details + Basket ══ */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">

            {/* 3. Order Details — fixed, doesn't scroll */}
            <div className="px-6 pt-5 pb-4 shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
                <span className="text-xs font-bold text-[#101828] uppercase tracking-wider">3. Order Details</span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pickup Date *</label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={e => setPickupDate(e.target.value)}
                      className="h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expected Delivery</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={e => setDeliveryDate(e.target.value)}
                      className="h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Pickup from hotel lobby, room 304 items…"
                    rows={1}
                    className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition resize-none placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* 4. Basket — takes remaining height, scrolls */}
            <div className="flex-1 flex flex-col overflow-hidden px-6 pb-0 min-h-0">
              <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Basket header */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-[#FBFCFD] border-b border-gray-100 shrink-0">
                  <div className="flex items-center gap-2">
                    <ShoppingBasket size={18} color="#02D0FF" strokeWidth={1.8} />
                    <span className="text-xs font-bold text-[#101828] uppercase tracking-wider">Review</span>
                  </div>
                  <div className="px-2 py-1 bg-[#F1F5F9] rounded">
                    <span className="text-xs font-semibold text-[#6A7282]">{totalItems} {totalItems === 1 ? "Item" : "Items"}</span>
                  </div>
                </div>

                {/* Basket items — scrollable */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 p-4 min-h-0">
                  {basket.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                      <ShoppingBasket size={28} className="opacity-20" />
                      <span className="text-sm italic font-bold">Basket is empty</span>
                      <span className="text-xs text-center">Click items in the catalog to add them</span>
                    </div>
                  ) : (
                    basket.map((entry, i) => (
                      <div
                        key={`${entry.item.id}-${i}`}
                        className="flex justify-between items-start p-3.5 gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl"
                      >
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <span className="font-bold text-[#101828] text-sm leading-tight">{entry.item.name}</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {entry.item.category && (
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{entry.item.category}</span>
                            )}
                            {entry.item.serviceType && (
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{entry.item.serviceType}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-[#101828]">QTY {entry.count}</span>
                            <span className="w-1 h-1 rounded-full bg-[#02D0FF]" />
                            <span className="font-bold text-xs text-[#7F50F4]">SAR {entry.item.price.toFixed(2)}</span>
                            <span className="text-[10px] text-slate-400">= SAR {(entry.item.price * entry.count).toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 px-2 py-1.5 bg-white border border-gray-100 rounded-2xl shrink-0">
                          <button onClick={() => increment(entry.item.id)} className="hover:opacity-70 transition p-0.5">
                            <Plus size={14} color="#02D0FF" strokeWidth={2.5} />
                          </button>
                          <span className="font-bold text-[#101828] text-xs min-w-4 text-center">{entry.count}</span>
                          {entry.count === 1 ? (
                            <button onClick={() => removeEntry(entry.item.id)} className="hover:opacity-70 transition p-0.5">
                              <Trash2 size={12} color="#F87171" strokeWidth={2} />
                            </button>
                          ) : (
                            <button onClick={() => decrement(entry.item.id)} className="hover:opacity-70 transition p-0.5">
                              <Minus size={14} color="#02D0FF" strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Summary + checkout — pinned to bottom of basket card */}
                <div className="px-5 py-4 border-t border-gray-100 bg-[rgba(248,250,252,0.6)] flex flex-col gap-2.5 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#90A1B9] uppercase tracking-wider">Subtotal</span>
                    <span className="text-sm font-bold text-[#314158]">SAR {subtotal.toFixed(2)}</span>
                  </div>
                  {selectedBiz && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#90A1B9] uppercase tracking-wider">Business</span>
                      <span className="text-xs font-bold text-[#7F50F4]">{selectedBiz.name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2.5 border-t border-[#E2E8F0]">
                    <span className="text-base font-bold text-[#0F172B] uppercase tracking-tight">Total</span>
                    <span className={`text-xl font-bold ${subtotal > 0 ? "text-[#4F39F6]" : "text-[#90A1B9]"}`}>
                      SAR {subtotal.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={!canCheckout || saving}
                    className="w-full py-3.5 text-white font-extrabold text-sm rounded-2xl tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                    style={{
                      background: canCheckout && !saving ? "#00D1FF" : "#E5DCFD",
                      boxShadow: canCheckout && !saving
                        ? "0px 8px 15px -3px rgba(0,209,255,0.25)"
                        : "none",
                    }}
                  >
                    {saving
                      ? <><Loader2 size={15} className="animate-spin" /> Creating Order…</>
                      : "CREATE ORDER"
                    }
                  </button>

                  {!canCheckout && (
                    <div className="flex items-center justify-center gap-1.5">
                      <AlertCircle size={11} color="#EF4444" strokeWidth={2} />
                      <span className="text-[10px] font-semibold text-[#EF4444]">
                        {!selectedBiz && basket.length === 0 ? "Select a business and add items"
                         : !selectedBiz                      ? "No business selected"
                         : basket.length === 0               ? "No items in basket"
                         :                                     "Pickup date is required"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* bottom padding so basket card doesn't clip the page edge */}
            <div className="h-5 shrink-0" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}