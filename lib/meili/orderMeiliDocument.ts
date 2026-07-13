/**
 * Used by scripts/backfillMeiliOrders.ts — lives inside the main
 * sashly-admin-web-app project, so it can safely import the real
 * mapOrderData and stay in lockstep with the Order model automatically.
 */
import { mapOrderData } from "@/lib/mappers/order.admin.mapper";
import type { DocumentData } from "firebase-admin/firestore";

export function toMeiliOrderDocument(id: string, data: DocumentData | undefined) {
  const order = mapOrderData(id, data);
  return {
    ...order,
    hasDriver: !!order.assignedDriverId,
  };
}