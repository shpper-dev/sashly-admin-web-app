"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { NotebookTabs, X } from "lucide-react";
import { OrderData } from "@/lib/types";

interface Props {
  order: OrderData;
  children: React.ReactNode; // trigger button
}

export default function OrderDetailsDrawer({
  order,
  children,
}: Props) {
  const unit_price = 14
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>

      <DrawerContent className="max-w-140! h-full w-[40vw]  right-0 left-auto mt-0 rounded-none">
        <div className="flex flex-col h-full">

          {/* Header */}
          <DrawerHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div className="flex items-center gap-5">
              <span className="bg-slate-50 rounded-md px-2 py-2">
                <NotebookTabs className="h-8 w-6 text-[#02D0FF]" />
            </span>
            <div>
              <DrawerTitle className="text-2xl font-semibold">
                Order #{order.id}
              </DrawerTitle>
              <p className="text-sm text-slate-500">
                Placed on {order.placed}
              </p>
            </div>
            </div>

            <DrawerClose asChild>
              <button>
                <X className="w-5 h-5 text-slate-400 cursor-pointer" />
              </button>
            </DrawerClose>
          </DrawerHeader>

          {/* Status Section */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
              <div className="flex gap-2 items-center">
                <div>
                  <p className="text-xs text-slate-400">STATUS</p>
                  <p className="text-purple-600 font-semibold">
                    PENDING
                  </p>
                </div>
                <div className="w-px h-9 bg-slate-300" />
                <div>
                  <p className="text-xs text-slate-400">READY BY</p>
                  <p className="font-semibold">
                    {order.ready_by.date}
                  </p>
                </div>
              </div>

              <button className="px-5 py-2 bg-[#02D0FF] text-white rounded-full text-sm">
                UPDATE STATUS
              </button>
            </div>
          </div>

          {/* Line Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-400">
              LINE ITEMS
            </h3>

            {order.order_details.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between border rounded-xl p-4 bg-white"
              >
                <div>
                  <p className="font-semibold text-slate-800">
                    {item.item_en} | {item.item_ar}
                  </p>
                  <p className="text-xs text-slate-400">
                    UNIT PRICE: SAR {unit_price.toFixed(2)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400">x{item.qty}</p>
                  <p className="font-semibold">SAR {(unit_price * item.qty).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t p-6 space-y-4">
            <div className="flex justify-between ">
              <span className="text-sm font-semibold text-slate-500">Total Order Value</span>
              <span className="text-ms font-bold">SAR {order.total.toFixed(2)}</span>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 text-xs border rounded-xl py-3 font-bold">
                PRINT RECEIPT
              </button>

              <button className="flex-1 text-xs bg-linear-to-r from-purple-600 to-purple-500 text-white rounded-xl py-3 font-bold shadow-lg">
                EDIT ORDER
              </button> 
            </div>
          </div>

        </div>
      </DrawerContent>
    </Drawer>
  );
}
