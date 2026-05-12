export interface Dispute {
  id: string;

  // references
  orderId: string;
  userId: string;
  driverId?: string | null;

  // status
  status:
    | "open"
    | "in_review"
    | "resolved"
    | "rejected";

  // dispute category
  issueType:
    | "missing_item"
    | "damaged"
    | "wrong_service"
    | "driver_behaviour"
    | "other";

  // customer description
  description: string;

  // uploaded evidence
  photoUrls?: string[];

  // assignment
  isAssigned?: boolean | null;
  assignedTo?: string | null; // admin ID

  // priority
  priority?:
    | "low"
    | "medium"
    | "high"
    | null;

  // resolution details
  resolution?: {
    action:
      | "full_refund"
      | "partial_refund"
      | "wallet_credit"
      | "reattempt"
      | "no_action";

    amount?: number | null;

    note: string;

    resolvedBy: string; // adminId
    resolvedAt: number;
  };

  // tracking
  isResolved?: boolean | null;

  createdAt: number;
  updatedAt: number;

}