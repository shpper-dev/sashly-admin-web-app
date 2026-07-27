import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  writeBatch,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import { Broadcast, BroadcastPriority, BroadcastTarget } from "../models/broadcast.model";
import { mapBroadcast } from "../mappers/broadcast.mapper";
import { getCurrentUser } from "./admin.auth";


//Fetch broadcast history 

export async function getBroadcasts(count = 20): Promise<Broadcast[]> {
  const q = query(
    collection(db, "broadcasts"),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapBroadcast);
}

// Send broadcast 
// 1. Saves a record to `broadcasts/`
// 2. Fans out a notification doc into every relevant user/driver subcollection
// Firestore batches max at 500 — we chunk automatically.

export async function sendBroadcast({
  title,
  body,
  target,
  priority,
}: {
  title: string;
  body: string;
  target: BroadcastTarget;
  priority: BroadcastPriority;
}): Promise<void> {
  const sendToUsers   = target === "ALL USERS" || target === "ACTIVE USERS";
  const sendToDrivers = target === "ALL USERS" || target === "DRIVERS";
  const sendToAdmins  = target === "ALL USERS" || target === "ADMINS";
  

  //  Resolve recipient doc IDs 

  let userIds:   string[] = [];
  let driverIds: string[] = [];
  let adminIds:  string[] = [];

  if (sendToUsers) {
    let usersQuery;
    if (target === "ACTIVE USERS") {
      usersQuery = query(collection(db, "users"), where("isActive", "==", true));
    } else {
      usersQuery = collection(db, "users");
    }
    const snap = await getDocs(usersQuery);
    userIds = snap.docs.map((d) => d.id);
  }

  if (sendToDrivers) {
    const snap = await getDocs(collection(db, "drivers"));
    driverIds = snap.docs.map((d) => d.id);
  }

  if (sendToAdmins) {
    const snap = await getDocs(collection(db, "admins"));
    adminIds = snap.docs.map((d) => d.id);
  }

  const totalCount = userIds.length + driverIds.length + adminIds.length;
  const admin = await getCurrentUser()
  const adminId = admin?.uid ?? "";
  //  Save the broadcast record first 
  await addDoc(collection(db, "broadcasts"), {
    title,
    body,
    target,
    priority,
    sentCount: totalCount,
    createdBy: adminId,
    createdAt: serverTimestamp(),
  });

  // Fan-out helper: chunk into batches of 499 

  const BATCH_SIZE = 499;
  // Execute in chunks — each chunk is one committed batch
  const userChunks   = chunkArray(userIds,   BATCH_SIZE);
  const driverChunks = chunkArray(driverIds, BATCH_SIZE);
  const adminChunks  = chunkArray(adminIds,  BATCH_SIZE);

  const batchPromises: Promise<void>[] = [];

  for (const chunk of userChunks) {
    const batch = writeBatch(db);
    for (const userId of chunk) {
      const notifRef = doc(collection(db, "users", userId, "notifications"));
      batch.set(notifRef, {
        id:             notifRef.id,
        userId,
        title,
        body,
        createdAt:      serverTimestamp(),
        isRead:         false,
        readAt:         null,
        type:           priority === "urgent" ? "urgent_broadcast" : "broadcast",
        deepLinkType:   "none",
        orderId:        null,
        ordersTabIndex: null,
        amount:         null,
        data:           { target, priority },
      });
    }
    batchPromises.push(batch.commit());
  }

  for (const chunk of driverChunks) {
    const batch = writeBatch(db);
    for (const driverId of chunk) {
      const notifRef = doc(collection(db, "drivers", driverId, "notifications"));
      batch.set(notifRef, {
        id:        notifRef.id,
        driverId,
        title,
        body,
        type:      priority === "urgent" ? "urgent_broadcast" : "broadcast",
        isRead:    false,
        readAt:    null,
        createdAt: serverTimestamp(),
        data:      { target, priority },
      });
    }
    batchPromises.push(batch.commit());
  }

  for (const chunk of adminChunks) {
  const batch = writeBatch(db);

  for (const adminId of chunk) {
    const notifRef = doc(collection(db, "admins", adminId, "notifications"));

    batch.set(notifRef, {
      id: notifRef.id,
      title,
      body,
      type: "broadcast",
      deepLink: "none",
      priority,
      isRead: false,
      readAt: null,
      createdAt: serverTimestamp(), 
    });
  }

  batchPromises.push(batch.commit());
}

  await Promise.all(batchPromises);
}

//  Util 

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}