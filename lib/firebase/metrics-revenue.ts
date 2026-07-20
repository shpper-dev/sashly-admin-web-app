import { collection, getDocs } from "firebase/firestore";
import { db } from "./config";
import { Dispute, ResolveAction } from "../models/dispute.model";
import {
  getAllOrdersCached,
  invalidateOrdersMetricsCache,
  buildUserFirstOrderMap,
  getDayString,
  getWeekString,
  getMonthString,
  getSortKey,
  MappedOrder,
} from "./metrics-orders";

//  TYPES 

export interface RevenueChartPoint {
  label: string;
  grossRevenue: number;
  realizedRevenue: number;
  cancelledRevenue: number;
  completedOrders: number;
  driverEarnings: number;
  refundedAmount: number; // refunds/credits resolved within this bucket, keyed by resolution date
}

export interface RevenueActivityReportRow {
  date: string;
  orders: number;
  grossRevenue: number;
  realizedRevenue: number;
  cancelledRevenue: number;
  discountGiven: number;
  refundedAmount: number;
  avgOrderValue: number;
  rawSortKey: string;
}

export interface RevenueSourceBreakdown {
  totalRevenue: number;
  individualRevenue: number;
  individualOrders: number;
  individualPct: number;
  businessRevenue: number;
  businessOrders: number;
  businessPct: number;
}

export interface RevenueCustomerTypeBreakdown {
  totalRevenue: number;
  firstTimeRevenue: number;
  firstTimeOrders: number;
  firstTimePct: number;
  returningRevenue: number;
  returningOrders: number;
  returningPct: number;
}

export interface RevenueConcentration {
  topSharePct: number;
  topRevenuePct: number;
  topOrdersCount: number;
}

// Disputes whose resolution actually cost the business money
const REFUND_COST_ACTIONS: ResolveAction[] = ["full_refund", "partial_refund", "wallet_credit"];

export interface RefundIssueTypeAmount {
  issueType: string;
  amount: number;
  count: number;
}

export interface RefundBreakdown {
  totalRefunded: number;          // full + partial + wallet credit combined
  fullRefundAmount: number;
  fullRefundPct: number;
  partialRefundAmount: number;
  partialRefundPct: number;
  walletCreditAmount: number;
  walletCreditPct: number;
  refundedOrdersCount: number;    // distinct orders with a cost-incurring resolution in range
  disputesResolvedCount: number;  // all disputes resolved in range, any action (ops metric)
  byIssueType: RefundIssueTypeAmount[]; // sorted descending by amount, zero-amount types excluded
}

export interface RevenueMetrics {
  grossRevenue: number;
  realizedRevenue: number;
  netRealizedRevenue: number;      // realizedRevenue - refunds.totalRefunded
  awaitingPaymentRevenue: number;
  cancelledRevenue: number;
  discountGiven: number;

  largestOrderValue: number;
  medianOrderValue: number;

  driverEarningsTotal: number;
  completedOrdersCount: number;
  totalOrdersCount: number;

  revenueGrowthPct: number | null;
  previousPeriodRevenue: number | null;

  refunds: RefundBreakdown;
  refundRatePct: number; // refundedOrdersCount / completedOrdersCount, guards against 0

  revenueBySource: RevenueSourceBreakdown;
  revenueByCustomerType: RevenueCustomerTypeBreakdown;
  revenueConcentration: RevenueConcentration;

  chartData: RevenueChartPoint[];
  reportRows: RevenueActivityReportRow[];
}

//  DISPUTES CACHE 
// Same short-TTL, module-level caching pattern as getAllOrdersCached in
// metrics-orders.ts. Kept separate since disputes and orders are different
// collections with independent write patterns.

type MappedDispute = Dispute & { id: string };

let disputesCache: { data: MappedDispute[]; timestamp: number } | null = null;
const DISPUTES_CACHE_TTL_MS = 60_000;

async function getAllDisputesCached(forceRefresh = false): Promise<MappedDispute[]> {
  const now = Date.now();
  if (!forceRefresh && disputesCache && now - disputesCache.timestamp < DISPUTES_CACHE_TTL_MS) {
    return disputesCache.data;
  }
  const snap = await getDocs(collection(db, "disputes"));
  const allDisputes = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MappedDispute));
  disputesCache = { data: allDisputes, timestamp: now };
  return allDisputes;
}

export function invalidateDisputesMetricsCache(): void {
  disputesCache = null;
}

// Invalidates both the orders cache and the disputes cache — call after any
// write (order status change, dispute resolution) that should be reflected
// immediately on the revenue metrics page.
export function invalidateRevenueMetricsCache(): void {
  invalidateOrdersMetricsCache();
  invalidateDisputesMetricsCache();
}

//  COST FACTORS & NET PROFIT 
// Pure, synchronous, no Firestore access — safe to call on every keystroke/
// slider-drag on the frontend for real-time net profit recalculation.

export interface RevenueCostFactors {
  operationalCostPct: number;
  commissionPct: number;
  deliveryCostPerOrder: number;
  includeDriverEarnings: boolean;
  includeRefunds: boolean;        // ← new
  manualAdjustment: number;
  manualAdjustmentLabel: string;
}

export const DEFAULT_COST_FACTORS: RevenueCostFactors = {
  operationalCostPct: 0,
  commissionPct: 0,
  deliveryCostPerOrder: 0,
  includeDriverEarnings: true,
  includeRefunds: true,
  manualAdjustment: 0,
  manualAdjustmentLabel: "",
};

export interface NetProfitBreakdown {
  realizedRevenue: number;
  driverEarningsCost: number;
  refundCost: number;             // ← new
  operationalCost: number;
  commissionCost: number;
  deliveryCost: number;
  manualAdjustment: number;
  totalCosts: number;
  netProfit: number;
  netMarginPct: number;
}

export function calculateNetProfit(
  realizedRevenue: number,
  completedOrdersCount: number,
  driverEarningsTotal: number,
  refundedTotal: number,
  factors: RevenueCostFactors
): NetProfitBreakdown {
  const driverEarningsCost = factors.includeDriverEarnings ? driverEarningsTotal : 0;
  const refundCost = factors.includeRefunds ? refundedTotal : 0;
  const operationalCost = realizedRevenue * (factors.operationalCostPct / 100);
  const commissionCost = realizedRevenue * (factors.commissionPct / 100);
  const deliveryCost = completedOrdersCount * factors.deliveryCostPerOrder;
  const manualAdjustment = factors.manualAdjustment;
  const totalCosts = driverEarningsCost + refundCost + operationalCost + commissionCost + deliveryCost + manualAdjustment;
  const netProfit = realizedRevenue - totalCosts;
  const netMarginPct = realizedRevenue === 0 ? 0 : (netProfit / realizedRevenue) * 100;

  return {
    realizedRevenue,
    driverEarningsCost,
    refundCost,
    operationalCost,
    commissionCost,
    deliveryCost,
    manualAdjustment,
    totalCosts,
    netProfit,
    netMarginPct,
  };
}

//  AGGREGATION HELPERS 

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function pct(part: number, total: number): number {
  return total === 0 ? 0 : (part / total) * 100;
}

function isCompleted(o: MappedOrder): boolean {
  return o.isDelivered || o.latestStatus.status === "delivered";
}

function isCancelled(o: MappedOrder): boolean {
  return o.isCancelled || o.latestStatus.status === "cancelled";
}

function computePreviousPeriodRevenue(
  allOrders: MappedOrder[],
  startMs?: number,
  endMs?: number
): number | null {
  if (!startMs || !endMs) return null;
  const duration = endMs - startMs;
  const prevStart = startMs - duration;
  const prevEnd = startMs - 1;

  return allOrders
    .filter((o) => o.createdAt >= prevStart && o.createdAt <= prevEnd && o.isPaid && !isCancelled(o))
    .reduce((sum, o) => sum + o.totalPrice, 0);
}

function buildSourceBreakdown(paidOrders: MappedOrder[]): RevenueSourceBreakdown {
  let individualRevenue = 0, individualOrders = 0;
  let businessRevenue = 0, businessOrders = 0;

  for (const o of paidOrders) {
    if (o.businessAccountId) {
      businessRevenue += o.totalPrice;
      businessOrders++;
    } else {
      individualRevenue += o.totalPrice;
      individualOrders++;
    }
  }

  const totalRevenue = individualRevenue + businessRevenue;
  return {
    totalRevenue,
    individualRevenue,
    individualOrders,
    individualPct: pct(individualRevenue, totalRevenue),
    businessRevenue,
    businessOrders,
    businessPct: pct(businessRevenue, totalRevenue),
  };
}

function buildCustomerTypeBreakdown(
  paidOrders: MappedOrder[],
  userFirstOrderMap: Map<string, { firstOrderId: string; firstOrderTime: number }>
): RevenueCustomerTypeBreakdown {
  let firstTimeRevenue = 0, firstTimeOrders = 0;
  let returningRevenue = 0, returningOrders = 0;

  for (const o of paidOrders) {
    const isFirstOrder = userFirstOrderMap.get(o.userId)?.firstOrderId === o.id;
    if (isFirstOrder) {
      firstTimeRevenue += o.totalPrice;
      firstTimeOrders++;
    } else {
      returningRevenue += o.totalPrice;
      returningOrders++;
    }
  }

  const totalRevenue = firstTimeRevenue + returningRevenue;
  return {
    totalRevenue,
    firstTimeRevenue,
    firstTimeOrders,
    firstTimePct: pct(firstTimeRevenue, totalRevenue),
    returningRevenue,
    returningOrders,
    returningPct: pct(returningRevenue, totalRevenue),
  };
}

function buildConcentration(paidOrders: MappedOrder[], topSharePct = 10): RevenueConcentration {
  if (paidOrders.length === 0) {
    return { topSharePct, topRevenuePct: 0, topOrdersCount: 0 };
  }
  const sorted = [...paidOrders].sort((a, b) => b.totalPrice - a.totalPrice);
  const topOrdersCount = Math.max(1, Math.ceil(sorted.length * (topSharePct / 100)));
  const topRevenue = sorted.slice(0, topOrdersCount).reduce((sum, o) => sum + o.totalPrice, 0);
  const totalRevenue = sorted.reduce((sum, o) => sum + o.totalPrice, 0);

  return { topSharePct, topRevenuePct: pct(topRevenue, totalRevenue), topOrdersCount };
}

//  CORE ANALYTICS IMPLEMENTATION 

export async function getRevenueMetrics(
  startMs?: number,
  endMs?: number,
  period: "daily" | "weekly" | "monthly" = "daily",
  forceRefresh = false
): Promise<RevenueMetrics> {

  const [allOrders, allDisputes] = await Promise.all([
    getAllOrdersCached(forceRefresh),
    getAllDisputesCached(forceRefresh),
  ]);
  const userFirstOrderMap = buildUserFirstOrderMap(allOrders);

  const filteredOrders = allOrders.filter((o) => {
    if (startMs && o.createdAt < startMs) return false;
    if (endMs && o.createdAt > endMs) return false;
    return true;
  });

  // Disputes are attributed to the period by resolution date (when the cash
  // actually moved), not the originating order's creation date.
  const filteredDisputes = allDisputes.filter((d) => {
    if (!d.resolution) return false;
    if (startMs && d.resolution.resolvedAt < startMs) return false;
    if (endMs && d.resolution.resolvedAt > endMs) return false;
    return true;
  });

  let grossRevenue = 0;
  let realizedRevenue = 0;
  let awaitingPaymentRevenue = 0;
  let cancelledRevenue = 0;
  let discountGiven = 0;
  let driverEarningsTotal = 0;
  let completedOrdersCount = 0;

  const paidOrders: MappedOrder[] = [];
  const chartMap = new Map<string, RevenueChartPoint & { sortKey: string }>();
  const reportRowMap = new Map<string, RevenueActivityReportRow>();

  for (const o of filteredOrders) {
    const completed = isCompleted(o);
    const cancelled = isCancelled(o);

    grossRevenue += o.totalPrice;

    if (cancelled) {
      cancelledRevenue += o.totalPrice;
    } else {
      if (o.isPaid) {
        realizedRevenue += o.totalPrice;
        paidOrders.push(o);
      } else {
        awaitingPaymentRevenue += o.totalPrice;
      }
      discountGiven += o.discountAmount ?? 0;
    }

    if (completed) {
      completedOrdersCount++;
      driverEarningsTotal += o.driverEarnings ?? 0;
    }

    let label = getDayString(o.createdAt);
    if (period === "weekly") label = getWeekString(o.createdAt);
    if (period === "monthly") label = getMonthString(o.createdAt);
    const sortKey = getSortKey(o.createdAt, period);

    if (!chartMap.has(sortKey)) {
      chartMap.set(sortKey, {
        label, grossRevenue: 0, realizedRevenue: 0, cancelledRevenue: 0,
        completedOrders: 0, driverEarnings: 0, refundedAmount: 0, sortKey,
      });
    }
    const point = chartMap.get(sortKey)!;
    point.grossRevenue += o.totalPrice;
    if (cancelled) point.cancelledRevenue += o.totalPrice;
    else if (o.isPaid) point.realizedRevenue += o.totalPrice;
    if (completed) {
      point.completedOrders++;
      point.driverEarnings += o.driverEarnings ?? 0;
    }

    const daySortKey = getSortKey(o.createdAt, "daily");
    const dayLabel = getDayString(o.createdAt);
    if (!reportRowMap.has(daySortKey)) {
      reportRowMap.set(daySortKey, {
        date: dayLabel, orders: 0, grossRevenue: 0, realizedRevenue: 0,
        cancelledRevenue: 0, discountGiven: 0, refundedAmount: 0, avgOrderValue: 0, rawSortKey: daySortKey,
      });
    }
    const row = reportRowMap.get(daySortKey)!;
    row.orders++;
    row.grossRevenue += o.totalPrice;
    if (cancelled) row.cancelledRevenue += o.totalPrice;
    else if (o.isPaid) row.realizedRevenue += o.totalPrice;
    if (!cancelled) row.discountGiven += o.discountAmount ?? 0;
  }

  //  Disputes / refunds pass 
  let fullRefundAmount = 0;
  let partialRefundAmount = 0;
  let walletCreditAmount = 0;
  let disputesResolvedCount = 0;
  const refundedOrderIds = new Set<string>();
  const issueTypeMap = new Map<string, { amount: number; count: number }>();

  for (const d of filteredDisputes) {
    if (!d.resolution) continue;
    disputesResolvedCount++;

    const action = d.resolution.action;
    const amount = d.resolution.amount ?? 0;
    if (!REFUND_COST_ACTIONS.includes(action) || amount <= 0) continue;

    refundedOrderIds.add(d.orderId);
    if (action === "full_refund") fullRefundAmount += amount;
    else if (action === "partial_refund") partialRefundAmount += amount;
    else if (action === "wallet_credit") walletCreditAmount += amount;

    const existing = issueTypeMap.get(d.issueType) ?? { amount: 0, count: 0 };
    existing.amount += amount;
    existing.count += 1;
    issueTypeMap.set(d.issueType, existing);

    const resolvedAt = d.resolution.resolvedAt;
    let label = getDayString(resolvedAt);
    if (period === "weekly") label = getWeekString(resolvedAt);
    if (period === "monthly") label = getMonthString(resolvedAt);
    const sortKey = getSortKey(resolvedAt, period);

    if (!chartMap.has(sortKey)) {
      chartMap.set(sortKey, {
        label, grossRevenue: 0, realizedRevenue: 0, cancelledRevenue: 0,
        completedOrders: 0, driverEarnings: 0, refundedAmount: 0, sortKey,
      });
    }
    chartMap.get(sortKey)!.refundedAmount += amount;

    const daySortKey = getSortKey(resolvedAt, "daily");
    const dayLabel = getDayString(resolvedAt);
    if (!reportRowMap.has(daySortKey)) {
      reportRowMap.set(daySortKey, {
        date: dayLabel, orders: 0, grossRevenue: 0, realizedRevenue: 0,
        cancelledRevenue: 0, discountGiven: 0, refundedAmount: 0, avgOrderValue: 0, rawSortKey: daySortKey,
      });
    }
    reportRowMap.get(daySortKey)!.refundedAmount += amount;
  }

  const totalRefunded = fullRefundAmount + partialRefundAmount + walletCreditAmount;
  const byIssueType = [...issueTypeMap.entries()]
    .map(([issueType, v]) => ({ issueType, amount: v.amount, count: v.count }))
    .sort((a, b) => b.amount - a.amount);

  const refunds: RefundBreakdown = {
    totalRefunded,
    fullRefundAmount,
    fullRefundPct: pct(fullRefundAmount, totalRefunded),
    partialRefundAmount,
    partialRefundPct: pct(partialRefundAmount, totalRefunded),
    walletCreditAmount,
    walletCreditPct: pct(walletCreditAmount, totalRefunded),
    refundedOrdersCount: refundedOrderIds.size,
    disputesResolvedCount,
    byIssueType,
  };

  const refundRatePct = pct(refunds.refundedOrdersCount, completedOrdersCount);

  //  Finalize 
  const paidValues = paidOrders.map((o) => o.totalPrice);
  const largestOrderValue = paidValues.length > 0 ? Math.max(...paidValues) : 0;
  const medianOrderValue = median(paidValues);

  const previousPeriodRevenue = computePreviousPeriodRevenue(allOrders, startMs, endMs);
  const revenueGrowthPct =
    previousPeriodRevenue === null || previousPeriodRevenue === 0
      ? null
      : ((realizedRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;

  const paidCountByDay = new Map<string, number>();
  for (const o of paidOrders) {
    const key = getSortKey(o.createdAt, "daily");
    paidCountByDay.set(key, (paidCountByDay.get(key) ?? 0) + 1);
  }
  const reportRows = [...reportRowMap.values()]
    .map((row) => {
      const paidCount = paidCountByDay.get(row.rawSortKey) ?? 0;
      return { ...row, avgOrderValue: paidCount === 0 ? 0 : row.realizedRevenue / paidCount };
    })
    .sort((a, b) => b.rawSortKey.localeCompare(a.rawSortKey));

  const chartData = [...chartMap.values()]
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ label, grossRevenue, realizedRevenue, cancelledRevenue, completedOrders, driverEarnings, refundedAmount }) => ({
      label, grossRevenue, realizedRevenue, cancelledRevenue, completedOrders, driverEarnings, refundedAmount,
    }));

  return {
    grossRevenue,
    realizedRevenue,
    netRealizedRevenue: realizedRevenue - totalRefunded,
    awaitingPaymentRevenue,
    cancelledRevenue,
    discountGiven,
    largestOrderValue,
    medianOrderValue,
    driverEarningsTotal,
    completedOrdersCount,
    totalOrdersCount: filteredOrders.length,
    revenueGrowthPct,
    previousPeriodRevenue,
    refunds,
    refundRatePct,
    revenueBySource: buildSourceBreakdown(paidOrders),
    revenueByCustomerType: buildCustomerTypeBreakdown(paidOrders, userFirstOrderMap),
    revenueConcentration: buildConcentration(paidOrders),
    chartData,
    reportRows,
  };
}