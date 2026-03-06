import {
  Ban,
  ChevronDown,
  Copy,
  LucideIcon,
  Mail,
  Phone,
  UserIcon,
} from "lucide-react";
import React from "react";

export default function DriversEditProfile() {
  return (
    <div className="flex-1 overflow-y-auto bg-white px-8 py-8">

      {/* ================= GRID ================= */}
      <div className="grid grid-cols-3 gap-x-8 gap-y-6 text-[13px]">

        {/* NAME */}
        <FormField label="Name">
          <InputWithIcon icon={UserIcon} defaultValue="Ahmed Khalid" />
        </FormField>

        {/* TEL */}
        <FormField label="Tel">
          <InputWithIcon icon={Phone} defaultValue="+966 50 123 4567" />
        </FormField>

        {/* SECONDARY TEL */}
        <FormField label="Secondary Tel">
          <InputWithIcon icon={Phone} defaultValue="+966" />
        </FormField>

        {/* EMAIL */}
        <FormField label="Email">
          <InputWithIcon icon={Mail} defaultValue="ahmed@example.com" />
        </FormField>

        {/* STREET ADDRESS */}
        <FormField label="Street Address">
          <InputWithSuffix defaultValue="Enter coordinate" />
        </FormField>

        {/* APT NUMBER */}
        <FormField label="Apt Number">
          <BaseInput />
        </FormField>

        {/* CITY */}
        <FormField label="City">
          <BaseInput defaultValue="Riyadh" />
        </FormField>

        {/* POST CODE */}
        <FormField label="Post Code">
          <BaseInput />
        </FormField>

        {/* DRIVER INSTRUCTIONS */}
        <FormField label="Driver Instructions">
          <BaseInput />
        </FormField>

        {/* NOTES */}
        <FormField label="Notes">
          <textarea className="w-full h-16 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7F50F4]" />
        </FormField>

        {/* PRIVATE NOTES */}
        <FormField label="Private Notes">
          <textarea className="w-full h-16 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7F50F4]" />
        </FormField>

        {/* GENDER */}
        <FormField label="Gender">
          <SelectInput value="Male" />
        </FormField>
      </div>

      {/* ================= PAYOUT SECTION ================= */}
      <div className="mt-5">

        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-slate-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-400 uppercase">
            Payouts & Operational
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-x-8 gap-y-6 text-[13px]">

          {/* IBAN */}
          <FormField label="IBAN for Payouts">
            <BaseInput defaultValue="SA 4200 0000 1234 5678 9012" />
          </FormField>

          {/* COMMISSION */}
          <FormField label="Commission Tier (%)">
            <BaseInput defaultValue="15" />
          </FormField>

          {/* ROUTE */}
          <FormField label="Preferred Route">
            <SelectInput value="North Riyadh" />
          </FormField>
        </div>

        {/* Performance Flags */}
        <div className="mt-2">
          <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Performance Flags
          </label>

          <div className="mt-1 rounded-2xl bg-slate-100 h-22 flex items-center px-6 text-slate-600 text-sm">
            None recorded.
          </div>
        </div>
      </div>

      {/* ================= BOTTOM BUTTONS ================= */}
      <div className="flex items-center justify-between mt-3 border-t pt-6">

        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-50 text-red-500 font-semibold text-sm hover:bg-red-100 transition">
          <Ban className="h-4 w-4" />
          Block Driver
        </button>

        <button className="px-12 py-3 rounded-2xl bg-[#16B4CF] hover:bg-[#119CB4] text-white font-semibold text-sm shadow-lg transition">
          Update
        </button>

      </div>

    </div>
  );
}

/* ================= HELPERS ================= */

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
        {label}
      </label>
      {children}
    </div>
  );
}

function BaseInput({ defaultValue }: { defaultValue?: string }) {
  return (
    <input
      defaultValue={defaultValue}
      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7F50F4]"
    />
  );
}

function InputWithIcon({
  icon: Icon,
  defaultValue,
}: {
  icon: LucideIcon;
  defaultValue?: string;
}) {
  return (
    <div className="flex items-center h-11 rounded-xl border border-slate-200 bg-slate-100 px-4 gap-3">
      <div className="text-slate-400">
        <Icon className="h-4 w-4" />
      </div>
      <input
        defaultValue={defaultValue}
        className="flex-1 bg-transparent text-sm text-slate-700 focus:outline-none"
      />
    </div>
  );
}

function SelectInput({ value }: { value: string }) {
  return (
    <div className="flex items-center justify-between h-11 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-700">
      {value}
      <ChevronDown className="h-4 w-4 text-slate-400" />
    </div>
  );
}

function InputWithSuffix({
  defaultValue,
}: {
  defaultValue?: string;
}) {
  return (
    <div className="relative w-full">
      <input
        defaultValue={defaultValue}
        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-100 pl-4 pr-10 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7F50F4]"
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
      >
        <Copy className="h-4 w-4" />
      </button>
    </div>
  );
}