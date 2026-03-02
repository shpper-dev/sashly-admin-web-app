"use client"

import React, { useRef, useState } from "react"
import { Camera, Filter, ListFilter, UploadCloud, X } from "lucide-react"

export default function UsersPhotos() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [customerPhotos] = useState<string[]>([]) // populate from backend later
  const [orderPhotos, setOrderPhotos] = useState<string[]>([])

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
    setOrderPhotos((prev) => [...prev, ...newImages])
  }

  const removeOrderPhoto = (index: number) => {
    setOrderPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="bg-white p-6 space-y-8 overflow-y-auto h-full">

      {/* ── Upload Section ── */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-3">
          Upload New Evidence
        </h3>

        <div className="flex gap-4">
          {/* Use Camera */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-44 h-30 rounded-xl border-2 border-dashed border-sky-200 bg-slate-50 flex flex-col items-center justify-center gap-2 hover:bg-sky-50 hover:border-sky-300 transition-colors shrink-0"
          >
            <Camera className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-semibold text-slate-600">Use Camera</span>
          </button>

          {/* Drag & Drop */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              handleFiles(e.dataTransfer.files)
            }}
            className="flex-1 h-30 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center gap-3 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-colors"
          >
            <UploadCloud className="w-5 h-5 text-slate-400 shrink-0" />
            <div className="text-center">
              <p className="text-xs text-slate-600">
                Drag & Drop photos here, or{" "}
                <span className="text-sky-500 font-semibold">browse files</span>
              </p>
              <span className="text-[10px] text-slate-400">JPG, PNG up to 10MB</span>
            </div>
          </div>
        </div>

        {/* Hidden file input — uploads go to Order Evidence */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* ── Customer Photos ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase">
            Customer Photos
          </h3>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 rounded-full text-slate-500">
            {customerPhotos.length} Files
          </span>
        </div>

        {customerPhotos.length === 0 ? (
          <p className="text-xs text-slate-300 italic">No customer photos yet</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {customerPhotos.map((src, i) => (
              <div key={i} className="w-30 h-30 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                <img src={src} alt="customer" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Orders Evidence Photos ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase">
            Orders Evidence Photos
          </h3>
          <div className="flex items-center gap-2">
            <ListFilter className="h-4 w-4 text-slate-400" strokeWidth={3} />
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 rounded-full text-slate-500">
            {orderPhotos.length} Files
          </span>
          </div>
        </div>

        {orderPhotos.length === 0 ? (
          <p className="text-xs text-slate-300 italic">No evidence photos yet — upload above</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {orderPhotos.map((src, i) => (
              <div key={i} className="relative w-35 h-35 rounded-xl overflow-hidden shadow-sm border border-slate-100 group">
                <img src={src} alt="evidence" className="w-full h-full object-cover" />
                {/* Remove button */}
                <button
                  onClick={() => removeOrderPhoto(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}