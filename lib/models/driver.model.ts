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
