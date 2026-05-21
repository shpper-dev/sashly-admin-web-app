import { Suspense } from "react";
import OrdersPageClient from "./components/OrdersPageClient";

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading orders...</div>}>
      <OrdersPageClient />
    </Suspense>
  );
}
