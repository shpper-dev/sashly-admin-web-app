"use client";
import { loginAdmin } from "@/lib/firebase/admin.auth";
import { Mail, Lock, Eye, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await loginAdmin(email, password, rememberMe);
      router.push("/");
    } catch (err: any) {
      console.error("Login Failed : ", err);
      if (err.message === "NOT_ADMIN") {
        setError("You do not have admin access.");
      } else if (err.message === "ACCOUNT_DISABLED") {
        setError("Your account has been disabled. Contact your administrator.");
      } else if (err.message === "SESSION_FAILED") {
        setError("Failed to login. Please try again later!");
      } else {
        setError("Invalid credentials or network error. Please try again later!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex flex-col gap-4">
      {/* HEADER */}
      <header className="flex items-center justify-between px-10 py-4 border-b bg-white">
        <img src="/images/logo.png" alt="sashly logo" className="h-10"  />
      </header>
      {/* LOGIN AREA */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="flex flex-col items-center w-full max-w-md gap-6">

          <form
            onSubmit={handleSubmit}
            className="bg-white w-full rounded-2xl shadow-sm border p-10"
          >
            {/* TITLE */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-800">
                Admin Access
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Request administrator credentials <br />
                for the Sashly ecosystem.
              </p>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* EMAIL */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-600"
              >
                Email Address
              </label>
              <div className="flex items-center mt-2 bg-slate-100 border rounded-lg px-3 h-12">
                <Mail size={18} className="text-slate-400 mr-2 shrink-0" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sashly.com"
                  required
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="mb-4">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-600"
              >
                Password
              </label>
              <div className="flex items-center mt-2 bg-slate-100 border rounded-lg px-3 h-12">
                <Lock size={18} className="text-slate-400 mr-2 shrink-0" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="flex-1 bg-transparent outline-none text-sm"
                />
                <Eye
                  size={18}
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 cursor-pointer shrink-0"
                />
              </div>
            </div>

            {/* REMEMBER */}
            <div className="flex items-center gap-2 mb-6 text-sm text-slate-600">
              <input 
                type="checkbox"  
                className="rounded border-slate-300 cursor-pointer" 
                id="remember"
                checked={rememberMe}
                onChange={(e) => {setRememberMe(e.target.checked)}}
              />
              <label htmlFor="remember" className="cursor-pointer select-none">
                Remember this device
              </label>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition shadow disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="text-sm">Signing in...</span>
              ) : (
                <>
                  Sign Into Dashboard
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* SUPPORT — outside the card */}
          <div className="text-center text-sm text-slate-500">
            <p>Authorized personnel only</p>
            <p className="mt-1">
              Need help?{" "}
              <span className="text-blue-500 cursor-pointer hover:underline">
                Contact Support
              </span>
            </p>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center text-sm text-slate-400 py-3 bg-white">
        <p>© 2026 Sashly Inc. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-1">
          <span className="cursor-pointer hover:underline">Privacy Policy</span>
          <span className="cursor-pointer hover:underline">Terms of Service</span>
        </div>
      </footer>

    </div>
  );
}