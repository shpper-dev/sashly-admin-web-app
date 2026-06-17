export interface Message{
    id: string;
    orderId: string; //chatroom
    senderId: string;
    text: string;
    role: "admin" | "user" | "system"; // for styling left or right
    photoUrl?: string | null;
    readByUser ?: boolean | null;
    readByAdmin ?: boolean | null;
    isSystem ?: boolean | null;
    createdAt: number; 
}