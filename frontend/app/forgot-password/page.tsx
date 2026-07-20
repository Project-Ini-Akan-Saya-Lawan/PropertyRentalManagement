"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // TODO: POST /api/auth/forgot-password
      // await fetch("/api/auth/forgot-password", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email }),
      // });
      await new Promise((r) => setTimeout(r, 1000)); // simulate API
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back to login */}
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#2B2B2B]/60 hover:text-[#C9A36A] transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to Sign In
        </Link>

        {!submitted ? (
          <>
            <h1
              className="text-3xl font-bold text-[#2B2B2B] mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Forgot Password
            </h1>
            <p className="text-sm text-[#2B2B2B]/50 mb-8">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3.5 top-3.5 text-gray-300"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@company.com"
                    className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white text-gray-700 focus:border-[#C9A36A] focus:ring-2 focus:ring-[#C9A36A]/20 outline-none transition-all"
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-[11px] mt-1.5">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#C9A36A] hover:bg-[#A8834A] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="text-center text-xs text-[#2B2B2B]/40 mt-6">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-[#C9A36A] font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </>
        ) : (
          /* Success state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2
              className="text-2xl font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Check Your Email
            </h2>
            <p className="text-sm text-[#2B2B2B]/60 mb-2">
              We&apos;ve sent a password reset link to:
            </p>
            <p className="text-sm font-bold text-[#C9A36A] mb-6">{email}</p>
            <p className="text-xs text-[#2B2B2B]/40 mb-8">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setSubmitted(false)}
                className="text-[#C9A36A] font-semibold hover:underline"
              >
                try again
              </button>
              .
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#C9A36A] hover:bg-[#A8834A] text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
