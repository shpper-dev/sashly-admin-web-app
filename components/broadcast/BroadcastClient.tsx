"use client";
import Header from "@/components/Header";
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { broadcastHeadings } from "@/constants/headings";
import { getAdminById } from "@/lib/firebase/admin.auth";
import {  getBroadcasts, sendBroadcast } from "@/lib/firebase/broadcast";
import { Broadcast, BroadcastPriority, BroadcastTarget } from "@/lib/models/broadcast.model";
import { TableHeading } from "@/lib/types";
import {
  ChevronLeft, ChevronRight, Eye,
  Loader2, Send,
} from "lucide-react";
import { useEffect, useState } from "react";


const TARGET_CONFIG: Record<BroadcastTarget, { label: string; className: string }> = {
  "ALL USERS":    { label: "All Users",    className: "bg-purple-50  text-purple-700" },
  "ACTIVE USERS": { label: "Active Users", className: "bg-green-50   text-green-700"  },
  "DRIVERS":      { label: "Drivers",      className: "bg-blue-50    text-blue-700"   },
  "ADMINS":       { label: "Admins",       className: "bg-slate-100  text-slate-700"  },
};

const PRIORITY_CONFIG: Record<BroadcastPriority, { label: string; className: string }> = {
  normal: { label: "Normal", className: "bg-slate-100 text-slate-600" },
  urgent: { label: "Urgent", className: "bg-red-50    text-red-600"   },
};

//  Time formatter 

function formatTimeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

const PAGE_SIZE = 8;



interface BroadcastClientProps {
  initialTarget?: string;
}

export default function BroadcastClient({ initialTarget }: BroadcastClientProps) {
  const [priority, setPriority] = useState<BroadcastPriority>("normal");
  const [target,   setTarget]   = useState<BroadcastTarget>(
    (initialTarget as BroadcastTarget) ?? "ALL USERS"
  );
  const [heading, setHeading] = useState<string>("");
  const [body,    setBody]    = useState<string>("");

  const [sending,      setSending]      = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [history,      setHistory]      = useState<Broadcast[]>([]);
  const [page,         setPage]         = useState(1);

 

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const records = await getBroadcasts(100);
      setHistory(records);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, []);



  const totalPages  = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
  const pageStart   = (page - 1) * PAGE_SIZE;
  const pageEnd     = Math.min(pageStart + PAGE_SIZE, history.length);
  const visibleRows = history.slice(pageStart, pageEnd);

  

  const handleSend = async () => {
    if (!heading.trim() || !body.trim()) {
      alert("Please fill in both the heading and body before sending.");
      return;
    }
    setSending(true);
    try {
      await sendBroadcast({ title: heading.trim(), body: body.trim(), target, priority });
      setHeading("");
      setBody("");
      setPage(1);
      await loadHistory(); 
    } catch (err) {
      console.error("Broadcast failed:", err);
      alert("Failed to send broadcast. Please try again.");
    } finally {
      setSending(false);
    }
  };


  const renderCellContent = (heading: TableHeading, value: any, row: Broadcast) => {

    switch (heading.id) {
      case "date_time":
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded w-fit">
              #{row.id.slice(0, 6).toUpperCase()}
            </span>
            <span className="text-[11px] text-slate-400">
              {new Date(row.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            </span>
          </div>
        );

      // Message heading preview
      case "msg_details":
        return (
          <div className="flex flex-col gap-0.5 max-w-[220px]">
            <span className="text-xs font-semibold text-slate-800 truncate">{row.title}</span>
            <span className="text-[11px] text-slate-400 truncate">{row.body}</span>
          </div>
        );

      // Target audience badge
      case "target": {
        const cfg = TARGET_CONFIG[row.target] ?? { label: row.target, className: "bg-slate-100 text-slate-600" };
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.className}`}>
            {cfg.label}
          </span>
        );
      }

      // Priority badge
      case "reach": {
        const cfg = PRIORITY_CONFIG[row.priority] ?? PRIORITY_CONFIG.normal;
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.className}`}>
            {cfg.label}
          </span>
        );
      }

      case "engagement":
        return (
          <div className="flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 text-green-600" strokeWidth={2.5} />
            <span className="text-xs font-bold text-slate-700">{row.sentCount.toLocaleString()}</span>
            <span className="text-[11px] text-slate-400">sent</span>
          </div>
        );

      case "created_by":
         return <AdminName adminId={row.createdBy} />;

      default:
        return <span className="text-xs">{value}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="flex flex-col min-h-screen pt-18 pl-60">

        {/* Compose form */}
        <section className="px-8 pb-6">
          <div className="bg-white border border-blue-500/30 rounded-2xl shadow-sm">

            <div className="px-6 py-4 text-xl font-semibold">New Broadcast</div>
            <div className="border-t border-slate-200" />

            <div className="p-6 space-y-4">

              {/* Target + Priority */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-600">TARGET AUDIENCE</label>
                  <Select value={target} onValueChange={(v) => setTarget(v as BroadcastTarget)}>
                    <SelectTrigger className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-5.5 text-sm font-medium focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all">
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-slate-200 bg-white shadow-lg">
                      {(["ALL USERS", "ACTIVE USERS", "DRIVERS", "ADMINS"] as BroadcastTarget[]).map((t) => (
                        <SelectItem key={t} value={t} className="rounded-lg cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                          {TARGET_CONFIG[t].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-600">PRIORITY LEVEL</label>
                  <div className="flex gap-4">
                    {(["normal", "urgent"] as BroadcastPriority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-3 rounded-xl border text-sm font-medium transition capitalize ${
                          priority === p
                            ? "border-purple-500 text-purple-600 bg-purple-50"
                            : "border-slate-300 text-slate-600 bg-slate-100"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Heading */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-600">MESSAGE HEADING</label>
                <input
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  maxLength={60}
                  placeholder="e.g. System Maintenance Notice"
                  className="w-full text-sm rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 outline-none focus:border-purple-400 focus:bg-white transition"
                />
                <div className="text-right text-xs text-slate-400">{heading.length}/60 characters</div>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-600">MESSAGE BODY</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={160}
                  rows={5}
                  placeholder="Enter your message here..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 outline-none resize-none focus:border-purple-400 focus:bg-white transition"
                />
                <div className="text-right text-xs text-slate-400">{body.length}/160 characters</div>
              </div>
            </div>

            <hr className="text-slate-200 mx-6" />

            <div className="flex justify-end gap-4 px-6 py-4">
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !heading.trim() || !body.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Broadcast
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Sent history */}
        <section className="px-8 pb-6">
          <div className="flex gap-3 mb-4 justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Sent History</h2>
              <p className="text-sm text-slate-500">Review previously broadcasted messages</p>
            </div>
          </div>

          {historyLoading ? (
            <TableSkeleton tableHeadings={broadcastHeadings} />
          ) : (
            <table className="w-full">
              <thead className="bg-slate-200/50">
                <tr>
                  {broadcastHeadings.map((h) => (
                    <th key={h.id} className="px-6 py-3 text-left text-sm font-semibold text-slate-700 first:rounded-tl-lg last:rounded-tr-lg">
                      {h.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={broadcastHeadings.length} className="px-6 py-12 text-center text-sm text-slate-500">
                      No broadcasts sent yet
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      {broadcastHeadings.map((h) => (
                        <td key={h.id} className="px-6 py-3 text-sm text-slate-700">
                          {renderCellContent(h, row[h.id as keyof Broadcast], row)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-200/50">
                <tr>
                  <td colSpan={broadcastHeadings.length} className="px-6 py-3 first:rounded-bl-lg last:rounded-br-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">
                        Showing <b>{pageStart + 1}</b>–<b>{pageEnd}</b> of <b>{history.length}</b> broadcasts
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="p-1 rounded disabled:opacity-30"
                        >
                          <ChevronLeft className="h-3 w-3 text-slate-700" />
                        </button>
                        <span className="text-xs text-slate-500">{page} / {totalPages}</span>
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="p-1 rounded disabled:opacity-30"
                        >
                          <ChevronRight className="h-3 w-3 text-slate-700" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}

// helpers
function AdminName({ adminId }: { adminId: string }) {
  const [name, setName] = useState("");

  useEffect(() => {
    getAdminById(adminId).then((admin) => {
      setName(`${admin.firstName} ${admin.lastName}`);
    });
  }, [adminId]);

  return (
    <span className="px-2 py-1 text-xs font-medium text-slate-500">
      {name}
    </span>
  );
}