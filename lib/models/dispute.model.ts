export type DisputeStatus ="open" | "in_review" | "resolved" | "rejected";
export type DisputeIssueType ="missing_item" | "damaged" | "wrong_service" | "driver_behaviour" | "delivery_problem" | "other";
export type ResolveAction ="full_refund" | "partial_refund" | "wallet_credit" | "reattempt" | "no_action";

export interface Dispute {
  id: string;

  // references
  orderId: string;
  userId: string;
  driverId?: string | null;

  // status
  status: DisputeStatus;

  // dispute category
  issueType: DisputeIssueType;
    
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
    action: ResolveAction;

    amount?: number | null;

    note: string;

    resolvedBy: string; // adminId
    resolvedAt: number;
  };

  // driver actions 
  driverActions: DriverAction[];

  // tracking
  isResolved?: boolean | null;

  createdAt: number;
  updatedAt: number;

}

export interface DriverAction {
  type: "warning" | "penalty";
  amount: number;
  note: string;
  by: string; // adminId
  at: number; // timestamp
}