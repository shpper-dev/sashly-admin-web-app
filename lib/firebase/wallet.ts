import {
  doc, getDoc, collection, query,
  where, orderBy, getDocs, updateDoc
} from "firebase/firestore";
import { db } from "./config";
import { Wallet, WalletTransaction, TransactionStatus } from "@/lib/models/wallet.model";

export async function getWalletByUserId(userId: string): Promise<Wallet | null> {
  const snap = await getDoc(doc(db, "wallets", userId));
  if (!snap.exists()) return null;
  return snap.data() as Wallet;
}

export async function getWalletTransactions(userId: string): Promise<WalletTransaction[]> {
  const q = query(
    collection(db, "wallet_transactions"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as WalletTransaction));
}

export async function updateTransactionStatus(
  transactionId: string,
  newStatus: TransactionStatus,
  adminUserId: string
): Promise<void> {
  await updateDoc(doc(db, "wallet_transactions", transactionId), {
    status: newStatus,
    updatedBy: adminUserId,
    updatedAt: Date.now(),
  });
}