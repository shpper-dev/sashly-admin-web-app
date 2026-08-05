"use client";
import React, { useRef, useState } from 'react';
import { 
  Mail, Phone, UserIcon, RotateCcw, Save, 
  MapPin, Camera,  X, Ban, Route,
  PackagePlus
} from 'lucide-react';
import { Driver } from '@/lib/models/driver.model';
import { deleteImage, fmtTimestamp, uploadImage } from '@/lib/utils';
import { updateDriver } from '@/lib/firebase/driver';
import { Switch } from '../ui/switch';

interface DriversEditProfileProps {
  driver: Driver;
  onSuccess?: () => void;
}

export default function DriversEditProfile({ driver, onSuccess }: DriversEditProfileProps) {
  const [saving, setSaving] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [togglingOffer, setTogglingOffer]   = useState(false); // ← separate loading flag

  const [isOnline, setIsOnline] = useState(driver.isOnline ?? false);
  const [offerEnabled, setOfferEnabled] = useState(driver.enableDriverOfferResponse ?? false); // ← local state, mirrors isOnline pattern

  // States
  const [name, setName] = useState(driver.name ?? "");
  const [email, setEmail] = useState(driver.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(driver.phoneNumber ?? "");
  const [profileImageUrl, setProfileImageUrl] = useState(driver.profileImageUrl ?? "");
  const [maxOrders, setMaxOrders] = useState(driver.maxActiveOrders ?? 5);

  // Image handling
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayImage = previewUrl ?? profileImageUrl;

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleToggleOnline = async () => {
    setTogglingOnline(true);
    try {
      await updateDriver(driver.id, { isOnline: !isOnline });
      setIsOnline((prev) => !prev);
      onSuccess?.();
    } catch (e) {
      console.error("Online toggle failed:", e);
    } finally {
      setTogglingOnline(false);
    }
  };

  const handleToggleOffer = async () => {
    setTogglingOffer(true);
    try {
      await updateDriver(driver.id, { enableDriverOfferResponse: !offerEnabled });
      setOfferEnabled((prev) => !prev);
      onSuccess?.();
    } catch (e) {
      console.error("Offer response toggle failed:", e);
    } finally {
      setTogglingOffer(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalImageUrl = profileImageUrl;

      if (pendingImageFile) {
        if (profileImageUrl) {
          try {
            await deleteImage(profileImageUrl);
          } catch (err) {
            console.error("Old image delete failed:", err);
          }
        }
        finalImageUrl = await uploadImage(pendingImageFile, "driverProfile");
        setPendingImageFile(null);
        setProfileImageUrl(finalImageUrl);
      }

      await updateDriver(driver.id, {
        name,
        email,
        phoneNumber,
        profileImageUrl: finalImageUrl || null,
        maxActiveOrders: maxOrders || 5,
      });
      onSuccess?.();
    } catch (e) {
      console.error("Update failed:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBlock = async () => {
    setBlocking(true);
    try {
      await updateDriver(driver.id, { isActive: !driver.isActive });
      onSuccess?.();
    } catch (e) {
      console.error("Action failed:", e);
    } finally {
      setBlocking(false);
    }
  };

  const initials = (name || "").trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

  return (
    <div className="flex-1 overflow-y-auto bg-white px-8 py-8">

      {/* Avatar Section */}
      <div className="flex justify-center mb-8">
        <div className="relative group">
          <div
            className="w-24 h-24 rounded-3xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-3xl overflow-hidden ring-4 ring-white shadow-lg cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {displayImage
              ? <img src={displayImage} alt="avatar" className="w-full h-full object-cover" />
              : initials || <UserIcon className="h-10 w-10" />}
          </div>
          <div
            className="absolute inset-0 rounded-3xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-6 w-6 text-white" />
          </div>
          {displayImage && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (profileImageUrl && !previewUrl) {
                  try { await deleteImage(profileImageUrl); } catch (err) { console.error(err); }
                }
                setPreviewUrl(null);
                setPendingImageFile(null);
                setProfileImageUrl("");
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-white text-red-600 rounded-full flex items-center justify-center shadow-md z-10"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
        </div>
      </div>

      {/* Main Fields Grid */}
      <div className="grid grid-cols-3 gap-x-6 gap-y-5">
        <FormField label="Full Name">
          <InputWithIcon icon={UserIcon} value={name} onChange={setName} />
        </FormField>

        <FormField label="Phone Number">
          <InputWithIcon icon={Phone} value={phoneNumber} onChange={setPhoneNumber} />
        </FormField>

        <FormField label="Email Address">
          <InputWithIcon icon={Mail} value={email} onChange={setEmail} />
        </FormField>

        <FormField label="Max Active Orders">
          <InputWithIcon icon={PackagePlus} value={maxOrders} onChange={setMaxOrders} type='number' />
        </FormField>
        

        {/* Online Status */}
        <FormField label="Online Status">
          
          <div
            className="flex items-center h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <Switch
              checked={isOnline}
              disabled={togglingOnline}
              onCheckedChange={handleToggleOnline}
              className="cursor-pointer data-[state=checked]:bg-purple-600!"
            />
            <span className={`text-sm font-semibold transition-colors ${isOnline ? "text-green-600" : "text-slate-400"}`}>
              {togglingOnline ? "Updating…" : isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </FormField>

        {/* Offer Response */}
        <FormField label="Offer Response">
          <div
            className="flex items-center h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <Switch
              checked={offerEnabled}
              disabled={togglingOffer}
              onCheckedChange={handleToggleOffer}
              className="cursor-pointer data-[state=checked]:bg-purple-600!"
            />
            <span className={`text-sm font-semibold transition-colors ${offerEnabled ? "text-green-600" : "text-slate-400"}`}>
              {togglingOffer ? "Updating…" : offerEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
        </FormField>
      </div>

      {/* Operational Section */}
      <div className="mt-10 pt-6 border-t border-slate-100">
        <SectionLabel>Payouts & Operational</SectionLabel>
        <div className="grid grid-cols-3 gap-x-6 gap-y-5">
            {/* <FormField label="IBAN for Payouts">
            <InputWithIcon icon={CreditCard} value={iban} onChange={setIban} placeholder="SA..." />
          </FormField>

          <FormField label="Commission Tier (%)">
            <InputWithIcon icon={Percent} value={commission} onChange={setCommission} />
          </FormField> */}
          <FormField label="System ID">
            <div className="flex items-center h-11 rounded-xl border border-slate-100 bg-slate-50 px-4 text-xs font-mono text-slate-400">
              {driver.id}
            </div>
          </FormField>
          <FormField label="Updated At">
            <div className="flex items-center h-11 rounded-xl border border-slate-100 bg-slate-50 px-4 text-xs font-mono text-slate-400">
              {fmtTimestamp(driver.updatedAt)}
            </div>
          </FormField>
          <FormField label="Designated Area (Read Only)">
          <div className="flex flex-col rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 gap-1 opacity-70">
            <div className="flex items-center gap-3">
              <Route className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-sm text-slate-600 truncate">
                {driver.designatedArea?.areaName ?? "No area assigned"}
              </span>
            </div>
            {driver.designatedArea?.center && (
              <div className="flex items-center gap-1.5 pl-7">
                <MapPin className="h-3 w-3 text-slate-300 shrink-0" />
                <span className="text-[10px] font-mono text-slate-400">
                  {driver.designatedArea.center.lat.toFixed(6)}, {driver.designatedArea.center.lng.toFixed(6)}
                </span>
              </div>
            )}
          </div>
        </FormField>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
        <button 
          onClick={handleToggleBlock}
          disabled={blocking}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition disabled:opacity-50 ${
            driver.isActive 
              ? "bg-red-50 text-red-500 hover:bg-red-100" 
              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
          }`}
        >
          {driver.isActive ? <Ban className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
          {blocking ? "Processing..." : driver.isActive ? "Block Driver" : "Unblock Driver"}
        </button>

        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 px-12 py-3 rounded-2xl bg-[#16B4CF] hover:bg-[#119CB4] text-white font-semibold text-sm shadow-lg transition disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Updating..." : "Update Profile"}
        </button>
      </div>
    </div>
  );
}

// helpers

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{label}</label>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1.5 h-4 bg-[#16B4CF] rounded-full" />
      <h3 className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
        {children}
      </h3>
    </div>
  );
}

function InputWithIcon({
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text"
}: {
  icon: any;
  value: string | number;
  onChange: (val: any) => void;
  placeholder?: string;
  type?: "text" | "number";
}) {
  return (
    <div className="flex items-center h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 gap-3">
      <Icon className="h-4 w-4 text-slate-400 shrink-0" />
      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(type === "number" ? Number(e.target.value) : e.target.value)
        }
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-slate-700 focus:outline-none"
      />
    </div>
  );
}