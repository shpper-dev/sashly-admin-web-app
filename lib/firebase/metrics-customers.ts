import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./config";
import { User } from "../models/user.model";
import { Order } from "../models/order.model";
import { mapUser } from "../mappers/user.mapper";
import { mapOrder } from "../mappers/order.mapper";


export interface CustomerMetric {
  userId: string;
  name: string;
  email: string;
  phone: string;
  signupDate: number;           // ms — from user.createdAt
  isNew: boolean;               // signed up within the selected range
  isReturning: boolean;         // had orders BEFORE the range start
  ordersInRange: number;        // order count within the selected date range
  totalOrdersAllTime: number;   // all-time order count
  spendInRange: number;         // SAR spent within range
  ltv: number;                  // total SAR spent all time (Lifetime Value)
  lastOrderAt: number | null;   // ms of most recent order
  isDeleted: boolean;
  hasOrdersInRange: boolean;    // placed at least one order in range
}

export interface CustomerPageStats {
  totalCustomers: number;       // all non-deleted users (all time)
  newInRange: number;           // signed up within range
  returningInRange: number;     // had prior orders, placed new ones in range
  activeInRange: number;        // placed at least one order in range
  avgOrderFrequency: number;    // avg orders per active customer in range
  avgLTV: number;               // avg lifetime spend across all customers with orders
  customers: CustomerMetric[];
}


export async function getCustomerMetrics(
  startMs: number,
  endMs: number
): Promise<CustomerPageStats> {

  // Fetch users and ALL orders in parallel — two independent collections
  const [usersSnap, ordersSnap] = await Promise.all([
    getDocs(collection(db, "users")),
    getDocs(collection(db, "orders")),
  ]);

  const users  = usersSnap.docs.map(mapUser);
  const orders = ordersSnap.docs.map(mapOrder);

  // Build a map: userId → all their orders (sorted oldest first)
  // This lets us compute per-user metrics in O(1) lookups
  const ordersByUser = new Map<string, Order[]>();
  for (const order of orders) {
    if (!ordersByUser.has(order.userId)) ordersByUser.set(order.userId, []);
    ordersByUser.get(order.userId)!.push(order);
  }

  const customers: CustomerMetric[] = [];

  for (const user of users) {
    const allOrders = ordersByUser.get(user.userId) ?? [];

    // Orders within the selected date range
    const inRange = allOrders.filter(
      o => o.createdAt >= startMs && o.createdAt <= endMs
    );

    // Orders strictly BEFORE the range start — used to detect returning customers
    const beforeRange = allOrders.filter(o => o.createdAt < startMs);

    const spendInRange = inRange.reduce((sum, o) => sum + o.totalPrice, 0);
    const ltv          = allOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    const lastOrderAt = allOrders.length > 0
      ? Math.max(...allOrders.map(o => o.createdAt))
      : null;

    // A customer is "new" if their account was created within the range
    const isNew = user.createdAt >= startMs && user.createdAt <= endMs;

    // A customer is "returning" if they had orders before the range AND placed orders in range
    const isReturning = beforeRange.length > 0 && inRange.length > 0;

    customers.push({
      userId:            user.userId,
      name:              user.name ?? "Unknown",
      email:             user.email ?? "",
      phone:             user.phone ?? user.phoneCode ?? "",
      signupDate:        user.createdAt,
      isNew,
      isReturning,
      ordersInRange:     inRange.length,
      totalOrdersAllTime: allOrders.length,
      spendInRange,
      ltv,
      lastOrderAt,
      isDeleted:         user.isDeleted ?? false,
      hasOrdersInRange:  inRange.length > 0,
    });
  }

  //Aggregate stats
  const activeCustomers = customers.filter(c => c.hasOrdersInRange);

  const avgOrderFrequency = activeCustomers.length > 0
    ? activeCustomers.reduce((sum, c) => sum + c.ordersInRange, 0) / activeCustomers.length
    : 0;

  const customersWithOrders = customers.filter(c => c.totalOrdersAllTime > 0);
  const avgLTV = customersWithOrders.length > 0
    ? customersWithOrders.reduce((sum, c) => sum + c.ltv, 0) / customersWithOrders.length
    : 0;

  return {
    totalCustomers:   customers.filter(c => !c.isDeleted).length,
    newInRange:       customers.filter(c => c.isNew).length,
    returningInRange: customers.filter(c => c.isReturning).length,
    activeInRange:    activeCustomers.length,
    avgOrderFrequency,
    avgLTV,
    customers,
  };
}