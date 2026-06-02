import { db } from "./config";
import {
  collection, query, where, orderBy, limit,
  startAfter, getDocs, updateDoc, doc, arrayUnion,
  QueryConstraint,
  getCountFromServer,
  getDoc,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import { Order, OrderStatuses, OrderStatus, OrderItem } from "@/lib/models/order.model";
import { mapOrder } from "../mappers/order.mapper";
import { createMessage } from "./message";
import { SearchFilters } from "@/app/(admin)/search/page";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { createDispute } from "./dispute";

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
  unpaid:          ["confirmed", "cancelled"],
  confirmed:       ["pickedUp", "cancelled"],
  pickedUp:        ["sorting", "cancelled"],
  sorting:         ["inProgress", "cancelled"],
  inProgress:      ["readyToDeliver", "cancelled"],
  readyToDeliver:  ["delivered", "cancelled"],
  delivered:       ["disputed"],
  disputed:        ["disputeResolved"],
  disputeResolved:        [],
  cancelled:       [],
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
  if (newStatus === "confirmed")      updates.isPaid = true;
  if (newStatus === "delivered")      { updates.isDelivered = true; updates.deliveryEndTime = Date.now(); }
  
  if (newStatus === "cancelled")      updates.isCancelled = true;

  // refine this once the disputes flow is finalised 
  if (newStatus === "disputed") {
    try {
      await createMessage({
        orderId,
        senderId: senderId || "system", 
        text: "🚨 Dispute Opened: Admin has moved this order to dispute status.",
        role: "admin", // since the admin is the one moving the status
        readByUser: false,
        readByAdmin: true,
      });

      // temp dispute creation
      await createDispute({
        orderId,
        userId: senderId,
        issueType: "missing_item",
        description:"Shorts is missing",
        priority:"high"
      },
      )
      
    } catch (msgError) {
      console.error("Failed to create dispute message:", msgError);
      throw new Error("Failed to create message.")
    }
  }

  await updateDoc(doc(db, "orders", orderId), updates);
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
  })
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
  })

  
}

// search orders
export async function searchOrders({
  filters,
  pageSize = 10,
  lastDoc,
}:{
  filters: Partial<SearchFilters>;
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot | null;
}) {
  const constraints : any[] = [];

  // exact match filters
  if(filters.orderId){
    constraints.push(where("id", "==", filters.orderId))
  }
  if(filters.payment === "paid"){
    constraints.push(where("isPaid", "==", true));
  }
  if(filters.payment === "unpaid"){
    constraints.push(where("isPaid", "==", false));
  }
  if(filters.email){
    constraints.push(where("userEmail", "==", filters.email.trim().toLowerCase()))
  }

  // date filters
  if(filters.placedAfter){
    constraints.push(where("createdAt", ">=", new Date(filters.placedAfter).getTime()));
  }
  if(filters.placedBefore){
    constraints.push(where("createdAt", "<=", new Date(filters.placedBefore).getTime()));
  }
  if(filters.paidAfter){
    constraints.push(where("paymentDate", ">=", new Date(filters.paidAfter).getTime()));
  }
  if(filters.paidBefore){
    constraints.push(where("paymentDate", "<=", new Date(filters.paidBefore).getTime()));
  }

  constraints.push(orderBy("createdAt","desc"));
  
  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  constraints.push(limit(pageSize));

  const q = query(collection(db,"orders"),...constraints);
  const snapshot = await getDocs(q);
  
  const docs = snapshot.docs;
  let orders = docs.map(mapOrder);

  // client side filtering
  orders = applyClientFilters(orders, filters);
  return {
    orders,
    lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore: docs.length === pageSize,
  };
  
}

function applyClientFilters(orders: Order[], filters: Partial<SearchFilters>) {
  return orders.filter((order) => {
    if (filters.name && !order.userName.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }

    if (filters.phone && !order.userPhone.includes(filters.phone)) {
      return false;
    }

    if (filters.summary) {
      const match = order.items.some((item) =>
        item.name.toLowerCase().includes(filters.summary!.toLowerCase())
      );
      if (!match) return false;
    }

    return true;
  });
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
  cursor?: any
) {
  const constraints = buildOrderConstraints(filters, pageSize);

  // pagination support
  if (cursor) {
    constraints.splice(constraints.length - 1, 0, startAfter(cursor));
  }

  const q = query(collection(db, "orders"), ...constraints);

  return onSnapshot(q, (snapshot) => {
    const rows = snapshot.docs.map(mapOrder);

    callback(
      rows,
      snapshot.docs[snapshot.docs.length - 1] ?? null
    );
  });
}

// subscribe to orders by user ud
export function subscribeToActiveOrdersByUserId(
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