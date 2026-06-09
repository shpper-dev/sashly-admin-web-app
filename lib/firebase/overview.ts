import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./config";
import { Order } from "../models/order.model";

//  Types 

export interface OverviewStats {
  orderCount: number;
  totalPieces: number;
  totalValue: number;
  revenue: number;
  totalDiscounts: number;
  totalCreditsUsed: number;
  unpaidInvoices: number;
  cleanedPieces: number;
}

export interface DailyRevenueRow {
  date: string;           // "YYYY-MM-DD"
  dateMs: number;
  revenue: number;
  cash: number;
  card: number;
  wallet: number;
  orderCount: number;
  discounts: number;
  credits: number;
}

export interface ServiceHealthOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  expectedDeliveryTime: number | null;
  totalPrice: number;
  status: "OVERDUE" | "ON TRACK" | "PENDING";
  latestStatus: string;
}

export interface TopSection {
  label: string;
  arabicName: string;
  totalPieces: number;
  percentage: number;
}

export interface RevenueBreakdown {
  card: number;
  cash: number;
  bank: number;
  total: number;
  cardPct: number;
  cashPct: number;
  bankPct: number;
  creditGiven: number;
}

export interface OverviewData {
  stats: OverviewStats;
  dailyRevenue: DailyRevenueRow[];
  serviceHealth: ServiceHealthOrder[];
  topSections: TopSection[];
  revenueBreakdown: RevenueBreakdown;
  // KPIs for the chart footer
  netSales: number;
  avgOrderValue: number;
  newAcquisitions: number;
}

// Helpers 

function toDateKey(ms: number): string {
  return new Date(ms).toISOString().split("T")[0]; // "YYYY-MM-DD"
}

function isOverdue(order: Order): boolean {
  if (!order.expectedDeliveryTime) return false;
  return Date.now() > order.expectedDeliveryTime;
}


function classifyPayment(paidBy?: string | null): "card" | "cash" | "wallet" {
  if (!paidBy) return "card";
  const lower = paidBy.toLowerCase();
  if (lower.includes("cash"))                     return "cash";
  if (lower.includes("wallet") || lower.includes("transfer")) return "wallet";
  return "card"; 
}

export async function getOverviewData(
  startMs: number,
  endMs: number
): Promise<OverviewData> {


  const q = query(
    collection(db, "orders"),
    where("createdAt", ">=", startMs),
    where("createdAt", "<=", endMs)
  );

  const [ordersSnap, usersSnap] = await Promise.all([
    getDocs(q),
    getDocs(collection(db, "users")),
  ]);

  const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order));


  const delivered  = orders.filter(o => o.isDelivered);
  const unpaid     = orders.filter(o => !o.isPaid && !o.isCancelled);
  const active     = orders.filter(o => !o.isDelivered && !o.isCancelled);

  const CLEANED_STATUSES = new Set(["cleaning", "readyToDeliver", "delivered"]);

  const stats: OverviewStats = {
    orderCount:       orders.length,
    totalPieces:      orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.count, 0), 0),
    totalValue:       orders.reduce((s, o) => s + o.totalPrice, 0),
    revenue:          delivered.reduce((s, o) => s + o.totalPrice, 0),
    totalDiscounts:   orders.reduce((s, o) => s + (o.discountAmount ?? 0), 0),
    totalCreditsUsed: orders
      .filter(o => o.appliedCoupon)
      .reduce((s, o) => s + (o.discountAmount ?? 0), 0),
    unpaidInvoices:   unpaid.length,
    cleanedPieces:    orders
      .filter(o => CLEANED_STATUSES.has(o.latestStatus.status))
      .reduce((s, o) => s + o.items.reduce((a, i) => a + i.count, 0), 0),
  };

  //Daily revenue log 
  // Group paid orders by date, split by payment method

  const dailyMap = new Map<string, DailyRevenueRow>();

  for (const order of orders) {
    if (!order.isPaid) continue; // only count paid orders in revenue log

    const dateKey = toDateKey(order.createdAt);
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        date: dateKey,
        dateMs: order.createdAt,
        revenue: 0,
        cash: 0,
        card: 0,
        wallet: 0,
        orderCount: 0,
        discounts: 0,
        credits: 0,
      });
    }

    const row = dailyMap.get(dateKey)!;
    const method = classifyPayment(order.paidBy);

    row.revenue     += order.totalPrice;
    row.orderCount  += 1;
    row.discounts   += order.discountAmount ?? 0;
    row.credits     += order.appliedCoupon ? (order.discountAmount ?? 0) : 0;
    row[method]     += order.totalPrice;
  }

  // Sort descending — most recent first
  const dailyRevenue = [...dailyMap.values()].sort((a, b) => b.dateMs - a.dateMs);

  // Service health 

  const ACTIVE_STATUSES = new Set(["confirmed", "pickedUp", "sorting", "detailing", "cleaning", "readyToDeliver"]);

  const serviceHealth: ServiceHealthOrder[] = active
    .filter(o => ACTIVE_STATUSES.has(o.latestStatus.status))
    .map(o => {
      let status: "OVERDUE" | "ON TRACK" | "PENDING";
      if (isOverdue(o)) {
        status = "OVERDUE";
      } else if (o.latestStatus.status === "confirmed" && !o.expectedDeliveryTime) {
        status = "PENDING";
      } else {
        status = "ON TRACK";
      }
      return {
        id:                   o.id,
        orderNumber:          o.orderNumber ?? `#${o.id.slice(-4).toUpperCase()}`,
        customerName:         o.userName,
        expectedDeliveryTime: o.expectedDeliveryTime ?? null,
        totalPrice:           o.totalPrice,
        status,
        latestStatus:         o.latestStatus.status,
      };
    })
    // Sort: OVERDUE first, then ON TRACK, then PENDING
    .sort((a, b) => {
      const priority = { OVERDUE: 0, "ON TRACK": 1, PENDING: 2 };
      return priority[a.status] - priority[b.status];
    })
    .slice(0, 10); // cap at 10 rows

  //Top selling sections (services)
  // Aggregate pieces per serviceName across all orders in range

  const sectionMap = new Map<string, { arabic: string; pieces: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const key = item.serviceName;
      if (!sectionMap.has(key)) {
        sectionMap.set(key, { arabic: item.serviceArabicName, pieces: 0 });
      }
      sectionMap.get(key)!.pieces += item.count;
    }
  }

  const totalSectionPieces = [...sectionMap.values()].reduce((s, v) => s + v.pieces, 0) || 1;

  const topSections: TopSection[] = [...sectionMap.entries()]
    .map(([name, { arabic, pieces }]) => ({
      label:       name,
      arabicName:  arabic,
      totalPieces: pieces,
      percentage:  Math.round((pieces / totalSectionPieces) * 100),
    }))
    .sort((a, b) => b.totalPieces - a.totalPieces)
    .slice(0, 5);

  // Revenue breakdown by payment method

  let cardTotal = 0, cashTotal = 0, bankTotal = 0;
  for (const order of orders.filter(o => o.isPaid)) {
    const method = classifyPayment(order.paidBy);
    if (method === "card") cardTotal += order.totalPrice;
    if (method === "cash") cashTotal += order.totalPrice;
    if (method === "wallet") bankTotal += order.totalPrice;
  }
  const revenueTotal = cardTotal + cashTotal + bankTotal || 1;

  const revenueBreakdown: RevenueBreakdown = {
    card:        cardTotal,
    cash:        cashTotal,
    bank:        bankTotal,
    total:       revenueTotal,
    cardPct:     Math.round((cardTotal / revenueTotal) * 100),
    cashPct:     Math.round((cashTotal / revenueTotal) * 100),
    bankPct:     Math.round((bankTotal / revenueTotal) * 100),
    creditGiven: stats.totalCreditsUsed,
  };

  // KPIs 

  const netSales      = stats.revenue - stats.totalDiscounts;
  const avgOrderValue = orders.length > 0 ? stats.totalValue / orders.length : 0;
  // New acquisitions = users whose createdAt falls within the range
  const newAcquisitions = usersSnap.docs.filter(d => {
    const createdAt = d.data().createdAt as number;
    return createdAt >= startMs && createdAt <= endMs;
  }).length;

  return {
    stats,
    dailyRevenue,
    serviceHealth,
    topSections,
    revenueBreakdown,
    netSales,
    avgOrderValue,
    newAcquisitions,
  };
}