"use client";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { Banner } from "@/lib/models/banner.model";
import { deleteBanner, getBanners, updateBanner } from "@/lib/firebase/banner";
import { deleteImage } from "@/lib/utils";
import { useToast } from "@/lib/providers/ToastProvider";
import ConfirmActionDialog from "@/components/ConfirmActionDialog";
import BannerDialog from "@/components/banners/BannerDialog";
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import { TableHeading } from "@/lib/types";

const bannerHeadings: TableHeading[] = [
  { id: "order",   title: "ORDER"   },
  { id: "image",   title: "IMAGE"   },
  { id: "title",   title: "TITLE"   },
  { id: "action",  title: "ACTION"  },
  { id: "dates",   title: "DATES"   },
  { id: "active",  title: "ACTIVE"  },
  { id: "actions", title: "ACTIONS" },
];

function fmtTimestamp(ts: { seconds: number } | null | undefined) {
  if (!ts) return "—";
  return new Date(ts.seconds * 1000).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function Banners() {
  const [banners,    setBanners]    = useState<Banner[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await getBanners();
      setBanners(data);
    } catch (e) {
      console.error("Failed to fetch banners:", e);
      showToast("Failed to load banners", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleToggleActive = async (banner: Banner) => {
    setTogglingId(banner.id);
    try {
      await updateBanner(banner.id, { isActive: !banner.isActive });
      setBanners((prev) =>
        prev.map((b) => b.id === banner.id ? { ...b, isActive: !b.isActive } : b)
      );
    } catch (e) {
      console.error("Toggle failed:", e);
      showToast("Failed to update banner status", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (banner: Banner) => {
    try {
      if (banner.imageUrl) {
        try { await deleteImage(banner.imageUrl); } catch { /* non-fatal */ }
      }
      await deleteBanner(banner.id);
      showToast("Banner deleted", "error");
      await fetchBanners();
    } catch (e) {
      console.error("Delete failed:", e);
      showToast("Failed to delete banner", "error");
    }
  };

  const renderCell = (heading: TableHeading, row: Banner) => {
    switch (heading.id) {

      case "order":
        return (
          <div className="flex items-center gap-2 text-slate-400">
            <GripVertical size={14} className="shrink-0" />
            <span className="text-sm font-bold text-slate-700">{row.sortOrder}</span>
          </div>
        );

      case "image":
        return row.imageUrl ? (
          <img
            src={row.imageUrl}
            alt={row.title ?? "Banner"}
            className="w-28 h-14 object-cover rounded-xl border border-slate-100"
          />
        ) : (
          <div className="w-28 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-medium">
            No image
          </div>
        );

      case "title":
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-slate-700 text-sm">
              {row.title || <span className="text-slate-300 italic">Untitled</span>}
            </span>
            <span className="text-[10px] text-slate-400">ID: {row.id.slice(-6)}</span>
          </div>
        );

      case "action":
        return (
          <div className="flex flex-col gap-0.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit ${
              row.actionType === "url"    ? "bg-blue-50 text-blue-600"   :
              row.actionType === "offers" ? "bg-amber-50 text-amber-600" :
              "bg-slate-100 text-slate-400"
            }`}>
              {row.actionType === "url"    ? "URL"       :
               row.actionType === "offers" ? "Offers"    :
               "No action"}
            </span>
            {row.actionType === "url" && row.actionValue && (
              <span className="text-[10px] text-slate-400 truncate max-w-40">{row.actionValue}</span>
            )}
          </div>
        );

      case "dates":
        return (
          <div className="flex flex-col gap-0.5 text-xs text-slate-500">
            <span>From: {fmtTimestamp(row.startDate as any)}</span>
            <span>To: {fmtTimestamp(row.endDate as any)}</span>
          </div>
        );

      case "active":
        return (
          <Switch
            checked={row.isActive}
            disabled={togglingId === row.id}
            onCheckedChange={() => handleToggleActive(row)}
            className="cursor-pointer data-[state=checked]:bg-purple-600!"
          />
        );

      case "actions":
        return (
          <div className="flex items-center gap-3">
            <BannerDialog mode="edit" banner={row} onSuccess={fetchBanners}>
              <button className="text-slate-500 hover:text-indigo-600">
              <Pencil size={16} />
            </button>
            </BannerDialog>

            <ConfirmActionDialog
              title="Delete Banner"
              description={`Delete "${row.title || "this banner"}"? The image will also be permanently removed.`}
              confirmLabel="Delete"
              onConfirm={() => handleDelete(row)}
            >
             <button className="text-red-500 hover:text-red-600 cursor-pointer">
              <Trash2 size={16} />
            </button>
            </ConfirmActionDialog>
          </div>
        );

      default:
        return "—";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex flex-col pt-16 pl-60 min-h-screen">

        {/* Top bar */}
        <section className="flex justify-between items-center px-8 py-5 border-b border-slate-100">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Banners</h2>
            <p className="text-sm text-slate-500">
              Manage app banners · {banners.filter(b => b.isActive).length} active of {banners.length}
            </p>
          </div>
          <BannerDialog onSuccess={fetchBanners}>
            <button className="flex gap-2 items-center bg-[#7F50F4] px-5 py-2.5 text-white text-sm font-bold rounded-xl hover:bg-[#6B3FD4] transition shadow-md">
              + Add Banner
            </button>
          </BannerDialog>
        </section>

        {/* Preview strip — active banners shown in sortOrder sequence */}
        {!loading && banners.filter(b => b.isActive).length > 0 && (
          <section className="px-8 py-4 border-b border-slate-100 bg-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Active Preview — as seen in app
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[...banners]
                .filter(b => b.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map(b => (
                  <img
                    key={b.id}
                    src={b.imageUrl}
                    alt={b.title ?? "Banner"}
                    className="h-20 w-auto rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                ))}
            </div>
          </section>
        )}

        {/* Table */}
        <section className="px-8 py-6">
          {loading ? (
            <TableSkeleton tableHeadings={bannerHeadings} />
          ) : (
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  {bannerHeadings.map(h => (
                    <th key={h.id} className="px-6 py-4 text-left text-sm font-bold text-slate-500 first:rounded-tl-lg last:rounded-tr-lg">
                      {h.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {banners.length === 0 ? (
                  <tr>
                    <td colSpan={bannerHeadings.length} className="px-6 py-12 text-center text-sm text-slate-400">
                      No banners yet — add your first one above
                    </td>
                  </tr>
                ) : (
                  banners.map((row, i) => (
                    <tr key={row.id ?? i} className="hover:bg-slate-50 transition-colors">
                      {bannerHeadings.map(h => (
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
                  <td colSpan={bannerHeadings.length} className="px-6 py-3 rounded-b-lg">
                    <span className="text-sm text-slate-600">
                      {banners.length} banner{banners.length !== 1 ? "s" : ""} total ·{" "}
                      {banners.filter(b => b.isActive).length} active
                    </span>
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