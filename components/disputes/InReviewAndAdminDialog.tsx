"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateDispute } from "@/lib/firebase/dispute";
import { Dispute } from "@/lib/models/dispute.model";
import { Admin } from "@/lib/models/admin.model";
import { Loader2, UserCheck, UserCog, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getAdmins } from "@/lib/firebase/admin.auth";
import { useAdminName } from "@/hooks/useAdminName";

interface InReviewAndAdminDialogProps {
  children: React.ReactNode;
  dispute: Dispute;
  currentAdminId: string;
  currentAdminName?: string;
}

export default function InReviewAndAdminDialog({
  children,
  dispute,
  currentAdminId,
  currentAdminName,
}: InReviewAndAdminDialogProps) {
  const [open, setOpen]             = useState(false);
  const [admins, setAdmins]         = useState<Admin[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading]       = useState(false);
  const [fetching, setFetching]     = useState(false);

  const isOpen     = dispute.status === "open";
  const isInReview = dispute.status === "in_review";

  const assignedAdminName = useAdminName(isInReview ? dispute.assignedTo : null);

  useEffect(() => {
    if (!open) return;
    setFetching(true);
    getAdmins()
      .then((list) => {
        setAdmins(list);
        const preselect = isInReview && dispute.assignedTo
          ? list.find((a) => a.uid === dispute.assignedTo)?.uid ?? currentAdminId
          : currentAdminId;
        setSelectedId(preselect);
      })
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [open]);

  const selectedAdmin = admins.find((a) => a.uid === selectedId);

  const handleConfirm = async () => {
    if (!selectedId || !selectedAdmin) return;
    setLoading(true);
    try {
      await updateDispute(dispute.id, {
        status: "in_review",
        isAssigned: true,
        assignedTo: selectedAdmin.uid,
        updatedAt: Date.now(),
      });
      setOpen(false);
    } catch (e) {
      console.error("MarkInReview failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const selfAdmin  = admins.find((a) => a.uid === currentAdminId);
  const otherAdmins = admins.filter((a) => a.uid !== currentAdminId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-sm rounded-2xl p-6 gap-0">
        <DialogHeader className="flex flex-row items-center justify-between mb-4">
          <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            {isOpen ? (
              <><UserCheck className="w-4 h-4 text-[#7F50F4]" /> Mark In Review</>
            ) : (
              <><UserCog className="w-4 h-4 text-[#7F50F4]" /> Change Assigned Admin</>
            )}
          </DialogTitle>
          <DialogClose asChild>
            <button className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-col gap-4">

          {/* Info banner for OPEN disputes */}
          {isOpen && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-3">
              <p className="text-xs text-blue-600 leading-relaxed">
                This will update the dispute status to{" "}
                <span className="font-bold">In Review</span> and assign it to
                the selected admin. All resolution actions will be unlocked.
              </p>
            </div>
          )}

          {/* Current assignment banner for IN_REVIEW */}
          {isInReview && dispute.assignedTo && (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-xl px-3.5 py-3">
              <span className="h-6 w-6 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center justify-center uppercase shrink-0">
                {assignedAdminName.charAt(0)}
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-700">{assignedAdminName}</p>
                <p className="text-[10px] text-slate-400">Currently assigned</p>
              </div>
            </div>
          )}

          {/* Admin selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">
              {isOpen ? "Assign to" : "Reassign to"}
            </label>

            {fetching ? (
              <div className="flex items-center justify-center h-10 bg-slate-50 rounded-xl border border-slate-200">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              </div>
            ) : (
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-[#7F50F4]/30 focus:border-[#7F50F4]/40 h-10">
                  <SelectValue placeholder="Select an admin…" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-lg">

                  {/* Self first */}
                  {selfAdmin && (
                    <SelectItem
                      value={selfAdmin.uid}
                      className="text-xs rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center justify-center uppercase shrink-0">
                          {selfAdmin.firstName.charAt(0)}
                        </span>
                        <span>{selfAdmin.firstName}</span>
                        <span className="text-slate-400 text-[10px]">(You)</span>
                      </div>
                    </SelectItem>
                  )}

                  {/* Other admins */}
                  {otherAdmins.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-[10px] text-slate-400 uppercase tracking-widest px-2 py-1.5">
                        Other admins
                      </SelectLabel>
                      {otherAdmins.map((a) => (
                        <SelectItem
                          key={a.uid}
                          value={a.uid}
                          className="text-xs rounded-lg cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center uppercase shrink-0">
                              {a.firstName.charAt(0)}
                            </span>
                            <span>{a.firstName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}

                </SelectContent>
              </Select>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <DialogClose asChild>
              <button className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-xs font-medium hover:bg-slate-50 transition">
                Cancel
              </button>
            </DialogClose>
            <button
              onClick={handleConfirm}
              disabled={loading || fetching || !selectedId}
              className="flex-1 py-2.5 rounded-xl bg-[#7F50F4] hover:bg-[#6B3FD4] text-white text-xs font-semibold disabled:opacity-50 transition flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isOpen ? (
                <><UserCheck className="w-3.5 h-3.5" /> Mark In Review</>
              ) : (
                <><UserCog className="w-3.5 h-3.5" /> Reassign</>
              )}
            </button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}