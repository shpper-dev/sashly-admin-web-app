"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { X, CalendarIcon } from "lucide-react"

import { useState } from "react"
import { format } from "date-fns"

interface ConfirmDeliveryDialogProps {
  children: React.ReactNode
}

export default function ConfirmDeliveryDialog({
  children,
}: ConfirmDeliveryDialogProps) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>()
  const [fromTime, setFromTime] = useState("")
  const [toTime, setToTime] = useState("")

  const handleSubmit = () => {
    console.log("Date:", date)
    console.log("From:", fromTime)
    console.log("To:", toTime)

    setOpen(false)
  }

  const timeOptions = Array.from({ length: 24 }).map((_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12
    const suffix = i < 12 ? "AM" : "PM"
    return `${hour} ${suffix}`
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-120 rounded-2xl p-8">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-3xl font-bold text-slate-700">
            Confirm Delivery
          </DialogTitle>

          <DialogClose asChild>
            <button>
              <X className="w-5 h-5 text-slate-400 cursor-pointer" />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-6 mt-6">

          {/* DELIVERY DATE */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 font-semibold">
              DELIVERY DATE
            </label>

            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center justify-between h-12 px-3 bg-slate-100 rounded-xl w-full text-left">
                  {date ? format(date, "EEE, dd MMM") : "Select date"}
                  <CalendarIcon className="w-4 h-4 text-slate-500" />
                </button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* TIME */}
          <div className="grid grid-cols-2 gap-6">
            {/* FROM */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-semibold">
                FROM
              </label>

              <div className="p-2 bg-slate-100 border-none rounded-xl">
                <Select value={fromTime} onValueChange={setFromTime}>
                  <SelectTrigger className="w-full h-12 px-3 bg-transparent border-0 shadow-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>

                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem
                        key={time}
                        value={time}
                        className="p-3"
                      >
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* TO */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-semibold">
                TO
              </label>

              <div className="p-2 bg-slate-100 border-none rounded-xl">
                <Select value={toTime} onValueChange={setToTime}>
                  <SelectTrigger className="w-full h-12 px-3 bg-transparent border-0 shadow-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>

                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem
                        key={time}
                        value={time}
                        className="p-3"
                      >
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* SUBMIT */}
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
