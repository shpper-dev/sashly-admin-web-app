"use client";
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Calendar, Mail, PencilLine, Phone, Route, ShoppingBag, LucideIcon } from 'lucide-react';
import DriversOrders from './DriversOrders';
import DriversEditProfile from './DriversEditProfile';
import { DesignatedArea, Driver } from '@/lib/models/driver.model';
import DriversRoutes from './DriversRoutes';
import { Order } from '@/lib/models/order.model';
import {  subscribeToAllOrdersByDriverId } from '@/lib/firebase/driver';

type TabName = "orders" | "stats" | "edit profile" | "routes" | "payouts" | "messages" | "photos";

interface HeaderTabDef {
  name: string;
  key: TabName;
  icon: LucideIcon;
}

const HEADER_TABS: HeaderTabDef[] = [
  { name: "Orders", key: "orders", icon: ShoppingBag },
  { name: "Edit Profile", key: "edit profile", icon: PencilLine },
  { name: "Routes", key: "routes", icon: Route },
];

function fmt(ts?: { seconds: number } | null) {
  if (!ts) return "—";
  return new Date(ts.seconds * 1000).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

interface DriverInfoDialogProps {
  children: React.ReactNode;
  driver?: Driver;
  onDelete?: () => void;
  onSuccess?: () => void;
}

export default function DriverInfoDialog({ children, driver, onDelete, onSuccess }: DriverInfoDialogProps) {
  const [activeTab, setActiveTab] = useState<TabName>("orders");
  const [open, setOpen] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
  if (!driver || !open) return;

  setLoadingOrders(true);

  const unsubscribe = subscribeToAllOrdersByDriverId(
    driver.id,
    (data) => {
      setOrders(data);
      setLoadingOrders(false);
    }
  );

  return () => unsubscribe();
}, [driver, open]);

  let name = "Unknown";
  let initials = "";

  if (driver) {
    name = driver.name?.trim() || "Unknown";
    initials = name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div onClick={() => setOpen(true)} className="cursor-pointer">
          {children}
        </div>
      </DialogTrigger>

      <DialogContent className="p-0 gap-0 border-0 overflow-hidden w-[80vw]! h-[90vh]! min-w-0! max-w-none! rounded-3xl shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>driver Information</DialogTitle>
        </DialogHeader>

        {!driver ? (
          <div className="p-6 text-sm text-slate-400">
            Loading driver...
          </div>
        ) : (
          <div className="flex h-full w-full overflow-hidden">
            {/* ── Sidebar ── */}
            <div className="w-64 shrink-0 bg-[#F8FAFC] border-r border-slate-100 flex flex-col justify-between p-6 h-full">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col items-center gap-2 pt-2">
                  <div className="w-16 h-16 rounded-2xl bg-[#7F50F4] text-white flex items-center justify-center text-xl font-bold tracking-wide overflow-hidden">
                    {driver.profileImageUrl ? (
                      <img src={driver.profileImageUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-bold text-[#101828] text-base">
                      {driver.name ?? "Abdullah Q"}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      ID: {driver.id ?? "DRIVER:01"}
                    </span>
                    <div className='flex items-center gap-4 mt-1'>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${!driver.isActive ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"} `}>
                      {driver.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${!driver.isOnline ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"} `}>
                      {driver.isActive ? "OFFLINE" : "ONLINE"}
                    </span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-200" />

                <div className="flex flex-col gap-4">
                  <ContactItem icon={Mail} label="Email" value={driver.email ?? ""} />
                  <ContactItem icon={Phone} label="Phone" value={driver.phoneNumber} />
                  <ContactItem icon={Calendar} label="Joined" value={fmt(driver.createdAt)} />
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-300 pt-4 mt-6">
                <button className="w-full py-2.5 px-4 bg-[#7F50F4] hover:bg-[#6B3FD4] text-white text-xs font-bold rounded-xl transition-colors">
                  + Assign Route
                </button>
                <button className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors">
                  Send Message
                </button>
              </div>
            </div>

            {/* ── Main Content ── */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center border-b border-slate-100 px-4 overflow-x-auto shrink-0">
                {HEADER_TABS.map((tab) => (
                  <HeaderTab
                    key={tab.key}
                    name={tab.name}
                    icon={tab.icon}
                    active={activeTab === tab.key}
                    onClick={() => setActiveTab(tab.key)}
                  />
                ))}
              </div>

              <div className="flex-1 overflow-y-auto">
                {activeTab === "orders" && <DriversOrders orders={orders} loading={loadingOrders} />}
                {activeTab === "edit profile" && <DriversEditProfile driver={driver} onSuccess={onSuccess}  />}
                {activeTab === "routes" && <DriversRoutes driverId={driver.id} currentArea={driver?.designatedArea ?? null} onSuccess={onSuccess} />}
                {/* Add other tab components here as needed */}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helpers
function ContactItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className='bg-white p-1.5 border border-slate-300 rounded-md'>
        <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
        <span className="text-xs text-slate-600 font-medium truncate">{value ?? "—"}</span>
      </div>
    </div>
  );
}

function HeaderTab({ name, icon: Icon, active, onClick }: { name: string; icon: LucideIcon; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-4 text-xs font-bold whitespace-nowrap border-b-2 transition-all duration-150 ${
        active ? "border-[#7F50F4] text-[#7F50F4]" : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {name}
    </button>
  );
}