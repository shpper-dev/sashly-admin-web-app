"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Banner } from "@/lib/models/banner.model";
import { createBanner, updateBanner } from "@/lib/firebase/banner";
import { deleteImage, uploadImage } from "@/lib/utils";
import { useToast } from "@/lib/providers/ToastProvider";
import { Timestamp } from "firebase/firestore";

interface BannerDialogProps {
  children: React.ReactNode;
  mode?: "add" | "edit";
  banner?: Banner;
  onSuccess?: () => void;
}

// Empty form shape — mirrors Banner model fields the admin can edit
interface BannerForm {
  title: string;
  isActive: boolean;
  sortOrder: string;               // string for <input type="number">
  actionType: "none" | "url" | "offers";
  actionValue: string;
  startDate: string;               // ISO date string for <input type="date">
  endDate: string;
}

const EMPTY_FORM: BannerForm = {
  title: "",
  isActive: true,
  sortOrder: "0",
  actionType: "none",
  actionValue: "",
  startDate: "",
  endDate: "",
};

function bannerToForm(b: Banner): BannerForm {
  return {
    title:       b.title ?? "",
    isActive:    b.isActive,
    sortOrder:   String(b.sortOrder),
    actionType:  b.actionType,
    actionValue: b.actionValue ?? "",
    startDate:   b.startDate ? new Date(b.startDate.seconds * 1000).toISOString().split("T")[0] : "",
    endDate:     b.endDate   ? new Date(b.endDate.seconds   * 1000).toISOString().split("T")[0] : "",
  };
}

function formToBanner(f: BannerForm, imageUrl: string): Omit<Banner, "id" | "createdAt"> {
  return {
    title:       f.title || null,
    isActive:    f.isActive,
    sortOrder:   parseInt(f.sortOrder) || 0,
    actionType:  f.actionType,
    actionValue: f.actionType === "url" ? f.actionValue : null,
    imageUrl,
    startDate:   f.startDate ? Timestamp.fromDate(new Date(f.startDate)) : null,
    endDate:     f.endDate   ? Timestamp.fromDate(new Date(f.endDate))   : null,
  };
}

export default function BannerDialog({
  children,
  mode = "add",
  banner,
  onSuccess,
}: BannerDialogProps) {
  const isEdit = mode === "edit";

  const [open,         setOpen]         = useState(false);
  const [form,         setForm]         = useState<BannerForm>(isEdit && banner ? bannerToForm(banner) : EMPTY_FORM);
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const fileInputRef                    = useRef<HTMLInputElement>(null);
  const { showToast }                   = useToast();

  // Re-seed form when the banner prop changes (e.g. table row data updates)
  useEffect(() => {
    if (isEdit && banner) {
      setForm(bannerToForm(banner));
      setImagePreview(banner.imageUrl ?? null);
    }
  }, [banner]);

  const set = <K extends keyof BannerForm>(k: K, v: BannerForm[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageRemoved(false);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(true);
  };

  const handleClose = () => {
    setForm(isEdit && banner ? bannerToForm(banner) : EMPTY_FORM);
    setImageFile(null);
    setImagePreview(isEdit && banner ? (banner.imageUrl ?? null) : null);
    setImageRemoved(false);
    setError(null);
    setOpen(false);
  };

  const handleSave = async () => {
    // Image is required for new banners; edit can keep the existing URL
    if (!isEdit && !imageFile) {
      setError("Please upload a banner image.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      let finalImageUrl = isEdit ? (banner?.imageUrl ?? "") : "";

      if (imageFile) {
        // Delete old image before uploading replacement
        if (isEdit && banner?.imageUrl) {
          try { await deleteImage(banner.imageUrl); } catch { /* non-fatal */ }
        }
        finalImageUrl = await uploadImage(imageFile, "banners");
      } else if (imageRemoved && isEdit && banner?.imageUrl) {
        // Admin explicitly removed without replacing
        try { await deleteImage(banner.imageUrl); } catch { /* non-fatal */ }
        finalImageUrl = "";
      }

      const payload = formToBanner(form, finalImageUrl);

      if (isEdit && banner) {
        await updateBanner(banner.id, payload);
        showToast("Banner updated successfully", "success");
      } else {
        await createBanner(payload);
        showToast("Banner created successfully", "success");
      }

      onSuccess?.();
      handleClose();
    } catch (e: any) {
      console.error("Banner save failed:", e);
      setError("Failed to save banner. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-widest";
  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7F50F4]/30 focus:border-[#7F50F4]/40 transition";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="p-0 gap-0 border-0 overflow-hidden w-full max-w-xl rounded-2xl shadow-2xl bg-white">
        <DialogHeader className="sr-only">
          <DialogTitle>{isEdit ? "Edit" : "Add"} Banner</DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">
            {isEdit ? "Edit Banner" : "Add Banner"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[75vh]">

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Banner Image */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Banner Image</label>
            <p className="text-[11px] text-slate-400 -mt-0.5">
              Recommended: ~1000×440px (16:7 ratio), JPEG/PNG
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 group">
                <img
                  src={imagePreview}
                  alt="Banner preview"
                  className="w-full h-36 object-cover"
                />
                {/* Overlay  */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 transition"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-36 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-[#7F50F4] hover:bg-purple-50/30 transition group"
              >
                <ImagePlus size={24} className="text-slate-300 group-hover:text-[#7F50F4] transition" />
                <span className="text-xs text-slate-400 group-hover:text-[#7F50F4] transition font-medium">
                  Click to upload banner image
                </span>
              </button>
            )}
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Title (Optional)</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Summer Sale"
              className={inputClass}
            />
          </div>

          {/* Sort Order + Active toggle */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Sort Order</label>
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", e.target.value)}
                placeholder="0"
                className={inputClass}
              />
              <p className="text-[11px] text-slate-400">Lower = shown first</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Active</label>
              <div className="flex items-center h-10 gap-3">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => set("isActive", v)}
                  className="cursor-pointer data-[state=checked]:bg-purple-600!"
                />
                <span className={`text-sm font-semibold ${form.isActive ? "text-green-600" : "text-slate-400"}`}>
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Type */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Tap Action</label>
            <Select value={form.actionType} onValueChange={(v) => set("actionType", v as BannerForm["actionType"])}>
              <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm h-10 focus:ring-2 focus:ring-[#7F50F4]/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="none">No action</SelectItem>
                <SelectItem value="url">Open URL</SelectItem>
                <SelectItem value="offers">Go to Offers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Value — only shown when actionType is "url" */}
          {form.actionType === "url" && (
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>URL</label>
              <input
                type="url"
                value={form.actionValue}
                onChange={(e) => set("actionValue", e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          )}

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Start Date (Optional)</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>End Date (Optional)</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 text-sm font-bold text-white bg-[#7F50F4] hover:bg-[#6B3FD4] rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
              : isEdit ? "Save Changes" : "Add Banner"
            }
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}