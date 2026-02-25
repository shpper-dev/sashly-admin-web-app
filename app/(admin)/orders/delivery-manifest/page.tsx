"use client";

import ManifestHeader from "@/components/delivery-manifest/ManifestHeader";
import RawAddresses from "@/components/delivery-manifest/RawAdresses";
import RegularPickupsTable from "@/components/delivery-manifest/RegularPickupsTable";
import RouteSection from "@/components/delivery-manifest/RouteSection";
import { Route } from "@/lib/types";
import { useState } from "react";


const mockRoutes: Route[] = [
  {
    id: "1",
    driver: "AHMED K.",
    pickups: 1,
    deliveries: 1,
    orders: [
      {
        id: "4656",
        client: "Sharifa",
        phone: "0595766850",
        address: "سكن طالبات جامعة الملك سعود مبنى 40",
        summary: [
          {item_en:"Laundry Bag",item_ar:"كيس الغسيل",qty:1}, 
          {item_en:"Trousers",item_ar:"بنطلون",qty:2}, 
          {item_en:"T-shirt",item_ar:"قميص",qty:3}
        ],
        amount: 224,
        type: "PICKUP",
        unpaid: true,
      },
      {
        id: "4657",
        client: "Ahmed",
        phone: "0595766850",
        address: "سكن طالبات جامعة الملك سعود مبنى 40",
        summary: [
          {item_en:"Laundry Bag",item_ar:"كيس الغسيل",qty:1}, 
          {item_en:"Trousers",item_ar:"بنطلون",qty:2}, 
          {item_en:"T-shirt",item_ar:"قميص",qty:3}
        ],
        amount: 224,
        type: "PICKUP",
        unpaid: true,
      },
    ],
  },
];

export default function DeliveryManifestPage() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggleOrder = (orderId: string) => {
    setSelected((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const toggleRoute = (route: Route, checked: boolean) => {
    const updates: Record<string, boolean> = {};
    route.orders.forEach((o) => {
      updates[o.id] = checked;
    });

    setSelected((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const toggleAll = (checked: boolean) => {
    const updates: Record<string, boolean> = {};
    mockRoutes.forEach((r) =>
      r.orders.forEach((o) => {
        updates[o.id] = checked;
      })
    );

    setSelected(updates);
  };

  const totalSelected = Object.values(selected).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white py-6 space-y-6">
      <ManifestHeader
        selectedCount={totalSelected}
        onSelectAll={() => toggleAll(true)}
        onDeselectAll={() => toggleAll(false)}
      />

      <main className="pt-17">
        {mockRoutes.map((route) => (
        <RouteSection
          key={route.id}
          route={route}
          selected={selected}
          onToggleOrder={toggleOrder}
          onToggleRoute={toggleRoute}
        />
      ))}

      <RawAddresses />
      <RegularPickupsTable />

      
      </main>
    </div>
  );
}