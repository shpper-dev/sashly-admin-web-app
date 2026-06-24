"use client";
import Header from "@/components/Header";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft, ChevronRight, Search, SlidersHorizontal,
  Phone, Pencil, Trash2, Plus, Copy, RefreshCw, Check,
  Users, Loader2,
  CopyPlusIcon,
} from "lucide-react";
import { TableHeading } from "@/lib/types";
import ConfirmActionDialog from "@/components/ConfirmActionDialog";
import BusinessAccountDialog from "@/components/business/BusinessAccountDialog";
import { Business } from "@/lib/models/business.model";
import { deleteBusiness, duplicateBusiness, getBusinesses, regenerateBusinessJoinCode } from "@/lib/firebase/business";
import { useToast } from "@/lib/providers/ToastProvider";
import TableSkeleton from "@/components/skeleton/TableSkeleton";

const PAGE_SIZE = 10;

const businessHeadings: TableHeading[] = [
  { id: "name",      title: "BUSINESS"  },
  { id: "join_code", title: "JOIN CODE" },
  { id: "contact",   title: "CONTACT"   },
  { id: "members",   title: "MEMBERS"   },
  { id: "status",    title: "STATUS"    },
  { id: "actions",   title: "ACTIONS"   },
];

const STATUS_FILTERS = ["All", "Active", "Inactive"] as const;

export default function BusinessAccounts() {
  const [businesses,    setBusinesses]    = useState<Business[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [searchTerm,    setSearchTerm]    = useState("");
  const [statusFilter,  setStatusFilter]  = useState<string>("All");
  const [currentPage,   setCurrentPage]   = useState(1);
  const [copiedId,      setCopiedId]      = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      setBusinesses(await getBusinesses());
    } catch (e) {
      console.error("Failed to load businesses", e);
      showToast("Failed to load businesses", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBusinesses(); }, []);

  const handleCopyCode = (b: Business) => {
    navigator.clipboard.writeText(b.joinCode);
    setCopiedId(b.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Regenerate join code and update local state without a full reload
  const handleRegenerate = async (b: Business) => {
    setRegeneratingId(b.id);
    try {
      const newCode = await regenerateBusinessJoinCode(b.id);
      setBusinesses((prev) =>
        prev.map((biz) => (biz.id === b.id ? { ...biz, joinCode: newCode } : biz))
      );
      showToast("Join code regenerated", "success");
    } catch (e) {
      console.error(e);
      showToast("Failed to regenerate join code", "error");
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleDelete = async (b: Business) => {
    try {
      await deleteBusiness(b.id);
      showToast(`${b.name} deleted`, "error");
      await loadBusinesses();
    } catch (e) {
      console.error(e);
      showToast("Failed to delete business", "error");
    }
  };

  const handleDuplicate = async (b: Business) => {
    const newName = window.prompt(`New business name:`, `Copy of ${b.name}`);
    if (!newName?.trim()) return;
    setDuplicatingId(b.id);
    try {
      await duplicateBusiness(b.id, newName.trim());
      showToast(`Duplicated as "${newName}"`, "success");
      await loadBusinesses();
    } catch (e) {
      console.error(e);
      showToast("Failed to duplicate business", "error");
    } finally {
      setDuplicatingId(null);
    }
  };

  const filtered = useMemo(() => businesses.filter((b) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || b.name.toLowerCase().includes(term) || b.contactName.toLowerCase().includes(term);
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active"   && b.isActive) ||
      (statusFilter === "Inactive" && !b.isActive);
    return matchesSearch && matchesStatus;
  }), [businesses, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd   = Math.min(currentPage * PAGE_SIZE, filtered.length);
  const counts = {
    All:      businesses.length,
    Active:   businesses.filter((b) => b.isActive).length,
    Inactive: businesses.filter((b) => !b.isActive).length,
  };

  const renderCellContent = (heading: TableHeading, row: Business) => {
    switch (heading.id) {

      case "name": {
        const initials = row.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{row.name}</p>
              <p className="text-[10px] text-slate-400">ID: {row.id.slice(-6)}</p>
            </div>
          </div>
        );
      }

      case "join_code":
        return (
          <div className="flex items-center gap-1">
            <span className="font-mono text-xs font-bold text-slate-700 tracking-widest bg-slate-100 px-2 py-1 rounded-lg">
              {row.joinCode}
            </span>
            {/* Copy */}
            <button
              title="Copy join code"
              onClick={() => handleCopyCode(row)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              {copiedId === row.id
                ? <Check size={13} className="text-green-500" />
                : <Copy size={13} />
              }
            </button>
            {/* Regenerate */}
            <button
              title="Regenerate join code — invalidates the current one"
              onClick={() => handleRegenerate(row)}
              disabled={regeneratingId === row.id}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition disabled:opacity-40"
            >
              {regeneratingId === row.id
                ? <Loader2 size={13} className="animate-spin" />
                : <RefreshCw size={13} />
              }
            </button>
          </div>
        );

      case "contact":
        return (
          <div className="flex flex-col gap-0.5">
            <p className="text-sm text-slate-700 font-medium">{row.contactName}</p>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Phone size={11} /> {row.contactPhone}
            </div>
          </div>
        );

      case "members":
        return (
          <BusinessAccountDialog mode="edit" business={row} onSuccess={loadBusinesses}>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#7F50F4] transition">
              <Users size={13} /> View members
            </button>
          </BusinessAccountDialog>
        );

      case "status":
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            row.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}>
            {row.isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        );

      case "actions":
        return (
          <div className="flex items-center gap-2">
            <BusinessAccountDialog mode="edit" business={row} onSuccess={loadBusinesses}>
              <button className="text-slate-400 hover:text-[#7F50F4] transition" title="Edit">
                <Pencil size={15} />
              </button>
            </BusinessAccountDialog>

            <button
              onClick={() => handleDuplicate(row)}
              disabled={duplicatingId === row.id}
              title="Duplicate business"
              className="text-slate-400 hover:text-blue-500 transition disabled:opacity-40"
            >
              {duplicatingId === row.id
                ? <Loader2 size={15} className="animate-spin" />
                : <CopyPlusIcon size={15} />
              }
            </button>

            <ConfirmActionDialog
              title="Delete Business"
              description={`Delete "${row.name}"? All members will be unlinked and this cannot be undone.`}
              confirmLabel="Delete"
              onConfirm={() => handleDelete(row)}
            >
              <button className="text-slate-400 hover:text-red-500 transition" title="Delete">
                <Trash2 size={15} />
              </button>
            </ConfirmActionDialog>
          </div>
        );

      default: return "—";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex flex-col pt-16 pl-60 min-h-screen">

        {/* Top bar */}
        <section className="flex items-center justify-between px-8 py-4 border-b border-slate-100">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Business Accounts</h2>
            <p className="text-sm text-slate-500">Manage business partners and their custom price catalogs</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm w-64">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search by name..."
                className="bg-transparent outline-none text-xs text-slate-600 placeholder:text-slate-400 w-full"
              />
            </div>
            <BusinessAccountDialog mode="add" onSuccess={loadBusinesses}>
              <button className="flex gap-2 items-center bg-[#7F50F4] px-5 py-2.5 text-white text-sm font-bold rounded-xl hover:bg-[#6B3FD4] transition shadow-md">
                <Plus size={15} /> Add Business
              </button>
            </BusinessAccountDialog>
          </div>
        </section>

        {/* Filter bar */}
        <section className="flex items-center gap-3 px-8 py-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
          </div>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex bg-slate-50 border border-slate-100 shadow-inner items-center gap-1 rounded-lg p-1">
            {STATUS_FILTERS.map((label) => (
              <button
                key={label}
                onClick={() => { setStatusFilter(label); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  statusFilter === label
                    ? "bg-white shadow text-slate-800 border border-slate-200"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  statusFilter === label ? "bg-slate-100 text-slate-600" : "bg-slate-200 text-slate-400"
                }`}>
                  {counts[label as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Table */}
        <section className="px-8 py-6">
          {loading ? (
            <TableSkeleton tableHeadings={businessHeadings} />
          ) : (
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  {businessHeadings.map((h) => (
                    <th key={h.id} className="px-5 py-3 text-left text-sm font-bold text-slate-500 first:rounded-tl-lg last:rounded-tr-lg">
                      {h.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={businessHeadings.length} className="px-5 py-12 text-center text-sm text-slate-500">
                      No businesses found
                    </td>
                  </tr>
                ) : (
                  paginated.map((row, i) => (
                    <tr key={row.id ?? i} className="hover:bg-slate-50 transition-colors">
                      {businessHeadings.map((h) => (
                        <td key={h.id} className="px-5 py-3 text-sm text-slate-700">
                          {renderCellContent(h, row)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-200/50">
                <tr>
                  <td colSpan={businessHeadings.length} className="px-6 py-3 rounded-b-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">
                        Showing <b>{rangeStart}</b>–<b>{rangeEnd}</b> of <b>{filtered.length}</b> businesses
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage <= 1}
                          className="p-1 rounded hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          <ChevronLeft className="h-4 w-4 text-slate-700" />
                        </button>
                        <span className="text-sm text-slate-600 px-1">
                          Page {currentPage} of {Math.max(1, totalPages)}
                        </span>
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage >= totalPages}
                          className="p-1 rounded hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          <ChevronRight className="h-4 w-4 text-slate-700" />
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