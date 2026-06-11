export type BroadcastTarget = "ALL USERS" | "ACTIVE USERS" | "DRIVERS" | "ADMINS";
export type BroadcastPriority = "normal" | "urgent";

export interface Broadcast {
  id: string;
  title?: string | null;
  body: string;
  target: BroadcastTarget;
  priority: BroadcastPriority;
  sentCount: number;
  createdBy: string; //adminId
  createdAt: number; // ms timestamp
}