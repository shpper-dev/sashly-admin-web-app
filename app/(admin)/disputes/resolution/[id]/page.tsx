"use client";
import ConfirmActionDialog from "@/components/ConfirmActionDialog";
import InReviewAndAdminDialog from "@/components/disputes/InReviewAndAdminDialog";
import StatusBadge from "@/components/disputes/StatusBadge";
import OrderChat from "@/components/orders/OrderChat";
import { SectionLabel } from "@/components/SectionLabel";
import { useAdminName } from "@/hooks/useAdminName";
import { getCurrentUser } from "@/lib/firebase/admin.auth";
import { applyDriverPenaltyFn, rejectDisputeFn, resolveDisputeFn, subscribeToDispute } from "@/lib/firebase/dispute";
import { getOrderById } from "@/lib/firebase/order";
import { Admin } from "@/lib/models/admin.model";
import { Dispute, DriverAction, ResolveAction } from "@/lib/models/dispute.model";
import { Order } from "@/lib/models/order.model";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft, Check, CheckCircle2, CircleAlert, Clock, Loader2, MapPin, NotepadText, Search, ShieldAlert, ShoppingCart, TriangleAlert, Undo2, User, UserCheck, UserCog, Wallet, X,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";


type DisputeWithDriverActions = Dispute & { driverActions?: DriverAction[] };

// Utilities
function getErrorMessage(err: any): string {
  return err?.message ?? "Something went wrong. Please try again.";
}

export default function DisputesResolutionDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [dispute, setDispute]   = useState<DisputeWithDriverActions | null>(null);
  const [order, setOrder]       = useState<Order | null>(null);
  const [auditNote, setAuditNote] = useState("");
  const [creditAmount, setCreditAmount]   = useState("");
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [actionError, setActionError]     = useState<string | null>(null);
  const [currentAdmin, setCurrentAdmin]   = useState<Admin | null>(null);
  const assignedAdminName = useAdminName(dispute?.assignedTo);

  //Real-time dispute subscription 
  useEffect(() => {
    const unsubscribe = subscribeToDispute(id, (updated: any) => {
      setDispute(updated);
      if (updated?.orderId && !order) {
        getOrderById(updated.orderId)
          .then(setOrder)
          .catch(console.error);
      }
    });
    return () => unsubscribe();
  }, [id]);

  //Get current admin 
  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        if (u) setCurrentAdmin(u as Admin);
      })
      .catch(console.error);
  }, []);

  // Action helpers — all calls go through cloud functions 
  // The functions handle the dispute update, order advancement, and any
  // wallet/refund ledger writes server-side. We never write those directly.

  const handleResolve = async (action: ResolveAction, amount?: number) => {
    if (!dispute || !auditNote.trim()) return;
    setLoadingAction(action);
    setActionError(null);
    try {
      await resolveDisputeFn({
        disputeId: dispute.id,
        action,
        amount,
        note: auditNote.trim(),
      });
      // Real-time subscription picks up the resolved dispute automatically.
    } catch (e) {
      console.error(e);
      setActionError(getErrorMessage(e));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async () => {
    if (!dispute || !auditNote.trim()) return;
    setLoadingAction("reject");
    setActionError(null);
    try {
      await rejectDisputeFn({ disputeId: dispute.id, note: auditNote.trim() });
    } catch (e) {
      console.error(e);
      setActionError(getErrorMessage(e));
    } finally {
      setLoadingAction(null);
    }
  };

  
  const handleDriverAction = async (type: "warning" | "penalty", amount?: number) => {
    if (!dispute?.driverId) return;
    const loadingKey = type === "warning" ? "driver_warning" : "driver_penalty";
    setLoadingAction(loadingKey);
    setActionError(null);
    try {
      await applyDriverPenaltyFn({
        driverId: dispute.driverId,
        type,
        amount,
        note: auditNote.trim() || undefined,
        disputeId: dispute.id,
      });
      if (type === "penalty") setPenaltyAmount("");
    } catch (e) {
      console.error(e);
      setActionError(getErrorMessage(e));
    } finally {
      setLoadingAction(null);
    }
  };

  // Derive UI flags
  const isOpen     = dispute?.status === "open";
  const isInReview = dispute?.status === "in_review";
  const isClosed   = dispute?.status === "resolved" || dispute?.status === "rejected";
  const actionsEnabled = isInReview && !isClosed && !!auditNote.trim();
  const missingNote    = !auditNote.trim();
  const driverActions  = dispute?.driverActions ?? [];

  // Loading state
  if (!dispute) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F8FAFC] overflow-hidden">

      {/* Top Nav */}
      <div className="fixed bg-white left-0 top-0 h-16 right-0 border-b border-b-blue-500/30 z-10">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-3">
            <Link href="/disputes">
              <ArrowLeft className="text-slate-700 w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <h2 className="text-lg text-slate-900 font-semibold">
                Dispute Resolution Details
              </h2>
              <StatusBadge status={dispute.status} />
            </div>
          </div>
          
        </div>
      </div>

      {/* Main Grid */}
      <main className="mt-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="grid grid-cols-12 gap-4 p-6 items-start">

          {/* LEFT COL — Order Summary | Customer & Driver | History */}
          <div className="col-span-3 flex flex-col gap-4">

            {/* Card: Order Summary */}
            <div className="bg-white border border-blue-200/60 rounded-2xl p-4 flex flex-col gap-3">
              <SectionLabel>Order Summary</SectionLabel>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#7F50F4]">
                  #{dispute.orderId}
                </span>
                <StatusBadge status={dispute.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 text-[10px] font-bold rounded-full text-white bg-linear-to-r from-[#7F50F4] to-[#02D0FF]">
                  {order?.serviceType ?? "Express"}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {order?.totalPrice != null
                    ? `SAR ${order.totalPrice.toFixed(2)}`
                    : "—"}
                </span>
              </div>
            </div>

            {/* Card: Customer & Driver */}
            <div className="bg-white border border-blue-200/60 rounded-2xl p-4 flex flex-col gap-4">

              {/* Customer */}
              <div className="flex flex-col gap-3 pb-4 border-b border-slate-100">
                <SectionLabel>Customer</SectionLabel>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-900">
                      {order?.userName ?? "—"}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {order?.userPhone ?? "—"}
                    </span>
                  </div>
                </div>
                {order?.deliveryAddress && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-[10px] text-slate-500 leading-relaxed">
                      {order.deliveryAddress.formattedAddress}
                    </span>
                  </div>
                )}
              </div>

              {/* Driver */}
              <div className="flex flex-col gap-3">
                <SectionLabel>Driver</SectionLabel>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-900">
                      {order?.driverName ?? "—"}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ID: {order?.assignedDriverId ?? "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card: History */}
            <div className="bg-white border border-blue-200/60 rounded-2xl p-4 flex flex-col gap-3">
              <SectionLabel>History</SectionLabel>
              <div className="flex flex-col gap-3">
                <div className="pl-3 border-l-2 border-[#7F50F4] flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-900">
                    Order Delivered
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {order ? "Driver confirmed delivery" : "—"}
                  </span>
                </div>

                <div className="pl-3 border-l-2 border-red-400 flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-900">
                    Dispute Opened
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDateTime(dispute.createdAt)}
                  </span>
                </div>

                {dispute.isAssigned && dispute.assignedTo && (
                  <div className="pl-3 border-l-2 border-yellow-400 flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-900">
                      Assigned for Review
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {assignedAdminName}
                    </span>
                  </div>
                )}

                {driverActions.map((action, i) => (
                  <div
                    key={`driver-action-${i}`}
                    className={`pl-3 border-l-2 flex flex-col gap-0.5 ${
                      action.type === "penalty" ? "border-red-400" : "border-amber-400"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 capitalize">
                      Driver {action.type}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDateTime(action.at)}
                    </span>
                  </div>
                ))}

                {dispute.resolution && (
                  <div className="pl-3 border-l-2 border-green-400 flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-900">
                      {dispute.status === "rejected" ? "Dispute Rejected" : "Dispute Resolved"}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDateTime(dispute.resolution.resolvedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MIDDLE COL — Dispute Context | Audit Note */}
          <div className="col-span-6 flex flex-col gap-4">

            {/* Card: Dispute Context */}
            <div className="bg-white border border-blue-200/60 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Dispute Context</h2>
                <p className="text-xs text-slate-400 mt-0.5">Review claims from both parties</p>
              </div>

              <div className="grid grid-cols-2 divide-x divide-slate-100">

                {/* Left — Customer Complaint */}
                <div className="flex flex-col gap-3 p-5">
                  <span className="flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase tracking-wide">
                    <CircleAlert className="w-3.5 h-3.5" />
                    Customer Complaint
                  </span>

                  <blockquote className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 leading-relaxed border border-slate-100">
                    {dispute.description || "No description provided."}
                  </blockquote>

                  {dispute.photoUrls && dispute.photoUrls.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Uploaded Evidence
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {dispute.photoUrls.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`evidence-${i + 1}`}
                            className="rounded-xl object-cover w-full h-28"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right — Driver Notes */}
                <div className="flex flex-col gap-3 p-5">
                  <span className="flex items-center gap-2 text-[10px] font-bold text-[#7F50F4] uppercase tracking-wide">
                    <NotepadText className="w-3.5 h-3.5" />
                    Driver Notes
                  </span>

                  <blockquote className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 leading-relaxed border border-slate-100">
                    {order?.deliveryNotes || "No driver note on record."}
                  </blockquote>

                  {(order?.deliveryPhotoUrl || order?.pickupPhotoUrl) && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Pickup / Drop-off Photo
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {order.pickupPhotoUrl && (
                          <img
                            src={order.pickupPhotoUrl}
                            alt="pickup"
                            className="rounded-xl object-cover w-full h-28"
                          />
                        )}
                        {order.deliveryPhotoUrl && (
                          <img
                            src={order.deliveryPhotoUrl}
                            alt="dropoff"
                            className="rounded-xl object-cover w-full h-28"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card: Internal Audit Note */}
            <div className="bg-white border border-blue-200/60 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-slate-900">Internal Audit Note</span>
                <span className="text-[11px] text-slate-400">
                  Explain your decision for future audits and records
                  {!isClosed && (
                    <span className="text-red-400 ml-1">
                      — required before resolving or rejecting
                    </span>
                  )}
                </span>
              </div>

              <textarea
                value={isClosed ? (dispute.resolution?.note ?? "") : auditNote}
                onChange={(e) => !isClosed && setAuditNote(e.target.value)}
                rows={4}
                maxLength={160}
                readOnly={isClosed}
                className={`w-full bg-slate-50 border rounded-xl p-3 text-xs text-slate-600 placeholder:text-slate-300 resize-none focus:outline-none transition ${
                  isClosed
                    ? "border-slate-100 cursor-not-allowed opacity-70"
                    : "border-slate-200 focus:ring-2 focus:ring-[#7F50F4]/30 focus:border-[#7F50F4]/40"
                }`}
                placeholder="Explain why you made this decision..."
              />
              {!isClosed && (
                <div className="text-right text-[10px] text-slate-400">
                  {auditNote.length} / 160 characters
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COL — Manual Action Panel | Admin Chat */}
          <div className="col-span-3 flex flex-col gap-4">

            {/* Card: Manual Action Panel */}
            <div className="bg-white border border-blue-200/60 rounded-2xl p-4 flex flex-col gap-2">
              <SectionLabel>Manual Action Panel</SectionLabel>

              {/* Inline error banner for failed cloud function calls */}
              {actionError && (
                <div className="flex items-start justify-between gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-1">
                  <span className="text-[11px] text-red-600 leading-snug">{actionError}</span>
                  <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-600 shrink-0">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* 1. STATE: OPEN (Needs Review) */}
              {isOpen && (
                <InReviewAndAdminDialog
                  dispute={dispute}
                  currentAdminId={currentAdmin?.uid || ""}
                  currentAdminName={currentAdmin?.firstName}
                >
                  <button className="flex items-center justify-between w-full px-4 py-2.5 bg-[#7F50F4] hover:bg-[#6B3FD4] rounded-xl text-xs font-bold text-white transition-colors">
                    Mark In Review <UserCheck className="h-4 w-4" />
                  </button>
                </InReviewAndAdminDialog>
              )}

              {/* 2. STATE: IN REVIEW (Active Actions) */}
              {isInReview && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center justify-center uppercase shrink-0">
                        {assignedAdminName.charAt(0).toUpperCase()}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-700">{assignedAdminName}</span>
                        <span className="text-[9px] text-slate-400">Assigned Admin</span>
                      </div>
                    </div>
                    <InReviewAndAdminDialog
                      dispute={dispute}
                      currentAdminId={currentAdmin?.uid || ""}
                    >
                      <button className="text-[10px] font-semibold text-[#7F50F4] hover:underline flex items-center gap-1">
                        <UserCog className="h-3 w-3" /> Change
                      </button>
                    </InReviewAndAdminDialog>
                  </div>

                  {/* Resolution actions */}
                  <ConfirmActionDialog
                    title="Issue Full Refund?"
                    description="This will return the full order amount to the customer's original payment method."
                    confirmLabel="Confirm Refund"
                    onConfirm={() => handleResolve("full_refund")}
                  >
                    <button
                      disabled={!actionsEnabled || loadingAction !== null}
                      className="flex items-center justify-between w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loadingAction === "full_refund"
                        ? <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        : <><span>Issue Full Refund</span><Undo2 className="h-4 w-4 text-red-500" /></>
                      }
                    </button>
                  </ConfirmActionDialog>

                  {/* Wallet credit — amount is required by the cloud function */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      placeholder="SAR"
                      disabled={!actionsEnabled || loadingAction !== null}
                      className="w-16 text-xs rounded-lg border border-slate-200 px-2 py-2.5 outline-none focus:border-[#02D0FF]/50 disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                    <ConfirmActionDialog
                      title="Grant Wallet Credit?"
                      description="The amount will be added to the customer's app wallet immediately."
                      confirmLabel="Add Credit"
                      onConfirm={() => handleResolve("wallet_credit", parseFloat(creditAmount))}
                    >
                      <button
                        disabled={!actionsEnabled || !creditAmount || loadingAction !== null}
                        className="flex-1 flex items-center justify-between px-4 py-2.5 bg-[#02D0FF] hover:bg-[#00BAE0] rounded-xl text-xs font-bold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {loadingAction === "wallet_credit"
                          ? <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          : <><span>Add Wallet Credit</span><Wallet className="h-4 w-4" /></>
                        }
                      </button>
                    </ConfirmActionDialog>
                  </div>

                  <ConfirmActionDialog
                    title="Re Attempt Delivery?"
                    description="The missing item/s will be delivered soon."
                    confirmLabel="Reattempt Delivery"
                    onConfirm={() => handleResolve("reattempt")}
                  >
                    <button
                      disabled={!actionsEnabled || loadingAction !== null}
                      className="flex items-center justify-between w-full px-4 py-2.5 bg-[#7F50F4] hover:bg-[#6B3FD4] rounded-xl text-xs font-bold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loadingAction === "reattempt"
                        ? <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        : <><span>Re-attempt Delivery</span><ShoppingCart className="h-4 w-4" /></>
                      }
                    </button>
                  </ConfirmActionDialog>

                  <div className="h-px bg-slate-100 my-0.5" />

                  {/* Driver actions — independent of resolving, requires dispute.driverId */}
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Driver Actions
                  </span>

                  <ConfirmActionDialog
                    title="Issue Driver Warning?"
                    description="The driver will be notified and a warning will be logged against their record."
                    confirmLabel="Issue Warning"
                    onConfirm={() => handleDriverAction("warning")}
                  >
                    <button
                      disabled={!dispute.driverId || loadingAction !== null}
                      className="flex items-center justify-between w-full px-4 py-2.5 bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loadingAction === "driver_warning"
                        ? <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        : <><span>Issue Warning</span><TriangleAlert className="h-4 w-4 text-orange-500" /></>
                      }
                    </button>
                  </ConfirmActionDialog>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={penaltyAmount}
                      onChange={(e) => setPenaltyAmount(e.target.value)}
                      placeholder="SAR"
                      disabled={!dispute.driverId || loadingAction !== null}
                      className="w-16 text-xs rounded-lg border border-slate-200 px-2 py-2.5 outline-none focus:border-red-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                    <ConfirmActionDialog
                      title="Apply Driver Penalty?"
                      description="A monetary penalty will be deducted from the driver's earnings and logged against their record."
                      confirmLabel="Apply Penalty"
                      onConfirm={() => handleDriverAction("penalty", penaltyAmount ? parseFloat(penaltyAmount) : undefined)}
                    >
                      <button
                        disabled={!dispute.driverId || loadingAction !== null}
                        className="flex-1 flex items-center justify-between px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl text-xs font-semibold text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {loadingAction === "driver_penalty"
                          ? <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          : <><span>Apply Penalty</span><ShieldAlert className="h-4 w-4" /></>
                        }
                      </button>
                    </ConfirmActionDialog>
                  </div>

                  <div className="h-px bg-slate-100 my-0.5" />

                  <ConfirmActionDialog
                    title="Resolve Dispute?"
                    description="This will close the case with no further action. The customer will be notified."
                    confirmLabel="Resolve & Close"
                    onConfirm={() => handleResolve("no_action")}
                  >
                    <button
                      disabled={!actionsEnabled || loadingAction !== null}
                      title={missingNote ? "Add an audit note before resolving" : undefined}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all bg-linear-to-r from-[#7F50F4] to-[#02D0FF] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loadingAction === "no_action"
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <><Check className="h-4 w-4" strokeWidth={3} /> Confirm &amp; Resolve Case</>
                      }
                    </button>
                  </ConfirmActionDialog>

                  <ConfirmActionDialog
                    title="Reject Dispute?"
                    description="This will close the case with no further action. The customer will be notified."
                    confirmLabel="Reject & Close"
                    onConfirm={() => handleReject()}
                  >
                    <button
                      disabled={!actionsEnabled || missingNote || loadingAction !== null}
                      title={missingNote ? "Add an audit note before rejecting" : undefined}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loadingAction === "reject"
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <><X className="h-4 w-4" /> Reject &amp; Close</>
                      }
                    </button>
                  </ConfirmActionDialog>
                </div>
              )}

              {/* 3. STATE: RESOLVED (Summary View) */}
              {isClosed && (
                <div className="flex flex-col gap-3">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-tight">Resolution Details</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-medium">Resolution Type</span>
                        <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {dispute.resolution?.action.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-medium">Processed By</span>
                        <span className="text-[10px] font-bold text-slate-700">{assignedAdminName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-medium">Date</span>
                        <span className="text-[10px] font-bold text-slate-700">
                          {formatDateTime(dispute.resolution?.resolvedAt || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Driver actions taken on this dispute, if any */}
                  {driverActions.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-orange-600">
                        <ShieldAlert className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-tight">Driver Actions</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {driverActions.map((action, i) => (
                          <div
                            key={`driver-action-summary-${i}`}
                            className="flex flex-col gap-1 bg-white rounded-lg border border-slate-100 p-2.5"
                          >
                            <div className="flex justify-between items-center">
                              <span
                                className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                                  action.type === "penalty"
                                    ? "bg-red-50 text-red-600"
                                    : "bg-amber-50 text-amber-600"
                                }`}
                              >
                                {action.type}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {formatDateTime(action.at)}
                              </span>
                            </div>
                            {action.amount != null && (
                              <span className="text-[10px] font-bold text-slate-700">
                                SAR {action.amount.toFixed(2)}
                              </span>
                            )}
                            {action.note && (
                              <span className="text-[10px] text-slate-500">{action.note}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Card: Admin Chat */}
            <div className="bg-white border border-blue-200/60 rounded-2xl overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-slate-100 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Admin Chat
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Communicate with the customer
                </p>
              </div>
              <div className="h-[60vh]">
                <OrderChat orderId={dispute.orderId} />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// helpers
// function SectionLabel({ children }: { children: React.ReactNode }) {
//   return (
//     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
//       {children}
//     </span>
//   );
// }


