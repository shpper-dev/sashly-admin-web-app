"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { X, CalendarIcon } from "lucide-react";

import { useState, useEffect, useMemo } from "react";
import { format, setHours, startOfDay } from "date-fns";
import { updateExpectedDeliveryTime } from "@/lib/firebase/order";
import { useToast } from "@/lib/providers/ToastProvider";

interface ConfirmDeliveryDialogProps {
  children: React.ReactNode;
  orderId: string;
  existingExpectedDelivery?: number | null; // The timestamp from Firestore
  orderCreatedAt: number;
  onSuccess: () => void;
}

export default function ConfirmDeliveryDialog({
  children,
  orderId,
  existingExpectedDelivery,
  orderCreatedAt,
  onSuccess,
}: ConfirmDeliveryDialogProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Helper: Convert 12h string ("2 PM") to 24h number (14)
  const parseHour = (timeStr: string) => {
    const [hourStr, suffix] = timeStr.split(" ");
    let hour = parseInt(hourStr);
    if (suffix === "PM" && hour !== 12) hour += 12;
    if (suffix === "AM" && hour === 12) hour = 0;
    return hour;
  };

  // Helper: Convert 24h number to 12h string format
  const formatTo12h = (hour: number) => {
    const h = hour % 12 === 0 ? 12 : hour % 12;
    const suffix = hour >= 12 ? "PM" : "AM";
    return `${h} ${suffix}`;
  };

  const timeOptions = Array.from({ length: 24 }).map((_, i) => formatTo12h(i));

  // Restriction: Disable dates before the order was created
  const minDate = useMemo(()=>startOfDay(new Date(orderCreatedAt)),[orderCreatedAt]);

  // PRE-FILL LOGIC
 useEffect(() => {
  // Only run the setup logic when the dialog is opened
  if (open) {
    if (existingExpectedDelivery && existingExpectedDelivery > 0) {
      const d = new Date(existingExpectedDelivery);
      setDate(startOfDay(d));
      setFromTime(formatTo12h(d.getHours()));
      setToTime(formatTo12h((d.getHours() + 2) % 24));
    } else {
      setDate(minDate);
      setFromTime("");
      setToTime("");
    }
  }
}, [open, existingExpectedDelivery, minDate]);

  const handleSubmit = async () => {
    if (!date || !fromTime || !toTime) {
      showToast("Please complete all fields", "error");
      return;
    }

    const startHour = parseHour(fromTime);
    const endHour = parseHour(toTime);

    if (endHour <= startHour && endHour !== 0) { 
      showToast("End time should be after start time", "error");
      return;
    }

    try {
      setLoading(true);
      // Combine the calendar date and the "From" select hour
      const deliveryTimestamp = setHours(startOfDay(date), startHour).getTime();

      await updateExpectedDeliveryTime(orderId, deliveryTimestamp);
      
      showToast("Delivery time updated", "success");
      onSuccess();
      setOpen(false);
    } catch (error) {
      console.error(error);
      showToast("Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-120 rounded-2xl p-8">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-3xl font-bold text-slate-700">
            Confirm Delivery
          </DialogTitle>
          <DialogClose asChild>
            <button className="p-1 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400 cursor-pointer" />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* DELIVERY DATE */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">
              Delivery Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center justify-between h-12 px-4 bg-slate-100 rounded-xl w-full text-left font-medium text-slate-700 hover:bg-slate-200 transition-colors">
                  {date ? format(date, "EEEE, dd MMM yyyy") : "Select date"}
                  <CalendarIcon className="w-4 h-4 text-slate-500" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(day) => day < minDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* TIME WINDOW */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">
                From
              </label>
              <Select value={fromTime} onValueChange={setFromTime}>
                <SelectTrigger className="w-full h-12 px-4 bg-slate-100 border-0 rounded-xl shadow-none focus:ring-0 text-slate-700 font-medium">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">
                To
              </label>
              <Select value={toTime} onValueChange={setToTime}>
                <SelectTrigger className="w-full h-12 px-4 bg-slate-100 border-0 rounded-xl shadow-none focus:ring-0 text-slate-700 font-medium">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="h-14 px-12 text-lg rounded-xl bg-[#02D0FF] hover:bg-[#02b8e6] text-white shadow-lg cursor-pointer transition-all active:scale-95"
            >
              {loading ? "Updating..." : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}