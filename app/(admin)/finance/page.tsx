"use client";
import VerfiyTopupDialog from '@/components/finance/VerifyTopupDialog';
import Header from '@/components/Header'
import { TableHeading } from '@/lib/types';
import { Banknote, Clock, RotateCcw, Wallet, WalletIcon, Loader2, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react'
import React, { useEffect, useState, useCallback } from 'react'
import {
  subscribeToPayoutRequests,
  subscribeToTopupRequests,
  subscribeToRecentTransactions,
  updateTransactionStatus,
  getFinanceStats,
} from '@/lib/firebase/wallet';
import { getUsersDisplayInfo } from '@/lib/firebase/user';
import { WalletTransaction } from '@/lib/models/wallet.model';
import { useToast } from '@/lib/providers/ToastProvider';
import { payoutHeadings, transactionHeadings } from '@/constants/headings';

// Collapsed vs. expanded ("View all") heights for the scrollable table bodies
const TABLE_BODY_HEIGHT_COLLAPSED = "max-h-[380px]";
const TABLE_BODY_HEIGHT_EXPANDED  = "max-h-[720px]";

type DisplayUser = { name: string; phone?: string | null };

export default function Finance() {
  // "payout" tab here means wallet withdrawal requests — drivers are on a fixed
  // salary and don't go through this wallet-based approval flow at all.
  const [activeTab, setActiveTab] = useState<"payout" | "topup">("payout")
  const { showToast } = useToast();

  const [payoutRows, setPayoutRows]           = useState<WalletTransaction[]>([]);
  const [topupRows, setTopupRows]             = useState<WalletTransaction[]>([]);
  const [transactionRows, setTransactionRows] = useState<WalletTransaction[]>([]);
  const [userCache, setUserCache]             = useState<Map<string, DisplayUser>>(new Map());

  const [loadingPayouts, setLoadingPayouts]           = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [actioningId, setActioningId]                 = useState<string | null>(null);

  // Expand state kept per-tab so switching tabs doesn't collapse the one you had open
  const [payoutExpanded, setPayoutExpanded]           = useState(false);
  const [topupExpanded, setTopupExpanded]             = useState(false);
  const [transactionsExpanded, setTransactionsExpanded] = useState(false);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingApprovalsCount: 0,
    walletRequestsAmount: 0,
  });

  //  Resolve display info for any userIds not yet in the cache 
  const resolveUsers = useCallback((rows: WalletTransaction[]) => {
    setUserCache((prevCache) => {
      const missing = rows.map((r) => r.userId).filter((id) => id && !prevCache.has(id));
      if (missing.length === 0) return prevCache;

      getUsersDisplayInfo(missing).then((fetched) => {
        setUserCache((prev) => {
          const next = new Map(prev);
          fetched.forEach((v, k) => next.set(k, v));
          return next;
        });
      });
      return prevCache;
    });
  }, []);

  //  Stats — refreshed on mount + whenever payout/topup listeners fire 
  const refreshStats = useCallback(async () => {
    try {
      setStats(await getFinanceStats());
    } catch (e) {
      console.error("Failed to load finance stats:", e);
    }
  }, []);

  useEffect(() => { refreshStats(); }, [refreshStats]);

  //  Live subscriptions 
  useEffect(() => {
    setLoadingPayouts(true);
    const unsubPayout = subscribeToPayoutRequests((rows) => {
      setPayoutRows(rows);
      resolveUsers(rows);
      setLoadingPayouts(false);
      refreshStats();
    });
    const unsubTopup = subscribeToTopupRequests((rows) => {
      setTopupRows(rows);
      resolveUsers(rows);
      refreshStats();
    });
    return () => { unsubPayout(); unsubTopup(); };
  }, [resolveUsers, refreshStats]);

  useEffect(() => {
    setLoadingTransactions(true);
    const unsub = subscribeToRecentTransactions((rows) => {
      setTransactionRows(rows);
      resolveUsers(rows);
      setLoadingTransactions(false);
    }, 10);
    return () => unsub();
  }, [resolveUsers]);

  //  Actions 
  const handleDecline = async (txn: WalletTransaction) => {
    setActioningId(txn.id);
    try {
      await updateTransactionStatus(txn.id, "failed", "admin");
      showToast(`Declined request from ${userCache.get(txn.userId)?.name ?? txn.email}`, "error");
    } catch (e) {
      console.error("Failed to decline:", e);
      showToast("Failed to decline request.", "error");
    } finally {
      setActioningId(null);
    }
  };

  // Withdrawal requests have no receipt/verification step the way top-ups do
  const handleApproveWithdrawal = async (txn: WalletTransaction) => {
    setActioningId(txn.id);
    try {
      await updateTransactionStatus(txn.id, "success", "admin");
      showToast(`Withdrawal approved for ${userCache.get(txn.userId)?.name ?? txn.email}`, "success");
    } catch (e) {
      console.error("Failed to approve withdrawal:", e);
      showToast("Failed to approve withdrawal.", "error");
    } finally {
      setActioningId(null);
    }
  };

  const handleRetry = async (txn: WalletTransaction) => {
    try {
      await updateTransactionStatus(txn.id, "pending", "admin");
      showToast("Transaction re-queued for processing.", "success");
    } catch (e) {
      console.error("Failed to retry:", e);
      showToast("Failed to retry transaction.", "error");
    }
  };

  const activeRows      = activeTab === "payout" ? payoutRows : topupRows;
  const activeExpanded  = activeTab === "payout" ? payoutExpanded : topupExpanded;
  const toggleActiveExpanded = () => {
    if (activeTab === "payout") setPayoutExpanded((v) => !v);
    else setTopupExpanded((v) => !v);
  };

  //  Payout / top-up cell renderer 
  const renderPayoutCell = (heading: TableHeading, row: WalletTransaction) => {
    switch (heading.id) {
      case "user_name": {
        const user = userCache.get(row.userId);
        return (
          <div>
            <p className="font-semibold text-slate-800 text-sm">{user?.name ?? "Loading…"}</p>
            {/* No IBAN field exists on User or WalletTransaction yet — showing
                the transaction subject here instead until that's added. */}
            <p className="text-xs text-slate-400 mt-0.5">{row.subject}</p>
          </div>
        )
      }
      case "contact_details": {
        const user = userCache.get(row.userId);
        return (
          <div>
            <p className="text-[#7F50F4] text-sm">{row.email}</p>
            {user?.phone && <p className="text-xs text-slate-400 mt-0.5">{user.phone}</p>}
          </div>
        )
      }
      case "requested_amount":
        return (
          <div>
            <p className="font-semibold text-slate-800 text-sm">SAR {row.amount.toFixed(2)}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {row.type === "withdraw" ? "Withdrawal Request" : "Top-up Request"}
            </p>
          </div>
        )
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDecline(row)}
              disabled={actioningId === row.id}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {actioningId === row.id
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : "Decline"
              }
            </button>
            {activeTab === "topup" ? (
              <VerfiyTopupDialog
                transaction={row}
                userName={userCache.get(row.userId)?.name}
                onSuccess={() => {}}
              >
                <button className="px-3 py-1.5 text-xs font-semibold bg-[#7F50F4] text-white rounded-lg hover:bg-[#6B3FD4] transition-colors cursor-pointer">
                  Verify Top-up
                </button>
              </VerfiyTopupDialog>
            ) : (
              <button
                onClick={() => handleApproveWithdrawal(row)}
                disabled={actioningId === row.id}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#7F50F4] text-white rounded-lg hover:bg-[#6B3FD4] transition-colors cursor-pointer disabled:opacity-50"
              >
                {actioningId === row.id
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <CheckCircle className="w-3 h-3" />
                }
                Approve Withdrawal
              </button>
            )}
          </div>
        )
      default:
        return null
    }
  }

  //  Transaction cell renderer 
  const renderTransactionCell = (heading: TableHeading, row: WalletTransaction) => {
    switch (heading.id) {
      case "transaction_id":
        return <span className="font-mono text-xs text-slate-500">#{row.id.slice(-8).toUpperCase()}</span>
      case "name": {
        const user = userCache.get(row.userId);
        return <span className="font-semibold text-slate-800 text-sm">{user?.name ?? row.email}</span>
      }
      case "type":
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
            row.type === "withdraw"
              ? "bg-blue-50 text-blue-600"
              : "bg-purple-50 text-[#7F50F4]"
          }`}>
            {row.type}
          </span>
        )
      case "date":
        return (
          <span className="text-sm text-slate-500">
            {new Date(row.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        )
      case "requested_amount": {
        const isCredit = row.type === "topup" || row.type === "refund" || row.type === "reward";
        return (
          <span className={`font-semibold text-sm ${isCredit ? "text-green-600" : "text-red-500"}`}>
            {isCredit ? "+" : "-"} SAR {row.amount.toFixed(2)}
          </span>
        )
      }
      case "status": {
        const statusStyles: Record<string, string> = {
          processing: "bg-purple-50 text-[#7F50F4]",
          pending:    "bg-purple-50 text-[#7F50F4]",
          success:    "bg-green-50 text-green-600",
          failed:     "bg-red-50 text-red-500",
          hold:       "bg-orange-50 text-orange-600",
        };
        return (
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full ${statusStyles[row.status] ?? "bg-slate-50 text-slate-500"}`}>
              {row.status}
            </span>
            {row.status === "failed" && (
              <button
                onClick={() => handleRetry(row)}
                className="text-[11px] text-[#7F50F4] flex items-center gap-1 hover:underline font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        )
      }
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex flex-col pt-16 pl-60 min-h-screen">
        <div className="bg-white px-8 py-6 space-y-8">

          {/* ── Stats ── */}
          <div className="grid grid-cols-3 gap-6">
            <StatCard
              title="Total Revenue"
              value={`SAR ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              icon={<Banknote className="w-5 h-5 text-green-600" />}
              bg="bg-green-50"
            />
            <StatCard
              title="Pending Approvals"
              value={`${stats.pendingApprovalsCount} Requests`}
              icon={<Clock className="w-5 h-5 text-orange-500" />}
              bg="bg-orange-50"
            />
            <StatCard
              title="Wallet Requests"
              value={`SAR ${stats.walletRequestsAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              icon={<Wallet className="w-5 h-5 text-purple-600" />}
              bg="bg-purple-50"
            />
          </div>

          {/* ── Withdrawal / Top-up Table ── */}
          <div className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setActiveTab("payout")}
                className={`flex flex-1 items-center justify-center gap-2 py-4 text-sm font-semibold relative cursor-pointer transition-colors ${
                  activeTab === "payout" ? "text-[#7F50F4]" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Banknote className="w-4 h-4" />
                Withdrawal Requests
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "payout" ? "bg-[#7F50F4] text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {payoutRows.length}
                </span>
                {activeTab === "payout" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7F50F4]" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("topup")}
                className={`flex flex-1 items-center justify-center gap-2 py-4 text-sm font- cursor-pointer relative transition-colors ${
                  activeTab === "topup" ? "text-[#7F50F4]" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <WalletIcon className="w-4 h-4" />
                Wallet Top-ups
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "topup" ? "bg-[#7F50F4] text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {topupRows.length}
                </span>
                {activeTab === "topup" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7F50F4]" />
                )}
              </button>
            </div>

            {/* Scrollable table — height toggles between collapsed/expanded per tab */}
            <div className={`${activeExpanded ? TABLE_BODY_HEIGHT_EXPANDED : TABLE_BODY_HEIGHT_COLLAPSED} overflow-y-auto transition-[max-height] duration-200`}>
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                  <tr>
                    {payoutHeadings.map((heading) => (
                      <th
                        key={heading.id}
                        className="px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50"
                      >
                        {heading.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loadingPayouts ? (
                    <tr>
                      <td colSpan={payoutHeadings.length} className="px-6 py-10 text-center text-sm text-slate-400">
                        Loading requests…
                      </td>
                    </tr>
                  ) : activeRows.length === 0 ? (
                    <tr>
                      <td colSpan={payoutHeadings.length} className="px-6 py-10 text-center text-sm text-slate-400">
                        No requests
                      </td>
                    </tr>
                  ) : (
                    activeRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        {payoutHeadings.map((heading) => (
                          <td key={heading.id} className="px-6 py-4 text-sm">
                            {renderPayoutCell(heading, row)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50">
              <span className="text-xs text-slate-400 font-medium">
                Showing {activeRows.length} {activeTab === "payout" ? "withdrawal" : "top-up"} request{activeRows.length !== 1 ? "s" : ""}
              </span>
              {activeRows.length > 0 && (
                <button
                  onClick={toggleActiveExpanded}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#7F50F4] hover:underline"
                >
                  {activeExpanded ? "Show less" : "View all"}
                  {activeExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* ── Recent Transactions Table ── */}
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-4">Recent Transactions</h3>

            <div className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className={`${transactionsExpanded ? TABLE_BODY_HEIGHT_EXPANDED : TABLE_BODY_HEIGHT_COLLAPSED} overflow-y-auto transition-[max-height] duration-200`}>
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                    <tr>
                      {transactionHeadings.map((heading) => (
                        <th
                          key={heading.id}
                          className="px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50"
                        >
                          {heading.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {loadingTransactions ? (
                      <tr>
                        <td colSpan={transactionHeadings.length} className="px-6 py-10 text-center text-sm text-slate-400">
                          Loading transactions…
                        </td>
                      </tr>
                    ) : transactionRows.length === 0 ? (
                      <tr>
                        <td colSpan={transactionHeadings.length} className="px-6 py-10 text-center text-sm text-slate-400">
                          No transactions
                        </td>
                      </tr>
                    ) : (
                      transactionRows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                          {transactionHeadings.map((heading) => (
                            <td key={heading.id} className="px-6 py-4 text-sm">
                              {renderTransactionCell(heading, row)}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50">
                <span className="text-xs text-slate-400 font-medium">
                  Showing latest {transactionRows.length} transactions
                </span>
                {transactionRows.length > 0 && (
                  <button
                    onClick={() => setTransactionsExpanded((v) => !v)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#7F50F4] hover:underline"
                  >
                    {transactionsExpanded ? "Show less" : "View all"}
                    {transactionsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

//  helper 
function StatCard({ title, value, icon, bg }: { title: string; value: string; icon: React.ReactNode; bg: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className={`absolute -bottom-6 -right-6 w-17 h-16 rounded-full ${bg}`} />
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="text-3xl font-bold mt-3 text-slate-900">{value}</h2>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}