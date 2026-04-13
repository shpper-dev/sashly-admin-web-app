"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import OrderInvoicePrint from "./OrderInvoicePrint";
import { Order } from "@/lib/models/order.model";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function OrderInvoiceDialog({
  order,
  children,
}: {
  order: Order;
  children: React.ReactNode;
}) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${order.id}`,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
        </DialogHeader>

        {/* Preview */}
        <div className="max-h-[70vh] overflow-auto border rounded-md">
          <OrderInvoicePrint ref={printRef} order={order} />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#02d0ff] text-white font-semibold rounded-md text-sm"
          >
            Print 
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}