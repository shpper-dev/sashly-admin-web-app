"use client";

import Header from "@/components/Header";
import { useState } from "react";
import OrderDetails from "./components/OrderDetails";
import OrderCleaning from "./components/OrderCleaning";
import OrderReady from "./components/OrderReady";
import OrderPickups from "./components/OrderPickups";
import UpdateOrderDialog from "@/components/orders/UpdateOrderDialog";
;

/* ---------------- TAB TYPES ---------------- */
export type TabKey = "detail" | "cleaning" | "ready" | "pickups" | "all" ;

const tabs: { key: TabKey; label: string }[] = [
  { key: "detail", label: "Detail" },
  { key: "cleaning", label: "Cleaning" },
  { key: "ready", label: "Ready" },
  { key: "pickups", label: "Pickups" },
  { key: "all", label: "All" },
];



/* ---------------- COMPONENT ---------------- */
export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("detail");
  const pageHeadings: Record<TabKey, { main: string; sub: string }> = {
  detail: {
    main: "Detail",
    sub: "Placed orders are listed here",
  },

  cleaning: {
    main: "Cleaning",
    sub: "Orders that are currently cleaning",
  },

  ready: {
    main: "Ready",
    sub: "Ready laundry to send for pickups",
  },

  pickups: {
    main: "Pickups",
    sub: "All the pickups are listed here",
  },

  all: {
    main: "All Orders",
    sub: "All orders across statuses",
  },
};

  
  return (
    <div className="min-h-screen bg-white">
      <Header title="Orders" />

      <main className="pt-16 pl-60 pb-10">
        {/* PAGE HEADER */}
        <section className="mb-6 px-8">
            <div className="flex justify-between items-start ">
               <div>
            <h1 className="text-2xl font-bold text-slate-800">{pageHeadings[activeTab].main}</h1>
            <p className="text-sm text-slate-500">
              {pageHeadings[activeTab].sub}
            </p>
          </div>

          {/* STATS */}
          <div className="flex items-center gap-8">
            <Stat label="ORDERS" value="12" />
            <Stat label="PIECES" value="94" />
            <Stat label="TOTAL" value="SAR 1,450" />
            <Stat label="UNPAID" value="SAR 420" danger />

            <div className="w-px h-7 bg-slate-300" />
            
            <button className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors shadow-md">
              + New Order
            </button>
          </div>
        </div>
        </section>
        <section className="">
        {/* TABS */}
        <div className="border-b border-slate-200 mb-6">
        <div className="flex items-center justify-between pr-8">
          {/* Tabs */}
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
        
          {/* Update Button */}
          <div className="mb-2">
            <UpdateOrderDialog orderId={3261} >
              <button className="bg-[#02D0FF] text-xs font-medium text-white rounded-lg px-4 py-2 transition-colors shadow-sm cursor-pointer">
                 Update Order
              </button>

            </UpdateOrderDialog>
            
          </div>
        </div>
        </div>
        </section>
        <section>
        {/* FILTER ROW */}
        
        { activeTab === "detail" && (
            <OrderDetails />
        )}
        {activeTab === "cleaning" &&(
            <OrderCleaning />
        )}
        {activeTab === "ready" &&(
            <OrderReady />
        )}
        {activeTab === "pickups" &&(
            <OrderPickups />
        )}
        {activeTab === "all" &&(
            <OrderDetails />
        )}
       
        </section>
      </main>
    </div>
  );
}

/* ---------------- REUSABLE COMPONENTS ---------------- */
function Stat({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="text-center">
      <div className="text-xs font-medium text-slate-400 ">{label}</div>
      <div
        className={`text-md font-bold ${
          danger ? "text-red-500" : "text-slate-800"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

