import { addDoc, collection, DocumentReference, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore";
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