import { db } from "./config";
import {
  collection, query, where, orderBy, limit,
  startAfter, getDocs, updateDoc, doc, arrayUnion,
  QueryConstraint,
  getCountFromServer,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { Order, OrderStatuses, OrderStatus, OrderItem } from "@/lib/models/order.model";
import { mapOrder } from "../mappers/order.mapper";
import { createMessage } from "./message";

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
  cancelled:       [],
  disputed:        []
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


