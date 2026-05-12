"use client";
import StatusBadge from "@/components/disputes/StatusBadge";
import WaitTimeBadge from "@/components/disputes/WaitTimeBadge";
import Header from "@/components/Header";
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import { useAdminName } from "@/hooks/useAdminName";
import { getDisputes } from "@/lib/firebase/dispute";
import { Dispute } from "@/lib/models/dispute.model";
import { TableHeading } from "@/lib/types";

import { AlertTriangle, ChevronLeft, ChevronRight, Download, HelpCircle, ListFilter, PackageX, RefreshCcw, Shirt, UserX,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// constants 

const QUEUE_PAGE_SIZE = 10;
const RESOLVED_PAGE_SIZE = 10;

// issue Category Config 

export const ISSUE_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; className: string }
> = {
  missing_item: {
    label: "Missing Item",
    icon: <PackageX className="h-3.5 w-3.5" />,
    className: "bg-orange-50 text-orange-600",
  },
  damaged: {
    label: "Damaged",
    icon: <Shirt className="h-3.5 w-3.5" />,
    className: "bg-red-50 text-red-600",
  },
  wrong_service: {
    label: "Wrong Service",
    icon: <RefreshCcw className="h-3.5 w-3.5" />,
    className: "bg-blue-50 text-blue-600",
  },
  driver_behavious: {
    label: "Driver Behavior",
    icon: <UserX className="h-3.5 w-3.5" />,
    className: "bg-yellow-50 text-yellow-700",
  },
  delivery_problem: {
    label: "Delivery Problem",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    className: "bg-amber-50 text-amber-600",
  },
  other: {
    label: "Other",
    icon: <HelpCircle className="h-3.5 w-3.5" />,
    className: "bg-slate-100 text-slate-500",
  },
};

const RESOLUTION_LABELS: Record<string, string> = {
  full_refund: "Full Refund",
  partial_refund: "Partial Refund",
  wallet_credit: "Wallet Credit",
  reattempt: "Reattempt",
  no_action: "No Action",
};

const QUEUE_HEADINGS: TableHeading[] = [
  { id: "orderId",    title: "Order ID"    },
  { id: "issueType",  title: "Category"   },
  { id: "createdAt",  title: "Wait Time"  },
  { id: "priority",   title: "Priority"   },
  { id: "status",     title: "Status"     },
  { id: "assignedTo", title: "Assigned To"},
  { id: "actions",    title: "Actions"    },
];

const RESOLVED_HEADINGS: TableHeading[] = [
  { id: "orderId",               title: "Order ID"    },
  { id: "issueType",             title: "Category"    },
  { id: "resolution_action",     title: "Resolution"  },
  { id: "resolution_resolvedBy", title: "Resolved By" },
  { id: "resolution_resolvedAt", title: "Resolved At" },
  { id: "status",                title: "Status"      },
  { id: "actions",               title: "Actions"    },
];

//  utilities


function formatDateTime(ts: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(ts));
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency", currency: "AED", minimumFractionDigits: 2,
  }).format(amount);
}

const Dash = () => <span className="text-slate-400">—</span>;

// renderCellContent 

function renderCellContent(heading: TableHeading, dispute: Dispute): React.ReactNode {
  switch (heading.id) {

    case "orderId":
      return <span className="font-medium text-slate-800">#{dispute.orderId}</span>;

    case "issueType":
      return <IssueCategoryBadge issueType={dispute.issueType} />;

    case "createdAt":
      return <WaitTimeBadge createdAt={dispute.createdAt} />;

    case "priority":
      return <PriorityBadge priority={dispute.priority} />;

    case "status":
      return <StatusBadge status={dispute.status} />;

    case "assignedTo":
      return dispute.isAssigned && dispute.assignedTo ? (
        <AdminAvatar id={dispute.assignedTo} />
      ) : (
        <Dash />
      );

    case "actions":
      return (
        <Link
          href={`/disputes/resolution/${dispute.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors"
        >
          {(dispute.status === "rejected" || dispute.status === "resolved") ? "View": "Resolve"}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      );

    case "resolution_action":
      return dispute.resolution ? (
        <span>{RESOLUTION_LABELS[dispute.resolution.action] ?? dispute.resolution.action}</span>
      ) : (
        <Dash />
      );

    case "resolution_amount":
      return dispute.resolution?.amount != null ? (
        <span className="font-medium text-slate-800">
          {formatCurrency(dispute.resolution.amount)}
        </span>
      ) : (
        <Dash />
      );

    case "resolution_resolvedBy":
      return dispute.resolution?.resolvedBy ? (
        <AdminAvatar
          id={dispute.resolution.resolvedBy}
          className="bg-slate-100 text-slate-600"
        />
      ) : (
        <Dash />
      );

    case "resolution_resolvedAt":
      return dispute.resolution?.resolvedAt ? (
        <span className="text-slate-500">{formatDateTime(dispute.resolution.resolvedAt)}</span>
      ) : (
        <Dash />
      );

    default:
      return <Dash />;
  }
}


export default function Disputes() {
  const [loadingActive,   setLoadingActive]   = useState(true);
  const [loadingResolved, setLoadingResolved] = useState(true);
  const [activeDisputes,   setActiveDisputes]   = useState<Dispute[]>([]);
  const [resolvedDisputes, setResolvedDisputes] = useState<Dispute[]>([]);

  useEffect(() => {
    getDisputes(true)
      .then(setActiveDisputes)
      .catch(console.error)
      .finally(() => setLoadingActive(false));

    getDisputes(false)
      .then(setResolvedDisputes)
      .catch(console.error)
      .finally(() => setLoadingResolved(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex flex-col pt-12 pl-60 min-h-screen">
        <section className="px-6 pb-10 space-y-10">

          {/* ── Resolution Queue ── */}
          <div>
            <div className="flex items-end justify-between mb-4 pt-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Resolution Queue</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Review and resolve open disputes to maintain marketplace trust
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <button className="flex gap-2 items-center bg-white border border-slate-200 px-3 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                  <ListFilter className="h-3.5 w-3.5" />
                  Filter
                </button>
                <button className="flex gap-2 items-center bg-[#7F50F4] px-3 py-2 text-white text-sm rounded-lg hover:bg-[#6d3ee0] transition-colors">
                  <Download className="h-3.5 w-3.5" />
                  Export Report
                </button>
              </div>
            </div>
            {loadingActive ? (
              <TableSkeleton tableHeadings={QUEUE_HEADINGS} />
            ) : (
              <DisputeTable
                headings={QUEUE_HEADINGS}
                disputes={activeDisputes}
                pageSize={QUEUE_PAGE_SIZE}
                paginationLabel="open disputes"
              />
            )}
          </div>

          {/* ── Resolved Disputes ── */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800">Resolved Disputes</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Historical log of all closed and rejected disputes
              </p>
            </div>
            {loadingResolved ? (
              <TableSkeleton tableHeadings={RESOLVED_HEADINGS} />
            ) : (
              <DisputeTable
                headings={RESOLVED_HEADINGS}
                disputes={resolvedDisputes}
                pageSize={RESOLVED_PAGE_SIZE}
                paginationLabel="closed disputes"
              />
            )}
          </div>

        </section>
      </main>
    </div>
  );
}

// helpers 
function IssueCategoryBadge({ issueType }: { issueType: string }) {
  const config = ISSUE_TYPE_CONFIG[issueType] ?? {
    label: issueType,
    icon: <HelpCircle className="h-3.5 w-3.5" />,
    className: "bg-slate-100 text-slate-500",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Dispute["priority"] }) {
  const map: Record<NonNullable<Dispute["priority"]>, { label: string; className: string }> = {
    high:   { label: "High",   className: "bg-red-50 text-red-600"         },
    medium: { label: "Medium", className: "bg-yellow-50 text-yellow-700"   },
    low:    { label: "Low",    className: "bg-green-50 text-green-700"     },
  };
  if (!priority || !(priority in map)) return <Dash />;
  const { label, className } = map[priority];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function AdminAvatar({ id, className = "bg-violet-100 text-violet-700" }: { id: string; className?: string }) {
  const adminName = useAdminName(id);
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
      <span
        className={`h-5 w-5 rounded-full text-[10px] font-bold flex items-center justify-center uppercase ${className}`}
      >
        {adminName.charAt(0).toUpperCase()}
      </span>
      {adminName}
    </span>
  );
}

// Shared Pagination 

function Pagination({
  page, pageSize, total, label, onPage,
}: {
  page: number; pageSize: number; total: number; label: string;
  onPage: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="flex items-center justify-between px-6 py-3">
      <p className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">{from}–{to}</span>{" "}
        of{" "}
        <span className="font-semibold text-slate-700">{total} {label}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        </button>
        <span className="text-xs text-slate-500 px-2">{page} / {totalPages}</span>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-slate-600" />
        </button>
      </div>
    </div>
  );
}

// shared Table Shell 

function DisputeTable({
  headings, disputes, pageSize, paginationLabel,
}: {
  headings: TableHeading[];
  disputes: Dispute[];
  pageSize: number;
  paginationLabel: string;
}) {
  const [page, setPage] = useState(1);
  const paginated = disputes.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {headings.map((h) => (
              <th
                key={h.id}
                className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
              >
                {h.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {paginated.length === 0 ? (
            <tr>
              <td
                colSpan={headings.length}
                className="px-6 py-12 text-center text-sm text-slate-400"
              >
                No disputes found
              </td>
            </tr>
          ) : (
            paginated.map((dispute) => (
              <tr key={dispute.id} className="hover:bg-slate-50/70 transition-colors">
                {headings.map((heading) => (
                  <td key={heading.id} className="px-6 py-4 text-sm text-slate-700">
                    {renderCellContent(heading, dispute)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="border-t border-slate-100 bg-slate-50/50">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={disputes.length}
          label={paginationLabel}
          onPage={setPage}
        />
      </div>
    </div>
  );
}

