import {
  doc, getDoc, collection, query,
  where, orderBy, getDocs, updateDoc,
  onSnapshot,
  limit,
  getAggregateFromServer,
  sum,
  count
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


// Payout (withdraw) requests currently awaiting admin action.
export function subscribeToPayoutRequests(
  callback: (rows: WalletTransaction[]) => void
): () => void {
  const q = query(
    collection(db, "wallet_transactions"),
    where("type", "==", "withdraw"),
    where("status", "in", ["pending", "processing"]),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ ...d.data(), id: d.id } as WalletTransaction)));
  });
}

// Wallet top-up requests currently awaiting admin action.
export function subscribeToTopupRequests(
  callback: (rows: WalletTransaction[]) => void
): () => void {
  const q = query(
    collection(db, "wallet_transactions"),
    where("type", "==", "topup"),
    where("status", "in", ["pending", "processing"]),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ ...d.data(), id: d.id } as WalletTransaction)));
  });
}

// Most recent transactions across all types/statuses, for the bottom table.
export function subscribeToRecentTransactions(
  callback: (rows: WalletTransaction[]) => void,
  max = 10
): () => void {
  const q = query(
    collection(db, "wallet_transactions"),
    orderBy("updatedAt", "desc"),
    limit(max)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ ...d.data(), id: d.id } as WalletTransaction)));
  });
}

// Aggregate stats for the top cards. Firestore aggregation queries (sum/count)
// don't support onSnapshot — call this on mount and again whenever the payout/
// topup listeners fire, rather than polling on a timer.
//
// "Total Revenue" is assumed to mean successful `payment`-type transactions.
// Adjust the type/status filter here if that definition should differ.
export async function getFinanceStats(): Promise<{
  totalRevenue: number;
  pendingApprovalsCount: number;
  walletRequestsAmount: number;
}> {
  const revenueQ = query(
    collection(db, "wallet_transactions"),
    where("type", "==", "payment"),
    where("status", "==", "success")
  );
  const pendingPayoutQ = query(
    collection(db, "wallet_transactions"),
    where("type", "==", "withdraw"),
    where("status", "in", ["pending", "processing"])
  );
  const pendingTopupQ = query(
    collection(db, "wallet_transactions"),
    where("type", "==", "topup"),
    where("status", "in", ["pending", "processing"])
  );

  const [revenueAgg, payoutAgg, topupAgg] = await Promise.all([
    getAggregateFromServer(revenueQ, { total: sum("amount") }),
    getAggregateFromServer(pendingPayoutQ, { count: count() }),
    getAggregateFromServer(pendingTopupQ, { count: count(), total: sum("amount") }),
  ]);

  return {
    totalRevenue: revenueAgg.data().total ?? 0,
    pendingApprovalsCount: (payoutAgg.data().count ?? 0) + (topupAgg.data().count ?? 0),
    walletRequestsAmount: topupAgg.data().total ?? 0,
  };
}