import {
  Mail, Phone, UserIcon, Globe, Trash2, RotateCcw, Save,
  Bell, MessageSquare, Tag, ShoppingBag, Megaphone, AlertCircle, Camera, Check, X
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { User, NotificationPref } from '@/lib/models/user.model';
import { restoreUser, softDeleteUser, updateUser } from '@/lib/firebase/user';
import { allCountries } from 'country-telephone-data';
import { deleteImage, uploadImage } from '@/lib/utils';
import { SectionLabel } from '../SectionLabel';
interface UsersEditCustomerProps {
  user: User;
  onDelete?: () => void;
  // onUpdate?: (updated: User) => void;
  onSuccess?: ()=> void;
}

const LANGUAGE_OPTIONS = [
  { label: "English", value: "en" },
  { label: "Arabic",  value: "ar" },
];

const PHONE_CODES = allCountries.map((c:any) => ({
  label: `+${c.dialCode} ${c.name}`,
  value: `+${c.dialCode}`,
  iso2: c.iso2,
}));

export default function UsersEditCustomer({ user, onDelete, onSuccess }: UsersEditCustomerProps) {
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName]                       = useState(user.name ?? "");
  const [phoneCode, setPhoneCode]             = useState(user.phoneCode ?? "+966");
  const [phone, setPhone]                     = useState(user.phone ?? "");
  const [profileImageUrl, setProfileImageUrl] = useState(user.profileImageUrl ?? "");
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [appLanguageCode, setAppLanguageCode] = useState(user.appLanguageCode ?? "en");
  const [notifPref, setNotifPref]             = useState<NotificationPref>(
    user.notificationPref ?? {
      userId: user.userId, pushEnabled: true, emailEnabled: true,
      smsEnabled: false, whatsappEnabled: false, getOrderUpdates: true,
      getOffers: false, getPromotions: false, getServiceAlerts: true,
    }
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayImage = previewUrl ?? profileImageUrl;

  const toggleNotif = (key: keyof NotificationPref) => {
    if (key === "userId") return;
    setNotifPref((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Just create a local preview — no upload yet
  setPendingImageFile(file);
  setPreviewUrl(URL.createObjectURL(file));
};

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalImageUrl = profileImageUrl;

     // Only upload if user actually picked a new image
     if (pendingImageFile) {
      finalImageUrl = await uploadImage(pendingImageFile, "userProfile");
      setPendingImageFile(null);
      setProfileImageUrl(finalImageUrl);
      }
      await updateUser(user.userId, {
        name, phoneCode, phone,
        profileImageUrl: finalImageUrl || null,
        appLanguageCode, notificationPref: notifPref,
      });
      onSuccess?.();
    } catch (e) {
      console.error("Update failed:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await softDeleteUser(user.userId);
      onDelete?.();
    } catch (e) {
      console.error("Delete failed:", e);
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async () => {
    setDeleting(true);
    try {
      await restoreUser(user.userId);
      onSuccess?.();
    } catch (e) {
      console.error("Restore failed:", e);
    } finally {
      setDeleting(false);
    }
  };

  const initials = (user.name ?? "").trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

  return (
    <div className="flex-1 overflow-y-auto bg-white px-6 py-6">

      {/* Deleted banner */}
      {user.isDeleted && (
        <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          This user has been soft-deleted and cannot log in.
        </div>
      )}

      {/*  Avatar change only */}
      <div className="flex justify-center mb-7">
        <div className="relative group">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-2xl overflow-hidden ring-4 ring-white shadow-md cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {displayImage
              ? <img src={displayImage} alt="avatar" className="w-full h-full object-cover" />
              : initials || <UserIcon className="h-8 w-8" />}
          </div>
      
          {/* Camera overlay on hover */}
          <div
            className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-5 w-5 text-white" />
          </div>
      
          {/* Remove button — only shown when there's an image */}
          {displayImage && (
            <button
              onClick={async (e) => {
                e.stopPropagation(); // prevent triggering file picker
                // Only hit storage if it's an already-saved URL, not a local preview
                if (profileImageUrl && !previewUrl) {
                      try {
                        await deleteImage(profileImageUrl);
                      } catch (err) {
                        console.error("Failed to delete from storage:", err);
                      }
                    }
                setPreviewUrl(null);
                setPendingImageFile(null);
                setProfileImageUrl("");
              }}
              className="absolute -top-2 -right-2 w-5 h-5 text-red-600 rounded-full flex items-center justify-center shadow-md transition-colors z-10 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
      
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
        </div>
      </div>

      {/* Editable fields  */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-5">

        {/* NAME */}
        <FormField label="Name">
          <div className="flex items-center h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 gap-3 focus-within:ring-2 focus-within:ring-[#7F50F4] focus-within:border-transparent transition">
            <UserIcon className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-700 focus:outline-none min-w-0"
            />
          </div>
        </FormField>

        {/* APP LANGUAGE */}
        <FormField label="App Language">
          <div className="flex items-center h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 gap-3 focus-within:ring-2 focus-within:ring-[#7F50F4] transition">
            <Globe className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={appLanguageCode}
              onChange={(e) => setAppLanguageCode(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-700 focus:outline-none min-w-0"
            >
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </FormField>

        {/* EMAIL — read-only, with verified badge below */}
        <FormField label="Email">
          <div className="flex items-center h-11 rounded-xl border border-slate-100 bg-slate-50/60 px-4 gap-3 opacity-70">
            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              value={user.email ?? ""}
              disabled
              className="flex-1 bg-transparent text-sm text-slate-600 focus:outline-none min-w-0 cursor-not-allowed"
            />
          </div>
          <VerifiedBadge verified={user.isEmailVerified} label="Email" />
        </FormField>

        {/* PHONE — with verified badge below */}
        <FormField label="Phone">
          <div className="flex gap-2">
            <select
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
              className="h-11 w-24 shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7F50F4]"
            >
              {PHONE_CODES.map((c,index) => (
                <option key={index} value={c.value}>{c.value}</option>
              ))}
            </select>
            <div className="flex-1 flex items-center h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 gap-3 focus-within:ring-2 focus-within:ring-[#7F50F4] focus-within:border-transparent transition min-w-0">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                value={phone.slice(phoneCode.length)}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-700 focus:outline-none min-w-0"
              />
            </div>
          </div>
          <VerifiedBadge verified={user.isPhoneVerified} label="Phone" />
        </FormField>

      </div>

      {/*  Notification Preferences */}
      <div className="mt-7">
        <SectionLabel>Notification Preferences</SectionLabel>
        <div className="grid grid-cols-2 gap-2.5">
          {([
            { key: "pushEnabled",     icon: Bell,          label: "Push" },
            { key: "emailEnabled",    icon: Mail,          label: "Email" },
            { key: "smsEnabled",      icon: MessageSquare, label: "SMS" },
            { key: "whatsappEnabled", icon: Phone,         label: "WhatsApp" },
            { key: "getOrderUpdates", icon: ShoppingBag,   label: "Order Updates" },
            { key: "getOffers",       icon: Tag,           label: "Offers" },
            { key: "getPromotions",   icon: Megaphone,     label: "Promotions" },
            { key: "getServiceAlerts",icon: AlertCircle,   label: "Service Alerts" },
          ] as const).map(({ key, icon: Icon, label }) => {
            const on = notifPref[key as keyof NotificationPref] as boolean;
            return (
              <button
                key={key}
                onClick={() => toggleNotif(key as keyof NotificationPref)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  on ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left text-xs">{label}</span>
                {/* mini pill toggle */}
                <div className={`w-7 h-3.5 rounded-full relative transition-colors shrink-0 ${on ? "bg-[#7F50F4]" : "bg-slate-300"}`}>
                  <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow transition-all ${on ? "left-3.5" : "left-0.5"}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/*  System Info  */}
      <div className="mt-7">
        <SectionLabel>System Info</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <ReadOnlyField
            label="Registered"
            value={user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
          />
          <ReadOnlyField label="User ID" value={user.userId} mono />
          {user.isDeleted && user.deletedAt && (
            <ReadOnlyField
              label="Deleted At"
              value={new Date(user.deletedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            />
          )}
        </div>
      </div>

      {/*  Bottom actions*/}
      <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
        {user.isDeleted ? (
          <button onClick={handleRestore} disabled={deleting}
            className="flex items-center gap-2 text-emerald-600 font-semibold text-sm disabled:opacity-50 hover:text-emerald-700 transition">
            <RotateCcw className="h-4 w-4" />
            {deleting ? "Restoring..." : "Restore User"}
          </button>
        ) : (
          <button onClick={handleDelete} disabled={deleting}
            className="flex items-center gap-2 text-red-400 font-semibold text-sm disabled:opacity-50 hover:text-red-600 transition">
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting..." : "Delete User"}
          </button>
        )}

        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#7F50F4] hover:bg-[#6B3FD4] text-white font-semibold text-sm shadow-md transition disabled:opacity-50">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
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

function VerifiedBadge({ verified, label }: { verified: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1 mt-1 text-[10px] font-semibold ${verified ? "text-emerald-600" : "text-slate-400"}`}>
      {verified
        ? <span className='text-[8px] text-green-600 flex items-center'><Check className="h-3 w-3 " />{label} verified</span>
        : <span className='tetx-[8px] text-red-600 flex items-center'><X className="h-3 w-3 " />{label} not verified</span>}
    </div>
  );
}

function ReadOnlyField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{label}</span>
      <span className={`text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 truncate ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}