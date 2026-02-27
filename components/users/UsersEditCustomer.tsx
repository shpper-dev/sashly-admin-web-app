import { ChevronDown, Copy, LucideIcon, Mail, PencilLine, Phone, Trash2, UserIcon } from 'lucide-react';
import React from 'react'

export default function UsersEditCustomer() {
  return (
  <div className="flex-1 overflow-y-auto bg-white px-8 py-8">

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
        <textarea className="w-full h-15 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7F50F4]" />
      </FormField>

      {/* PRIVATE NOTES */}
      <FormField label="Private Notes">
        <textarea className="w-full h-15 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7F50F4]" />
      </FormField>

      {/* GENDER */}
      <FormField label="Gender">
        <SelectInput value="Male" />
      </FormField>

      {/* PRICE LIST */}
      <FormField label="Price List">
        <SelectInput value="Default" />
      </FormField>

      {/* PAYMENT TYPE */}
      <FormField label="Payment Type">
        <SelectInput value="Default" />
      </FormField>

      {/* INVOICE STYLE */}
      <FormField label="Invoice Style">
        <SelectInput value="Store Default" />
      </FormField>

      {/* DISCOUNT */}
      <FormField label="Discount (%)">
        <InputWithEdit defaultValue="0.00" />
      </FormField>

      {/* CREDIT */}
      <FormField label="Credit (SAR)">
        <InputWithEdit defaultValue="0.00" />
      </FormField>

      {/* ROUTE */}
      <div className='flex items-center gap-2'>
        <FormField label="Route #">
        <BaseInput defaultValue="0" />
      </FormField>

      {/* STOP */}
      <FormField label="Stop #">
        <BaseInput defaultValue="0" />
      </FormField>
      </div>

      {/* TAX EXEMPT */}
      <div className="col-span-1">
        <FormField label="Tax Exempt">
          <CheckboxCard label="Customer is tax exempt" />
        </FormField>
      </div>

      {/* HOTEL GUEST */}
      <div className="col-span-1">
        <FormField label="Hotel Guest">
          <CheckboxCard label="Customer is a hotel guest" />
        </FormField>
      </div>

    </div>

    {/* Bottom Buttons */}
    <div className="flex items-center justify-between mt-10 border-t pt-6">

      <button className="flex items-center gap-2 text-red-500 font-semibold text-sm">
        <Trash2 className="h-4 w-4" />
        Delete Customer
      </button>

      <button className="px-10 py-3 rounded-2xl bg-[#16B4CF] hover:bg-[#119CB4] text-white font-semibold text-sm shadow-lg transition">
        Update
      </button>

    </div>

  </div>

  )
}

// helpers
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
      <div className="text-slate-400"><Icon className='h-4 w-4'/></div>
      <input
        defaultValue={defaultValue}
        className="flex-1 bg-transparent text-sm text-slate-700 focus:outline-none"
      />
    </div>
  );
}

function InputWithEdit({ defaultValue }: { defaultValue?: string }) {
  return (
    <div className="flex items-center py-3 rounded-xl border border-slate-200 bg-slate-100 justify-between px-4">
      <input
        defaultValue={defaultValue}
        className="flex-1 bg-transparent text-sm text-slate-700 focus:outline-none"
      />
      <PencilLine className="h-4 w-4 text-[#7F50F4]" />
    </div>
  );
}

function CheckboxCard({ label }: { label: string }) {
  return (
    <div className="flex gap-2 border border-slate-200 bg-slate-100 pl-3 pr-6 py-3 rounded-xl w-full">
      <input type='checkbox' className="w-5 h-5 rounded-md accent-purple-600 "/>
      <span className="text-sm text-slate-700 font-medium text-nowrap">
        {label}
      </span>
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
  placeholder,
}: {
  defaultValue?: string
  placeholder?: string
}) {
  return (
    <div className="relative w-full">
      <input
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="
          w-full
          h-11
          rounded-xl
          border border-slate-200
          bg-slate-100
          pl-4 pr-10
          text-sm text-slate-700
          placeholder:text-slate-400
          focus:outline-none
          focus:ring-2 focus:ring-[#7F50F4]
        "
      />

      {/* Suffix Icon */}
      <button
        type="button"
        className="
          absolute
          right-3
          top-1/2
          -translate-y-1/2
          text-slate-400
          hover:text-slate-600
          transition
        "
      >
        <Copy className="h-4 w-4" />
      </button>
    </div>
  )
}