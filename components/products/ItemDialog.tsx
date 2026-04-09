"use client";

import * as React from "react";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { Trash2, X, Tag, ChevronDown, Loader2, HelpCircle } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Category, Item, Service } from "@/lib/models/product.model";
import { createItem, updateItem } from "@/lib/firebase/product";
import { useToast } from "@/lib/providers/ToastProvider";

// types

interface SelectedService extends Service {
  overridePrice: string;
}

type Props =
  | { mode: "add";  item?: never;  children: React.ReactNode; onSuccess?: () => void }
  | { mode: "edit"; item: Item;    children: React.ReactNode; onSuccess?: () => void };




export default function ItemDialog({ mode, item, children, onSuccess }: Props) {
  const isEdit = mode === "edit";
  const fileRef = useRef<HTMLInputElement>(null);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);

  //  form state 
  const [name,               setName]               = useState(item?.name               ?? "");
  const [arabicName,         setArabicName]         = useState(item?.arabicName         ?? "");
  const [tagInput,           setTagInput]           = useState("");
  const [tags,               setTags]               = useState<string[]>(item?.searchTerms ?? []);
  const [description,        setDescription]        = useState(item?.description        ?? "");
  const [arabicDescription,  setArabicDescription]  = useState(item?.arabicDescription  ?? "");
  const [categoryId,         setCategoryId]         = useState(item?.categoryId         ?? "");
  const [preview,            setPreview]            = useState<string | null>(item?.photoUrl ?? null);
  const [photo,              setPhoto]              = useState<File | null>(null);
  const [selectedServices,   setSelectedServices]   = useState<SelectedService[]>(
    item?.services.map((s) => ({ ...s, overridePrice: String(s.price) })) ?? []
  );

  //  data state 
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [services,     setServices]     = useState<Service[]>([]);
  const [dataLoading,  setDataLoading]  = useState(false);

  //  ui state 
  const [open,          setOpen]          = useState(false);
  const [servicesOpen,  setServicesOpen]  = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");

  const { showToast } = useToast();

  //  fetch categories + services 
  useEffect(() => {
    // add mode: fetch once on mount. edit mode: fetch when dialog opens.
    if (mode === "edit" && !open) return;
    async function fetchData() {
      setDataLoading(true);
      try {
        const [catSnap, svcSnap] = await Promise.all([
          getDocs(collection(db, "Categories")),
          getDocs(collection(db, "Services")),
        ]);
        setCategories(catSnap.docs.map((d) => d.data() as Category));
        setServices(svcSnap.docs.map((d) => d.data() as Service));
      } catch (e) {
        console.error("Failed to fetch data:", e);
      } finally {
        setDataLoading(false);
      }
    }
    fetchData();
  }, [open]);

  //  re-sync when item prop changes (edit only) 
  useEffect(() => {
    if (!isEdit || !item) return;
    setName(item.name);
    setArabicName(item.arabicName);
    setTags(item.searchTerms);
    setDescription(item.description ?? "");
    setArabicDescription(item.arabicDescription ?? "");
    setCategoryId(item.categoryId);
    setPreview(item.photoUrl ?? null);
    setPhoto(null);
    setSelectedServices(item.services.map((s) => ({ ...s, overridePrice: String(s.price) })));
  }, [item]);

  //  close service dropdown on outside click 
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  //  reset 
  const resetForm = () => {
    if (isEdit && item) {
      setName(item.name);
      setArabicName(item.arabicName);
      setTags(item.searchTerms);
      setDescription(item.description ?? "");
      setArabicDescription(item.arabicDescription ?? "");
      setCategoryId(item.categoryId);
      setPreview(item.photoUrl ?? null);
      setPhoto(null);
      setSelectedServices(item.services.map((s) => ({ ...s, overridePrice: String(s.price) })));
    } else {
      setName(""); setArabicName(""); setTagInput(""); setTags([]);
      setDescription(""); setArabicDescription(""); setCategoryId("");
      setPreview(null); setPhoto(null); setSelectedServices([]);
      if (fileRef.current) fileRef.current.value = "";
    }
    setError("");
    setServicesOpen(false);
    setServiceSearch("");
  };

  //  tag helpers 
  const addTag = (raw: string) => {
    const newTags = raw.split(",").map((t) => t.trim().toLowerCase()).filter((t) => t && !tags.includes(t));
    if (newTags.length) setTags((p) => [...p, ...newTags]);
    setTagInput("");
  };
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
    if (e.key === "Backspace" && !tagInput && tags.length) setTags((p) => p.slice(0, -1));
  };
  const removeTag = (tag: string) => setTags((p) => p.filter((t) => t !== tag));

  //  photo helpers 
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };
  const removeImage = () => {
    setPreview(null);
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  //  service helpers 
  const toggleService = (svc: Service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === svc.id);
      if (exists) return prev.filter((s) => s.id !== svc.id);
      return [...prev, { ...svc, overridePrice: String(svc.price) }];
    });
  };
  const updateServicePrice = (id: string, value: string) => {
    setSelectedServices((prev) => prev.map((s) => s.id === id ? { ...s, overridePrice: value } : s));
  };
  const isServiceSelected = (id: string) => !!selectedServices.find((s) => s.id === id);

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  //  submit 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const servicesPayload = selectedServices.map(({ overridePrice, ...svc }) => ({
        ...svc,
        price: parseFloat(overridePrice) || svc.price,
      }));

      if (isEdit) {
        await updateItem(item.id, {
          name, arabicName, searchTerms: tags,
          description, arabicDescription, categoryId,
          photo,
          existingPhotoUrl: item.photoUrl,
          photoRemoved: !preview && !photo,
          selectedServices: servicesPayload,
        });
        showToast(`Item: ${name} updated successfully.`, "success");
      } else {
        await createItem({
          name, arabicName, searchTerms: tags,
          description: description.trim(),
          arabicDescription: arabicDescription.trim(),
          categoryId, photo,
          selectedServices: servicesPayload,
        });
        showToast(`Item: ${name} created successfully.`, "success");
      }

      onSuccess?.();
      setOpen(false);
      resetForm();
    } catch (err: any) {
      console.error(`${isEdit ? "Update" : "Create"} item failed:`, err);
      setError(`Failed to ${isEdit ? "update" : "create"} item. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) resetForm();
          setOpen(v);
        }}
      >
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent className="max-w-180! p-0 overflow-y-auto no-scrollbar rounded-3xl max-h-[calc(100vh-10px)]!">

          {/* Header */}
          <DialogHeader className="sticky top-0 px-6 py-3 bg-slate-50 border-b flex flex-row items-center justify-between z-10">
            <DialogTitle className="text-lg font-bold">
              {isEdit ? "Edit Item" : "Add New Item"}
            </DialogTitle>
            <DialogClose asChild>
              <button className="cursor-pointer" onClick={resetForm}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </DialogClose>
          </DialogHeader>

          {/* Body */}
          <form onSubmit={handleSubmit} className="bg-white px-8 pt-6 pb-2 space-y-5">

            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
            )}

            {/* Row 1 — Names */}
            <div className="grid grid-cols-2 gap-8">
              <FormInput label="NAME (ENGLISH)" placeholder="e.g. Shirt"   value={name}       onChange={setName}       required />
              <FormInput label="NAME (ARABIC)"  placeholder="مثال: قميص"   value={arabicName} onChange={setArabicName} dir="rtl" required />
            </div>

            {/* Row 2 — Category + Photo */}
            <div className="grid grid-cols-2 gap-8">
              {/* Category */}
              <div>
                <FormLabel text="CATEGORY" />
                <Select required value={categoryId} onValueChange={setCategoryId} disabled={dataLoading}>
                  <SelectTrigger className="mt-1 w-full bg-slate-50 border-slate-200 text-[12px] h-12! rounded-md focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400">
                    <SelectValue placeholder={dataLoading ? "Loading…" : "Select a category"} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="rounded-xl w-[--radix-select-trigger-width]">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-[12px] rounded-lg cursor-pointer">
                        <div className="flex flex-col">
                          <span>{cat.name}</span>
                          <span className="text-[10px] text-slate-400">{cat.arabicName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Photo */}
              <div>
                <div className="flex items-center gap-1.5">
                  <FormLabel text="PHOTO" />
                  <span className="text-[10px] text-slate-400">(optional)</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-16 h-16 rounded-xl border bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[9px] text-slate-400 text-center leading-tight px-1">No Image</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="bg-slate-200 px-3 py-2 rounded-lg text-purple-600 text-xs font-medium cursor-pointer shadow"
                    onClick={() => fileRef.current?.click()}
                  >
                    {preview ? "Change" : "Upload"}
                  </button>
                  {preview && (
                    <button type="button" onClick={removeImage} className="p-1.5 rounded-lg border hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>
              </div>
            </div>

            {/* Row 3 — Search Terms */}
            <div>
              <FormLabel text="SEARCH TERMS" />
              <div className="mt-1 min-h-10 flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-cyan-500/20 focus-within:border-cyan-400 transition-all">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-700 text-[10px] font-medium">
                    <Tag size={8} />
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 hover:text-cyan-900">
                      <X size={9} strokeWidth={2.5} />
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
                  className="flex-1 min-w-30 bg-transparent outline-none text-xs text-slate-700 placeholder:text-slate-400"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Separate with comma or Enter</p>
            </div>

            {/* Row 4 — Descriptions */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-1.5">
                  <FormLabel text="DESCRIPTION" />
                  <span className="text-[10px] text-slate-400">(optional)</span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description…"
                  rows={3}
                  className="mt-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 w-full text-[12px] resize-none outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <FormLabel text="ARABIC DESCRIPTION" />
                  <span className="text-[10px] text-slate-400">(optional)</span>
                </div>
                <textarea
                  value={arabicDescription}
                  onChange={(e) => setArabicDescription(e.target.value)}
                  placeholder="وصف مختصر…"
                  rows={3}
                  dir="rtl"
                  className="mt-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 w-full text-[12px] resize-none outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all"
                />
              </div>
            </div>

            {/* Row 5 — Services */}
            <div>
              <FormLabel text="SERVICES" />
              <div className="relative mt-1" ref={serviceDropdownRef}>
                {/* Trigger */}
                <button
                  type="button"
                  disabled={dataLoading}
                  onClick={() => setServicesOpen((p) => !p)}
                  className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-[12px] text-slate-600 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all"
                >
                  <span>
                    {dataLoading
                      ? "Loading services…"
                      : selectedServices.length === 0
                      ? "Select services…"
                      : `${selectedServices.length} service${selectedServices.length > 1 ? "s" : ""} selected`}
                  </span>
                  <ChevronDown size={14} className={cn("text-slate-400 shrink-0 transition-transform", servicesOpen && "rotate-180")} />
                </button>

                {/* Dropdown */}
                {servicesOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <input
                        type="text"
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        placeholder="Search services…"
                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all"
                      />
                    </div>
                    <ul className="max-h-44 overflow-y-auto">
                      {filteredServices.length === 0 ? (
                        <li className="px-4 py-3 text-xs text-slate-400 text-center">No services found</li>
                      ) : (
                        filteredServices.map((svc) => (
                          <li key={svc.id}>
                            <button
                              type="button"
                              onClick={() => toggleService(svc)}
                              className={cn(
                                "w-full flex items-center justify-between px-4 py-2.5 text-xs transition-colors",
                                isServiceSelected(svc.id) ? "bg-cyan-50 text-cyan-700" : "text-slate-700 hover:bg-slate-50"
                              )}
                            >
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{svc.name}</span>
                                <span className="text-[10px] text-slate-400">{svc.arabicName}</span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-slate-400 text-[11px]">SAR {svc.price}</span>
                                <div className={cn(
                                  "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                                  isServiceSelected(svc.id) ? "bg-cyan-500 border-cyan-500" : "border-slate-300"
                                )}>
                                  {isServiceSelected(svc.id) && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Selected services — price overrides */}
              {selectedServices.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {selectedServices.map((svc) => (
                    <div key={svc.id} className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-700">{svc.name}</span>
                        <span className="text-[10px] text-slate-400">{svc.arabicName}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide">Price</span>
                        <div className="flex items-center border border-slate-200 bg-white rounded-md px-2">
                          <span className="text-[10px] text-slate-400 mr-1">SAR</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={svc.overridePrice}
                            onChange={(e) => updateServicePrice(svc.id, e.target.value)}
                            className="w-20 py-1.5 text-xs outline-none bg-transparent text-slate-700"
                          />
                        </div>
                        <button type="button" onClick={() => toggleService(svc)} className="p-1 rounded hover:bg-red-50 transition-colors">
                          <X size={12} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 py-5 border-t flex justify-end gap-4 bg-white">
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer" onClick={resetForm}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit as any}
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-600 text-white cursor-pointer shadow-md shadow-cyan-200 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </span>
              ) : isEdit ? "Save Changes" : "Create Item"}
            </Button>
          </div>

        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

// helpers

function FormLabel({ text }: { text: string }) {
  return <label className="text-[10px] font-bold tracking-widest text-slate-600">{text}</label>;
}

function HelpTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="w-3 h-3 text-blue-700 cursor-pointer" />
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}

function FormInput({
  label, placeholder, tooltip, value, onChange, dir, required,
}: {
  label: string; placeholder?: string; tooltip?: string;
  value: string; onChange: (v: string) => void; dir?: string; required?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <FormLabel text={label} />
        {tooltip && <HelpTooltip text={tooltip} />}
      </div>
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
        required={required}
        className="mt-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 w-full text-[12px] outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all"
      />
    </div>
  );
}