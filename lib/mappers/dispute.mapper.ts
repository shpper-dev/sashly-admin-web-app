import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Dispute } from "../models/dispute.model";

export function mapDispute(
  doc: QueryDocumentSnapshot<DocumentData>
): Dispute {
  const data = doc.data();

  if (!data) {
    throw new Error(`Dispute document ${doc.id} is empty`);
  }

  const mapResolution = (r: any): Dispute["resolution"] => ({
    action: r?.action ?? "no_action",
    amount: r?.amount ?? null,
    note: r?.note ?? "",
    resolvedBy: r?.resolvedBy ?? "",
    resolvedAt: r?.resolvedAt ?? 0,
  });

  return {
    id: doc.id,

    // references
    orderId: data.orderId ?? "",
    userId: data.userId ?? "",
    driverId: data.driverId ?? null,

    // status
    status: data.status ?? "open",

    // dispute category
    issueType: data.issueType ?? "other",

    // customer description
    description: data.description ?? "",

    // uploaded evidence
    photoUrls: Array.isArray(data.photoUrls)
      ? data.photoUrls
      : [],

    // assignment
    isAssigned: data.isAssigned ?? false,
    assignedTo: data.assignedTo ?? null,

    // priority
    priority: data.priority ?? "low",

    // resolution
    resolution: data.resolution
      ? mapResolution(data.resolution)
      : undefined,

    // tracking
    isResolved: data.isResolved ?? false,

    // timestamps
    createdAt:
      data.createdAt?.toMillis?.() ??
      data.createdAt ??
      0,

    updatedAt:
      data.updatedAt?.toMillis?.() ??
      data.updatedAt ??
      0,
  };
}