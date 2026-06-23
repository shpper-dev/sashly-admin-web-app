import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import {
  Business,
} from "../models/business.model";

export function mapBusiness(doc: QueryDocumentSnapshot<DocumentData>): Business {
  const data = doc.data();

  if (!data) {
    throw new Error(`Business document ${doc.id} is empty`);
  }

  return {
  id: doc.id,

  name: data.name ?? "",
  joinCode: data.joinCode ?? "",

  contactPhone: data.contactPhone ?? "",
  contactName: data.contactName ?? "",

  isActive: false,
  createdAt: data.createdAt?.toMillis?.() ??
    data.createdAt ??
    0,
  
};
}