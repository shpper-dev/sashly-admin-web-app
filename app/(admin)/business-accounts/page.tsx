"use client";
import Header from "@/components/Header";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft, ChevronRight, Download, Search, SlidersHorizontal,Phone, Star, Pencil, Trash2, Plus,
  Loader2,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { TableHeading } from "@/lib/types";
import ConfirmActionDialog from "@/components/ConfirmActionDialog";
import BusinessAccountDialog from "@/components/business/BusinessAccountDialog";
import { PricingDialog } from "@/components/business/PricingDialog";
import { Business } from "@/lib/models/business.model";
import { blockBusiness, getBusinesses, restoreBusiness } from "@/lib/firebase/business";

//  Constants 

const PAGE_SIZE = 5;

const businessHeadings: TableHeading[] = [
  { id: "name",        title: "BUSINESS"       },
  { id: "location",    title: "LOCATION"       },
  { id: "contact",     title: "CONTACT"        },
  { id: "rating",      title: "RATING"         },
  { id: "orders",      title: "TOTAL ORDERS"   },
  { id: "pricing",     title: "PRICING"        },
  { id: "status",      title: "STATUS"         },
  { id: "actions",     title: "ACTIONS"        },
];

const STATUS_FILTERS = ["All", "Active", "Suspended"] as const;

export default function BusinessAccounts() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm]       = useState("");
  const [statusFilter, setStatusFilter]   = useState<string>("All");
  const [cityFilter, setCityFilter]       = useState<string>("All");
  const [currentPage, setCurrentPage]     = useState(1);

  useEffect(() => {
  loadBusinesses();
}, []);

async function loadBusinesses() {
  try {
    setLoading(true);

    const rows = await getBusinesses();

    setBusinesses(rows);
  } catch (error) {
    console.error("Failed to load businesses", error);
  } finally {
    setLoading(false);
  }
}
  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term || (
        b.name.toLowerCase().includes(term) ||
        b.ownerName.toLowerCase().includes(term) ||
        b.email.toLowerCase().includes(term) ||
        b.address?.toLowerCase().includes(term)
      );
      const matchesStatus =
  statusFilter === "All" ||
  (statusFilter === "Active" && !b.isDeleted) ||
  (statusFilter === "Suspended" && b.isDeleted);
      
      return matchesSearch && matchesStatus;
    });
  }, [businesses,searchTerm, statusFilter]);

  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart  = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd    = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const counts = {
  All: businesses.length,
  Active: businesses.filter((b) => !b.isDeleted).length,
  Suspended: businesses.filter((b) => b.isDeleted).length,
};

  const renderCellContent = (heading: TableHeading, row: Business) => {
    switch (heading.id) {
      case "name": {
        const initials = row.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-linear-to-br from-indigo-100 to-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
              {row.logoUrl ? <img src={row.logoUrl} alt={row.name} className="w-full h-full object-cover" /> : initials}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{row.name}</p>
              <p className="text-xs text-slate-400">{row.arabicName}</p>
            </div>
          </div>
        );
      }
      case "location":
        return (
          <div className="flex items-start gap-1.5 text-sm text-slate-600">
            <div>
              <p className="font-medium">{row.address}</p>
              {/* <p className="text-xs text-slate-400">{row.city}</p> */}
            </div>
          </div>
        );
      case "contact":
        return (
          <div className="flex flex-col gap-0.5">
            <p className="text-sm text-slate-700">{row.email}</p>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Phone size={11} /> {row.phone}
            </div>
          </div>
        );
      case "rating":
        return (
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-slate-700">{row.rating ? row.rating.toFixed(1) : 0}</span>
          </div>
        );
      case "orders":
        return (
          <span className="text-sm font-semibold text-slate-700">
            {(row.totalOrders ?? 0).toLocaleString()}
          </span>
        );
      case "pricing":
        return <PricingDialog business={row} />;
      case "status": {
        const map = {
          active:    { label: "ACTIVE",    cls: "bg-green-100 text-green-700"  },
          suspended: { label: "SUSPENDED", cls: "bg-red-100 text-red-600"      },
          // pending:   { label: "PENDING",   cls: "bg-amber-100 text-amber-700"  },
        } as const;
        const s = map[row.isDeleted ? "suspended" : "active"];
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
            {s.label}
          </span>
        );
      }
      case "actions":
        return (
          <div className="flex items-center justify-end gap-3">
            <BusinessAccountDialog mode="edit" business={row} onSuccess={() => loadBusinesses()}>
              <button className="text-slate-500 hover:text-purple-600">
              <Pencil size={16} />
            </button>
            </BusinessAccountDialog>
            <ConfirmActionDialog
              title={row.isDeleted ? "Restore Business" : "Suspend Business"}
              description={
                row.isDeleted
                  ? `Restore "${row.name}"?`
                  : `Suspend "${row.name}"?`
              }
              confirmLabel={row.isDeleted ? "Restore" : "Suspend"}
              onConfirm={async () => {
                if (row.isDeleted) {
                  await restoreBusiness(row.id);
                } else {
                  await blockBusiness(row.id);
                }
              }}
              onSuccess={loadBusinesses}
            >
              <button
                className={`cursor-pointer ${
                  row.isDeleted
                    ? "text-green-600 hover:text-green-700"
                    : "text-red-500 hover:text-red-600"
                }`}
              >
                {!row.isDeleted ? (
                  <Trash2 size={16} />
                ):(
                  <ArchiveRestore size={16} />
                )}
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
        <section className="flex items-center justify-between px-8 py-3 border-b border-slate-100">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Business Accounts</h2>
            <p className="text-sm text-slate-500">Manage laundromat partners and their service pricing</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm w-72">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search by name, owner or area..."
                className="bg-transparent outline-none text-xs text-slate-600 placeholder:text-slate-400 w-full"
              />
            </div>
            {/* <button className="flex gap-2 items-center bg-white px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg shadow-sm">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button> */}
            <BusinessAccountDialog mode="add" onSuccess={() => loadBusinesses()}>
              <button className="flex gap-2 items-center bg-purple-600 px-5 py-2.5 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-purple-700 transition-colors">
                <Plus size={15} /> Add New Business
              </button>
            </BusinessAccountDialog>
          </div>
        </section>

        {/* Filter bar */}
        <section className="flex items-center gap-3 px-8 py-3 border-b border-slate-100 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider mr-1">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
          </div>

          <div className="h-5 w-px bg-slate-200" />

          {/* Status filter */}
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

          <div className="h-5 w-px bg-slate-200" />

          {/* City filter */}
          {/* <div className="flex items-center gap-2 flex-wrap">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => { setCityFilter(city); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  cityFilter === city
                    ? "bg-[#7F50F4] border-[#7F50F4] text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {city}
              </button>
            ))}
          </div> */}
        </section>

        {/* Table */}
        <section className="px-8 py-6">
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
                paginated.map((row, index) => (
                  <tr key={row.id ?? index} className="hover:bg-slate-50 transition-colors">
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
                        className="p-1 rounded hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4 text-slate-700" />
                      </button>
                      <span className="text-sm text-slate-600 px-1">Page {currentPage} of {Math.max(1, totalPages)}</span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="p-1 rounded hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="h-4 w-4 text-slate-700" />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </section>
      </main>
    </div>
  );
}