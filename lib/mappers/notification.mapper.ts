import { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import { Notification } from "../models/notification";

export function mapNotification(doc: QueryDocumentSnapshot<DocumentData>) : Notification {
    const data = doc.data();

    if (!data) {
    throw new Error(`Notification document ${doc.id} is empty`);
  }

  return {
    id: doc.id,
    title:     data.title     ?? "",
    body:      data.body      ?? "",
    priority:  data.priority ?? "normal",
    type: data.type ?? "",
    deepLink: data.deepLink ??  null,
    isRead: data.isRead ?? false,
    readAt: data.readAt ?? null,
    createdAt: (data.createdAt as Timestamp)?.toMillis() ?? Date.now(),
  }
}
