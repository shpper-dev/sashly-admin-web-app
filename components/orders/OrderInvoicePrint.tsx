"use client";

import { Order } from "@/lib/models/order.model";
import { forwardRef } from "react";


const OrderInvoicePrint = forwardRef<HTMLDivElement, { order: Order }>(
  ({ order }, ref) => {
    return (
      <div ref={ref} className="px-6 py-4 text-sm text-slate-700 bg-white">
        {/* header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-bold bg-purple-600 text-white py-1 px-2 rounded-lg">INVOICE</h1>
          <div className="text-right">
            <p className="font-semibold">Sashly</p>
            <p>Saudi Arabia</p>
          </div>
        </div>

        {/* order info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Order</p>
            <p><b>Order ID:</b> {order.id}</p>
            <p><b>Date:</b> {new Date(order.createdAt).toLocaleDateString()}</p>
            <span className={`px-2 py-1 text-[10px] w-15 text-center font-semibold rounded-lg ${order.isPaid ? "text-green-600 bg-green-50": "text-red-600 bg-red-50" }`}>{order.isPaid ? "PAID" : "UNPAID"}</span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Customer</p>
            <p><b>Customer:</b> {order.userName}</p>
            <p><b>Email:</b> {order.userEmail}</p>
            <p><b>Phone:</b> {order.userPhone}</p>
          </div>
        </div>

        {/* table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-500">
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest rounded-tl-lg">Item</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest">Qty</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest">Price</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest rounded-tr-lg">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <tr key={item.id} className="bg-white">
                <td className="px-4 py-3 text-slate-800">{item.name}</td>
                <td className="px-4 py-3 text-center text-slate-700">{item.count}</td>
                <td className="px-4 py-3 text-right text-slate-600">
                  {item.servicePrice.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-800">
                  {(item.count * item.servicePrice).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="mt-6 flex justify-end">
          <div className="text-right">
            <p className="text-lg font-bold text-purple-600">
              Total: SAR {order.totalPrice.toFixed(2)} 
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-xs text-gray-500 text-center">
          Thank you for your business.
        </div>
      </div>
    );
  }
);

OrderInvoicePrint.displayName = "OrderInvoicePrint";
export default OrderInvoicePrint;