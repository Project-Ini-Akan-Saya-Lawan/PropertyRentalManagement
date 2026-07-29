"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, Eye, EyeOff } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.message || "Failed to reset password.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  if (done)
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1
            className="text-2xl font-bold text-[#2B2B2B] mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Password Reset!
          </h1>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <h1
          className="text-3xl font-bold text-[#2B2B2B] mb-1"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Reset Password
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-3.5 text-gray-300"
              />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm bg-white text-gray-700 focus:border-[#C9A36A] focus:ring-2 focus:ring-[#C9A36A]/20 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-3.5 text-gray-300 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-3.5 text-gray-300"
              />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white text-gray-700 focus:border-[#C9A36A] focus:ring-2 focus:ring-[#C9A36A]/20 outline-none transition-all"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9A36A] hover:bg-[#A8834A] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
