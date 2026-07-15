
import { mapOrderData } from "@/lib/mappers/order.admin.mapper";
import type { DocumentData } from "firebase-admin/firestore";

export function toMeiliOrderDocument(id: string, data: DocumentData | undefined) {
  const order = mapOrderData(id, data);
  return {
    ...order,
    hasDriver: !!order.assignedDriverId,
  };
}