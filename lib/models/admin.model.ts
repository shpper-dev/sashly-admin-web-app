export type AdminRole = "superadmin"  | "admin" | "viewer";

export interface Admin{
    uid: string;
    email: string;
    firstName : string;
    lastName : string;
    role: AdminRole;
    createdAt : Date;
    isActive : boolean;
    isDeleted: boolean;
}

