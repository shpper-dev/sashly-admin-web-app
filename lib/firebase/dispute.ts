import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import { Dispute } from "../models/dispute.model";
import {  db, functions } from "./config";
import { mapDispute } from "../mappers/dispute.mapper";
import { httpsCallable } from "firebase/functions";

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

type ResolveAction = "full_refund" | "partial_refund" | "wallet_credit" | "reattempt" | "no_action";

interface ResolveDisputeInput {
  disputeId: string;
  action: ResolveAction;
  amount?: number;
  note?: string;
}

interface RejectDisputeInput {
  disputeId: string;
  note?: string;
}

interface ApplyDriverPenaltyInput {
  driverId: string;
  type: "warning" | "penalty";
  amount?: number;
  note?: string;
  disputeId?: string;
}

interface AssignDisputeInput {
  disputeId: string;
  assignToAdminId?: string;
}

interface CallableResult {
  success: true;
  [key: string]: any;
}

export const resolveDisputeFn      = httpsCallable<ResolveDisputeInput, CallableResult>(functions, "resolveDispute");
export const rejectDisputeFn       = httpsCallable<RejectDisputeInput, CallableResult>(functions, "rejectDispute");
export const applyDriverPenaltyFn  = httpsCallable<ApplyDriverPenaltyInput, CallableResult>(functions, "applyDriverPenalty");
export const assignDisputeFn       = httpsCallable<AssignDisputeInput, CallableResult>(functions, "assignDispute");