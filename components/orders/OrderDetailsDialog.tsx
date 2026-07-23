"use client";

import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import {
  NotebookTabs, X, 
  CreditCard, Star, Package, Truck, CheckCircle2,
  Circle, Shirt, Clock,
  Plus,
  Pencil,
} from "lucide-react";
import { Order, OrderStatuses } from "@/lib/models/order.model";
import UpdateOrderDialog from "./UpdateOrderDialog";
import { useEffect, useState } from "react";
import { OrderPriceSection } from "./OrderPriceSection";
import OrderPaymentDialog from "./OrderPaymentDialog";
import OrderInvoiceDialog from "./OrderInvoiceDialog";
import OrderChat from "./OrderChat";
import OrderItemDialog from "./OrderItemDialog";
import {  deleteOrderItem } from "@/lib/firebase/order";
import { useToast } from "@/lib/providers/ToastProvider";
import ConfirmDeliveryDialog from "./ConfirmDeliveryDialog";

import {  useOrderServiceDowngrade } from "@/hooks/useOrderServiceDowngrade";
import EditPickupWindowDialog from "./EditPickupWindowDialog";
import DisputeResolutionCard from "./DisputeResolutionCard";


interface Props {
  order: Order;
  children: React.ReactNode;
  onStatusUpdate: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  confirmed:      { label: "Confirmed",        color: "text-blue-600",   dot: "bg-blue-500"   },
  pickedUp:       { label: "Picked Up",        color: "text-indigo-600", dot: "bg-indigo-500" },
  sorting:        { label: "Sorting",          color: "text-yellow-600", dot: "bg-yellow-500" },
  detailing:      { label: "detailing",        color: "text-pink-600",   dot: "bg-pink-500"   },
  cleaning:       { label: "Cleaning",         color: "text-orange-600", dot: "bg-orange-500" },
  readyToDeliver: { label: "Ready to Deliver", color: "text-purple-600", dot: "bg-purple-500" },
  delivered:      { label: "Delivered",        color: "text-green-600",  dot: "bg-green-500"  },
  disputed:       { label: "Disputed",         color: "text-red-500",    dot: "bg-red-400"  },
  disputeResolved:{ label: "Dispute Resolved", color: "text-green-500",  dot: "bg-green-400"  },
  cancelled:      { label: "Cancelled",        color: "text-red-600",    dot: "bg-red-500"    },
};

function fmt(ts?: number | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(ts?: number | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function OrderDetailsDialog({  order, children, onStatusUpdate, open: controlledOpen, onOpenChange }: Props) {
  useOrderServiceDowngrade(order.id, onStatusUpdate);
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen       = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (val: boolean) => {
    if (isControlled) {
      onOpenChange?.(val);
    } else {
      setInternalOpen(val);
    }
  };
  const cfg = STATUS_CONFIG[order.latestStatus.status] ?? { label: order.latestStatus.status, color: "text-slate-600", dot: "bg-slate-400" };

  const canEditPickupWindow = order.latestStatus.status === "confirmed" && !order.isCancelled;

  const {showToast} = useToast();
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="p-0 gap-0 border-0 overflow-hidden w-[95vw]! max-w-none! h-[95vh]! min-w-0! rounded-2xl shadow-2xl">
        <div className="flex flex-col h-full overflow-hidden">

          {/*  Header*/}
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b shrink-0">
            <div className="flex items-center gap-4">
              <span className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <NotebookTabs className="h-5 w-5 text-[#02D0FF]" />
              </span>
              <div>
                <DialogTitle className="text-base font-bold uppercase tracking-wide">
                  Order #{order?.orderNumber ?? order.id}
                </DialogTitle>
                <p className="text-xs text-slate-400">
                  Placed {fmt(order.createdAt)} · Updated {fmt(order.updatedAt)}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-semibold">Email</span>
              <span className="text-xs text-[#02d0ff]">{order.userEmail}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-semibold">Phone</span>
              <span className="text-xs text-[#02d0ff]">{order.userPhone}</span>
            </div>
            <DialogClose asChild>
              <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </DialogClose>
          </DialogHeader>

          {/*  Status banner */}
          <div className="px-6 py-3 border-b bg-slate-50 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">

                {/* Current status */}
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Status</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <p className={`font-bold text-sm uppercase ${cfg.color}`}>{cfg.label}</p>
                  </div>
                </div>

                <div className="w-px h-8 bg-slate-200" />

                {/* Service type */}
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Service</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Shirt className="h-3.5 w-3.5 text-slate-400" />
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                      order.serviceType === "express"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {order.serviceType}
                    </span>
                  </div>
                </div>

                <div className="w-px h-8 bg-slate-200" />

                {/* Ready by */}
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Ready By</p>
                  {(order.isDelivered || order.isCancelled) ? (
                    <p className="font-semibold text-sm text-slate-700 mt-0.5">{fmt(order.expectedDeliveryTime)}</p>
                  ):(
                    <ConfirmDeliveryDialog 
                    orderId={order.id} orderCreatedAt={order.createdAt} 
                    existingExpectedDelivery={order.expectedDeliveryTime} onSuccess={onStatusUpdate} >
                      <p className="font-semibold text-sm text-slate-700 mt-0.5 cursor-pointer hover:text-[#02d0ff]">{fmt(order.expectedDeliveryTime)}</p>
                    </ConfirmDeliveryDialog>
                  )}
                  
                </div>

                <div className="w-px h-8 bg-slate-200" />

                {/* Payment */}
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Payment</p>
                  <span className={`text-xs font-bold mt-0.5 ${order.isPaid ? "text-green-600" : "text-red-500"}`}>
                    {order.isPaid ? `PAID · ${order.paidBy ?? ""} · ${fmt(order.paymentDate)}` : "UNPAID"}
                  </span>
                </div>

              </div>
              <div className="flex items-center gap-3">
                
              {!order.isPaid && !order.isCancelled && (
                  <OrderPaymentDialog total={order.totalPrice} 
                   orderId={order.id}
                   isPaid={order.isPaid}
                   onSuccess={()=>{
                    onStatusUpdate();
                   
                   }}
                   >
                     <button className="px-4 py-2 text-xs flex items-center gap-2 bg-[#02D0FF]  hover:bg-[#10ccf7] text-white rounded-full font-bold cursor-pointer transition-colors shadow-sm">
                       PAY
                     </button>
                   </OrderPaymentDialog>

                )}

              <UpdateOrderDialog
                orderId={order.id}
                userId={order.userId} //for dispute message creation, might change to adminId later
                currentStatus={order.latestStatus.status as OrderStatuses}
                onSuccess={() => onStatusUpdate()}
              >
                <button className="px-4 py-2 bg-[#02D0FF] hover:bg-[#10ccf7] text-white rounded-full text-xs font-bold cursor-pointer transition-colors shadow-sm">
                  UPDATE STATUS
                </button>
              </UpdateOrderDialog>
              </div>
            </div>
          </div>

          {/* Body — 3 column layout*/}
          <div className="flex-1 overflow-hidden flex">

            {/* LEFT column */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6 border-r border-slate-100">
                {/* Line items */}
              <Section title={`Line Items (${order.items.length})`} titleButton={ !order.isPaid ? (
                <OrderItemDialog mode="add" orderId={order.id} onSuccess={onStatusUpdate} businessAccountId={order.businessAccountId ?? null}  >
                  <button className="flex items-center gap-1 text-[10px] px-2 py-1 shadow-sm border border-cyan-300 rounded-lg text-[#02d0ff]">
                  <Plus className="h-2.5 w-2.5" strokeWidth={3} /> Add Item(s)
                </button>
                </OrderItemDialog>
              ):("")}>
                <div className="flex flex-col gap-3 mt-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="relative flex items-center gap-3 border border-slate-100 rounded-xl p-3 bg-white">                  

                      {/* Edit + Delete icons */}
                     {!order.isPaid && (
                       <div className="absolute top-[-9] right-[-10] flex items-center gap-2">
                        <OrderItemDialog mode="edit" orderId={order.id} orderItem={item} itemIndex={i} onSuccess={onStatusUpdate } businessAccountId={order.businessAccountId ?? null}>
                          <button className="w-5 h-5 bg-purple-100 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors shadow-sm">
                            <Pencil className="h-3 w-3" />
                          </button>
                        </OrderItemDialog>
                          <button className="w-5 h-5 bg-red-50 flex items-center justify-center rounded-md hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors cursor-pointer shadow-sm"
                          onClick={async () => {
                             await deleteOrderItem(order.id, i);
                             onStatusUpdate();
                          }}>
                            <X className="h-3 w-3" />
                          </button>
                      </div>  
                     )}                

                      {item.photoUrl ? (
                        <img src={item.photoUrl} alt={item.name} className="w-9 h-9 rounded-lg object-cover shrink-0 border" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Package className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 pr-14">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.name} · {item.arabicName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{item.serviceName}</p>
                        <p className="text-[10px] text-slate-400">SAR {item.servicePrice.toFixed(2)} × {item.count}</p>
                      </div>
                      <p className="text-xs font-bold text-slate-800 shrink-0">
                        SAR {(item.servicePrice * item.count).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>

               {/* Price breakdown */}
              <Section title="Price Breakdown">
                <OrderPriceSection order={order} onSuccess={onStatusUpdate} />
              </Section>

               {/* Dispute & Resolution — separate from Price Breakdown above
                   by design: the pricing section always shows the original
                   as-charged breakdown untouched; this shows dispute
                   lifecycle + any refund/credit issued afterward. */}
               {order.disputeId && (
                 <Section title="Dispute & Resolution">
                   <DisputeResolutionCard disputeId={order.disputeId} orderTotalPrice={order.totalPrice} />
                 </Section>
               )}

              {/* Payment detail */}
              {(order.paidBy || order.paymentInfo) && (
                <Section title="Payment Details">
                  <div className="grid grid-cols-2 gap-3">
                    {order.paidBy && (
                      <InfoRow icon={<CreditCard className="h-3.5 w-3.5" />} label="Method" value={order.paidBy} />
                    )}
                    {order.paymentInfo && (
                      <InfoRow icon={<CreditCard className="h-3.5 w-3.5" />} label="Reference" value={   typeof order.paymentInfo === "string"
                      ? order.paymentInfo
                      : order.paymentInfo?.message || null} className="col-span-2" />
                    )}
                  </div>
                </Section>
              )}

              {/* Pickup & Delivery — addresses only; timing now lives in the
                  Timeline section (middle column) to avoid showing the same
                  timestamps twice in two different formats. */}
              <Section title="Pickup & Delivery">
                <div className="flex flex-col gap-3">
                  <AddressCard
                    icon={<Package className="h-3.5 w-3.5 text-purple-600" />}
                    iconBg="bg-purple-100"
                    label="Pickup Address"
                    address={order.pickUpAddress?.formattedAddress ?? "—"}
                  />
                  <AddressCard
                    icon={<Truck className="h-3.5 w-3.5 text-[#02D0FF]" />}
                    iconBg="bg-[#02D0FF]/10"
                    label="Delivery Address"
                    address={order.deliveryAddress?.formattedAddress ?? "—"}
                  />
                </div>
              </Section>

              {/* Rating */}
              {order.ratingByUser && (
                <Section title="Customer Rating">
                  <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < order.ratingByUser!.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"}`} />
                      ))}
                      <span className="text-xs text-slate-500 ml-1">{order.ratingByUser.rating}/5</span>
                    </div>
                    {order.ratingByUser.feedback && (
                      <p className="text-xs text-slate-600 italic">"{order.ratingByUser.feedback}"</p>
                    )}
                    {order.ratingByUser.photoUrls?.length ? (
                      <div className="flex gap-2 flex-wrap">
                        {order.ratingByUser.photoUrls.map((url, i) => (
                          <img key={i} src={url} alt="rating" className="w-14 h-14 object-cover rounded-lg border" />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </Section>
              )}  


            </div>
            {/* MIDDLE column */}
            
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6 border-r border-slate-100">

              {/* Timeline — every scheduling/timestamp field on the order,
                  consolidated in one place */}
              <Section title="Timeline">
                <div className="flex flex-col gap-2">
                  <TimelineRow
                    icon={<NotebookTabs className="h-3.5 w-3.5 text-slate-400" />}
                    label="Order Placed"
                    value={`${fmt(order.createdAt)} · ${fmtTime(order.createdAt)}`}
                  />

                  <TimelineRow
                    icon={<Package className="h-3.5 w-3.5 text-purple-500" />}
                    label="Pickup Window"
                    value={`${fmt(order.pickUpStartTime)} · ${fmtTime(order.pickUpStartTime)} – ${fmtTime(order.pickUpEndTime)}`}
                    editable={canEditPickupWindow}
                  >
                    <EditPickupWindowDialog
                      orderId={order.id}
                      existingPickUpStartTime={order.pickUpStartTime}
                      existingPickUpEndTime={order.pickUpEndTime}
                      orderCreatedAt={order.createdAt}
                      onSuccess={onStatusUpdate}
                    >
                      <p className="text-xs font-semibold text-slate-700 cursor-pointer hover:text-[#02d0ff]">
                        {fmt(order.pickUpStartTime)} · {fmtTime(order.pickUpStartTime)} – {fmtTime(order.pickUpEndTime)}
                      </p>
                    </EditPickupWindowDialog>
                  </TimelineRow>

                  {order.assignedDriverId && order.driverAssignedAt && (
                    <TimelineRow
                      icon={<Truck className="h-3.5 w-3.5 text-indigo-500" />}
                      label="Driver Assigned"
                      value={`${fmt(order.driverAssignedAt)} · ${fmtTime(order.driverAssignedAt)}`}
                    />
                  )}

                  {order.driverAcceptedAt && (
                    <TimelineRow
                      icon={<CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />}
                      label="Driver Accepted"
                      value={`${fmt(order.driverAcceptedAt)} · ${fmtTime(order.driverAcceptedAt)}`}
                    />
                  )}

                  {order.estimatedPickupTime && (
                    <TimelineRow
                      icon={<Clock className="h-3.5 w-3.5 text-slate-400" />}
                      label="Estimated Pickup"
                      value={`${fmt(order.estimatedPickupTime)} · ${fmtTime(order.estimatedPickupTime)}`}
                    />
                  )}

                  <TimelineRow
                    icon={<Truck className="h-3.5 w-3.5 text-[#02D0FF]" />}
                    label="Ready By / Expected Delivery"
                    value={fmt(order.expectedDeliveryTime)}
                    editable={!order.isDelivered && !order.isCancelled}
                  >
                    <ConfirmDeliveryDialog
                      orderId={order.id}
                      orderCreatedAt={order.createdAt}
                      existingExpectedDelivery={order.expectedDeliveryTime}
                      onSuccess={onStatusUpdate}
                    >
                      <p className="text-xs font-semibold text-slate-700 cursor-pointer hover:text-[#02d0ff]">
                        {fmt(order.expectedDeliveryTime)}
                      </p>
                    </ConfirmDeliveryDialog>
                  </TimelineRow>

                  {order.estimatedDeliveryTime && (
                    <TimelineRow
                      icon={<Clock className="h-3.5 w-3.5 text-slate-400" />}
                      label="Estimated Delivery"
                      value={`${fmt(order.estimatedDeliveryTime)} · ${fmtTime(order.estimatedDeliveryTime)}`}
                    />
                  )}

                  {/* {order.deliveryStartTime && (
                    <TimelineRow
                      icon={<Truck className="h-3.5 w-3.5 text-amber-500" />}
                      label="Delivery Started"
                      value={`${fmt(order.deliveryStartTime)} · ${fmtTime(order.deliveryStartTime)}`}
                    />
                  )} */}

                  {order.deliveryEndTime && (
                    <TimelineRow
                      icon={<CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                      label="Actual Delivery"
                      value={`${fmt(order.deliveryEndTime)} · ${fmtTime(order.deliveryEndTime)}`}
                    />
                  )}
                </div>
              </Section>

                {/* Status history */}
              <Section title="Status History">
                <div className="flex flex-col gap-2">
                  {[...order.statusHistory].reverse().map((s, i) => {
                    const scfg = STATUS_CONFIG[s.status] ?? { label: s.status, color: "text-slate-600", dot: "bg-slate-400" };
                    const isLatest = i === 0;
                    return (
                      <div
                        key={i}
                        className={`flex items-start gap-3 p-3 rounded-xl border ${
                          isLatest ? "bg-purple-50 border-purple-100" : "bg-white border-slate-100"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isLatest ? "bg-purple-100" : "bg-slate-100"}`}>
                          {isLatest
                            ? <CheckCircle2 className={`h-3.5 w-3.5 ${scfg.color}`} />
                            : <Circle className="h-3.5 w-3.5 text-slate-300" />
                          }
                        </div>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs font-bold uppercase ${scfg.color}`}>{scfg.label}</span>
                            {isLatest && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 font-bold uppercase shrink-0">
                                Now
                              </span>
                            )}
                          </div>
                          {s.description && <p className="text-[11px] text-slate-500">{s.description}</p>}
                          <p className="text-[10px] text-slate-400">{fmt(s.createdAt)} · {fmtTime(s.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>

            </div>

            {/* RIGHT column */}
            <div className=" shrink-0 overflow-y-auto px-5 py-5 flex flex-col gap-6">
            <Section title="Chat History">
                <OrderChat orderId={order.id} />
              </Section>

            </div>
          </div>

          {/* Footer*/}
          <div className="border-t px-6 py-4 flex items-center justify-between bg-white shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Total Order Value</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-cyan-500 font-semibold">SAR</span>
                <span className="text-xl font-bold text-slate-800">{order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <OrderInvoiceDialog order={order} >
              <button className="px-6 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              PRINT RECEIPT
            </button>
            </OrderInvoiceDialog>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

//helpers
function Section({ title, children, titleButton }: { title: string; children: React.ReactNode; titleButton?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{title}</p>
        {titleButton && titleButton}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value, valueClass, className }: {
  icon: React.ReactNode; label: string; value: string; valueClass?: string; className?: string;
}) {
  return (
    <div className={`flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 ${className ?? ""}`}>
      <div className="text-slate-400 mt-0.5 shrink-0">{icon}</div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{label}</span>
        <span className={`text-xs text-slate-700 font-medium truncate ${valueClass ?? ""}`}>{value}</span>
      </div>
    </div>
  );
}

function AddressCard({ icon, iconBg, label, address }: {
  icon: React.ReactNode; iconBg: string; label: string; address: string;
}) {
  return (
    <div className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{label}</p>
        <p className="text-xs text-slate-700 font-medium">{address}</p>
      </div>
    </div>
  );
}

// Row used in the Timeline section. When `editable` is true and children
// are provided, the value itself becomes the click target for the
// corresponding edit dialog — same "click the value to edit it" pattern
// already used for Ready By in the status banner.
function TimelineRow({ icon, label, value, editable, children }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editable?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{label}</p>
        {editable && children ? children : (
          <p className="text-xs font-semibold text-slate-700">{value}</p>
        )}
      </div>
    </div>
  );
}