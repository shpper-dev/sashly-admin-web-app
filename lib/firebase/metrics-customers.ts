import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./config";
import { User } from "../models/user.model";
import { Order } from "../models/order.model";
import { mapUser } from "../mappers/user.mapper";
import { mapOrder } from "../mappers/order.mapper";


// export interface CustomerMetric {
//   userId: string;
//   name: string;
//   email: string;
//   phone: string;
//   signupDate: number;           // ms — from user.createdAt
//   isNew: boolean;               // signed up within the selected range
//   isReturning: boolean;         // had orders BEFORE the range start
//   ordersInRange: number;        // order count within the selected date range
//   totalOrdersAllTime: number;   // all-time order count
//   spendInRange: number;         // SAR spent within range
//   ltv: number;                  // total SAR spent all time (Lifetime Value)
//   lastOrderAt: number | null;   // ms of most recent order
//   isDeleted: boolean;
//   hasOrdersInRange: boolean;    // placed at least one order in range
// }
export interface CustomerMetric {
  userId: string;
  name: string;
  email: string;
  phone: string;

  signupDate: number;

  isNew: boolean;
  isReturning: boolean;

  ordersInRange: number;
  totalOrdersAllTime: number;

  spendInRange: number;

  // Actual lifetime revenue from this customer
  ltv: number;

  // NEW
  firstOrderAt: number | null;
  lastOrderAt: number | null;

  customerLifespanMonths: number;
  purchaseFrequency: number; // orders/month
  avgOrderValue: number;

  isDeleted: boolean;
  hasOrdersInRange: boolean;
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
    // const spendInRange = inRange.reduce((sum, o) => sum + o.totalPrice, 0);

// Historical revenue (actual customer value)
// const ltv = allOrders.reduce((sum, o) => sum + o.totalPrice, 0);

const firstOrderAt =
  allOrders.length > 0
    ? Math.min(...allOrders.map(o => o.createdAt))
    : null;

// const lastOrderAt =
//   allOrders.length > 0
//     ? Math.max(...allOrders.map(o => o.createdAt))
//     : null;

// Lifetime in months
let customerLifespanMonths = 0;

if (firstOrderAt && lastOrderAt) {
  customerLifespanMonths = Math.max(
    1,
    (lastOrderAt - firstOrderAt) / (1000 * 60 * 60 * 24 * 30.44)
  );
}

// Orders per month
const purchaseFrequency =
  customerLifespanMonths > 0
    ? allOrders.length / customerLifespanMonths
    : 0;

// Average order value for this customer
const avgOrderValue =
  allOrders.length > 0
    ? ltv / allOrders.length
    : 0;

    // A customer is "new" if their account was created within the range
    const isNew = user.createdAt >= startMs && user.createdAt <= endMs;

    // A customer is "returning" if they had orders before the range AND placed orders in range
    const isReturning = beforeRange.length > 0 && inRange.length > 0;

    // customers.push({
    //   userId:            user.userId,
    //   name:              user.name ?? "Unknown",
    //   email:             user.email ?? "",
    //   phone:             user.phone ?? user.phoneCode ?? "",
    //   signupDate:        user.createdAt,
    //   isNew,
    //   isReturning,
    //   ordersInRange:     inRange.length,
    //   totalOrdersAllTime: allOrders.length,
    //   spendInRange,
    //   ltv,
    //   lastOrderAt,
    //   isDeleted:         user.isDeleted ?? false,
    //   hasOrdersInRange:  inRange.length > 0,
    // });
    customers.push({
  userId: user.userId,
  name: user.name ?? "Unknown",
  email: user.email ?? "",
  phone: user.phone ?? user.phoneCode ?? "",

  signupDate: user.createdAt,

  isNew,
  isReturning,

  ordersInRange: inRange.length,
  totalOrdersAllTime: allOrders.length,

  spendInRange,
  ltv,

  firstOrderAt,
  lastOrderAt,

  customerLifespanMonths,
  purchaseFrequency,
  avgOrderValue,

  isDeleted: user.isDeleted ?? false,
  hasOrdersInRange: inRange.length > 0,
});
  }

  //Aggregate stats
  const activeCustomers = customers.filter(c => c.hasOrdersInRange);

  const avgOrderFrequency = activeCustomers.length > 0
    ? activeCustomers.reduce((sum, c) => sum + c.ordersInRange, 0) / activeCustomers.length
    : 0;

  // const customersWithOrders = customers.filter(c => c.totalOrdersAllTime > 0);
  // const avgLTV = customersWithOrders.length > 0
  //   ? customersWithOrders.reduce((sum, c) => sum + c.ltv, 0) / customersWithOrders.length
  //   : 0;

  // const activeCustomers = customers.filter(c => c.hasOrdersInRange);

const customersWithOrders = customers.filter(
  c => c.totalOrdersAllTime > 0
);

// Average purchase frequency (orders/month)
const avgPurchaseFrequency =
  customersWithOrders.length > 0
    ? customersWithOrders.reduce(
        (sum, c) => sum + c.purchaseFrequency,
        0
      ) / customersWithOrders.length
    : 0;

// Average order value across all orders
const totalRevenue = customersWithOrders.reduce(
  (sum, c) => sum + c.ltv,
  0
);

const totalOrders = customersWithOrders.reduce(
  (sum, c) => sum + c.totalOrdersAllTime,
  0
);

const averageOrderValue =
  totalOrders > 0
    ? totalRevenue / totalOrders
    : 0;

// Average customer lifespan
const averageCustomerLifespan =
  customersWithOrders.length > 0
    ? customersWithOrders.reduce(
        (sum, c) => sum + c.customerLifespanMonths,
        0
      ) / customersWithOrders.length
    : 0;

// Marketing LTV estimate
const avgLTV =
  averageOrderValue *
  avgPurchaseFrequency *
  averageCustomerLifespan;

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

// for customer reports

export interface CustomerReportRow {
  name:              string;
  email:             string;
  phone:             string;
  signupDate:        string;
  completedOrders:   number;
  firstOrderDate:    string;
  lastOrderDate:     string;
  spendInRange:      number;
  ltv:               number;
  avgOrderValue:     number;
  type:              string;
}

export function buildCustomerReportRows(
  customers: CustomerMetric[]
): CustomerReportRow[] {
  return customers
    .filter(c => !c.isDeleted)
    .map(c => ({
      name:            c.name,
      email:           c.email,
      phone:           c.phone ?? "",
      signupDate:      c.signupDate
        ? new Date(c.signupDate).toLocaleDateString("en-GB")
        : "—",
      completedOrders: c.totalOrdersAllTime,
      firstOrderDate:  c.lastOrderAt
        ? new Date(c.lastOrderAt).toLocaleDateString("en-GB")
        : "—",
      lastOrderDate:   c.lastOrderAt
        ? new Date(c.lastOrderAt).toLocaleDateString("en-GB")
        : "—",
      spendInRange:    c.spendInRange,
      ltv:             c.ltv,
      avgOrderValue:   c.totalOrdersAllTime > 0
        ? c.ltv / c.totalOrdersAllTime
        : 0,
      type: c.isDeleted        ? "Deleted"
          : c.isNew            ? "New"
          : c.isReturning      ? "Returning"
          : c.ordersInRange > 0 ? "Active"
          : "Inactive",
    }))
    .sort((a, b) => b.completedOrders - a.completedOrders);
}