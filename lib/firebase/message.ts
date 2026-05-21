import { addDoc, collection, DocumentReference, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { Message } from "../models/message.model";
import { serializeMessage } from "../serializers/message.serializer";
import { db } from "./config";
import { mapMessage } from "../mappers/message.mapper";

export async function createMessage(
  data: Partial<Message>
): Promise<DocumentReference> {
  const cleanData = serializeMessage(data);
  
  return await addDoc(collection(db, "messages"), {
    ...cleanData,
    createdAt: serverTimestamp(), 
  });
}

export function subscribeToMessages(
  orderId: string, 
  callback: (messages: Message[]) => void
) {
  const q = query(
    collection(db, "messages"),
    where("orderId", "==", orderId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(mapMessage));
  });
}

// listener for unread messages
export function subscribeToUnreadMessages(
  callback: (messages: Message[]) => void) {
    const q = query(
      collection(db,"messages"),
      where("role","==","user"),
      where("readByAdmin","==",false),
      orderBy("createdAt","desc"),
      limit(20)
    );

    return onSnapshot(q, (snapshot) =>{
      callback(snapshot.docs.map(mapMessage))
    });
  
}

// to mark the chats read
export async function markOrderMessagesAsReadByAdmin(
  orderId: string
) {
  const q = query(
    collection(db, "messages"),
    where("orderId", "==", orderId),
    where("role", "==", "user"),
    where("readByAdmin", "==", false)
  );

  const snapshot = await getDocs(q);

  await Promise.all(
    snapshot.docs.map((docSnap) =>
      updateDoc(docSnap.ref, {
        readByAdmin: true,
      })
    )
  );
}