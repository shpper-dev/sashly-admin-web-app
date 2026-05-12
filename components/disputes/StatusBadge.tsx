import { Dispute } from "@/lib/models/dispute.model";

const Dash = () => <span className="text-slate-400">—</span>;

export default function StatusBadge({ status }: { status: Dispute["status"] }) {
  const map: Record<NonNullable<Dispute["status"]>, { label: string; className: string }> = {
    open:      { label: "Open",      className: "bg-blue-50 text-blue-700"     },
    in_review: { label: "Review", className: "bg-yellow-50 text-yellow-700" },
    resolved:  { label: "Resolved",  className: "bg-green-50 text-green-700"   },
    rejected:  { label: "Rejected",  className: "bg-red-50 text-red-600"       },
  };
  if (!status || !(status in map)) return <Dash />;
  const { label, className } = map[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
