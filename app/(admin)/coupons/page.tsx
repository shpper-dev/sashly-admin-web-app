"use client";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Tag, BarChart3, Percent, Search, SlidersHorizontal,
} from "lucide-react";
import { Coupon } from "@/lib/models/coupon.model";
import { getCoupons, deleteCoupon } from "@/lib/firebase/coupon";
import { TableHeading } from "@/lib/types";
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import { PencilLine, Trash2 } from "lucide-react";
import DeleteCouponDialog from "@/components/coupons/DeleteCouponDialog";
import { useToast } from "@/lib/providers/ToastProvider";
import CouponDialog from "@/components/coupons/CouponDialog";
import { couponHeadings } from "@/constants/headings";

export default function CouponsPage() {
  const [loading, setLoading]           = useState(false);
  const [coupons, setCoupons]           = useState<Coupon[]>([]);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all");
  const [currentPage, setCurrentPage]   = useState(1);

  // toast
  const {showToast} = useToast();
  const pageSize = 10;

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const rows = await getCoupons();
      setCoupons(rows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  // Client-side filter + search 
  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch  = c.code.toLowerCase().includes(search.toLowerCase());
    const isExpired      = Date.now() > c.endDate;
    const matchesStatus  =
      statusFilter === "all" ||
      (statusFilter === "active"  && c.isActive && !isExpired) ||
      (statusFilter === "expired" && isExpired);
    return matchesSearch && matchesStatus;
  });

  //  Pagination (trying out client side pagination)
  const totalPages       = Math.ceil(filteredCoupons.length / pageSize);
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  //  Stats
  const activeCoupons    = coupons.filter((c) => c.isActive && Date.now() < c.endDate).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
  const totalDiscount    = coupons.reduce((sum, c) =>
    c.discountType === "fixed" ? sum + c.discountValue * (c.usageCount || 0) : sum, 0
  );

  //Cell renderer
  const renderCell = (heading: TableHeading, row: Coupon) => {
    switch (heading.id) {
      case "code":
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <Tag className="h-4 w-4 text-purple-600" />
            </div>
            <span className="font-bold text-slate-800 tracking-wide">{row.code}</span>
          </div>
        );

      case "discount":
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800">
              {row.discountType === "percentage" ? `${row.discountValue}% OFF` : `SAR ${row.discountValue}`}
            </span>
            <span className="text-[10px] text-slate-400 uppercase">{row.discountType}</span>
          </div>
        );

      case "usage": {
        const percent = row.maxUsage
          ? Math.min((row.usageCount / row.maxUsage) * 100, 100)
          : 0;
        return (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-500">
              {row.usageCount} / {row.maxUsage ?? "∞"}
            </span>
            {row.maxUsage && (
              <div className="w-24 h-1.5 bg-slate-100 rounded-full">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    percent === 100 ? "bg-red-400" : percent > 80 ? "bg-orange-400" : "bg-[#7F50F4]"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            )}
          </div>
        );
      }

      case "dates":
        return (
          <span className="text-sm text-slate-600">
            {new Date(row.endDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        );

      case "status": {
        const expired = Date.now() > row.endDate;
        return expired ? (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-400">EXPIRED</span>
        ) : row.isActive ? (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">ACTIVE</span>
        ) : (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-600">PAUSED</span>
        );
      }

      case "in_app":{
        return <span className="text-sm text-slate-600">{row.isAppPromotion ? "Yes": "No"}</span>
      }

      case "actions":
        return (
          <div className="flex items-center gap-2 justify-end">
            <CouponDialog coupon={row} onSuccess={fetchCoupons} mode="edit" >
              <button className="p-2 bg-[#02d0ff] hover:bg-[#73def7] rounded-md transition-colors cursor-pointer">
                <PencilLine className="w-4 h-3.5 text-white" />
              </button>
            </CouponDialog>
            <DeleteCouponDialog
              couponCode={row.code}
              onConfirm={() => deleteCoupon(row.id)}
              onSuccess={() => { showToast(`Deleted ${row.code}`, "error"); fetchCoupons(); }}
            >
              <button className="p-2 bg-red-50 rounded-md transition-colors cursor-pointer">
                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
              </button>
            </DeleteCouponDialog>
          </div>
        );

      default: return "—";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="flex flex-col pt-14 pl-60 min-h-screen">

        {/* Page header  */}
        <section className="flex items-center justify-between px-8 py-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Promotions</h1>
            <p className="text-sm text-slate-500">Create and manage your promo codes and coupons</p>
          </div>
          <CouponDialog onSuccess={fetchCoupons} mode="add">
            <button className="flex items-center gap-2 bg-[#02D0FF] hover:bg-[#00b8e0] text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors">
              <Plus className="h-4 w-4" /> Add Coupon
            </button>
          </CouponDialog>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-6 px-16 py-5">
          <StatCard title="Active Coupons"      value={String(activeCoupons)}               icon={<Percent className="h-5 w-5" />}  />
          <StatCard title="Total Redemptions"   value={String(totalRedemptions)}            icon={<BarChart3 className="h-5 w-5" />} />
          <StatCard title="Total Discount (SAR)" value={totalDiscount.toLocaleString()}     icon={<Tag className="h-5 w-5" />}       />
        </section>

        {/* Search + filter row */}
        <section className="flex items-center justify-between px-8 py-3">
          {/* Status filter pills */}
          <div className="flex bg-slate-50 border border-slate-100 shadow-inner items-center gap-1 rounded-lg p-1">
            {(["all", "active", "expired"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setStatusFilter(f); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize ${
                  statusFilter === f
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm w-64">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search coupon code..."
              className="bg-transparent outline-none text-xs text-slate-600 placeholder:text-slate-400 w-full"
            />
          </div>
        </section>

        {/* Table */}
        <section className="px-8 pb-8">
          {loading ? (
            <TableSkeleton tableHeadings={couponHeadings} />
          ) : (
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  {couponHeadings.map((h) => (
                    <th key={h.id} className="px-6 py-4 text-left text-xs font-bold text-slate-500 first:rounded-tl-lg last:rounded-tr-lg">
                      {h.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {paginatedCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={couponHeadings.length} className="px-6 py-12 text-center text-sm text-slate-400">
                      No coupons found
                    </td>
                  </tr>
                ) : (
                  paginatedCoupons.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      {couponHeadings.map((h) => (
                        <td key={h.id} className="px-6 py-4 text-sm text-slate-700">
                          {renderCell(h, row)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-200/50">
                <tr>
                  <td colSpan={couponHeadings.length} className="px-6 py-3 rounded-b-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">
                        Showing{" "}
                        <b>{filteredCoupons.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</b>
                        {" "}–{" "}
                        <b>{Math.min(currentPage * pageSize, filteredCoupons.length)}</b>
                        {" "}of <b>{filteredCoupons.length}</b> coupons
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage((p) => p - 1)}
                          disabled={currentPage === 1}
                          className="p-1 rounded hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4 text-slate-700" />
                        </button>
                        <span className="text-sm text-slate-600 px-1">
                          Page {currentPage}
                        </span>
                        <button
                          onClick={() => setCurrentPage((p) => p + 1)}
                          disabled={currentPage === totalPages || totalPages === 0}
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
          )}
        </section>
      </main>
    </div>
  );
}

//  Helpers 
function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-5 py-4 flex items-center justify-between shadow-sm">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm uppercase tracking-widest text-slate-400 font-bold">{title}</span>
        <span className="text-2xl font-bold text-slate-800">{value}</span>
      </div>
      <div className="w-10 h-10 bg-purple-50 text-[#7F50F4] flex items-center justify-center rounded-xl">
        {icon}
      </div>
    </div>
  );
}