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
import { X, Loader2 } from "lucide-react";
import { getServices, getItems } from "@/lib/firebase/product";
import { Item, Service } from "@/lib/models/product.model";
import { OrderItem } from "@/lib/models/order.model"; 
import { addItemToOrder, updateOrderItem } from "@/lib/firebase/order";
import { useToast } from "@/lib/providers/ToastProvider";

type Props =
  | { mode: "add"; orderId:string, orderItem?: never; itemIndex?: never; children: React.ReactNode; onSuccess?: () => void }
  | { mode: "edit"; orderId:string, orderItem: OrderItem; itemIndex: number; children: React.ReactNode; onSuccess?: () => void };

export default function OrderItemDialog({ mode, orderId, orderItem, itemIndex, children, onSuccess }: Props) {
  const isEdit = mode === "edit";
  const [open, setOpen] = useState(false);

  // data
  const [items, setItems] = useState<Item[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]  = useState<string>("");

  // selections
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [quantity, setQuantity] = useState(1);

  const {showToast} = useToast();

  useEffect(() => {
    if (!open) return;
    async function fetchData() {
      setLoading(true);
      try {
        const [fetchedItems] = await Promise.all([getItems(), getServices()]);
        setItems(fetchedItems);

        if (isEdit && orderItem) {
          const currentItem = fetchedItems.find((i) => i.id === orderItem.id);
          setSelectedItem(currentItem ?? null);
          setServices(currentItem?.services ?? []);
          setSelectedService(currentItem?.services.find(s => s.name === orderItem.serviceName) ?? null);
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
    // Only auto-select first service if not in edit mode init
    if (!isEdit) setSelectedService(selectedItem.services?.[0] || null);
  }, [selectedItem]);

  const handleConfirm = async () => {
    if (!selectedItem || !selectedService) return;

    setLoading(true);
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

      if (isEdit && itemIndex !== undefined) {
        await updateOrderItem(orderId, itemIndex, payload);
      } else {
        await addItemToOrder(orderId, payload);
      }

      onSuccess?.();
      setOpen(false);
      showToast(`Order: ${orderId} updated successfully.`, "success");
    } catch (error) {
      console.error("Operation failed:", error);
      setError(`Failed to ${isEdit ? "update" : "create"} item. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    if (!isEdit) {
      setSelectedItem(null);
      setSelectedService(null);
      setQuantity(1);
    }
  };

  const canConfirm = !!selectedItem && !!selectedService && quantity >= 1;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-3 py-4 border-b flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-bold text-slate-800">
            {isEdit ? "Edit Item" : "Add New Item"}
          </DialogTitle>
          <DialogClose onClick={reset}>
            <X className="w-4 h-4 text-slate-400" />
          </DialogClose>
        </DialogHeader>

        <div className="px-6 py-2 space-y-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : (
            <>
              {/* ITEMS */}
              {error && (
              <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
            )}
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
                          className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                            active
                              ? "border-cyan-400 text-cyan-600 bg-cyan-50"
                              : "border-slate-200 text-slate-500 bg-white hover:border-slate-300"
                          }  disabled:cursor-not-allowed`}
                          //disabling item selection in edit mode
                          disabled={isEdit && item.id !== selectedItem?.id}
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

              {/* SERVICES */}
              <div>
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">
                  Select Service
                </p>
                {services.length === 0 ? (
                  <p className="text-xs text-slate-400">No services found.</p>
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

              <div className="border-t" />

              {/* QUANTITY */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Quantity</p>
                  <p className="text-xs text-slate-400">Set number of pieces</p>
                </div>

                <div className="flex items-center bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-lg bg-white shadow flex items-center justify-center text-base font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-700">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded-lg bg-white shadow flex items-center justify-center text-base font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Summary */}
              {canConfirm && (
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
            disabled={!canConfirm}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 text-white font-semibold text-sm hover:bg-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isEdit ? "Save Changes" : "Add to Order"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}