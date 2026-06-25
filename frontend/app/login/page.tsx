"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});
type Form = z.infer<typeof schema>;

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    await new Promise((r) => setTimeout(r, 600));

    // Admin check
    if (data.email === ADMIN_EMAIL && data.password === ADMIN_PASSWORD) {
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminEmail", data.email);
      router.push("/admin/dashboard");
      return;
    }

    // User login - TODO: replace with real API
    // const res = await fetch("/api/auth/login", { method: "POST", body: JSON.stringify(data) });
    // if (!res.ok) { setError("password", { message: "Invalid email or password" }); return; }
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", data.email);
    router.push("/account");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <h1
          className="text-3xl font-bold text-[#2B2B2B] mb-1"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Sign In
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          Access your workspace account
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
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
                {...register("email")}
                type="email"
                placeholder="you@company.com"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white placeholder:text-gray-300 text-gray-700 focus:border-[#C9A36A] focus:ring-2 focus:ring-[#C9A36A]/20 outline-none transition-all"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-[11px] mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium text-[#2B2B2B]">
                Password
              </label>
              <Link href="#" className="text-xs text-[#C9A36A] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-3.5 text-gray-300"
              />
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white placeholder:text-gray-300 text-gray-700 focus:border-[#C9A36A] focus:ring-2 focus:ring-[#C9A36A]/20 outline-none transition-all"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-[11px] mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-[#C9A36A] hover:bg-[#A8834A] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm group"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
            {!isSubmitting && (
              <ArrowRight
                size={15}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white hover:bg-gray-50 py-3 rounded-xl transition-colors text-sm text-gray-600 font-medium"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-[#C9A36A] font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
