"use client";
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Building2, Copy, Check, Users, BookOpen, Phone, MapPin, Calendar, Loader2, LucideIcon, ShoppingBag } from 'lucide-react';
import { Business, CatalogItem } from '@/lib/models/business.model';
import { getCatalog, getBusinessMembers, BusinessMember } from '@/lib/firebase/business';
import { subscribeToAllOrdersByBusinessId } from '@/lib/firebase/order';
import { Order } from '@/lib/models/order.model';
import BusinessOrders from './BusinessOrders';

type TabName = "orders" | "catalog" | "members";

interface BusinessInfoDialogProps {
  children: React.ReactNode;
  business?: Business;
  autoOpen?: boolean;
}

export default function BusinessInfoDialog({ children, business, autoOpen }: BusinessInfoDialogProps) {
  const [activeTab, setActiveTab] = useState<TabName>("orders");
  const [open, setOpen] = useState(!!autoOpen);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [members, setMembers] = useState<BusinessMember[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!business || !open) return;

    setLoadingCatalog(true);
    getCatalog(business.id)
      .then(setCatalog)
      .finally(() => setLoadingCatalog(false));

    setLoadingMembers(true);
    getBusinessMembers(business.id)
      .then(setMembers)
      .finally(() => setLoadingMembers(false));
  }, [business, open]);

  // Orders — live subscription, same pattern as UserInfoDialog
  useEffect(() => {
    if (!business || !open) return;

    setLoadingOrders(true);

    const unsubscribe = subscribeToAllOrdersByBusinessId(
      business.id,
      (data) => {
        setOrders(data);
        setLoadingOrders(false);
      }
    );

    return () => unsubscribe();
  }, [business, open]);

  const initials = (business?.name ?? "")
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const handleCopy = () => {
    if (!business?.joinCode) return;
    navigator.clipboard.writeText(business.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div onClick={() => setOpen(true)}>
          {children}
        </div>
      </DialogTrigger>

      <DialogContent className="p-0 gap-0 border-0 overflow-hidden w-[75vw]! h-[90vh]! min-w-0! max-w-none! rounded-3xl shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Business Information</DialogTitle>
        </DialogHeader>

        {!business ? (
          <div className="p-6 text-sm text-slate-400">
            Loading business...
          </div>
        ) : (
          <div className="flex h-full w-full overflow-hidden">

            {/*  Sidebar  */}
            <div className="w-64 shrink-0 bg-[#F8FAFC] border-r border-slate-100 flex flex-col justify-between p-6 h-full">
              <div className="flex flex-col gap-5">

                <div className="flex flex-col items-center gap-2 pt-2">
                  <div className="w-16 h-16 rounded-2xl bg-[#7F50F4] text-white flex items-center justify-center text-xl font-bold tracking-wide">
                    {initials || <Building2 className="h-6 w-6" />}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-bold text-[#101828] text-base text-center">
                      {business.name}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      ID: {business.id.slice(-6)}
                    </span>
                    <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${business.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                      {business.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-slate-200" />

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <div className='bg-white p-1.5 border border-slate-300 rounded-md'>
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact</span>
                      <span className="text-xs text-slate-600 font-medium truncate">{business.contactName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className='bg-white p-1.5 border border-slate-300 rounded-md'>
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Phone</span>
                      <span className="text-xs text-slate-600 font-medium truncate">{business.contactPhone}</span>
                    </div>
                  </div>

                  {business.address?.formattedAddress && (
                    <div className="flex items-center gap-2">
                      <div className='bg-white p-1.5 border border-slate-300 rounded-md'>
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Address</span>
                        <span className="text-xs text-slate-600 font-medium truncate">{business.address.formattedAddress}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <div className='bg-white p-1.5 border border-slate-300 rounded-md'>
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Registered</span>
                      <span className="text-xs text-slate-600 font-medium truncate">
                        {business.createdAt
                          ? new Date(business.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Join code */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Join Code</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-9 px-3 rounded-lg bg-white border border-slate-200 flex items-center font-mono text-xs font-bold text-slate-700 tracking-widest truncate">
                      {business.joinCode || "—"}
                    </div>
                    <button
                      onClick={handleCopy}
                      disabled={!business.joinCode}
                      className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-500 disabled:opacity-40"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 w-full justify-center flex-wrap">
                  <div className="flex flex-col pl-3 pr-6 py-2 bg-white rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Orders</span>
                    <span className="text-md font-bold text-slate-700">{orders.length}</span>
                  </div>
                  <div className="flex flex-col pl-3 pr-6 py-2 bg-white rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Catalog</span>
                    <span className="text-md font-bold text-slate-700">{catalog.length}</span>
                  </div>
                  <div className="flex flex-col pl-3 pr-6 py-2 bg-white rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 text-nowrap">Members</span>
                    <span className="text-md font-bold text-[#4F39F6] text-nowrap">{members.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center border-b border-slate-100 px-4 overflow-x-auto shrink-0">
                <HeaderTab name="Orders"   icon={ShoppingBag} active={activeTab === "orders"}   onClick={() => setActiveTab("orders")} />
                <HeaderTab name="Catalog"  icon={BookOpen}    active={activeTab === "catalog"}  onClick={() => setActiveTab("catalog")} />
                <HeaderTab name="Members"  icon={Users}       active={activeTab === "members"}  onClick={() => setActiveTab("members")} />
              </div>

              <div className="flex-1 overflow-y-auto">
                {activeTab === "orders"  && <BusinessOrders orders={orders} loading={loadingOrders} />}
                {activeTab === "catalog" && <CatalogTab catalog={catalog} loading={loadingCatalog} />}
                {activeTab === "members" && <MembersTab members={members} loading={loadingMembers} />}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

//  helpers 
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

function CatalogTab({ catalog, loading }: { catalog: CatalogItem[]; loading: boolean }) {
  if (loading) return <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 text-slate-400 animate-spin" /></div>;
  if (catalog.length === 0) return <div className="text-center py-10 text-slate-400 text-sm">No catalog items found</div>;

  return (
    <div className="px-8 py-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {["Item", "Category", "Service", "Price", "Active"].map((h) => (
              <th key={h} className="pb-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 first:pl-0">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {catalog.map((item) => (
            <tr key={item.id}>
              <td className="py-2.5 px-2 first:pl-0 font-medium text-slate-700 text-xs">{item.name}</td>
              <td className="py-2.5 px-2 text-slate-400 text-xs">{item.category ?? "—"}</td>
              <td className="py-2.5 px-2 text-slate-400 text-xs">{item.serviceType ?? "—"}</td>
              <td className="py-2.5 px-2 text-xs font-bold text-slate-700">SAR {item.price.toFixed(2)}</td>
              <td className="py-2.5 px-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.isActive ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MembersTab({ members, loading }: { members: BusinessMember[]; loading: boolean }) {
  if (loading) return <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 text-slate-400 animate-spin" /></div>;
  if (members.length === 0) return <div className="text-center py-10 text-slate-400 text-sm">No members found</div>;

  return (
    <div className="px-8 py-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {["Name", "Email", "Phone", "Joined"].map((h) => (
              <th key={h} className="pb-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 first:pl-0">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {members.map((m) => (
            <tr key={m.userId}>
              <td className="py-3 px-2 first:pl-0 font-semibold text-slate-700 text-xs">{m.name}</td>
              <td className="py-3 px-2 text-slate-400 text-xs">{m.email}</td>
              <td className="py-3 px-2 text-slate-400 text-xs">{m.phone ?? "—"}</td>
              <td className="py-3 px-2 text-slate-400 text-xs">
                {new Date(m.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}