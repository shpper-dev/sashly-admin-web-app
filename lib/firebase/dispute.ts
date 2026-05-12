import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import { Dispute } from "../models/dispute.model";
import { db } from "./config";
import { mapDispute } from "../mappers/dispute.mapper";

export async function createDispute(dispute: Partial<Dispute>) {
    await addDoc(collection(db,"disputes"),{
        ...dispute,
        isAssigned: false,
        isResolved: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
    })
}
// set the active param to get unresolved and resolved disputes seperately
export async function getDisputes(active: boolean): Promise<Dispute[]>{
    const constraints = active
        ? [where("isResolved", "==", false), orderBy("createdAt", "desc")]
        : [where("isResolved", "==", true), orderBy("createdAt", "desc")];
    const q = query(collection(db,"disputes"), ...constraints);
    const disputeSnap = await getDocs(q);

    return disputeSnap.docs.map(mapDispute);
}
// update dispute
export async function updateDispute(
  disputeId: string,
  updates: Partial<Dispute>
) {
    // remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(
        ([_, value]) => value !== undefined
      )
    );

    await updateDoc(doc(db, "disputes", disputeId), {
      ...cleanUpdates,
      updatedAt: Date.now(),
    });
}

// function to get real time access to individual dsipute docs
export function subscribeToDispute(
  disputeId: string,
  callback: (dispute: Dispute | null) => void
) {
  const disputeRef = doc(db, "disputes", disputeId);

  return onSnapshot(disputeRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    const mapped = mapDispute(snapshot as any);

    callback(mapped);
  });
}

