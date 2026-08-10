import { db } from "./config";
import {
  collection, query, where, orderBy, limit,
  startAfter, getDocs, updateDoc, doc, arrayUnion,
  QueryConstraint,
  getCountFromServer,
  getDoc,
  onSnapshot,
  setDoc,
  getAggregateFromServer,
  count,
  or,
  sum,
  and,
} from "firebase/firestore";
import { Order, OrderStatuses, OrderStatus, OrderItem, ServiceType } from "@/lib/models/order.model";
import { mapOrder } from "../mappers/order.mapper";

import { SearchFilters } from "@/app/(admin)/search/page";

import { UserAddress } from "../models/user.model";
import { getCatalog } from "./business";

import { mapOrderData } from "../mappers/order.admin.mapper";

//Filters type
export interface OrderFilters {
  status?: OrderStatuses;
  statuses?: OrderStatuses[];
  isPaid?: boolean;
  isCancelled?: boolean;
  isDelivered?: boolean;
  hasDriver?: boolean;
  serviceType?: "ordinary" | "express";
}

// Fetch helpers 
function buildOrderConstraints(filters: OrderFilters, pageSize: number): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];

  if (filters.status)
    constraints.push(where("latestStatus.status", "==", filters.status));
  if (filters.statuses?.length)
    constraints.push(where("latestStatus.status", "in", filters.statuses));
  if (filters.isPaid !== undefined)
    constraints.push(where("isPaid", "==", filters.isPaid));
  if (filters.isCancelled !== undefined)
    constraints.push(where("isCancelled", "==", filters.isCancelled));
  if (filters.isDelivered !== undefined)
    constraints.push(where("isDelivered", "==", filters.isDelivered));
  if (filters.hasDriver)
    constraints.push(where("assignedDriverId","!=", null))
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
  const rows = snapshot.docs.map(mapOrder)
  return { rows, lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null };
}

export async function getOrdersNextPage(
  lastDoc: any,
  pageSize = 20,
  filters: OrderFilters = {}
): Promise<{ rows: Order[]; lastDoc: any }> {
  const constraints = buildOrderConstraints(filters, pageSize);
  constraints.splice(constraints.length - 1, 0, startAfter(lastDoc));
  const q = query(collection(db, "orders"), ...constraints);
  const snapshot = await getDocs(q);
  const rows = snapshot.docs.map(mapOrder);
  return { rows, lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null };
}

//Status advancement 
// Valid transitions enforced here — UI calls this, not updateDoc directly
const STATUS_TRANSITIONS: Record<OrderStatuses, OrderStatuses[]> = {
  confirmed: ["pickedUp", "cancelled"],
  pickedUp: ["sorting", "detailing", "cancelled"],
  sorting: ["detailing", "cancelled"],
  detailing: ["cleaning", "cancelled"],
  cleaning: ["readyToDeliver", "cancelled"],
  readyToDeliver: ["delivered", "cancelled"],
  delivered: ["disputed"],
  disputed: ["disputeResolved"],
  disputeResolved: [],
  cancelled: [],
  
};

export function getAllowedNextStatuses(current: OrderStatuses): OrderStatuses[] {
  return STATUS_TRANSITIONS[current] ?? [];
}


export async function advanceOrderStatus(
  orderId: string,
  newStatus: OrderStatuses,
  description?: string,
  senderId?: string,
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
  if (newStatus === "delivered")      { updates.isDelivered = true; updates.deliveryEndTime = Date.now(); }
  
  if (newStatus === "cancelled")      updates.isCancelled = true;


  await updateDoc(doc(db, "orders", orderId), updates);
  // await syncOrderToMeiliTemp(orderId);
}

export async function confirmOrderPayment(
  orderId: string,
  paidBy: "cash" | "card" | "wallet",
  paymentInfo?: string,
): Promise<void> {

  // seperating status from payment
  await updateDoc(doc(db, "orders", orderId), {
    isPaid: true,
    paidBy,
    paymentInfo: paymentInfo ?? null,
    paymentDate: Date.now(), //new
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

// update order pickup window (admin-editable only while order is still "confirmed" —

export async function updatePickupWindow(
  orderId: string,
  pickUpStartTime: number,
  pickUpEndTime: number
): Promise<void> {
  await updateDoc(doc(db, "orders", orderId), {
    pickUpStartTime,
    pickUpEndTime,
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

// get active orders by user id
export async function getActiveOrdersByUserId(userId: string): Promise<Order[]> {
  try {
    const ordersRef = collection(db, "orders");

    const q = query(
      ordersRef,
      where("userId", "==", userId),
      where("isDelivered", "==", false) 
    );

    const querySnapshot = await getDocs(q);

    const orders: Order[] = querySnapshot.docs.map(mapOrder)

    return orders;
  } catch (error) {
    console.error("Error fetching active orders:", error);
    throw error;
  }
}

// get active order count
export async function getActiveOrdersCount():Promise<number> {
  const q = query(collection(db,"orders"), where("isDelivered", "==",false) ,
   where("isCancelled","==",false));
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count ?? 0;
  
}

export async function getPendingPayoutsTotal(): Promise<number> {
  const q = query(
    collection(db, "orders"),
    where("isCancelled", "==", false),
    where("isPaid", "==", false)
  );
 
  const snap = await getDocs(q);
 
  return snap.docs.reduce((sum, doc) => {
    const data = doc.data();
    return sum + (data.totalPrice ?? 0);
  }, 0);
}

// daily order stats
export async function getDailyOrderStats(): Promise<{
  orderCount: number;
  totalValue: number;
  totalDiscounts: number;
  totalCreditsUsed: number;
}> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startMs = startOfDay.getTime();
  const endMs   = Date.now();

  const q = query(
    collection(db, "orders"),
    where("createdAt", ">=", startMs),
    where("createdAt", "<=", endMs)
  );

  const snap = await getDocs(q);
  const orders = snap.docs.map(d => ({ ...d.data() } as Order));

  return {
    orderCount:       orders.length,
    totalValue:       orders.reduce((sum, o) => sum + o.totalPrice, 0),
    // discountAmount is already on Order model
    totalDiscounts:   orders.reduce((sum, o) => sum + (o.discountAmount ?? 0), 0),
    // credits = difference between original price and paid price when a coupon was applied
    totalCreditsUsed: orders
      .filter(o => o.appliedCoupon)
      .reduce((sum, o) => sum + (o.discountAmount ?? 0), 0),
  };
}



// update order price (manual admin adjustments)
export async function updateOrderPrice(orderId: string, total:number): Promise<void>{
   await updateDoc(doc(db,"orders", orderId),{
    totalPrice: total,
    updatedAt: Date.now(),
   });
}

// update order expected delivery time
export async function updateExpectedDeliveryTime(orderId: string, expectedDelivery: number): Promise<void> {
  await updateDoc(doc(db,"orders",orderId),{
    expectedDeliveryTime: expectedDelivery,
    updatedAt: Date.now(),
  })
  
}

// add new item to order

export async function addItemToOrder(orderId: string, newItem: OrderItem) {
  const orderRef = doc(db, "orders", orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) throw new Error("Order not found");

  const currentItems = orderSnap.data().items as OrderItem[];
  
  // Check if item with same ID AND Service already exists
  const existingIdx = currentItems.findIndex(
    (item) => item.id === newItem.id && item.serviceName === newItem.serviceName
  );

  let updatedItems: OrderItem[];

  if (existingIdx > -1) {
    // Increase the count
    updatedItems = [...currentItems];
    updatedItems[existingIdx].count += newItem.count;
  } else {
    // Add as new line
    updatedItems = [...currentItems, newItem];
  }

  // Recalculate Total
  const total = updatedItems.reduce((acc, item) => acc + (item.servicePrice * item.count), 0);

  await updateDoc(orderRef, {
    items: updatedItems,
    totalPrice: total,
    updatedAt: Date.now()
  });
 
}

// multiple items added together
export async function addItemsToOrder(orderId: string, newItems: OrderItem[]) {
  const orderRef  = doc(db, "orders", orderId);
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) throw new Error("Order not found");

  let updatedItems = [...(orderSnap.data().items as OrderItem[])];

  for (const newItem of newItems) {
    const existingIdx = updatedItems.findIndex(
      (item) => item.id === newItem.id && item.serviceName === newItem.serviceName
    );
    if (existingIdx > -1) {
      updatedItems[existingIdx] = {
        ...updatedItems[existingIdx],
        count: updatedItems[existingIdx].count + newItem.count,
      };
    } else {
      updatedItems = [...updatedItems, newItem];
    }
  }

  const total = updatedItems.reduce((acc, item) => acc + item.servicePrice * item.count, 0);

  await updateDoc(orderRef, {
    items: updatedItems,
    totalPrice: total,
    updatedAt: Date.now(),
  });
}


// update existing order item
export async function updateOrderItem(orderId: string, itemIndex: number, updatedItem: OrderItem) {
  const orderRef = doc(db,"orders", orderId);
  const orderSnap = await getDoc(orderRef);

  if(!orderSnap.exists()) throw new Error("Order not found!");

  let items = [...(orderSnap.data().items || [])] as OrderItem[];
  // remove the item at the current index
  items.splice(itemIndex,1);
  // check if the existing item with updated service already exist as a different order item
  const existingIdx = items.findIndex(
    (item) => item.id === updatedItem.id && item.serviceName === updatedItem.serviceName
  );

  // if exists, increase the count
  if(existingIdx > -1){
    items[existingIdx] = {
      ...items[existingIdx],
      count: items[existingIdx].count + updatedItem.count,
    }
  } else{
    // update the item & insert back into position
    items.splice(itemIndex,0,updatedItem);

  }
  // recalculate total
  const total = items.reduce((acc, item) => acc + item.servicePrice * item.count , 0);

  // update doc
  await updateDoc(orderRef,{
    items,
    totalPrice: total,
    updatedAt: Date.now(),
  });
 
}

// delete orderItem from an existing order

export async function deleteOrderItem(orderId: string, itemIndex: number) {
  const orderRef = doc(db,"orders", orderId);
  const orderSnap = await getDoc(orderRef);

  if(!orderSnap.exists()) throw new Error("Order not found");

  let items = [...(orderSnap.data().items || [])] as OrderItem[];

  // validation: prevent deleting if no items
  if (items.length === 0) throw new Error("No items left to delete");
  
  //remove item
  items.splice(itemIndex,1);

  // recalculate total
  const total = items.reduce((acc, item) => acc + item.servicePrice * item.count,0);

  // update doc
  await updateDoc(orderRef,{
    items,
    totalPrice: total,
    updatedAt: Date.now(),
  });

  
}



function escapeFilterValue(v: string): string {
  return v.replace(/"/g, '\\"');
}
 
function buildMeiliFilter(filters: Partial<SearchFilters>): string {
  const clauses: string[] = [];
 
  if (filters.orderId) {
    const v = escapeFilterValue(filters.orderId.trim());
    clauses.push(`(orderNumber = "${v}" OR id = "${v}")`);
  }
 
  if (filters.email) {
    clauses.push(`userEmail = "${escapeFilterValue(filters.email.trim().toLowerCase())}"`);
  }
 
  if (filters.payment === "paid") clauses.push("isPaid = true");
  if (filters.payment === "unpaid") clauses.push("isPaid = false");
 
  if (filters.placedAfter) {
    clauses.push(`createdAt >= ${new Date(filters.placedAfter).getTime()}`);
  }
  if (filters.placedBefore) {
    clauses.push(`createdAt <= ${new Date(filters.placedBefore).getTime()}`);
  }
  if (filters.paidAfter) {
    clauses.push(`paymentDate >= ${new Date(filters.paidAfter).getTime()}`);
  }
  if (filters.paidBefore) {
    clauses.push(`paymentDate <= ${new Date(filters.paidBefore).getTime()}`);
  }
 
  return clauses.join(" AND ");
}
 
function buildMeiliQuery(filters: Partial<SearchFilters>): string {
  return [filters.name, filters.phone].filter(Boolean).join(" ").trim();
}
 
export async function searchOrders({
  filters,
  pageSize = 10,
  page = 1,
  status,
  orderType,
}: {
  filters: Partial<SearchFilters>;
  pageSize?: number;
  page?: number;
  // Post-search refinement filters — the Order Status / Order Type dropdowns
  // shown once results are on screen. Kept separate from `filters` since
  // they're not part of the search form itself.
  status?: string;
  orderType?: string;
}): Promise<{ orders: Order[]; hasMore: boolean }> {
  const q = buildMeiliQuery(filters);
 
  const clauses = [buildMeiliFilter(filters)];
  if (status) clauses.push(`latestStatus.status = "${escapeFilterValue(status)}"`);
  if (orderType) clauses.push(`serviceType = "${escapeFilterValue(orderType)}"`);
  const filter = clauses.filter(Boolean).join(" AND ");
 
  const offset = (page - 1) * pageSize;
 
  const params = new URLSearchParams({
    q,
    limit: String(pageSize),
    offset: String(offset),
  });
  if (filter) params.set("filter", filter);
 
  const res = await fetch(`/api/orders/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Search failed with status ${res.status}`);
  }
 
  const data: { hits: Order[]; estimatedTotalHits: number } = await res.json();
 
  return {
    orders: data.hits,
    hasMore: offset + data.hits.length < data.estimatedTotalHits,
  };
}
 

// get order by id
export async function getOrderById(
  orderId: string
): Promise<Order | null> {
    const orderRef = doc(db, "orders", orderId);
    const snapshot = await getDoc(orderRef);
    if (!snapshot.exists()) {
      return null;
    }
    return mapOrder(snapshot as any);
}

// real time firestore orders sync
export function subscribeToOrders(
  callback: (orders: Order[], lastDoc: any) => void,
  filters: OrderFilters = {},
  pageSize = 20,
  cursor?: any,
  onError?: (error: Error) => void
) {
  const constraints = buildOrderConstraints(filters, pageSize);

  // pagination support
  if (cursor) {
    constraints.splice(constraints.length - 1, 0, startAfter(cursor));
  }

  const q = query(collection(db, "orders"), ...constraints);

  return onSnapshot(
   q,
   (snapshot) => {
     const rows = snapshot.docs.map(mapOrder);
     callback(rows, snapshot.docs[snapshot.docs.length - 1] ?? null);
   },
   (error) => {
     console.error("subscribeToOrders failed:", error);
     onError?.(error);
   }
 );
}

// subscribe to orders by user ud
export function subscribeToAllOrdersByUserId(
  userId: string,
  callback: (orders: Order[]) => void
) {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];

    callback(orders);
  });
}



// business orders

export interface CreateBusinessOrderInput {
  businessId:       string;
  businessName:     string;
  businessPhone:    string;
  catalogItemIds:   { itemId: string; count: number }[];
  serviceType:      ServiceType;
  pickUpAddress:    UserAddress;
  deliveryAddress:  UserAddress;
  pickUpStartTime:  number;
  pickUpEndTime:    number;
  expectedDeliveryTime?: number | null;
  notes?: string | null;
}

export async function createBusinessOrder(
  input: CreateBusinessOrderInput
): Promise<string> {
  // Fetch the business catalog to resolve item names + prices
  const catalog = await getCatalog(input.businessId);
  const catalogMap = new Map(catalog.map(c => [c.id, c]));

  const items: OrderItem[] = input.catalogItemIds
    .map(({ itemId, count }) => {
      const catalogItem = catalogMap.get(itemId);
      if (!catalogItem) return null;
      return {
        id:               catalogItem.id,
        name:             catalogItem.name,
        arabicName:       "",                          // catalog items are flat
        categoryId:       catalogItem.category ?? "",
        serviceName:      catalogItem.serviceType ?? "",
        serviceArabicName: "",
        servicePrice:     catalogItem.price,
        count,
        photoUrl:         catalogItem.imageUrl ?? null,
      } satisfies OrderItem;
    })
    .filter(Boolean) as OrderItem[];

  if (items.length === 0) throw new Error("No valid items resolved from catalog");

  const totalPrice = items.reduce((sum, item) => sum + item.servicePrice * item.count, 0);

  const createdAtTimestamp = Date.now();
  const orderNumber = await generateUniqueOrderNumber();
  const orderData: Omit<Order, "id"> = {
    // Business orders don't have an individual user — use the business as the
    // "customer" identity so existing reports and table cells still work
    userId:            input.businessId,
    userName:          input.businessName,
    userEmail:         "",
    userPhone:         input.businessPhone,

    orderNumber:       orderNumber,
    items,
    totalPrice,
    latestStatus:      { status: "confirmed", createdAt: Date.now() },
    statusHistory:     [{ status: "confirmed", createdAt: Date.now() }],
    isPaid:            false,
    isDelivered:       false,
    isCancelled:       false,
    serviceType:       input.serviceType,
    pickUpStartTime:   input.pickUpStartTime,
    pickUpEndTime:     input.pickUpEndTime,
    pickUpAddress:     input.pickUpAddress,
    deliveryAddress:   input.deliveryAddress,
    expectedDeliveryTime: input.expectedDeliveryTime ?? null,
    deliveryStartTime: null,
    deliveryEndTime:   null,
    paidBy:            null,
    paymentInfo:       null,
    paymentDate:       null,
    discountAmount:    null,
    appliedCoupon:     null,
    assignedDriverId:  null,
    driverName:        null,
    driverPhone:       null,
    driverProfileImageUrl: null,
    driverAssignedAt:  null,
    driverAcceptedAt:  null,
    driverEarnings:    null,
    platformFee:       null,
    driverFee:         null,
    driverLocation:    null,
    estimatedPickupTime:   null,
    estimatedDeliveryTime: null,
    deliveryNotes:     input.notes ?? null,
    pickupPhotoUrl:    null,
    deliveryPhotoUrl:  null,
    customerSignatureUrl: null,
    driverActivePhase: null,
    hasOpenDispute:    null,
    disputeId:         null,
    disputeStatus:     null,
    disputeIssueType:  null,
    lastDisputeAt:     null,
    businessAccountId: input.businessId,  // ← tags the order to the business
    ratingByUser:      null,
    createdAt:         createdAtTimestamp,
    updatedAt:         createdAtTimestamp,
  };

  const orderId = generateOrderId(input.businessId, new Date(createdAtTimestamp));

  // 2. Reference the document specifically using the generated ID and save it with setDoc
  const ref = doc(db, "orders", orderId);
  await setDoc(ref, orderData);

  return orderId;
}


// helpers for creating order
export function generateOrderId(userId: string, timestamp: Date = new Date()): string {
  const userPart = userId
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .padEnd(4, "0")
    .substring(0, 4);

  const timePart = timestamp
    .getTime()          // millisecondsSinceEpoch
    .toString(36)       // toRadixString(36) — identical 0-9a-z output
    .toUpperCase()
    .padStart(8, "0");

  return `${userPart}${timePart}`;
}

const ORDER_NUMBER_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWX0123456789";


function randomInt(max: number): number {
  const array = new Uint32Array(1);
  // Uses browser/Node native CSPRNG
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for Node.js environments if running server-side
    const crypto = require("crypto");
    crypto.getRandomValues(array);
  }
  return array[0] % max;
}

function generateOrderNumberCandidate(): string {
  let out = "";
  for (let i = 0; i < 6; i++) {
    // Draws securely from the alphabet length
    out += ORDER_NUMBER_ALPHABET[randomInt(ORDER_NUMBER_ALPHABET.length)];
  }
  return out;
}

export async function generateUniqueOrderNumber(): Promise<string> {

  for (let attempt = 0; attempt < 50; attempt++) {
    const candidate = generateOrderNumberCandidate();
    
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("orderNumber", "==", candidate), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a unique order number.");
}

// get orders by theri business id
export function subscribeToAllOrdersByBusinessId(
  businessAccountId: string,
  callback: (orders: Order[]) => void
): () => void {
  const q = query(
    collection(db, "orders"),
    where("businessAccountId", "==", businessAccountId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((d) => mapOrder(d)); // reuse your existing order mapper
    callback(orders);
  });

  return unsubscribe;
}



// Filter-only constraints (no orderBy/limit) — exported so stats queries
// reuse the exact same filter semantics as the row queries, instead of
// maintaining a second, driftable copy.
export function buildWhereConstraints(filters: OrderFilters): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];

  if (filters.status)
    constraints.push(where("latestStatus.status", "==", filters.status));
  if (filters.statuses?.length)
    constraints.push(where("latestStatus.status", "in", filters.statuses));
  if (filters.isPaid !== undefined)
    constraints.push(where("isPaid", "==", filters.isPaid));
  if (filters.isCancelled !== undefined)
    constraints.push(where("isCancelled", "==", filters.isCancelled));
  if (filters.isDelivered !== undefined)
    constraints.push(where("isDelivered", "==", filters.isDelivered));
  if (filters.hasDriver)
    constraints.push(where("assignedDriverId", "!=", null));
  if (filters.serviceType)
    constraints.push(where("serviceType", "==", filters.serviceType));

  return constraints;
}

function buildOrderConstraintsForTabs(filters: OrderFilters, pageSize: number): QueryConstraint[] {
  const constraints = buildWhereConstraints(filters);
  constraints.push(orderBy("createdAt", "desc"), limit(pageSize));
  return constraints;
}

export interface OrderTabStats {
  count:        number;
  // totalPieces intentionally omitted from live aggregation for now.
  // Firestore's sum() aggregate can only reduce a top-level numeric field —
  // it can't reach into items[] and sum item.count server-side. Doing that
  // reduction would require either (a) fetching every matching order
  // document client-side (the exact cost this aggregate approach exists to
  // avoid), or (b) a denormalized totalItemCount field written at every
  // mutation site, which we're deferring for now. Revisit once that's in.
  totalPieces?: number;
  totalRevenue: number;
  totalUnpaid:  number;
}

async function computeUnpaidTotal(
  baseConstraints: QueryConstraint[],
  filters: OrderFilters
): Promise<number> {
  if (filters.isPaid === true) return 0;
  if (filters.isCancelled === true) return 0;

  const extra: QueryConstraint[] = [];
  if (filters.isPaid === undefined) extra.push(where("isPaid", "==", false));
  if (filters.isCancelled === undefined) extra.push(where("isCancelled", "==", false));

  const q = query(collection(db, "orders"), ...baseConstraints, ...extra);
  const agg = await getAggregateFromServer(q, { totalUnpaid: sum("totalPrice") });
  return agg.data().totalUnpaid ?? 0;
}

export async function getOrderTabStats(filters: OrderFilters): Promise<OrderTabStats> {
  const whereConstraints = buildWhereConstraints(filters);
  const base = query(collection(db, "orders"), ...whereConstraints);

  const [mainAgg, totalUnpaid] = await Promise.all([
    getAggregateFromServer(base, {
      count:        count(),
      totalRevenue: sum("totalPrice"),
      // totalPieces: sum("totalItemCount"), // re-enable once the field exists
    }),
    computeUnpaidTotal(whereConstraints, filters),
  ]);

  return {
    count:        mainAgg.data().count,
    totalRevenue: mainAgg.data().totalRevenue ?? 0,
    totalUnpaid,
  };
}


export async function getArchiveTabStats(): Promise<OrderTabStats> {
  const archiveFilter = or(
    where("isDelivered", "==", true),
    where("isCancelled", "==", true),
  );

  const base = query(collection(db, "orders"), archiveFilter);

  
  const unpaidQuery = query(
    collection(db, "orders"),
    and(
      archiveFilter,
      where("isPaid", "==", false),
      where("isCancelled", "==", false),
    ),
  );

  const [mainAgg, unpaidAgg] = await Promise.all([
    getAggregateFromServer(base, {
      count:        count(),
      totalRevenue: sum("totalPrice"),
      // totalPieces: sum("totalItemCount"), // re-enable once the field exists
    }),
    getAggregateFromServer(unpaidQuery, { totalUnpaid: sum("totalPrice") }),
  ]);

  return {
    count:        mainAgg.data().count,
    totalRevenue: mainAgg.data().totalRevenue ?? 0,
    totalUnpaid:  unpaidAgg.data().totalUnpaid ?? 0,
  };
}