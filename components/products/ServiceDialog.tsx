"use client";

import React, { useEffect, useState } from "react";
import { X, Tag, Loader2, SaudiRiyal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { createService, updateService } from "@/lib/firebase/product";
import { Service } from "@/lib/models/product.model";
import { useToast } from "@/lib/providers/ToastProvider";

interface ServiceDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;

  mode?: "add" | "edit";
  service?: Service;
}

export default function ServiceDialog({
  children,
  onSuccess,
  mode = "add",
  service,
}: ServiceDialogProps) {

  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [description, setDescription] = useState("");
  const [arabicDescription, setArabicDescription] = useState("");

  const [price, setPrice] = useState<string>("");

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {showToast} = useToast();

  //prefill

  useEffect(() => {
    if (mode === "edit" && service) {
      setName(service.name || "");
      setArabicName(service.arabicName || "");
      setDescription(service.description || "");
      setArabicDescription(service.arabicDescription || "");
      setPrice(service.price?.toString() || "");
      setTags(service.searchTerms || []);
    }
  }, [mode, service]);

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

  const removeTag = (tag: string) =>
    setTags((prev) => prev.filter((t) => t !== tag));

  //reset

  const resetForm = () => {
    setName("");
    setArabicName("");
    setDescription("");
    setArabicDescription("");
    setPrice("");
    setTags([]);
    setTagInput("");
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    resetForm();
    setOpen(false);
  };

//  submit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {

      const payload = {
        name,
        arabicName,
        description: description.trim(),
        arabicDescription: arabicDescription.trim(),
        price: parseFloat(price),
        searchTerms: tags,
      };

      if (mode === "edit" && service) {

        await updateService(service.id, payload);

        

      } else {

        await createService(payload);

        // setSuccess(`Service: ${name} created successfully.`);
        

      }

      onSuccess?.();
      handleClose();
      showToast(`Service: ${name} ${mode === "edit" ? "updated" : "created"} successfully.`, "success");

    } catch (err) {
      console.error("Save service failed:", err);
      setError("Failed to save service. Please try again.");
    } finally {
    
      setLoading(false);
    }
  };

  // shared styles

  const labelClass =
    "text-xs font-semibold text-slate-500 uppercase tracking-wide";

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 shadow-inner text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all";


  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="p-0 gap-0 border-0 overflow-hidden w-full max-w-lg rounded-2xl shadow-2xl bg-white">

        <DialogHeader className="sr-only">
          <DialogTitle>Service</DialogTitle>
        </DialogHeader>

        {/* Header */}

        <div className="flex items-center justify-between px-6 py-2 bg-slate-50 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">
            {mode === "edit" ? "Edit Service" : "Add Service"}
          </h2>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Form */}

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

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

          {/* Name + Arabic Name */}

          <div className="grid grid-cols-2 gap-4">

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Name (English)</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dry Cleaning"
                required
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Arabic Name</label>
              <input
                value={arabicName}
                onChange={(e) => setArabicName(e.target.value)}
                placeholder="مثال: تنظيف جاف"
                required
                dir="rtl"
                className={inputClass}
              />
            </div>

          </div>

          {/* Search Terms */}

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
                    className="ml-0.5 hover:text-cyan-900"
                  >
                    <X size={10} strokeWidth={2.5} />
                  </button>
                </span>
              ))}

              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => tagInput.trim() && addTag(tagInput)}
                placeholder={tags.length === 0 ? "Type and press Enter or comma…" : ""}
                className="flex-1 min-w-30 bg-transparent outline-none text-sm"
              />

            </div>

            <p className="text-[11px] text-slate-400">
              Separate terms with comma or Enter
            </p>

          </div>

          {/* Description */}

          <div className="grid grid-cols-2 gap-4">

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Description</label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Arabic Description</label>

              <textarea
                value={arabicDescription}
                onChange={(e) => setArabicDescription(e.target.value)}
                rows={3}
                dir="rtl"
                className={`${inputClass} resize-none`}
              />
            </div>

          </div>

          {/* Price */}

          <div className="flex flex-col gap-1.5">

            <label className={labelClass}>Base Price</label>

            <div className="flex items-center bg-slate-50 border border-slate-200 shadow-inner rounded-lg px-3 focus-within:ring-2 focus-within:ring-cyan-500/20 focus-within:border-cyan-400">

              <SaudiRiyal size={15} className="text-slate-400 mr-1" />

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
                className="flex-1 py-2.5 bg-transparent outline-none text-sm"
              />

              <span className="text-xs text-slate-400">SAR</span>

            </div>

          </div>

          {/* Footer */}

          <div className="flex items-center justify-end gap-3 pt-1 border-t border-slate-100 mt-1">

            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-linear-to-r from-cyan-500 to-blue-500 rounded-lg hover:opacity-90 transition shadow-sm disabled:opacity-60 flex items-center gap-2"
            >

              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving…
                </>
              ) : mode === "edit" ? (
                "Save Changes"
              ) : (
                "Add Service"
              )}

            </button>

          </div>

        </form>

      </DialogContent>
    </Dialog>
  );
}