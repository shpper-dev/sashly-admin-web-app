import { QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import {Broadcast } from "../models/broadcast.model";

export function mapBroadcast(doc: QueryDocumentSnapshot):Broadcast{
    const data = doc.data();

    if(!data){
        throw new Error(`Broadcast document ${doc.id} doesn't exist`);
    }

    return {
      id:        doc.id,
      title:     data.title     ?? "",
      body:      data.body      ?? "",
      target:    data.target    ?? "ALL USERS",
      priority:  data.priority  ?? "normal",
      sentCount: data.sentCount ?? 0,
      createdBy: data.createdBy ?? "",
      createdAt: (data.createdAt as Timestamp)?.toMillis() ?? Date.now(),
    };
} 