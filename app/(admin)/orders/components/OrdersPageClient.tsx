"use client";
import {
  OrderFilters, subscribeToOrders,
  getOrderTabStats, getArchiveTabStats, OrderTabStats,
} from "@/lib/firebase/order";
import { Order } from "@/lib/models/order.model";
import { useEffect, useRef, useState, useCallback } from "react";
import Header from "@/components/Header";
import { Download, Plus } from "lucide-react";
import { exportToCsv } from "@/lib/utils";
import { useToast } from "@/lib/providers/ToastProvider";
import { useRouter, useSearchParams } from "next/navigation";
import OrderDetails from "./OrderDetails";
import OrderCleaning from "./OrderCleaning";
import OrderPickups from "./OrderPickups";
import OrderReady from "./OrderReady";
import OrderArchive from "./OrderArchive";
import OrderAll from "./OrderAll";
import AddBusinessOrderDialog from "@/components/orders/AddBusinessOrderDialog";

export type TabKey = "all" | "detail" | "cleaning" | "ready" | "pickups" | "archive";
type LiveTabKey = Exclude<TabKey, "archive">;

const TAB_FILTERS: Record<LiveTabKey, OrderFilters> = {
  all:      {},
  detail:   { statuses: ["pickedUp", "sorting", "detailing"], isCancelled: false, isDelivered: false },
  pickups:  { status: "confirmed", hasDriver: true },
  cleaning: { statuses: ["cleaning"] },
  ready:    { status: "readyToDeliver" },
};

const tabs: { key: TabKey; label: string }[] = [
  { key: "all",      label: "All"      },
  { key: "pickups",  label: "Pickups"  },
  { key: "detail",   label: "Detail"   },
  { key: "cleaning", label: "Cleaning" },
  { key: "ready",    label: "Ready"    },
  { key: "archive",  label: "Archive"  },
];

export interface OrderTabProps {
  orders: Order[];
  loading: boolean;
  onStatusUpdate: () => void;
  currentPage: number;
  hasNextPage: boolean;
  onNext: () => void;
  onPrev: () => void;
  pageSize: number;
  autoOpenOrderId?: string | null;
}

const EMPTY_STATS: OrderTabStats = { count: 0, totalRevenue: 0, totalUnpaid: 0 };

export default function OrdersPage() {
  const [activeTab, setActiveTab]     = useState<TabKey>("detail");
  const [loading, setLoading]         = useState(false);
  const [orders, setOrders]           = useState<Order[]>([]);
  const [lastDoc, setLastDoc]         = useState<any>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const cursorStack = useRef<any[]>([undefined]);

  const [tabStats, setTabStats]         = useState<OrderTabStats>(EMPTY_STATS);
  const [statsLoading, setStatsLoading] = useState(false);
  const statsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchParams = useSearchParams();
  const router       = useRouter();
  const autoOpenOrderId = searchParams.get("orderId");

  useEffect(() => {
    if (autoOpenOrderId) router.replace("/orders");
  }, [autoOpenOrderId]);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const { showToast } = useToast();

  const pageHeadings: Record<TabKey, { main: string; sub: string }> = {
    all:      { main: "All",      sub: "All orders" },
    detail:   { main: "Detail",   sub: "Orders awaiting detailing or currently being detailed" },
    cleaning: { main: "Cleaning", sub: "Orders currently being cleaned" },
    ready:    { main: "Ready",    sub: "Ready laundry awaiting delivery" },
    pickups:  { main: "Pickups",  sub: "Confirmed orders with an assigned driver" },
    archive:  { main: "Archive",  sub: "All delivered and cancelled orders" },
  };

  const PAGE_SIZE = 50;

  const refetchStats = useCallback((tab: TabKey) => {
    if (statsDebounceRef.current) clearTimeout(statsDebounceRef.current);
    statsDebounceRef.current = setTimeout(async () => {
      setStatsLoading(true);
      try {
        const stats = tab === "archive"
          ? await getArchiveTabStats()
          : await getOrderTabStats(TAB_FILTERS[tab as LiveTabKey]);
        setTabStats(stats);
      } catch (err) {
        console.error("Failed to load tab stats", err);
      } finally {
        setStatsLoading(false);
      }
    }, 300);
  }, []);

  useEffect(() => {
    setLoading(true);
    setOrders([]);
    setTabStats(EMPTY_STATS);

    unsubscribeRef.current?.();
    cursorStack.current = [undefined];
    setCurrentPage(1);

    if (activeTab === "archive") {
      setLoading(false);
      refetchStats("archive");
      return;
    }

    const unsubscribe = subscribeToOrders(
      (rows, newLastDoc) => {
        setOrders(rows);
        setLastDoc(newLastDoc);
        setHasNextPage(rows.length === PAGE_SIZE);
        setLoading(false);
        refetchStats(activeTab);
      },
      TAB_FILTERS[activeTab as LiveTabKey],
      PAGE_SIZE
    );

    unsubscribeRef.current = unsubscribe;
    return () => {
      unsubscribe();
      if (statsDebounceRef.current) clearTimeout(statsDebounceRef.current);
    };
  }, [activeTab, refetchStats]);

  const handleNext = async () => {
    if (!hasNextPage || !lastDoc || activeTab === "archive") return;

    cursorStack.current.push(lastDoc);
    unsubscribeRef.current?.();

    const unsubscribe = subscribeToOrders(
      (rows, newLastDoc) => {
        setOrders(rows);
        setLastDoc(newLastDoc);
        setHasNextPage(rows.length === PAGE_SIZE);
      },
      TAB_FILTERS[activeTab as LiveTabKey],
      PAGE_SIZE,
      lastDoc
    );

    unsubscribeRef.current = unsubscribe;
    setCurrentPage((p) => p + 1);
  };

  const handlePrev = async () => {
    if (currentPage <= 1 || activeTab === "archive") return;

    cursorStack.current.pop();
    const prevCursor = cursorStack.current[cursorStack.current.length - 1];

    unsubscribeRef.current?.();

    const unsubscribe = subscribeToOrders(
      (rows, newLastDoc) => {
        const filtered =
          activeTab === "detail"
            ? rows.filter((o) => !o.assignedDriverId)
            : activeTab === "pickups"
            ? rows.filter((o) => !!o.assignedDriverId)
            : rows;

        setOrders(filtered);
        setLastDoc(newLastDoc);
        setHasNextPage(rows.length === PAGE_SIZE);
      },
      TAB_FILTERS[activeTab as LiveTabKey],
      PAGE_SIZE,
      prevCursor
    );

    unsubscribeRef.current = unsubscribe;
    setCurrentPage((p) => p - 1);
  };

  function formatOrdersForCSV(orders: Order[]) {
    return orders.map((o) => ({
      ID: o.id,
      UserName: o.userName,
      Email: o.userEmail,
      Phone: `'${o.userPhone}`,
      TotalPrice: o.totalPrice,
      Status: o.latestStatus?.status ?? "-",
      Items: o.items?.map((item) => `${item.name} x${item.count}`).join(" | ") ?? "-",
      StatusHistory: o.statusHistory?.map((s) => `${s.status}`).join(" → ") ?? "-",
      Paid: o.isPaid ? "Yes" : "No",
      Delivered: o.isDelivered ? "Yes" : "No",
      Cancelled: o.isCancelled ? "Yes" : "No",
      ServiceType: o.serviceType,
      CreatedAt: new Date(o.createdAt).toLocaleString(),
      PickUpAddress: o.pickUpAddress
        ? `${o.pickUpAddress.formattedAddress ?? ""}, ${o.pickUpAddress.city ?? ""}`
        : "-",
      DeliveryAddress: o.deliveryAddress
        ? `${o.deliveryAddress.formattedAddress ?? ""}, ${o.deliveryAddress.city ?? ""}`
        : "-",
      Payment: o.paidBy ?? "-",
    }));
  }

  const tabProps: OrderTabProps = {
    orders,
    loading,
    onStatusUpdate: () => {},
    currentPage,
    hasNextPage,
    onNext: handleNext,
    onPrev: handlePrev,
    pageSize: PAGE_SIZE,
    autoOpenOrderId: autoOpenOrderId ?? null,
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-16 pl-60 pb-10">
        <section className="mb-6 px-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{pageHeadings[activeTab].main}</h1>
              <p className="text-sm text-slate-500">{pageHeadings[activeTab].sub}</p>
            </div>

            <div className="flex items-center gap-8">
              <Stat label="ORDERS" value={tabStats.count} loading={statsLoading} />
              {/* PIECES temporarily removed — see totalPieces comment in getOrderTabStats/getArchiveTabStats */}
              {/* <Stat label="PIECES" value={tabStats.totalPieces ?? 0} loading={statsLoading} /> */}
              <Stat label="TOTAL"  value={`SAR ${tabStats.totalRevenue.toFixed(2)}`} loading={statsLoading} />
              <Stat label="UNPAID" value={`SAR ${tabStats.totalUnpaid.toFixed(2)}`} danger loading={statsLoading} />

              <div className="w-px h-7 bg-slate-300" />

              <div className="flex items-center gap-2">
                <AddBusinessOrderDialog onSuccess={() => {}}>
                  <button className="flex items-center gap-2 bg-[#02D0FF] hover:bg-[#00b8e0] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm cursor-pointer transition-colors">
                    <Plus className="h-4 w-4" /> Add Business Order
                  </button>
                </AddBusinessOrderDialog>

                {activeTab !== "archive" && (
                  <button
                    className="flex gap-2 items-center bg-white px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg shadow-sm cursor-pointer hover:bg-slate-50"
                    onClick={() => {
                      try {
                        const formattedOrders = formatOrdersForCSV(orders);
                        exportToCsv(formattedOrders, `${activeTab}-page${currentPage ?? 1}-orders.csv`);
                        showToast(`orders exported to csv successfully`, "success");
                      } catch (error) {
                        showToast(`Failed to export orders to csv`, "error");
                      }
                    }}
                  >
                    <Download className="h-3.5 w-3.5" /> Export CSV
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="border-b border-slate-200 mb-6">
            <div className="flex items-center justify-between pr-8">
              <div className="flex items-center gap-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-3 px-4 text-sm font-medium transition-colors cursor-pointer first:ml-10 ${
                      activeTab === tab.key
                        ? "text-purple-600 border-b-2 border-purple-600 -mb-px"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          {activeTab === "detail"   && <OrderDetails  {...tabProps} />}
          {activeTab === "pickups"  && <OrderPickups  {...tabProps} />}
          {activeTab === "cleaning" && <OrderCleaning {...tabProps} />}
          {activeTab === "ready"    && <OrderReady    {...tabProps} />}
          {activeTab === "all"      && <OrderAll      {...tabProps} />}
          {activeTab === "archive"  && <OrderArchive  autoOpenOrderId={autoOpenOrderId ?? null} />}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value, danger, loading }: { label: string; value: string | number; danger?: boolean; loading?: boolean }) {
  return (
    <div className="text-center">
      <div className="text-xs font-medium text-slate-400">{label}</div>
      <div className={`text-md font-bold ${danger ? "text-red-500" : "text-slate-800"} ${loading ? "opacity-40" : ""}`}>
        {value}
      </div>
    </div>
  );
}