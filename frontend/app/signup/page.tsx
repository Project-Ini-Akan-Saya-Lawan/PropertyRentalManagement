"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  Building2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

const schema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(8, "Phone number is required"),
    company: z.string().optional(),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Form = z.infer<typeof schema>;

export default function SignupPage() {
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
    try {
      const response = await fetch(
        "http://localhost:3001/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: data.fullName,
            email: data.email,
            phone_number: data.phone,
            password: data.password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError("email", {
          message: result.message || "Registration failed",
        });
        return;
      }

      alert(result.message);

      router.push("/login");
    } catch (error) {
      console.error(error);

      setError("email", {
        message: "Cannot connect to backend server.",
      });
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
    <h1 className="font-serif text-3xl font-bold text-[#2B2B2B] mb-1">
      Create Account
    </h1>

    <p className="text-sm text-gray-400 mb-8">
      Join Rupiah Building today
    </p>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5">
          Full Name <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <User
            size={15}
            className="absolute left-3.5 top-3.5 text-gray-300"
          />

          <input
            {...register("fullName")}
            placeholder="John Doe"
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white placeholder:text-gray-300 text-gray-700 focus:border-[#C9A36A] focus:ring-2 focus:ring-[#C9A36A]/20 outline-none transition-all"
          />
        </div>

        {errors.fullName && (
          <p className="text-red-500 text-[11px] mt-1">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5">
          Email Address <span className="text-red-500">*</span>
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

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5">
          Phone Number <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <Phone
            size={15}
            className="absolute left-3.5 top-3.5 text-gray-300"
          />

          <input
            {...register("phone")}
            type="tel"
            placeholder="+62 812 3456 7890"
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white placeholder:text-gray-300 text-gray-700 focus:border-[#C9A36A] focus:ring-2 focus:ring-[#C9A36A]/20 outline-none transition-all"
          />
        </div>

        {errors.phone && (
          <p className="text-red-500 text-[11px] mt-1">
            {errors.phone.message}
          </p>
        )}
      </div> 
            {/* Company (Optional) */}
      <div>
        <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5">
          Company Name{" "}
          <span className="text-gray-400 font-normal">(Optional)</span>
        </label>

        <div className="relative">
          <Building2
            size={15}
            className="absolute left-3.5 top-3.5 text-gray-300"
          />

          <input
            {...register("company")}
            placeholder="Your company"
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white placeholder:text-gray-300 text-gray-700 focus:border-[#C9A36A] focus:ring-2 focus:ring-[#C9A36A]/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5">
          Password <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <Lock
            size={15}
            className="absolute left-3.5 top-3.5 text-gray-300"
          />

          <input
            {...register("password")}
            type="password"
            placeholder="At least 8 characters"
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white placeholder:text-gray-300 text-gray-700 focus:border-[#C9A36A] focus:ring-2 focus:ring-[#C9A36A]/20 outline-none transition-all"
          />
        </div>

        {errors.password && (
          <p className="text-red-500 text-[11px] mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5">
          Confirm Password <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <Lock
            size={15}
            className="absolute left-3.5 top-3.5 text-gray-300"
          />

          <input
            {...register("confirmPassword")}
            type="password"
            placeholder="Repeat your password"
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white placeholder:text-gray-300 text-gray-700 focus:border-[#C9A36A] focus:ring-2 focus:ring-[#C9A36A]/20 outline-none transition-all"
          />
        </div>

        {errors.confirmPassword && (
          <p className="text-red-500 text-[11px] mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Terms */}
      <p className="text-xs text-gray-400 leading-relaxed">
        By creating an account, you agree to our{" "}
        <Link
          href="#"
          className="text-[#C9A36A] hover:underline"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="#"
          className="text-[#C9A36A] hover:underline"
        >
          Privacy Policy
        </Link>
        .
      </p>
      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 bg-[#2B2B2B] text-white text-sm font-medium py-3 rounded-xl hover:bg-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isSubmitting ? (
          "Creating account..."
        ) : (
          <>
            Create Account
            <ArrowRight size={16} />
          </>
        )}
      </motion.button>

      {/* Already have an account */}
      <p className="text-center text-sm text-gray-400 pt-2">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#C9A36A] font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  </motion.div>
</div>
  );
}