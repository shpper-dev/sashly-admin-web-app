import { serverTimestamp } from "firebase/firestore";
import { Message } from "../models/message.model";

export function serializeMessage(message: Partial<Message>){

    return{
         orderId: message.orderId ?? "",
         senderId: message.senderId ?? "",
         text: message.text ?? "",
         role: message.role ?? "user",
         photoUrl: message.photoUrl ?? "",
         readByAdmin: message.readByAdmin ?? false,
         readByUser: message.readByUser ?? false,
         createdAt: message.createdAt ?? serverTimestamp(),
}
} 