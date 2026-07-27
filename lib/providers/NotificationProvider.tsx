"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  collection, query, orderBy, limit,
  onSnapshot, doc, updateDoc, writeBatch,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase/config";
import { useToast } from "@/lib/providers/ToastProvider";
import { Notification } from "../models/notification.model";

interface NotificationContextType {
  alerts: Notification[];
  unreadCount: number;
  markAsRead: (alertId: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

//  Context 

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const [adminId, setAdminId] = useState<string | null>(null);
  const [alerts,  setAlerts]  = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { showToast } = useToast();

  // Resolve current admin's UID

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setAdminId(user?.uid ?? null);
    });
    return () => unsubscribeAuth();
  }, []);

  // Subscribe to admins/{adminId}/notifications

  useEffect(() => {
    if (!adminId) return;

    const notificationsRef = collection(db, "admins", adminId, "notifications");
    const q = query(notificationsRef, orderBy("createdAt", "desc"), limit(50));

    let isInitialLoad = true;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeAlerts: Notification[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id:       d.id,
          title:    data.title    ?? "",
          body:     data.body     ?? "",
          type:     data.type     ?? "broadcast",
          deepLink: data.deepLink ?? null,
          entityId: data.entityId ?? null,
          priority: data.priority ?? "normal",
          isRead:   data.isRead   ?? false,
          readAt:   data.readAt   ?? null,
          createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
        } as Notification;
      });

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" && !isInitialLoad) {
          const n = change.doc.data();
          const toastType = n.priority === "urgent" ? "error" : "info";
          showToast(`${n.title}: ${n.body}`, toastType);

          if (n.priority === "urgent") {
            const audio = new Audio("/sounds/notification-chime.mp3");
            audio.play().catch(() => {});
          }
        }
      });

      setAlerts(activeAlerts);
      setUnreadCount(activeAlerts.filter((a) => !a.isRead).length);
      isInitialLoad = false;
    });

    return () => unsubscribe();
  }, [adminId]);

  // Mark a single notification as read 
  const markAsRead = async (alertId: string) => {
    if (!adminId) return;
    try {
      await updateDoc(
        doc(db, "admins", adminId, "notifications", alertId),
        { isRead: true, readAt: Date.now() }
      );
    } catch (err) {
      console.error("markAsRead failed:", err);
    }
  };

  //  Batch-mark all unread as read 

  const clearAll = async () => {
    if (!adminId) return;
    const unread = alerts.filter((a) => !a.isRead);
    if (unread.length === 0) return;

    const BATCH_SIZE = 499;
    const chunks: Notification[][] = [];
    for (let i = 0; i < unread.length; i += BATCH_SIZE) {
      chunks.push(unread.slice(i, i + BATCH_SIZE));
    }

    await Promise.all(
      chunks.map((chunk) => {
        const batch = writeBatch(db);
        chunk.forEach((alert) => {
          batch.update(
            doc(db, "admins", adminId, "notifications", alert.id),
            { isRead: true, readAt: Date.now() }
          );
        });
        return batch.commit();
      })
    );
  };

  return (
    <NotificationContext.Provider value={{ alerts, unreadCount, markAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

