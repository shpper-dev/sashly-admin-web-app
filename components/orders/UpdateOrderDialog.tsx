"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useState } from "react"

interface UpdateOrderDialogProps {
  orderId: number
  children: React.ReactNode
}

export default function UpdateOrderDialog({ orderId, children }: UpdateOrderDialogProps) {
  const [updateAction, setUpdateAction] = useState("cleaned")
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);


  const handleSubmit = () => {
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-180 rounded-2xl p-8">
        {/* HEADER */}
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-3xl font-bold text-slate-700">
            Update Order
          </DialogTitle>
          <DialogClose>
                <X className="w-5 h-5 text-slate-400 cursor-pointer" />
          </DialogClose>
        </DialogHeader>

        {/* FORM CONTENT */}
        <div className="space-y-6 mt-6">

          {/* ID + NOTES */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-slate-400 font-semibold">ID</label>
              <input
                value={orderId}
                disabled
                className="mt-2 p-3 bg-slate-100 border-none rounded-xl"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-slate-400 font-semibold">Notes</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 p-3 bg-slate-100 border-none rounded-xl resize-none"
              />
            </div>
          </div>

          {/* UPDATE SELECT */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 font-semibold">Update</label>

            <div className="p-2 bg-slate-100 border-none rounded-xl">
            <Select value={updateAction} onValueChange={setUpdateAction}>
              <SelectTrigger className="w-full h-12 px-3 bg-transparent border-0 shadow-none focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Select action" />
              </SelectTrigger>

              <SelectContent 
                    position="popper"
                    className="p-3">
                <SelectItem value="cleaned" className="p-3" >
                  Mark as Cleaned
                </SelectItem>

                <SelectItem value="notes-only" className="p-3">
                  Update Notes Without Checkin
                </SelectItem>

                <SelectItem value="delete" className="p-3">
                  Delete Order
                </SelectItem>

                <SelectItem value="reference" className="p-3">
                  Add Check Number / Reference (using Notes)
                </SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-6">
            <Button
              onClick={handleSubmit}
              className="h-14 px-10 text-lg rounded-xl bg-[#02D0FF] hover:bg-cyan-500 shadow-lg cursor-pointer"
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
