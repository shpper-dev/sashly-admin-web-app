import { db } from "./config";
import {
  collection, query, where, orderBy, limit,
  startAfter, getDocs, updateDoc, doc, arrayUnion,
  QueryConstraint
} from "firebase/firestore";
import { Order, OrderStatuses, OrderStatus } from "@/lib/models/order.model";

//Filters type
export interface OrderFilters {
  status?: OrderStatuses;
  isPaid?: boolean;
  isCancelled?: boolean;
  serviceType?: "ordinary" | "express";
}

// Fetch helpers 
function buildOrderConstraints(filters: OrderFilters, pageSize: number): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];

  if (filters.status)
    constraints.push(where("latestStatus.status", "==", filters.status));
  if (filters.isPaid !== undefined)
    constraints.push(where("isPaid", "==", filters.isPaid));
  if (filters.isCancelled !== undefined)
    constraints.push(where("isCancelled", "==", filters.isCancelled));
  if (filters.serviceType)
    constraints.push(where("serviceType", "==", filters.serviceType));

  constraints.push(orderBy("createdAt", "desc"), limit(pageSize));
  return constraints;
}

export async function getOrders(
  pageSize = 20,
  filters: OrderFilters = {}
): Promise<{ rows: Order[]; lastDoc: any }> {
  const q = query(collection(db, "orders"), ...buildOrderConstraints(filters, pageSize));
  const snapshot = await getDocs(q);
  const rows = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Order));
  return { rows, lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null };
}

export async function getOrdersNextPage(
  lastDoc: any,
  pageSize = 20,
  filters: OrderFilters = {}
): Promise<{ rows: Order[]; lastDoc: any }> {
  const constraints = buildOrderConstraints(filters, pageSize);
  // insert startAfter before limit (last two items)
  constraints.splice(constraints.length - 1, 0, startAfter(lastDoc));
  const q = query(collection(db, "orders"), ...constraints);
  const snapshot = await getDocs(q);
  const rows = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Order));
  return { rows, lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null };
}

//Status advancement 
// Valid transitions enforced here — UI calls this, not updateDoc directly
const STATUS_TRANSITIONS: Record<OrderStatuses, OrderStatuses[]> = {
  unpaid:          ["confirmed", "cancelled"],
  confirmed:       ["pickedUp", "cancelled"],
  pickedUp:        ["sorting", "cancelled"],
  sorting:         ["inProgress", "cancelled"],
  inProgress:      ["readyToDeliver", "cancelled"],
  readyToDeliver:  ["delivered", "cancelled"],
  delivered:       [],
  cancelled:       [],
};

export function getAllowedNextStatuses(current: OrderStatuses): OrderStatuses[] {
  return STATUS_TRANSITIONS[current] ?? [];
}

export async function advanceOrderStatus(
  orderId: string,
  newStatus: OrderStatuses,
  description?: string
): Promise<void> {
  const statusEntry: OrderStatus = {
    status: newStatus,
    description: description ?? null,
    createdAt: Date.now(),
  };

  const updates: Record<string, any> = {
    latestStatus: statusEntry,
    statusHistory: arrayUnion(statusEntry), // append only, never replace
    updatedAt: Date.now(),
  };

  // Status → flag mapping from the doc
  if (newStatus === "confirmed")      updates.isPaid = true;
  if (newStatus === "delivered")      { updates.isDelivered = true; updates.deliveryEndTime = Date.now(); }
  if (newStatus === "cancelled")      updates.isCancelled = true;

  await updateDoc(doc(db, "orders", orderId), updates);
}

export async function confirmOrderPayment(
  orderId: string,
  paidBy: "cash" | "card" | "wallet",
  paymentInfo?: string,
): Promise<void> {
  const statusEntry: OrderStatus = {
    status: "confirmed",
    description: `Payment confirmed via ${paidBy}`,
    createdAt: Date.now(),
  };

// now the order is coming in as confirmed even when unpaid..really no need to do specifically set paid true will auto change while confirming. then only update payment option via this function
  await updateDoc(doc(db, "orders", orderId), {
    isPaid: true,
    paidBy,
    paymentInfo : paymentInfo ?? null,
    latestStatus: statusEntry,
    statusHistory: arrayUnion(statusEntry),
    updatedAt: Date.now(),
  });
}

// delivery
export async function markDeliveryStarted(orderId: string): Promise<void> {
  const statusEntry: OrderStatus = {
    status: "readyToDeliver",
    description: "Driver has started delivery",
    createdAt: Date.now(),
  };

  await updateDoc(doc(db, "orders", orderId), {
    deliveryStartTime: Date.now(),
    latestStatus: statusEntry,
    statusHistory: arrayUnion(statusEntry),
    updatedAt: Date.now(),
  });
}

export async function markDelivered(orderId: string): Promise<void> {
  const statusEntry: OrderStatus = {
    status: "delivered",
    description: "Order delivered to customer",
    createdAt: Date.now(),
  };

  await updateDoc(doc(db, "orders", orderId), {
    isDelivered: true,
    deliveryEndTime: Date.now(),
    latestStatus: statusEntry,
    statusHistory: arrayUnion(statusEntry),
    updatedAt: Date.now(),
  });
}