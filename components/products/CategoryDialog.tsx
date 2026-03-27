"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, ImagePlus, Tag, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCategory, updateCategory } from "@/lib/firebase/product";
import { Category } from "@/lib/models/product.model";

interface CategoryDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;

  mode?: "add" | "edit";
  category?: Category;
}

export default function CategoryDialog({
  children,
  onSuccess,
  mode = "add",
  category,
}: CategoryDialogProps){
  const [open, setOpen]               = useState(false);
  const [name, setName]               = useState("");
  const [arabicName, setArabicName]   = useState("");
  const [tagInput, setTagInput]       = useState("");
  const [tags, setTags]               = useState<string[]>([]);
  const [photo, setPhoto]             = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");
  const fileInputRef                  = useRef<HTMLInputElement>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  useEffect(() => {
  if (mode === "edit" && category) {
    setName(category.name || "");
    setArabicName(category.arabicName || "");
    setTags(category.searchTerms || []);
    setPhotoPreview(category.photoUrl || null);
  }
}, [mode, category]);

  //tag helpers
  const addTag = (raw: string) => {
    const newTags = raw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t && !tags.includes(t));
    if (newTags.length) setTags((prev) => [...prev, ...newTags]);
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === "Backspace" && !tagInput && tags.length) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  //photo helpers
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  //reset
  const resetForm = () => {
    setName(""); setArabicName(""); setTagInput("");
    setTags([]); setPhoto(null); setPhotoPreview(null); 
    setPhotoRemoved(false); setError(""); setSuccess("");
  };

  const handleClose = () => { resetForm(); setOpen(false); };

  //  submit 
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setError("");
  setSuccess("");
  setLoading(true);

  try {

    if (mode === "edit" && category) {
      await updateCategory(category.id, {
        name,
        arabicName,
        searchTerms: tags,
        photo,
        existingPhotoUrl: category.photoUrl ?? null,
        photoRemoved,
      });

      setSuccess(`Category updated successfully.`);
    } 
    
    else {
      await createCategory({
        name,
        arabicName,
        searchTerms: tags,
        photo,
      });

      setSuccess(`Category: ${name} created successfully.`);
    }

    onSuccess?.();

    setTimeout(() => handleClose(), 1200);

  } catch (err: any) {
    console.error("Category save failed:", err);
    setError("Failed to save category. Please try again.");
  } finally {
    setLoading(false);
  }
};

  // shared styles 
  const labelClass = "text-xs font-semibold text-slate-500 uppercase tracking-wide";
  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 shadow-inner text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="p-0 gap-0 border-0 overflow-hidden w-full max-w-lg rounded-2xl shadow-2xl bg-white">
        <DialogHeader className="sr-only">
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">
             {mode === "edit" ? "Edit Category" : "Add Category"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

          {/* Error / Success */}
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
              {success}
            </div>
          )}

          {/* Name + Arabic Name side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Name (English)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Clothing"
                required
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Arabic Name</label>
              <input
                type="text"
                value={arabicName}
                onChange={(e) => setArabicName(e.target.value)}
                placeholder="مثال: قمصان"
                required
                dir="rtl"
                className={inputClass}
              />
            </div>
          </div>

          {/* Search Terms tag input */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Search Terms</label>
            <div className="min-h-11 flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 shadow-inner focus-within:ring-2 focus-within:ring-cyan-500/20 focus-within:border-cyan-400 transition-all">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-700 text-[11px] font-medium"
                >
                  <Tag size={9} />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 hover:text-cyan-900 transition-colors"
                  >
                    <X size={10} strokeWidth={2.5} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
                placeholder={tags.length === 0 ? "Type and press Enter or comma…" : ""}
                className="flex-1 min-w-30 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <p className="text-[11px] text-slate-400">Separate terms with comma or Enter</p>
          </div>

          {/* Photo upload */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Photo</label>
            <input
             ref={fileInputRef}
             type="file"
             accept="image/*"
             onChange={handlePhotoChange}
             className="hidden"
            />
        
          <div className="flex items-center gap-4">
            {/* Upload zone / Preview — left */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-30 h-30 shrink-0 flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-cyan-300 transition-all group overflow-hidden"
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <ImagePlus size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-500 transition-colors text-center leading-tight px-1">
                    Upload image
                  </span>
                </>
              )}
            </button>
        
            {/* File info — right of preview */}
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              {(photo || photoPreview) ? (
                <>
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {photo?.name || "Existing Image"}
                  </span>
                  {photo && (
                    <span className="text-[11px] text-slate-400">
                      {(photo.size / 1024).toFixed(1)} KB
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => { 
                      setPhoto(null); 
                      setPhotoPreview(null); 
                      setPhotoRemoved(true);
                    }}
                    className="self-start mt-1 text-[11px] font-medium text-red-400 hover:text-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <span className="text-xs text-slate-400">No file chosen</span>
              )}
            </div>
          </div>
        </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-1 border-t border-slate-100 mt-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-linear-to-r from-cyan-500 to-blue-500 rounded-lg hover:opacity-90 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving…
                </>
              ) : (
                mode === "edit" ? "Save Changes" : "Add Category"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}