"use client";
import { OrderFilters, subscribeToOrders } from "@/lib/firebase/order";
import { Order } from "@/lib/models/order.model";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import { Download } from "lucide-react";
import { exportToCsv } from "@/lib/utils";
import { useToast } from "@/lib/providers/ToastProvider";
import { useRouter, useSearchParams } from "next/navigation";
import OrderDetails from "./OrderDetails";
import OrderCleaning from "./OrderCleaning";
import OrderPickups from "./OrderPickups";
import OrderReady from "./OrderReady";
import OrderArchive from "./OrderArchive";
import OrderAll from "./OrderAll";

export type TabKey ="all" | "detail" | "cleaning" | "ready" | "pickups" | "archive";

const TAB_FILTERS: Record<TabKey, OrderFilters> = {
  all: {},
  detail:   {  statuses: ["pickedUp" , "sorting" , "detailing"], isCancelled:false, isDelivered:false},
  pickups:  {  status: "confirmed"   , hasDriver: true   }, 
  cleaning: {  statuses: ["cleaning"]       },
  ready:    {  status: "readyToDeliver"  },
  archive:  {},  // cancelled + delivered fetched separately and merged client-side
};

const tabs: { key: TabKey; label: string }[] = [
  { key: "all",      label: "All"},
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
  // pagination
  currentPage: number;
  hasNextPage: boolean;
  onNext: () => void;
  onPrev: () => void;
  pageSize: number;
  autoOpenOrderId?: string | null;
}

export default function OrdersPage() {
  const [activeTab, setActiveTab]     = useState<TabKey>("detail");
  const [loading, setLoading]         = useState(false);
  const [orders, setOrders]           = useState<Order[]>([]);
  const [lastDoc, setLastDoc]         = useState<any>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const cursorStack = useRef<any[]>([undefined]);

  const searchParams = useSearchParams();
  const router       = useRouter();

  // Read orderId set by the notification link, then immediately clean the URL
  const autoOpenOrderId = searchParams.get("orderId");
  useEffect(() => {
    if (autoOpenOrderId) router.replace("/orders");
  }, [autoOpenOrderId]);

  const unsubscribeRef     = useRef<(() => void) | null>(null);
  const unsubscribeRef2    = useRef<(() => void) | null>(null); // second listener for archive
  const { showToast } = useToast();

  const pageHeadings: Record<TabKey, { main: string; sub: string }> = {
    all:      { main: "All",      sub: "All orders"  },
    detail:   { main: "Detail",   sub: "Orders awaiting detailing or currently being detailed"  },
    cleaning: { main: "Cleaning", sub: "Orders currently being cleaned"               },
    ready:    { main: "Ready",    sub: "Ready laundry awaiting delivery"              },
    pickups:  { main: "Pickups",  sub: "Confirmed orders with an assigned driver"     },
    archive:  { main: "Archive",  sub: "All delivered and cancelled orders"           },
  };

  const PAGE_SIZE = 10;

  useEffect(() => {
    setLoading(true);
    setOrders([]);

    // cleanup old listeners
    unsubscribeRef.current?.();
    unsubscribeRef2.current?.();

    cursorStack.current = [undefined];
    setCurrentPage(1);

    // Archive tab — merge two separate subscriptions (delivered + cancelled)
    if (activeTab === "archive") {
      let deliveredOrders: Order[] = [];
      let cancelledOrders: Order[] = [];

      const merge = () => {
        // Merge and sort by createdAt desc
        const merged = [...deliveredOrders, ...cancelledOrders].sort(
          (a, b) => b.createdAt - a.createdAt
        );
        setOrders(merged);
        setHasNextPage(false); // archive is unpaginated for now
        setLoading(false);
      };

      unsubscribeRef.current = subscribeToOrders(
        (rows) => { deliveredOrders = rows; merge(); },
        { isDelivered: true },
        PAGE_SIZE
      );

      unsubscribeRef2.current = subscribeToOrders(
        (rows) => { cancelledOrders = rows; merge(); },
        { isCancelled: true },
        PAGE_SIZE
      );

      return () => {
        unsubscribeRef.current?.();
        unsubscribeRef2.current?.();
      };
    }

    // All other tabs — single subscription
    const unsubscribe = subscribeToOrders(
      (rows, newLastDoc) => {
        setOrders(rows);
        setLastDoc(newLastDoc);
        setHasNextPage(rows.length === PAGE_SIZE);
        setLoading(false);
      },
      TAB_FILTERS[activeTab],
      PAGE_SIZE
    );

    unsubscribeRef.current = unsubscribe;

    return () => unsubscribe();
  }, [activeTab]);

  const handleNext = async () => {
    if (!hasNextPage || !lastDoc) return;

    cursorStack.current.push(lastDoc);
    unsubscribeRef.current?.();

    const unsubscribe = subscribeToOrders(
      (rows, newLastDoc) => {
        setOrders(rows);
        setLastDoc(newLastDoc);
        setHasNextPage(rows.length === PAGE_SIZE);
      },
      TAB_FILTERS[activeTab],
      PAGE_SIZE,
      lastDoc
    );

    unsubscribeRef.current = unsubscribe;
    setCurrentPage((p) => p + 1);
  };

  const handlePrev = async () => {
    if (currentPage <= 1) return;

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
      TAB_FILTERS[activeTab],
      PAGE_SIZE,
      prevCursor
    );

    unsubscribeRef.current = unsubscribe;
    setCurrentPage((p) => p - 1);
  };

  // format orders to csv format
  function formatOrdersForCSV(orders: Order[]) {
    return orders.map((o) => ({
      ID: o.id,
      UserName: o.userName,
      Email: o.userEmail,

      // prevent scientific notation
      Phone: `'${o.userPhone}`,

      TotalPrice: o.totalPrice,
      Status: o.latestStatus?.status ?? "-",

      // convert items array → readable string
      Items: o.items?.map((item) => `${item.name} x${item.count}`).join(" | ") ?? "-",

      // convert status history
      StatusHistory: o.statusHistory?.map((s) => `${s.status}`).join(" → ") ?? "-",

      Paid:      o.isPaid      ? "Yes" : "No",
      Delivered: o.isDelivered ? "Yes" : "No",
      Cancelled: o.isCancelled ? "Yes" : "No",

      ServiceType: o.serviceType,
      CreatedAt: new Date(o.createdAt).toLocaleString(),

      // addresses (flatten important fields only)
      PickUpAddress: o.pickUpAddress
        ? `${o.pickUpAddress.formattedAddress ?? ""}, ${o.pickUpAddress.city ?? ""}`
        : "-",
      DeliveryAddress: o.deliveryAddress
        ? `${o.deliveryAddress.formattedAddress ?? ""}, ${o.deliveryAddress.city ?? ""}`
        : "-",

      Payment: o.paidBy ?? "-",
    }));
  }

  // Pass orders + loading + pagination down to each tab
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
        {/* PAGE HEADER */}
        <section className="mb-6 px-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{pageHeadings[activeTab].main}</h1>
              <p className="text-sm text-slate-500">{pageHeadings[activeTab].sub}</p>
            </div>

            {/* STATS */}
            <div className="flex items-center gap-8">
              <Stat label="ORDERS" value={orders.length} />
              <Stat label="PIECES" value={orders.reduce((acc, order) =>
                acc + order.items.reduce((sum, item) => sum + item.count, 0), 0)} />
              <Stat label="TOTAL" value={`SAR ${orders.reduce((acc, order) => acc + order.totalPrice, 0).toFixed(2)}`} />
              <Stat label="UNPAID" value={`SAR ${orders.filter((o) => !o.isPaid && !o.isCancelled).reduce((acc, order) => acc + order.totalPrice, 0).toFixed(2)}`} danger />

              <div className="w-px h-7 bg-slate-300" />

              {/* currently only per page orders */}
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
            </div>
          </div>
        </section>

        <section className="">
          {/* TABS */}
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
          {activeTab === "archive"  && <OrderArchive  {...tabProps} />}
          {activeTab === "all" && <OrderAll {...tabProps} />}
        </section>
      </main>
    </div>
  );
}

// helpers
function Stat({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className="text-center">
      <div className="text-xs font-medium text-slate-400">{label}</div>
      <div className={`text-md font-bold ${danger ? "text-red-500" : "text-slate-800"}`}>
        {value}
      </div>
    </div>
  );
}