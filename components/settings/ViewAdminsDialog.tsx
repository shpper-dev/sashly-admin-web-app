"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Admin } from "@/lib/models/admin.model";
import { TableHeading } from "@/lib/types";
import Link from "next/link";
import { getAdmins, getCurrentUser } from "@/lib/firebase/admin.auth";

const adminHeadings: TableHeading[] = [
    { id: "name", title: "Name" },
    { id: "email", title: "Email" },
    { id: "role", title: "Role" },
    { id: "status", title: "Status" },
    { id: "actions", title: "" },
]





interface Props {
  children: React.ReactNode;
}

export default function AdminsDialog({ children }: Props) {
  const [open, setOpen]           = useState(false);
  const [admins, setAdmins]       = useState<Admin[]>([]);
  const [loading, setLoading]     = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);

  function renderCell(heading: TableHeading, admin: Admin) {
  switch (heading.id) {
    case "name":
      return (
        <span className="font-semibold text-slate-800">
          {admin.firstName} {admin.lastName}
        </span>
      );
    case "email":
      return <span className="text-slate-500">{admin.email}</span>;
    case "role":
      return (
        <span className="capitalize text-slate-700">{admin.role}</span>
      );
    case "status":
      return (
        <span className={admin.isActive ? "text-green-600" : "text-red-400"}>
          {admin.isActive ? "Active" : "Inactive"}
        </span>
      );
    
    default:
      return null;
  }
}

  // fetch admins from Firestore
  async function fetchAdmins() {
    setLoading(true);
    try {
      const adminsData = await getAdmins();
      setAdmins(adminsData);
      const current = await getCurrentUser();
      setCurrentAdmin(current);
    } catch (e) {
      console.error("Failed to fetch admins:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) fetchAdmins();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="p-0 gap-0 border-0 overflow-hidden w-[68vw] max-w-4xl rounded-2xl shadow-2xl bg-white">
        <DialogHeader className="sr-only">
          <DialogTitle>All Admins</DialogTitle>
        </DialogHeader>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Admins</h2>
            {!loading && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                {admins.length} admin{admins.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {currentAdmin?.role === "superadmin" && (
            <Link href={"/admin/add-admin"} 
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold rounded-lg shadow-sm shadow-cyan-200 transition-colors"
          >
            <Plus size={13} strokeWidth={2.5} />
            Add Admin
          </Link>
          )}
          
        </div>

        {/* ── Table ── */}
        <div className="overflow-y-auto max-h-[58vh]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={18} className="animate-spin text-cyan-500" />
            </div>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 border-b border-slate-200">
                  {adminHeadings.map((heading) => (
                    <th
                      key={heading.id}
                      className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {heading.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {admins.map((admin,index) => (
                  <tr key={admin.uid} className="border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                    {adminHeadings.map((heading) => (
                      <td key={heading.id} className="px-6 py-3.5">
                        {renderCell(heading, admin)}
                      </td>
                    ))}
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan={adminHeadings.length} className="px-6 py-12 text-center text-slate-400">
                      No admins found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

        
      </DialogContent>
    </Dialog>
  );
}