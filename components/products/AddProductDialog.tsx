"use client"

import * as React from "react"
import Image from "next/image"
import { useRef, useState } from "react"
import { Trash2, HelpCircle, X } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"


import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { Switch } from "../ui/switch"

interface Props {
  children: React.ReactNode
}

export default function AddProductDialog({ children }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const removeImage = () => {
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <TooltipProvider>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent className="max-w-180! p-0 overflow-y-auto no-scrollbar rounded-3xl max-h-[calc(100vh-10px)]!">
          {/* Header */}
          <DialogHeader className="fixed top-0 left-0 right-0 px-6 py-3 bg-slate-50 border-b flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-bold">
              Add New Product
            </DialogTitle>

            <DialogClose asChild>
              <button className="cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </DialogClose>
          </DialogHeader>

          {/* Body */}
          <div className="bg-white px-8 pt-18 space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-8">
              <FormInput
                label="PRODUCT NAME"
                placeholder="We'll sort it for you - نفرزها عنك"
              />
              <FormInput label="SECTION" />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-8">
              {/* Image Upload */}
              <div>
                <FormLabel text="BUTTON IMAGE" />

                <div className="flex items-center gap-4 mt-3">
                  <div className="w-20 h-20 rounded-2xl border bg-white flex items-center justify-center overflow-hidden">
                    {preview ? (
                      <Image
                        src={preview}
                        alt="Preview"
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No Image
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="bg-slate-200 px-3 py-2 rounded-lg text-purple-600 text-xs font-medium shadow"
                    onClick={() => fileRef.current?.click()}
                  >
                    Change Icon
                  </button>

                  {preview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={removeImage}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              <FormInput
                label="OVERLAY TEXT"
                tooltip="Text displayed over the product card"
              />
            </div>


            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-8">
              <FormInput
                label="PRODUCT TYPE"
                tooltip="Used for internal grouping"
              />
              <FormInput label="ACTIVE IN PRICE LISTS" />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-4 gap-6">
              <CurrencyInput label="PRICE" />
              <CurrencyInput
                label="EXPRESS PRICE"
                tooltip="Special fast delivery price"
              />
              <CurrencyInput
                label="COST PRICE"
                tooltip="Internal cost"
              />
              <CurrencyInput
                label="MINIMUM PRICE"
                tooltip="Minimum allowed selling price"
              />
            </div>

            {/* Numbers */}
            <div className="grid grid-cols-4 gap-6">
              <NumberInput label="MIN QUANTITY" tooltip="Minimum allowed" />
              <NumberInput label="PIECES / PRODUCT" tooltip="Pieces count" />
              <NumberInput label="EXTRA DAYS" tooltip="Additional processing" />
              <NumberInput label="ORDER" tooltip="Sorting order" />
            </div>

            {/* Row */}
            <div className="grid grid-cols-3 gap-8 items-end">
              <FormInput label="ID / SKU" placeholder="SKU-12345" />
              <FormInput label="SLOT SPACE" tooltip="Storage slot space" />

              <div className="flex items-center gap-3 pb-3">
                <Switch  />
                <span className="text-xs font-medium">Skip Conveyor</span>
                <HelpTooltip text="Disable conveyor automation" />
              </div>
            </div>

            {/* Select Cards */}
            <div className="grid grid-cols-3 gap-6">
              <SelectableCard label="Active" defaultActive />
              <SelectableCard label="Online" defaultActive />
              <SelectableCard label="Tax Exempt" />
            </div>
          </div>

          {/* Footer */}
          <div className="px-10 py-6 border-t flex justify-end gap-4 bg-white ">
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer">Cancel</Button>
            </DialogClose>

            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white cursor-pointer">
              Create Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

/* ---------- Reusable Components ---------- */

function FormLabel({ text }: { text: string }) {
  return (
    <label className="text-[10px] font-bold tracking-widest text-slate-600">
      {text}
    </label>
  )
}

function HelpTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="w-3 h-3 text-blue-700 cursor-pointer" />
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  )
}

function FormInput({
  label,
  placeholder,
  tooltip,
}: {
  label: string
  placeholder?: string
  tooltip?: string
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <FormLabel text={label} />
        {tooltip && <HelpTooltip text={tooltip} />}
      </div>
      <input placeholder={placeholder} className="mt-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 w-full text-[12px]" />
    </div>
  )
}

function CurrencyInput({
  label,
  tooltip,
}: {
  label: string
  tooltip?: string
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <FormLabel text={label} />
        {tooltip && <HelpTooltip text={tooltip} />}
      </div>

      <div className="mt-1 flex items-center border rounded-md bg-slate-50 px-3">
        <span className="text-xs text-slate-500 mr-2">SAR</span>
        <input
          type="number"
          defaultValue={0}
          className="w-full py-2 outline-none bg-transparent text-xs"
        />
      </div>
    </div>
  )
}

function NumberInput({
  label,
  tooltip,
}: {
  label: string
  tooltip?: string
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <FormLabel text={label} />
        {tooltip && <HelpTooltip text={tooltip} />}
      </div>
      <input type="number" defaultValue={0} className="mt-1 bg-slate-50 border text-xs border-slate-200 rounded-md px-3 py-2 w-full" />
    </div>
  )
}

function SelectableCard({
  label,
  defaultActive,
}: {
  label: string
  defaultActive?: boolean
}) {
  const [active, setActive] = useState(defaultActive ?? false)

  return (
    <div
      onClick={() => setActive(!active)}
      className={cn(
        "cursor-pointer border rounded-lg px-6 py-2 flex justify-between items-center transition",
        active
          ? "bg-indigo-50 border-indigo-200"
          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
      )}
    >
      <span className="font-semibold text-xs">{label}</span>

      <input type="checkbox"
        checked={active}
        onChange={() => setActive(!active)}
        className="w-4 h-4 accent-purple-600 text-indigo-600 rounded focus:ring-indigo-500"
      />
    </div>
  )
}