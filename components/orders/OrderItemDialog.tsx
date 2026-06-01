"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { X, Loader2, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { getServices, getItems } from "@/lib/firebase/product";
import { Item, Service } from "@/lib/models/product.model";
import { OrderItem } from "@/lib/models/order.model";
import { addItemsToOrder, addItemToOrder, updateOrderItem } from "@/lib/firebase/order";
import { useToast } from "@/lib/providers/ToastProvider";

type Props =
  | { mode: "add";  orderId: string; orderItem?: never; itemIndex?: never; children: React.ReactNode; onSuccess?: () => void }
  | { mode: "edit"; orderId: string; orderItem: OrderItem; itemIndex: number; children: React.ReactNode; onSuccess?: () => void };

// Cart entry used only in "add" mode
interface CartEntry {
  item: Item;
  service: Service;
  quantity: number;
}

export default function OrderItemDialog({ mode, orderId, orderItem, itemIndex, children, onSuccess }: Props) {
  const isEdit = mode === "edit";
  const [open, setOpen] = useState(false);

  // data
  const [items, setItems]       = useState<Item[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string>("");

  // current selection (the "staging" row before adding to cart)
  const [selectedItem, setSelectedItem]       = useState<Item | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [quantity, setQuantity]               = useState(1);

  // cart — only used in add mode
  const [cart, setCart] = useState<CartEntry[]>([]);

  const { showToast } = useToast();

  useEffect(() => {
    if (!open) return;
    async function fetchData() {
      setLoading(true);
      try {
        const [fetchedItems] = await Promise.all([getItems(), getServices()]);
        setItems(fetchedItems);

        // Edit mode — pre-populate the single selection
        if (isEdit && orderItem) {
          const currentItem = fetchedItems.find((i) => i.id === orderItem.id);
          setSelectedItem(currentItem ?? null);
          setServices(currentItem?.services ?? []);
          setSelectedService(currentItem?.services.find((s) => s.name === orderItem.serviceName) ?? null);
          setQuantity(orderItem.count);
        }
      } catch (e) {
        console.error("Failed to fetch:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [open, isEdit, orderItem]);

  // Sync services when item changes
  useEffect(() => {
    if (!selectedItem) return;
    setServices(selectedItem.services || []);
    if (!isEdit) setSelectedService(selectedItem.services?.[0] || null);
  }, [selectedItem]);

  // ── Cart helpers (add mode only) ──

  // Add the current staged selection into the cart
  const addToCart = () => {
    if (!selectedItem || !selectedService) return;

    setCart((prev) => {
      // If same item+service already in cart, just bump quantity
      const existing = prev.findIndex(
        (e) => e.item.id === selectedItem.id && e.service.id === selectedService.id
      );
      if (existing !== -1) {
        return prev.map((e, i) =>
          i === existing ? { ...e, quantity: e.quantity + quantity } : e
        );
      }
      return [...prev, { item: selectedItem, service: selectedService, quantity }];
    });

    // Reset staging area so the user can pick the next item
    setSelectedItem(null);
    setSelectedService(null);
    setQuantity(1);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCartQty = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((e, i) => (i === index ? { ...e, quantity: Math.max(1, e.quantity + delta) } : e))
    );
  };

  // ── Confirm ──
  const handleConfirm = async () => {
    setError("");

    // Edit mode — single item update (unchanged behaviour)
    if (isEdit) {
      if (!selectedItem || !selectedService) return;
      setSaving(true);
      try {
        const payload: OrderItem = {
          id: selectedItem.id,
          name: selectedItem.name,
          arabicName: selectedItem.arabicName || "",
          categoryId: selectedItem.categoryId || "",
          serviceName: selectedService.name,
          serviceArabicName: selectedService.arabicName || "",
          servicePrice: selectedService.price,
          count: quantity,
          photoUrl: selectedItem.photoUrl || null,
        };
        await updateOrderItem(orderId, itemIndex!, payload);
        onSuccess?.();
        setOpen(false);
        showToast(`Order ${orderId} updated successfully.`, "success");
      } catch (e) {
        console.error(e);
        setError("Failed to update item. Please try again.");
      } finally {
        setSaving(false);
      }
      return;
    }

    // Add mode — flush the whole cart
    if (cart.length === 0) return;
    setSaving(true);
    try {
      // add all items
      await addItemsToOrder(
          orderId,
          cart.map((entry) => ({
            id: entry.item.id,
            name: entry.item.name,
            arabicName: entry.item.arabicName || "",
            categoryId: entry.item.categoryId || "",
            serviceName: entry.service.name,
            serviceArabicName: entry.service.arabicName || "",
            servicePrice: entry.service.price,
            count: entry.quantity,
            photoUrl: entry.item.photoUrl || null,
          }))
        );
      onSuccess?.();
      reset();
      setOpen(false);
      showToast(`Added ${cart.length} item${cart.length > 1 ? "s" : ""} to order ${orderId}.`, "success");
    } catch (e) {
      console.error(e);
      setError("Failed to add items. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    if (!isEdit) {
      setSelectedItem(null);
      setSelectedService(null);
      setQuantity(1);
      setCart([]);
    }
    setError("");
  };

  // Staging row is ready to add to cart
  const canStage   = !!selectedItem && !!selectedService && quantity >= 1;
  // Confirm is enabled when cart has items (add) or staging is ready (edit)
  const canConfirm = isEdit ? canStage : cart.length > 0;

  const cartTotal = cart.reduce((acc, e) => acc + e.service.price * e.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-bold text-slate-800">
            {isEdit ? "Edit Item" : "Add Items"}
          </DialogTitle>
          <DialogClose onClick={reset}>
            <X className="w-4 h-4 text-slate-400" />
          </DialogClose>
        </DialogHeader>

        <div className="px-6 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : (
            <>
              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
              )}

              {/* ITEM PICKER */}
              <div>
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">
                  Select Item
                </p>
                {items.length === 0 ? (
                  <p className="text-xs text-slate-400">No items found.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => {
                      const active = selectedItem?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedItem(active ? null : item)}
                          disabled={isEdit && item.id !== selectedItem?.id}
                          className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                            active
                              ? "border-cyan-400 text-cyan-600 bg-cyan-50"
                              : "border-slate-200 text-slate-500 bg-white hover:border-slate-300"
                          } disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          {item.photoUrl && (
                            <img src={item.photoUrl} alt={item.name} className="w-4 h-4 rounded-full object-cover shrink-0" />
                          )}
                          {item.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SERVICE PICKER */}
              <div>
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">
                  Select Service
                </p>
                {services.length === 0 ? (
                  <p className="text-xs text-slate-400">{selectedItem ? "No services for this item." : "Select an item first."}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {services.map((svc) => {
                      const active = selectedService?.id === svc.id;
                      return (
                        <button
                          key={svc.id}
                          onClick={() => setSelectedService(active ? null : svc)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                            active
                              ? "border-cyan-400 text-cyan-600 bg-cyan-50"
                              : "border-slate-200 text-slate-500 bg-white hover:border-slate-300"
                          }`}
                        >
                          {svc.name}
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            active ? "bg-cyan-100 text-cyan-700" : "bg-slate-100 text-slate-400"
                          }`}>
                            SAR {svc.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* QUANTITY + ADD TO CART ROW */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-white shadow flex items-center justify-center text-base font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-9 text-center text-sm font-bold text-slate-700">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-lg bg-white shadow flex items-center justify-center text-base font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Add to cart — only shown in add mode */}
                {!isEdit && (
                  <button
                    onClick={addToCart}
                    disabled={!canStage}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                    Add to Cart
                  </button>
                )}
              </div>

              {/* ── CART (add mode only) ── */}
              {!isEdit && cart.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      Cart ({cart.length})
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {cart.map((entry, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">

                        {/* Item photo */}
                        {entry.item.photoUrl ? (
                          <img src={entry.item.photoUrl} alt={entry.item.name} className="w-7 h-7 rounded-lg object-cover shrink-0 border" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-slate-200 shrink-0" />
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {entry.item.name} · {entry.service.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            SAR {entry.service.price.toFixed(2)} × {entry.quantity} = SAR {(entry.service.price * entry.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Qty controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => updateCartQty(i, -1)}
                            className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
                          >
                            <Minus className="w-2.5 h-2.5 text-slate-500" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-700">{entry.quantity}</span>
                          <button
                            onClick={() => updateCartQty(i, +1)}
                            className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5 text-slate-500" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(i)}
                          className="w-6 h-6 rounded-md bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors shrink-0"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Cart total */}
                  <div className="flex items-center justify-between px-3 py-2 bg-cyan-50 border border-cyan-100 rounded-xl">
                    <span className="text-xs font-semibold text-slate-600">Cart Total</span>
                    <span className="text-sm font-black text-slate-800">SAR {cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Edit mode summary */}
              {isEdit && canStage && (
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-slate-700">
                      {selectedItem!.name} · {selectedService!.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      SAR {selectedService!.price.toFixed(2)} × {quantity}
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-800">
                    SAR {(selectedService!.price * quantity).toFixed(2)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
          <DialogClose asChild>
            <button onClick={reset} className="text-xs font-bold tracking-widest text-slate-400 uppercase hover:text-slate-600 transition-colors">
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || saving}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 text-white font-semibold text-sm hover:bg-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
              : isEdit
                ? "Save Changes"
                : `Add ${cart.length > 0 ? `${cart.length} Item${cart.length > 1 ? "s" : ""}` : "to Order"}`
            }
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}