"use client";
import { useEffect, useState } from "react";
import { subscribeToDispute } from "@/lib/firebase/dispute";
import { getAdminById } from "@/lib/firebase/admin.auth";
import { Dispute, ResolveAction } from "@/lib/models/dispute.model";
import { Undo2, User, ShieldAlert, CheckCircle2 } from "lucide-react";

interface Props {
  disputeId: string;
  orderTotalPrice: number;
}

const DISPUTE_STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  open:      { label: "Open",      color: "text-red-600",    dot: "bg-red-500"    },
  in_review: { label: "In Review", color: "text-yellow-600", dot: "bg-yellow-500" },
  resolved:  { label: "Resolved",  color: "text-green-600",  dot: "bg-green-500"  },
  rejected:  { label: "Rejected",  color: "text-slate-500",  dot: "bg-slate-400"  },
};

const ISSUE_TYPE_LABELS: Record<string, string> = {
  missing_item: "Missing Item",
  damaged: "Damaged Item",
  wrong_service: "Wrong Service",
  driver_behaviour: "Driver Behaviour",
  delivery_problem: "Delivery Problem",
  other: "Other",
};

const RESOLUTION_ACTION_LABELS: Record<ResolveAction, string> = {
  full_refund: "Full Refund",
  partial_refund: "Partial Refund",
  wallet_credit: "Wallet Credit",
  reattempt: "Reattempt",
  no_action: "No Action Taken",
};

const FINANCIAL_ACTIONS: ResolveAction[] = ["full_refund", "partial_refund", "wallet_credit"];

function fmt(ts?: number | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(ts?: number | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function DisputeResolutionCard({ disputeId, orderTotalPrice }: Props) {
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);

  // Resolved-by admin name — fetched separately since it comes from a
  // different collection (admins) than the dispute doc itself. Falls back
  // to the truncated ID while loading or if the lookup fails, rather than
  // blocking the whole card render on it.
  const [resolvedByName, setResolvedByName] = useState<string | null>(null);

  useEffect(() => {
    if (!disputeId) {
      setDispute(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToDispute(disputeId, (d) => {
      setDispute(d);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [disputeId]);

  useEffect(() => {
    const resolvedBy = dispute?.resolution?.resolvedBy;
    if (!resolvedBy) {
      setResolvedByName(null);
      return;
    }

    let cancelled = false;
    setResolvedByName(null); // reset while the new lookup is in flight

    getAdminById(resolvedBy)
      .then((admin) => {
        if (cancelled) return;
        // ASSUMPTION: admin record exposes `name`; adjust if the real field
        // differs (e.g. displayName).
        setResolvedByName(`${admin?.firstName} ${admin?.lastName}`);
      })
      .catch((err) => {
        console.error("Failed to fetch resolving admin:", err);
        if (!cancelled) setResolvedByName(null);
      });

    return () => {
      cancelled = true;
    };
  }, [dispute?.resolution?.resolvedBy]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-400">
        Loading dispute details…
      </div>
    );
  }

  if (!dispute) return null;

  const statusCfg = DISPUTE_STATUS_CONFIG[dispute.status] ?? { label: dispute.status, color: "text-slate-600", dot: "bg-slate-400" };
  const resolution = dispute.resolution;
  const isFinancialResolution = !!resolution && FINANCIAL_ACTIONS.includes(resolution.action);

  const refundAmount = resolution
    ? resolution.action === "full_refund"
      ? resolution.amount ?? orderTotalPrice
      : resolution.amount ?? 0
    : 0;

  const netRetained = orderTotalPrice - refundAmount;

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-500" />
          <div>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Dispute Status</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
              <span className={`text-sm font-bold uppercase ${statusCfg.color}`}>{statusCfg.label}</span>
            </div>
          </div>
        </div>
        {dispute.priority && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
            dispute.priority === "high" ? "bg-red-50 text-red-600" :
            dispute.priority === "medium" ? "bg-yellow-50 text-yellow-600" :
            "bg-slate-100 text-slate-500"
          }`}>
            {dispute.priority} priority
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Issue + description */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            {ISSUE_TYPE_LABELS[dispute.issueType] ?? dispute.issueType}
          </span>
          <p className="text-xs text-slate-600">{dispute.description}</p>
        </div>

        {/* Evidence photos */}
        {dispute.photoUrls && dispute.photoUrls.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {dispute.photoUrls.map((url, i) => (
              <img key={i} src={url} alt="dispute evidence" className="w-14 h-14 object-cover rounded-lg border" />
            ))}
          </div>
        )}

        {/* Assignment */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <User size={12} />
          {dispute.isAssigned && dispute.assignedTo
            ? <span>Assigned to admin #{dispute.assignedTo.slice(-6)}</span>
            : <span>Unassigned</span>}
        </div>

        {/* Resolution */}
        {resolution ? (
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                {isFinancialResolution
                  ? <Undo2 size={12} className="text-orange-500" />
                  : <CheckCircle2 size={12} className="text-green-500" />}
                {RESOLUTION_ACTION_LABELS[resolution.action] ?? resolution.action}
              </span>
              <span className="text-[10px] text-slate-400">{fmt(resolution.resolvedAt)} · {fmtTime(resolution.resolvedAt)}</span>
            </div>

            {isFinancialResolution && (
              <>
                <div className="flex justify-between text-xs text-orange-600">
                  <span>Refund / Credit Amount</span>
                  <span className="font-bold">SAR {refundAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-700 font-semibold pt-1 border-t border-slate-200">
                  <span>Net Amount Retained</span>
                  <span>SAR {netRetained.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  Issued as wallet credit — original payment of SAR {orderTotalPrice.toFixed(2)} is unaffected.
                </p>
              </>
            )}

            {resolution.note && (
              <p className="text-[11px] text-slate-500 italic">"{resolution.note}"</p>
            )}

            <p className="text-[10px] text-slate-400">
              Resolved by {resolvedByName ?? `admin #${resolution.resolvedBy.slice(-6)}`}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Not yet resolved.</p>
        )}

        {/* Driver actions taken as part of this dispute */}
        {dispute.driverActions && dispute.driverActions.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Driver Actions</span>
            {dispute.driverActions.map((action, i) => (
              <div key={i} className="flex items-center justify-between text-[11px] bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
                <span className="font-semibold text-red-600 uppercase">
                  {action.type}{action.amount ? ` · SAR ${action.amount.toFixed(2)}` : ""}
                </span>
                <span className="text-slate-400">{fmt(action.at)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Timestamps */}
        <div className="flex justify-between text-[10px] text-slate-400 pt-1">
          <span>Filed {fmt(dispute.createdAt)}</span>
          <span>Updated {fmt(dispute.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}