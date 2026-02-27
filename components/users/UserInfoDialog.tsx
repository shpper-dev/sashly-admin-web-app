"use client";
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Calendar, Camera, ChartNoAxesColumn, CheckIcon, ClockCheck, ClockIcon, CreditCard, Dot, HelpCircle, LucideIcon, Mail, MessageCircle, PencilLine, Phone, ShoppingBag, Timer, Truck } from 'lucide-react';
import Users from '@/app/(admin)/users/page';
import UsersOrders from './UsersOrders';
import { User } from '@/lib/types';
import UsersEditCustomer from './UsersEditCustomer';
import UsersStats from './UsersStats';
import UsersPayment from './UsersPayment';

type TabName = "orders" | "stats" | "edit customer" | "payments" | "messages" | "pickups" | "photos";

interface HeaderTabDef {
  name: string;
  key: TabName;
  icon: LucideIcon;
}


const HEADER_TABS: HeaderTabDef[] = [
  { name: "Orders",          key: "orders",         icon: ShoppingBag       },
  { name: "Stats",           key: "stats",           icon: ChartNoAxesColumn },
  { name: "Edit Customer",   key: "edit customer",   icon: PencilLine        },
  { name: "Payments",        key: "payments",        icon: CreditCard        },
  { name: "Messages",        key: "messages",        icon: MessageCircle     },
  { name: "Pickups",         key: "pickups",         icon: Truck             },
  { name: "Photos",          key: "photos",          icon: Camera            },
];


interface UserInfoDialogProps {
  children: React.ReactNode;
  user: User;
}

export default function UserInfoDialog({ children, user }: UserInfoDialogProps) {
  const [activeTab, setActiveTab] = React.useState<TabName>("orders");
  

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="p-0 gap-0 border-0 overflow-hidden max-w-5xl! w-full rounded-3xl shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>User Information</DialogTitle>
        </DialogHeader>

        <div className="flex h-155">

          {/* ── Sidebar ── */}
          <div className="w-64 shrink-0 bg-[#F8FAFC] border-r border-slate-100 flex flex-col justify-between p-6">

            {/* Top: avatar + identity + contact */}
            <div className="flex flex-col gap-5">

              {/* Avatar + name + status */}
              <div className="flex flex-col items-center gap-2 pt-2">
                <div className="w-16 h-16 rounded-2xl bg-[#7F50F4] text-white flex items-center justify-center text-xl font-bold tracking-wide">
                  {user.customer.first_name[0]}{user.customer.last_name[0]}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-bold text-[#101828] text-base">
                    {user.customer.first_name} {user.customer.last_name}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    ID: {user.customer.id}
                  </span>
                  <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-600">
                    {user.status}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-200" />

              {/* Contact info */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className='bg-white p-1.5 border border-slate-300 rounded-md'>
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Email
                    </span>
                    <span className="text-xs text-slate-600 font-medium truncate">
                      {user.contact.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className='bg-white p-1.5 border border-slate-300 rounded-md'>
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    PHONE
                    </span>
                    <span className="text-xs text-slate-600 font-medium truncate">
                      {user.contact.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className='bg-white p-1.5 border border-slate-300 rounded-md'>
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Joined
                    </span>
                    <span className="text-xs text-slate-600 font-medium truncate">
                      Jan 2024
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 w-full justify-center">
                <div className="flex flex-col  pl-3 pr-6 py-2 bg-white rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase  text-slate-400">
                    Orders
                  </span>
                  <span className="text-md font-bold text-slate-700">{user.orders}</span>
                </div>
                <div className="flex flex-col pl-3 pr-6 py-2 bg-white rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 text-nowrap">
                    Spent
                  </span>
                  <span className="text-md font-bold text-[#4F39F6] text-nowrap">
                   SAR {user.total_spent.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom: action buttons */}
            <div className="flex flex-col gap-2 border-t border-slate-300 pt-4">
              <button className="w-full py-2.5 px-4 bg-[#7F50F4] hover:bg-[#6B3FD4] text-white text-xs font-bold rounded-xl transition-colors">
                + Create Order
              </button>
              <button className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors">
                Send Message
              </button>
            </div>
          </div>

          {/* ── Main content area ── */}
          <div className="flex flex-col flex-1 overflow-hidden">

            {/* Tab bar */}
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

            {/* Tab content */}
            {/* <div className="flex-1 overflow-y-auto p-6">
              <TabContent activeTab={activeTab} />
            </div> */}

            {/* different tabs */}
            {activeTab === "orders" && (
                <UsersOrders />
            )}
            {activeTab === "edit customer" && (
                <UsersEditCustomer />
            )}
            {activeTab === "stats" && (
                <UsersStats />
            )}
            {activeTab === "payments" && (
                <UsersPayment />
            )}
            
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

//helpers
function HeaderTab({
  name,
  icon: Icon,
  active,
  onClick,
}: {
  name: string;
  icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-4 text-xs font-bold whitespace-nowrap
        border-b-2 transition-all duration-150
        ${active
          ? "border-[#7F50F4] text-[#7F50F4]"
          : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
        }
      `}
    >
      <Icon className="h-3.5 w-3.5" />
      {name}
    </button>
  );
}

