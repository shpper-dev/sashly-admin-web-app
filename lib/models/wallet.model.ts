export interface Wallet{
    userId: string;
    currentBalance: number;
    totalWithdraw: number;
    totalPending: number;
    topUpAmount: number;
    totalBalance: number;
}

export type TransactionType = "topup" | "payment" | "refund" | "reward" | "withdraw";

export type TransactionStatus = "pending" | "processing" | "success" | "failed" | "hold";


export interface WalletTransaction{
    id: string;
    userId: string;
    email: string;
    type: string;
    status: string;
    amount: number;
    subject: string;
    description: string;
    orderId?: string | null;
    createdAt: number;
    updatedBy?: string | null;
    updatedAt: number;
}

