"use client";
import { changePassword } from "@/lib/firebase/admin.auth";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";



export default function ChangePassword() {
  const router = useRouter();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const requirements = [
    { met: newPassword.length >= 8, label: "At least 8 characters" },
    { met: /[A-Z]/.test(newPassword), label: "One uppercase letter" },
    { met: /[0-9]/.test(newPassword), label: "One number" },
    { met: /[^A-Za-z0-9]/.test(newPassword), label: "One special character" },
  ];

  const allRequirementsMet = requirements.every((r) => r.met);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!allRequirementsMet) {
      setError("Your new password doesn't meet all requirements.");
      return;
    }
    if (!passwordsMatch) {
      setError("New passwords do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("New password must differ from your current password.");
      return;
    }

    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
    } catch (err: any) {
        setError("Failed to update password. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const isValid =
  newPassword.length >= 8 &&
  /[A-Z]/.test(newPassword) &&
  /[0-9]/.test(newPassword) &&
  /[^A-Za-z0-9]/.test(newPassword);

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex flex-col">
      {/* HEADER */}
      {/* <header className="flex items-center justify-between px-10 py-4 border-b bg-white">
        <img src="/images/logo.png" alt="sashly logo" className="h-10" />
      </header> */}

      {/* MAIN AREA */}
      <main className="flex flex-1 items-center justify-center px-4 py-6">
        <div className="flex flex-col items-center w-full max-w-md">

          {success ? (
            /* SUCCESS STATE */
            <div className="bg-white w-full rounded-2xl shadow-sm border p-6 text-center">
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
                  <ShieldCheck size={32} className="text-emerald-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Password Updated</h2>
              <p className="text-sm text-slate-500 mb-8">
                Your administrator password has been changed successfully. Use your new password on next sign-in.
              </p>
              <button
                onClick={() => router.push("/")}
                className="w-full h-12 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition shadow"
              >
                Back to Dashboard
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            /* FORM */
            <form
              onSubmit={handleSubmit}
              className="bg-white w-full rounded-2xl shadow-sm border px-10 pt-4 pb-2"
            >
              {/* TITLE */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Change Password</h1>
                <p className="text-sm text-slate-500 mt-2">
                  Update your administrator account password.
                </p>
              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* CURRENT PASSWORD */}
              <div className="mb-3">
                <label htmlFor="current" className="text-sm font-medium text-slate-600">
                  Current Password
                </label>
                <div className="flex items-center mt-1 bg-slate-100 border rounded-lg px-3 h-12">
                  <Lock size={18} className="text-slate-400 mr-2 shrink-0" />
                  <input
                    id="current"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                  <Eye
                    size={18}
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="text-slate-400 cursor-pointer shrink-0"
                  />
                </div>
              </div>

              {/* DIVIDER */}
              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">New Password</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* NEW PASSWORD */}
              <div className="mb-3">
                <label htmlFor="new" className="text-sm font-medium text-slate-600">
                  New Password
                </label>
                <div className="flex items-center mt-1 bg-slate-100 border rounded-lg px-3 h-12">
                  <Lock size={18} className="text-slate-400 mr-2 shrink-0" />
                  <input
                    id="new"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="text-slate-400 cursor-pointer shrink-0"
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <PasswordStrengthBar password={newPassword} />
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="mb-3">
                <label htmlFor="confirm" className="text-sm font-medium text-slate-600">
                  Confirm New Password
                </label>
                <div className={`flex items-center mt-1 bg-slate-100 border rounded-lg px-3 h-12 transition-colors ${
                  confirmPassword && !passwordsMatch ? "border-red-300" : confirmPassword && passwordsMatch ? "border-emerald-300" : ""
                }`}>
                  <Lock size={18} className="text-slate-400 mr-2 shrink-0" />
                  <input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="text-slate-400 cursor-pointer shrink-0"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                )}
                {confirmPassword && passwordsMatch && (
                  <p className="text-xs text-emerald-600 mt-1">Passwords match.</p>
                )}
              </div>

              {/* REQUIREMENTS */}
              {newPassword.length > 0 && (
                <div className="mb-3 p-4 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2">
                  {requirements.map((r) => (
                    <RequirementRow key={r.label} met={r.met} label={r.label} />
                  ))}
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading || !isValid}
                className="w-full h-12 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition shadow disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="text-sm">Updating password...</span>
                ) : (
                  <>
                    Update Password
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* CANCEL */}
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full mt-3 h-10 text-sm text-slate-500 hover:text-slate-700 transition"
              >
                Cancel
              </button>
            </form>
          )}

          {/* <div className="text-center text-sm text-slate-500">
            <p>Authorized personnel only</p>
            <p className="mt-1">
              Need help?{" "}
              <span className="text-blue-500 cursor-pointer hover:underline">
                Contact Support
              </span>
            </p>
          </div> */}
        </div>
      </main>

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

// helpers
function PasswordStrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;

  const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-400"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score - 1] : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${
        score <= 1 ? "text-red-500" : score === 2 ? "text-orange-500" : score === 3 ? "text-yellow-600" : "text-emerald-600"
      }`}>
        {labels[score - 1] ?? ""}
      </p>
    </div>
  );
}

function RequirementRow({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2
        size={14}
        className={`shrink-0 transition-colors duration-200 ${met ? "text-emerald-500" : "text-slate-300"}`}
      />
      <span className={`text-xs transition-colors duration-200 ${met ? "text-slate-600" : "text-slate-400"}`}>
        {label}
      </span>
    </div>
  );
}