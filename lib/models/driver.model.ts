import { Timestamp } from "firebase/firestore";

export interface Driver{
    id: string;       //phone number              
    phoneNumber: string;            
    name?: string | null;
    email?: string | null;
    profileImageUrl?: string | null;
    
    designatedArea?: DesignatedArea | null;

    fcmToken?: string | null;
    isActive: boolean;              
    isOnline: boolean;    
    
    // offer toggle
    enableDriverOfferResponse: boolean;

    // counts
    activeOrderCount?: number;
    ordersAssignedToday?: number;
    ordersCompletedToday?: number;
    maxActiveOrders?: number;

    // dates
    lastAssignedAt?: FirebaseFirestore.Timestamp | null;
    createdAt: FirebaseFirestore.Timestamp;
    updatedAt?: FirebaseFirestore.Timestamp | null;
};

export interface DesignatedArea {
    areaName: string;
    polygon: Array<{ lat: number; lng: number }>;
    center: { lat: number; lng: number };
}



export type EndedReason = "went_offline" | "auto_closed_stale";

export interface DriverShift {
  id: string
  driverId: string;
  driverName: string | null;
  driverPhone: string | null;

  startedAt: Timestamp;
  endedAt: Timestamp | null;

  durationMs: number | null;

  isOpen: boolean;

  endedReason: EndedReason | null;
}

// Server/client-boundary-safe shape for the timesheet Route Handler —
// Timestamps can't cross that boundary, so this uses millis instead.
export interface DriverShiftDTO {
  id: string;
  driverId: string;
  driverName: string | null;
  driverPhone: string | null;
  startedAtMs: number;
  endedAtMs: number | null;
  durationMs: number | null;
  isOpen: boolean;
  endedReason: EndedReason | null;
}