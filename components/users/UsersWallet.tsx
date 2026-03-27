"use client";
import { useEffect, useState } from "react";
import {
  ArrowDownCircle, ArrowUpCircle, CreditCard,
  Gift, RefreshCw, Wallet, Loader2,
} from "lucide-react";
import { Wallet as WalletModel, WalletTransaction, TransactionStatus, TransactionType } from "@/lib/models/wallet.model";
import { getWalletByUserId, getWalletTransactions, updateTransactionStatus } from "@/lib/firebase/wallet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  userId: string;
}

// ── Config maps ───────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<TransactionType, { label: string; icon: React.ReactNode; color: string }> = {
  topup:    { label: "Top Up",   icon: <ArrowDownCircle className="h-4 w-4" />, color: "text-green-600 bg-green-50"   },
  payment:  { label: "Payment",  icon: <CreditCard       className="h-4 w-4" />, color: "text-blue-600 bg-blue-50"     },
  refund:   { label: "Refund",   icon: <RefreshCw        className="h-4 w-4" />, color: "text-purple-600 bg-purple-50" },
  reward:   { label: "Reward",   icon: <Gift             className="h-4 w-4" />, color: "text-yellow-600 bg-yellow-50" },
  withdraw: { label: "Withdraw", icon: <ArrowUpCircle    className="h-4 w-4" />, color: "text-red-600 bg-red-50"       },
};

const STATUS_CONFIG: Record<TransactionStatus, { label: string; color: string }> = {
  pending:    { label: "Pending",    color: "bg-blue-100 text-blue-600"    },
  processing: { label: "Processing", color: "bg-teal-100 text-teal-600"    },
  success:    { label: "Success",    color: "bg-green-100 text-green-700"  },
  failed:     { label: "Failed",     color: "bg-red-100 text-red-600"      },
  hold:       { label: "On Hold",    color: "bg-orange-100 text-orange-600"},
};

const ALL_STATUSES: TransactionStatus[] = ["pending", "processing", "success", "failed", "hold"];
const ALL_TYPES: TransactionType[]      = ["topup", "payment", "refund", "reward", "withdraw"];

export default function UsersWallet({ userId }: Props) {
  const [wallet, setWallet]               = useState<WalletModel | null>(null);
  const [transactions, setTransactions]   = useState<WalletTransaction[]>([]);
  const [loading, setLoading]             = useState(true);
  const [typeFilter, setTypeFilter]       = useState<TransactionType | "all">("all");
  const [statusFilter, setStatusFilter]   = useState<TransactionStatus | "all">("all");
  const [updatingId, setUpdatingId]       = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [w, txns] = await Promise.all([
        getWalletByUserId(userId),
        getWalletTransactions(userId),
      ]);
      setWallet(w);
      setTransactions(txns);
    } catch (e) {
      console.error("Failed to fetch wallet:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [userId]);

  const handleStatusChange = async (txnId: string, newStatus: TransactionStatus) => {
    setUpdatingId(txnId);
    try {
      await updateTransactionStatus(txnId, newStatus, "admin");
      setTransactions((prev) =>
        prev.map((t) => t.id === txnId ? { ...t, status: newStatus, updatedAt: Date.now() } : t)
      );
    } catch (e) {
      console.error("Failed to update status:", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = transactions.filter((t) => {
    const matchType   = typeFilter   === "all" || t.type   === typeFilter;
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchType && matchStatus;
  });

  const withdrawable = wallet ? wallet.currentBalance - wallet.topUpAmount : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-slate-400">
        No wallet found for this user.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-6 py-5">

      {/* ── Balance summary cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <BalanceCard
          label="Current Balance"
          value={wallet.currentBalance}
          highlight
        />
        <BalanceCard label="Total Balance"   value={wallet.totalBalance}  />
        <BalanceCard label="Withdrawable"    value={withdrawable}         />
        <BalanceCard label="Total Topped Up" value={wallet.topUpAmount}   />
        <BalanceCard label="Total Withdrawn" value={wallet.totalWithdraw} />
        <BalanceCard label="Pending"         value={wallet.totalPending}  />
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold shrink-0">
          Filter
        </span>

        {/* Type filter */}
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
          <SelectTrigger className="h-8 rounded-lg border border-slate-200 bg-slate-50 text-xs w-36">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {ALL_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{TYPE_CONFIG[t].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status filter */}
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="h-8 rounded-lg border border-slate-200 bg-slate-50 text-xs w-36">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-xs text-slate-400 ml-auto">
          {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Transactions table ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["DATE", "TYPE", "SUBJECT", "AMOUNT", "ORDER", "STATUS"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                  No transactions found
                </td>
              </tr>
            ) : (
              filtered.map((txn) => {
                const type   = TYPE_CONFIG[txn.type as TransactionType];
                const status = STATUS_CONFIG[txn.status as TransactionStatus];
                return (
                  <tr key={txn.id} className="hover:bg-slate-50/60 transition-colors">

                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(txn.createdAt).toLocaleDateString("en-US", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${type?.color ?? "bg-slate-100 text-slate-500"}`}>
                        {type?.icon}
                        {type?.label ?? txn.type}
                      </span>
                    </td>

                    {/* Subject */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-700">{txn.subject}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-40">{txn.description}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-cyan-500 font-semibold">SAR</span>
                        <span className="font-bold text-slate-800">{txn.amount.toFixed(2)}</span>
                      </div>
                    </td>

                    {/* Order ID */}
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {txn.orderId
                        ? <span className="font-mono text-purple-600">#{txn.orderId.slice(-6)}</span>
                        : <span>—</span>}
                    </td>

                    {/* Status — editable dropdown */}
                    <td className="px-4 py-3">
                      {updatingId === txn.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      ) : (
                        <Select
                          value={txn.status}
                          onValueChange={(v) => handleStatusChange(txn.id, v as TransactionStatus)}
                        >
                          <SelectTrigger className={`h-7 px-2.5 rounded-full border-0 text-[10px] font-semibold w-32 ${status?.color ?? "bg-slate-100 text-slate-500"}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ALL_STATUSES.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                {STATUS_CONFIG[s].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────
function BalanceCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`flex flex-col gap-0.5 px-4 py-3 rounded-xl border ${highlight ? "bg-[#7F50F4]/5 border-[#7F50F4]/20" : "bg-white border-slate-100"}`}>
      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`text-[10px] font-semibold ${highlight ? "text-[#7F50F4]" : "text-cyan-500"}`}>SAR</span>
        <span className={`text-lg font-bold ${highlight ? "text-[#7F50F4]" : "text-slate-800"}`}>
          {value.toFixed(2)}
        </span>
      </div>
    </div>
  );
}