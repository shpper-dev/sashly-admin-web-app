import { NotificationContext } from "@/lib/providers/NotificationProvider";
import { useContext } from "react";

export const useAdminNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useAdminNotifications must be used within AdminNotificationProvider.");
  return ctx;
};