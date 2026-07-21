import { collection, getDocs } from "firebase/firestore";
import { db } from "./config";
import { User } from "../models/user.model";
import { mapUser } from "../mappers/user.mapper";
import { getAllOrdersCached, invalidateOrdersMetricsCache, MappedOrder } from "./metrics-orders";

export interface CustomerMetric {
  userId: string;
  name: string;
  email: string;
  phone: string;

  signupDate: number;

  isNew: boolean;       // PERIOD — signed up within the selected range
  isReturning: boolean; // PERIOD — had orders before the range AND ordered within it

  ordersInRange: number;        // PERIOD — non-cancelled orders placed within the range
  totalOrdersAllTime: number;   // LIFETIME — non-cancelled orders, ever

  spendInRange: number; // PERIOD  — realized (paid, non-cancelled) revenue within the range
  ltv: number;          // LIFETIME — realized (paid, non-cancelled) revenue, all time

  // LIFETIME — do NOT change with the selected date range
  firstOrderAt: number | null;
  lastOrderAt: number | null;

  // PERIOD — DO change with the selected date range; null if no orders fell within it
  firstOrderInRangeAt: number | null;
  lastOrderInRangeAt: number | null;

  customerLifespanMonths: number; // LIFETIME — months between first & last order ever
  purchaseFrequency: number;      // LIFETIME — orders per month, observed over their whole history
  avgOrderValue: number;          // LIFETIME — ltv / paid order count

  isDeleted: boolean;
  hasOrdersInRange: boolean;
}

export interface CustomerPageStats {
  totalCustomers: number;             // LIFETIME — all non-deleted registered users, regardless of range
  newInRange: number;                 // PERIOD — signed up within range, excludes deleted
  returningInRange: number;           // PERIOD — repeat activity within range, excludes deleted
  activeInRange: number;              // PERIOD — placed >=1 non-cancelled order in range
  avgOrderFrequency: number;          // PERIOD — avg orders per active customer in range
  avgSpendPerActiveCustomer: number;  // PERIOD — realized spend in range / active customers in range
  avgLTV: number;                     // LIFETIME — avg realized lifetime spend, customers with >=1 paid order ever
  customers: CustomerMetric[];
}

//  Cancellation helper 
// Mirrors the "cancelled orders don't represent real revenue or engagement"
// standard already applied in metrics-revenue.ts, applied here so customer-
// level counts and spend aren't inflated by orders that never actually happened.
function isCancelledOrder(o: MappedOrder): boolean {
  return o.isCancelled || o.latestStatus?.status === "cancelled";
}

//  USERS CACHE 
// Same short-TTL, module-level caching pattern as getAllOrdersCached in
// metrics-orders.ts, applied here so this module doesn't refetch the entire
// users collection on every date-range change.

type MappedUser = ReturnType<typeof mapUser>;

let usersCache: { data: MappedUser[]; timestamp: number } | null = null;
const USERS_CACHE_TTL_MS = 60_000;

async function getAllUsersCached(forceRefresh = false): Promise<MappedUser[]> {
  const now = Date.now();
  if (!forceRefresh && usersCache && now - usersCache.timestamp < USERS_CACHE_TTL_MS) {
    return usersCache.data;
  }
  const snap = await getDocs(collection(db, "users"));
  const allUsers = snap.docs.map(mapUser);
  usersCache = { data: allUsers, timestamp: now };
  return allUsers;
}

export function invalidateUsersMetricsCache(): void {
  usersCache = null;
}

// Invalidates both the users cache and the shared orders cache (from
// metrics-orders.ts) — call after any write that should be reflected
// immediately on the Customer Reports page.
export function invalidateCustomerMetricsCache(): void {
  invalidateUsersMetricsCache();
  invalidateOrdersMetricsCache();
}

//  CORE ANALYTICS IMPLEMENTATION 

export async function getCustomerMetrics(
  startMs: number,
  endMs: number,
  forceRefresh = false
): Promise<CustomerPageStats> {

  // Users and orders fetched (and cached) independently — same pattern used
  // throughout the rest of the metrics system.
  const [users, allOrdersRaw] = await Promise.all([
    getAllUsersCached(forceRefresh),
    getAllOrdersCached(forceRefresh),
  ]);

  // Cancelled orders are excluded up front — they never represent real
  // customer engagement or revenue, and previously inflated every count.
  const validOrders = allOrdersRaw.filter((o) => !isCancelledOrder(o));

  const ordersByUser = new Map<string, MappedOrder[]>();
  for (const order of validOrders) {
    if (!ordersByUser.has(order.userId)) ordersByUser.set(order.userId, []);
    ordersByUser.get(order.userId)!.push(order);
  }

  const customers: CustomerMetric[] = [];

  for (const user of users) {
    const allOrders = ordersByUser.get(user.userId) ?? []; // lifetime, non-cancelled

    // Orders within the selected date range
    const inRange = allOrders.filter((o) => o.createdAt >= startMs && o.createdAt <= endMs);

    // Orders strictly BEFORE the range start — used to detect returning customers
    const beforeRange = allOrders.filter((o) => o.createdAt < startMs);

    // Revenue figures only count orders that were actually PAID — an
    // unpaid/pending order isn't realized revenue yet.
    const paidOrders = allOrders.filter((o) => o.isPaid);
    const paidInRange = inRange.filter((o) => o.isPaid);

    const spendInRange = paidInRange.reduce((sum, o) => sum + o.totalPrice, 0);
    const ltv = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    // LIFETIME first/last order — intentionally independent of the selected range
    const firstOrderAt = allOrders.length > 0 ? Math.min(...allOrders.map((o) => o.createdAt)) : null;
    const lastOrderAt = allOrders.length > 0 ? Math.max(...allOrders.map((o) => o.createdAt)) : null;

    // PERIOD first/last order — genuinely scoped to the selected range
    const firstOrderInRangeAt = inRange.length > 0 ? Math.min(...inRange.map((o) => o.createdAt)) : null;
    const lastOrderInRangeAt = inRange.length > 0 ? Math.max(...inRange.map((o) => o.createdAt)) : null;

    // Lifetime span in months, observed between first and last order ever
    let customerLifespanMonths = 0;
    if (firstOrderAt && lastOrderAt) {
      customerLifespanMonths = Math.max(
        1,
        (lastOrderAt - firstOrderAt) / (1000 * 60 * 60 * 24 * 30.44)
      );
    }

    const purchaseFrequency = customerLifespanMonths > 0 ? allOrders.length / customerLifespanMonths : 0;
    const avgOrderValue = paidOrders.length > 0 ? ltv / paidOrders.length : 0;

    // A customer is "new" if their account was created within the range
    const isNew = user.createdAt >= startMs && user.createdAt <= endMs;

    // A customer is "returning" if they had orders before the range AND placed orders in range
    const isReturning = beforeRange.length > 0 && inRange.length > 0;

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
      firstOrderInRangeAt,
      lastOrderInRangeAt,

      customerLifespanMonths,
      purchaseFrequency,
      avgOrderValue,

      isDeleted: user.isDeleted ?? false,
      hasOrdersInRange: inRange.length > 0,
    });
  }

  // Aggregate stats — deleted customers excluded consistently everywhere,
  // so these numbers always match what each tab actually shows.
  const nonDeleted = customers.filter((c) => !c.isDeleted);
  const activeCustomers = nonDeleted.filter((c) => c.hasOrdersInRange);

  const avgOrderFrequency = activeCustomers.length > 0
    ? activeCustomers.reduce((sum, c) => sum + c.ordersInRange, 0) / activeCustomers.length
    : 0;

  // PERIOD — genuine "revenue per customer" for the selected range
  const totalSpendInRange = activeCustomers.reduce((sum, c) => sum + c.spendInRange, 0);
  const avgSpendPerActiveCustomer = activeCustomers.length > 0
    ? totalSpendInRange / activeCustomers.length
    : 0;

  // LIFETIME — simple, mathematically valid average of each customer's real
  // lifetime spend. Replaces the old (AOV × frequency × lifespan) formula,
  // which multiplied together three separately-averaged quantities — a
  // statistically invalid operation that produced a number with no real
  // meaning and, incidentally, never moved with the date range either.
  const customersWithLifetimeSpend = nonDeleted.filter((c) => c.ltv > 0);
  const avgLTV = customersWithLifetimeSpend.length > 0
    ? customersWithLifetimeSpend.reduce((sum, c) => sum + c.ltv, 0) / customersWithLifetimeSpend.length
    : 0;

  return {
    totalCustomers: nonDeleted.length,
    newInRange: customers.filter((c) => c.isNew && !c.isDeleted).length,
    returningInRange: customers.filter((c) => c.isReturning && !c.isDeleted).length,
    activeInRange: activeCustomers.length,
    avgOrderFrequency,
    avgSpendPerActiveCustomer,
    avgLTV,
    customers,
  };
}

//  Customer report rows 

export interface CustomerReportRow {
  name: string;
  email: string;
  phone: string;
  signupDate: string;
  totalOrdersAllTime: number; // renamed from "completedOrders" — it was never filtered to completed status
  firstOrderDate: string;     // LIFETIME
  lastOrderDate: string;      // LIFETIME
  spendInRange: number;       // PERIOD
  ltv: number;                // LIFETIME
  avgOrderValue: number;      // LIFETIME
  type: string;
}

export function buildCustomerReportRows(customers: CustomerMetric[]): CustomerReportRow[] {
  return customers
    .filter((c) => !c.isDeleted)
    .map((c) => ({
      name: c.name,
      email: c.email,
      phone: c.phone ?? "",
      signupDate: c.signupDate
        ? new Date(c.signupDate).toLocaleDateString("en-GB")
        : "—",
      totalOrdersAllTime: c.totalOrdersAllTime,
      // FIXED: was reading c.lastOrderAt for both fields — first and last
      // order dates now correctly reference their own (lifetime) source field.
      firstOrderDate: c.firstOrderAt
        ? new Date(c.firstOrderAt).toLocaleDateString("en-GB")
        : "—",
      lastOrderDate: c.lastOrderAt
        ? new Date(c.lastOrderAt).toLocaleDateString("en-GB")
        : "—",
      spendInRange: c.spendInRange,
      ltv: c.ltv,
      avgOrderValue: c.avgOrderValue, // reuse the already-computed lifetime AOV rather than recomputing it
      type: c.isDeleted        ? "Deleted"
          : c.isNew            ? "New"
          : c.isReturning      ? "Returning"
          : c.ordersInRange > 0 ? "Active"
          : "Inactive",
    }))
    .sort((a, b) => b.totalOrdersAllTime - a.totalOrdersAllTime);
}