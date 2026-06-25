"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import BookingStepper from "@/components/booking/BookingStepper";
import BookingSummary from "@/components/booking/BookingSummary";
import { getWorkspaceBySlug } from "@/data/workspaces";
import { notFound } from "next/navigation";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(8, "Required"),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms" }),
  }),
});

type Form = z.infer<typeof schema>;

export default function ConfirmDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const workspace = getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const [rentData, setRentData] = useState<{
    floor?: string;
    type?: string;
    date?: string;
  }>({});

  useEffect(() => {
    const raw = sessionStorage.getItem(`rent-${slug}`);
    if (raw) setRentData(JSON.parse(raw));
  }, [slug]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: Form) => {
    sessionStorage.setItem(`personal-${slug}`, JSON.stringify(data));
    router.push(`/workspace/${slug}/rent-details/payment`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft size={13} /> Back
        </button>

        <h1 className="font-serif text-2xl font-bold text-[#C9A36A] mb-6">
          Rent Details
        </h1>

        <BookingStepper step={2} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <h2 className="font-semibold text-[#2B2B2B] mb-5">
              Personal Information
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <input
                    {...register("firstName")}
                    placeholder="First Name"
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register("lastName")}
                    placeholder="Last Name"
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Email"
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300"
                />
                {errors.email && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="Phone"
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300"
                />
                {errors.phone && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="mt-2">
                <h3 className="font-semibold text-sm text-[#2B2B2B] mb-2">
                  Terms &amp; Eligibility
                </h3>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("acceptTerms")}
                    className="mt-0.5 accent-[#C9A36A]"
                  />
                  <span className="text-xs text-gray-500">
                    I acknowledge and agree to Rupiah Building&apos;s{" "}
                    <span className="text-[#C9A36A] underline cursor-pointer">
                      Terms of Use
                    </span>{" "}
                    and{" "}
                    <span className="text-[#C9A36A] underline cursor-pointer">
                      Privacy Policy
                    </span>
                    .
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {errors.acceptTerms.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="border border-gray-200 text-gray-500 font-semibold text-sm px-6 py-2.5 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-[#C9A36A] hover:bg-[#A8834A] text-white font-semibold text-sm px-8 py-2.5 rounded-md transition-colors"
                >
                  Continue
                </button>
              </div>
            </form>
          </motion.div>

          {/* Summary */}
          <BookingSummary
            workspace={workspace}
            floor={rentData.floor}
            type={rentData.type}
            date={rentData.date}
          />
        </div>
      </div>
    </div>
  );
}
