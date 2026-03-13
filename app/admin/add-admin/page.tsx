"use client";
import { createAdmin } from "@/lib/firebase/admin.auth";
import { Mail, Lock, Eye, ArrowRight, User, Shield, ChevronDown, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { AdminRole } from "@/lib/models/admin.model";
import Link from "next/link";

const ROLES: { value: AdminRole; label: string }[] = [
  { value: "admin",      label: "Admin"       },
  { value: "superadmin", label: "Super Admin" },
  { value: "viewer",     label: "Viewer"      },
];

export default function AddAdminForm() {
  const router = useRouter();
  const [showPassword, setShowPassword]   = useState(false);
  const [firstName,    setFirstName]      = useState<string>("");
  const [lastName,     setLastName]       = useState<string>("");
  const [email,        setEmail]          = useState<string>("");
  const [password,     setPassword]       = useState<string>("");
  const [role,         setRole]           = useState<AdminRole>("admin");
  const [roleOpen,     setRoleOpen]       = useState(false);
  const [error,        setError]          = useState<string>("");
  const [success,      setSuccess]        = useState<string>("");
  const [loading,      setLoading]        = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRoleOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      setLoading(true);
      await createAdmin(email, password, firstName, lastName, role);
      setSuccess(`Admin account for ${firstName} ${lastName} created successfully.`);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("admin");
    } catch (err: any) {
      console.error("Create Admin Failed: ", err);
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Failed to create admin. Please try again later!");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputRow = "flex items-center mt-2 bg-slate-100 border rounded-lg px-3 h-12";
  const inputClass = "flex-1 bg-transparent outline-none text-sm";

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex flex-col">
        {/* HEADER */}
      {/* <header className="flex items-center justify-between px-10 py-4 border-b bg-white">
        <img src="/images/logo.png" alt="sashly logo" className="h-14"  />
      </header> */}

      {/* FORM AREA */}
      <div className="flex flex-1 items-center justify-center px-4 py-6">
        <div className="flex flex-col items-center w-full max-w-lg gap-6">

          <form
            onSubmit={handleSubmit}
            className="bg-white w-full rounded-2xl shadow-sm border px-10 py-6"
          >
            {/* TITLE */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-slate-800">Create Admin</h1>
              <Link href={"/settings"} className="text-slate-400 hover:text-slate-600 text-sm" >
              Back to settings
              </Link> 
              
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
                {success}
              </div>
            )}

            {/* FIRST NAME + LAST NAME */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label htmlFor="firstName" className="text-sm font-medium text-slate-600">
                  First Name
                </label>
                <div className={inputRow}>
                  <User size={18} className="text-slate-400 mr-2 shrink-0" />
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="text-sm font-medium text-slate-600">
                  Last Name
                </label>
                <div className={inputRow}>
                  <User size={18} className="text-slate-400 mr-2 shrink-0" />
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* EMAIL */}
            <div className="mb-5">
              <label htmlFor="email" className="text-sm font-medium text-slate-600">
                Email Address
              </label>
              <div className={inputRow}>
                <Mail size={18} className="text-slate-400 mr-2 shrink-0" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sashly.com"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="mb-5">
              <label htmlFor="password" className="text-sm font-medium text-slate-600">
                Password
              </label>
              <div className={inputRow}>
                <Lock size={18} className="text-slate-400 mr-2 shrink-0" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={inputClass}
                />
                <Eye
                  size={18}
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 cursor-pointer shrink-0"
                />
              </div>
            </div>

            {/* ROLE — custom dropdown */}
            <div className="mb-8" ref={dropdownRef}>
              <label className="text-sm font-medium text-slate-600">Role</label>
              <div className="relative mt-2">
                {/* Trigger */}
                <button
                  type="button"
                  onClick={() => setRoleOpen(!roleOpen)}
                  className="w-full flex items-center bg-slate-100 border rounded-lg px-3 h-12 text-sm text-slate-700"
                >
                  <Shield size={18} className="text-slate-400 mr-2 shrink-0" />
                  <span className="flex-1 text-left">
                    {ROLES.find((r) => r.value === role)?.label}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 shrink-0 transition-transform duration-150 ${roleOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Options */}
                {roleOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    {ROLES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => { setRole(r.value); setRoleOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 mb-1 text-sm rounded-lg transition-colors mx-auto
                          ${role === r.value
                            ? "bg-cyan-500 text-white"
                            : "text-slate-700 hover:bg-cyan-500 hover:text-white"
                          }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition shadow disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="text-sm">Creating Admin...</span>
              ) : (
                <>
                  Create Admin Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* NOTE */}
          {/* <div className="text-center text-sm text-slate-500">
            <p>Only superadmins can create new accounts.</p>
            <p className="mt-1">
              Need help?{" "}
              <span className="text-blue-500 cursor-pointer hover:underline">
                Contact Support
              </span>
            </p>
          </div> */}

        </div>
      </div>

      {/* FOOTER */}
      {/* <footer className="text-center text-sm text-slate-400 py-3 bg-white">
        <p>© 2026 Sashly Inc. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-1">
          <span className="cursor-pointer hover:underline">Privacy Policy</span>
          <span className="cursor-pointer hover:underline">Terms of Service</span>
        </div>
      </footer> */}

    </div>
  );
}