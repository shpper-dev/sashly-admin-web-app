import { QueryDocumentSnapshot } from "firebase/firestore";
import { Message } from "../models/message.model";

export function mapMessage(doc: QueryDocumentSnapshot): Message{
    const data = doc.data();

    if(!data){
        throw new Error(`Message document ${doc.id} doesn't exist`);
    }

    return{
         id: doc.id,
         orderId: data.orderId ?? "",
         senderId: data.senderId ?? "",
         text: data.text ?? "",
         role: data.role ?? "admin",
         photoUrl: data.photoUrl ?? "",
         readByAdmin: data.readByAdmin ?? false,
         readByUser: data.readByUser ?? false,
         isSystem : data.isSystem ?? false,
         createdAt: data.createdAt?.toMillis?.() ?? data.createdAt ?? 0,
}
} 