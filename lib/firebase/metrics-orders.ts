import { collection, getDocs } from "firebase/firestore";
import { db } from "./config";
import { mapOrder } from "../mappers/order.mapper";

//INTERFACES


export interface ChartTimelinePoint {
  label: string;
  orders: number;
  completed: number;
  cancelled: number;
  firstOrders: number;
}

export interface ActivityReportRow {
  date: string;
  orders: number;
  firstOrders: number;
  completed: number;
  cancelled: number;
  completionRate: number;
  rawSortKey: string;
}

export interface FirstTimeOrderRow {
  orderId: string;
  orderNumber: string;
  customer: string;
  total: number;
  createdAt: number;
  status: string;
}

export interface ServiceTypeBreakdown {
  total: number;
  completed: number;
  cancelled: number;
  pending: number; // neither completed nor cancelled yet (in-flight)
  completedPct: number;
  cancelledPct: number;
  pendingPct: number;
}

export interface OperationalOrderMetrics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  firstTimeOrders: number;
  expressOrders: number;
  ordinaryOrders: number;
  expressBreakdown: ServiceTypeBreakdown;
  ordinaryBreakdown: ServiceTypeBreakdown;
  averageOrderValue: number;
  averageItemsPerOrder: number;
  chartData: ChartTimelinePoint[];
  reportRows: ActivityReportRow[];
  firstOrderRows: FirstTimeOrderRow[];
}

interface UserFirstOrderTracker {
  firstOrderId: string;
  firstOrderTime: number;
}


// DATE UTILITIES 


function getDayString(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }); // e.g. "01 Jun"
}

function getWeekString(timestamp: number): string {
  const date = new Date(timestamp);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff); // Monday start
  return `Wk ${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`;
}

function getMonthString(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function getSortKey(timestamp: number, period: "daily" | "weekly" | "monthly"): string {
  const d = new Date(timestamp);
  if (period === "daily") return d.toISOString().substring(0, 10);
  if (period === "monthly") return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  // Weekly sort key via starting Monday
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().substring(0, 10);
}


// ORDERS CACHE  
// The first-order computation needs the FULL historical order set on every
// call, regardless of the selected date range. Re-fetching the entire
// collection on every range/period change is expensive at scale, so 
// cache it in-module for a short TTL. Call invalidateOrdersMetricsCache()
// after any write that should be reflected immediately 

type MappedOrder = ReturnType<typeof mapOrder>;

let ordersCache: { data: MappedOrder[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60_000; // 1 minute

async function getAllOrdersCached(forceRefresh = false): Promise<MappedOrder[]> {
  const now = Date.now();
  if (!forceRefresh && ordersCache && now - ordersCache.timestamp < CACHE_TTL_MS) {
    return ordersCache.data;
  }
  const snap = await getDocs(collection(db, "orders"));
  const allOrders = snap.docs.map(mapOrder);
  ordersCache = { data: allOrders, timestamp: now };
  return allOrders;
}

export function invalidateOrdersMetricsCache(): void {
  ordersCache = null;
}


// CORE ANALYTICS IMPLEMENTATION 


export async function getOperationalOrderMetrics(
  startMs?: number,
  endMs?: number,
  period: "daily" | "weekly" | "monthly" = "daily",
  forceRefresh = false
): Promise<OperationalOrderMetrics> {

  //Fetch total cross-historical collection records (cached across calls)
  const allOrders = await getAllOrdersCached(forceRefresh);

  //Identify First-Time conversion points across entire historical lifespan
  const userFirstOrderMap = new Map<string, UserFirstOrderTracker>();
  for (const o of allOrders) {
    const existing = userFirstOrderMap.get(o.userId);
    if (!existing) {
      userFirstOrderMap.set(o.userId, { firstOrderId: o.id, firstOrderTime: o.createdAt });
    } else if (o.createdAt < existing.firstOrderTime) {
      userFirstOrderMap.set(o.userId, { firstOrderId: o.id, firstOrderTime: o.createdAt });
    }
  }

  //Apply operational date window filters
  const filteredOrders = allOrders.filter((o) => {
    if (startMs && o.createdAt < startMs) return false;
    if (endMs   && o.createdAt > endMs)   return false;
    return true;
  });

  //Initialize structural reporting matrices
  let computedRevenue = 0; // revenue from COMPLETED orders only (AOV basis)
  let totalPiecesCount = 0;

  let expressOrders = 0;
  let ordinaryOrders = 0;
  let expressCompleted = 0;
  let expressCancelled = 0;
  let ordinaryCompleted = 0;
  let ordinaryCancelled = 0;
  let completedOrders = 0;
  let cancelledOrders = 0;
  let firstTimeOrders = 0;

  const timelineMap = new Map<string, ChartTimelinePoint & { sortKey: string }>();
  const reportRowMap = new Map<string, ActivityReportRow>();
  const firstOrderRows: FirstTimeOrderRow[] = [];

  // Aggregate transactional datasets
  for (const o of filteredOrders) {
    const isFirstOrder = userFirstOrderMap.get(o.userId)?.firstOrderId === o.id;
    const isCompleted = o.isDelivered || o.latestStatus.status === "delivered" || o.latestStatus.status === "completed";
    const isCancelled = o.isCancelled || o.latestStatus.status === "cancelled";

    if (isCompleted) {
      completedOrders++;
      computedRevenue += o.totalPrice; // AOV is based on completed orders only
      // Avg items/order is also based on completed orders only (actual processed load)
      totalPiecesCount += o.items.reduce((sum, item) => sum + item.count, 0);
    }

    // Express/Ordinary counts reflect ALL demand in the range (not just completed),
    // with a fulfillment-outcome breakdown layered on top.
    if (o.serviceType === "express") {
      expressOrders++;
      if (isCompleted) expressCompleted++;
      if (isCancelled) expressCancelled++;
    } else {
      ordinaryOrders++;
      if (isCompleted) ordinaryCompleted++;
      if (isCancelled) ordinaryCancelled++;
    }

    if (isCancelled) cancelledOrders++;
    if (isFirstOrder) {
      firstTimeOrders++;
      firstOrderRows.push({
        orderId: o.id,
        orderNumber: o.orderNumber ?? o.id.substring(0, 8),
        customer: o.userName || "Customer",
        total: o.totalPrice,
        createdAt: o.createdAt,
        status: o.latestStatus.status,
      });
    }

    // Resolve date segmentation grouping text label
    let label = getDayString(o.createdAt);
    if (period === "weekly") label = getWeekString(o.createdAt);
    if (period === "monthly") label = getMonthString(o.createdAt);

    const sortKey = getSortKey(o.createdAt, period);

    // --- Process Chart Timeline Maps ---
    if (!timelineMap.has(sortKey)) {
      timelineMap.set(sortKey, { label, orders: 0, completed: 0, cancelled: 0, firstOrders: 0, sortKey });
    }
    const tPoint = timelineMap.get(sortKey)!;
    tPoint.orders++;
    if (isCompleted) tPoint.completed++;
    if (isCancelled) tPoint.cancelled++;
    if (isFirstOrder) tPoint.firstOrders++;

    // --- Process Operational Activity Tables Row Maps ---
    // Keyed by full daily sort key ("YYYY-MM-DD") to avoid collapsing the
    // same calendar day across different years (e.g. "01 Jun" 2024 vs 2025).
    const daySortKey = getSortKey(o.createdAt, "daily");
    const dayDisplayLabel = getDayString(o.createdAt);

    if (!reportRowMap.has(daySortKey)) {
      reportRowMap.set(daySortKey, {
        date: dayDisplayLabel,
        orders: 0,
        firstOrders: 0,
        completed: 0,
        cancelled: 0,
        completionRate: 0,
        rawSortKey: daySortKey
      });
    }
    const rRow = reportRowMap.get(daySortKey)!;
    rRow.orders++;
    if (isFirstOrder) rRow.firstOrders++;
    if (isCompleted) rRow.completed++;
    if (isCancelled) rRow.cancelled++;
  }

  // Finalize dynamic percentage computations
  const totalOrders = filteredOrders.length;
  const averageOrderValue = completedOrders === 0 ? 0 : computedRevenue / completedOrders;
  const averageItemsPerOrder = completedOrders === 0 ? 0 : totalPiecesCount / completedOrders;

  // Build fulfillment-outcome breakdowns for each service type
  const buildBreakdown = (total: number, completed: number, cancelled: number): ServiceTypeBreakdown => {
    const pending = total - completed - cancelled;
    return {
      total,
      completed,
      cancelled,
      pending,
      completedPct: total === 0 ? 0 : (completed / total) * 100,
      cancelledPct: total === 0 ? 0 : (cancelled / total) * 100,
      pendingPct: total === 0 ? 0 : (pending / total) * 100,
    };
  };

  const expressBreakdown = buildBreakdown(expressOrders, expressCompleted, expressCancelled);
  const ordinaryBreakdown = buildBreakdown(ordinaryOrders, ordinaryCompleted, ordinaryCancelled);

  // Process and finalize structured rows inside the Activity Report
  const reportRows = [...reportRowMap.values()]
    .map(row => ({
      ...row,
      completionRate: row.orders === 0 ? 0 : (row.completed / row.orders) * 100
    }))
    .sort((a, b) => b.rawSortKey.localeCompare(a.rawSortKey)); // Modern descending lookup flow

  // Chronologically sort chart datasets
  const chartData = [...timelineMap.values()]
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ label, orders, completed, cancelled, firstOrders }) => ({
      label, orders, completed, cancelled, firstOrders
    }));

  // Sort localized client conversion logs by descending timestamps
  firstOrderRows.sort((a, b) => b.createdAt - a.createdAt);

  return {
    totalOrders,
    completedOrders,
    cancelledOrders,
    firstTimeOrders,
    expressOrders,
    ordinaryOrders,
    expressBreakdown,
    ordinaryBreakdown,
    averageOrderValue,
    averageItemsPerOrder,
    chartData,
    reportRows,
    firstOrderRows,
  };
}