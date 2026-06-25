"use client";

import { use } from "react";
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
  tower: z.string().min(1, "Required"),
  floor: z.string().min(1, "Required"),
  type: z.string().min(1, "Required"),
  commitmentTerms: z.string().min(1, "Required"),
  date: z.string().min(1, "Required"),
});

type Form = z.infer<typeof schema>;

const FLOORS = [
  "Floor 5",
  "Floor 6",
  "Floor 7",
  "Floor 8",
  "Floor 10",
  "Floor 11",
  "Floor 15",
  "Floor 18",
  "Floor 19",
  "Floor 20",
  "Floor 25",
];
const TERMS = ["1 Year", "5 Years", "10 Years", "15 Years", "20 Years"];
const TYPES = ["Coworking Desk", "Business Executive", "Executive Suite"];

export default function RentDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const workspace = getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { tower: workspace.tower },
  });

  const w = watch();

  const onSubmit = (data: Form) => {
    sessionStorage.setItem(`rent-${slug}`, JSON.stringify(data));
    router.push(`/workspace/${slug}/rent-details/confirm-details`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft size={13} /> Back
        </button>

        <h1 className="font-serif text-2xl font-bold text-[#C9A36A] mb-6">
          Rent Details
        </h1>

        <BookingStepper step={1} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid sm:grid-cols-2 gap-5 mb-5">
                {/* Tower */}
                <div>
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    Tower
                  </label>
                  <select
                    {...register("tower")}
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-white appearance-none"
                  >
                    <option value="">Select tower</option>
                    <option value="Wowo Tower">Wowo Tower</option>
                    <option value="Wowi Tower">Wowi Tower</option>
                  </select>
                  {errors.tower && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.tower.message}
                    </p>
                  )}
                </div>

                {/* Commitment Terms */}
                <div>
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    Commitment Terms
                  </label>
                  <select
                    {...register("commitmentTerms")}
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-white"
                  >
                    <option value="">Select term</option>
                    {TERMS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {errors.commitmentTerms && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.commitmentTerms.message}
                    </p>
                  )}
                </div>

                {/* Floor */}
                <div>
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    Floor
                  </label>
                  <select
                    {...register("floor")}
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-white"
                  >
                    <option value="">Select floor</option>
                    {FLOORS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  {errors.floor && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.floor.message}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    {...register("date")}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700"
                  />
                  {errors.date && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.date.message}
                    </p>
                  )}
                </div>

                {/* Type */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    Type
                  </label>
                  <select
                    {...register("type")}
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-white"
                  >
                    <option value="">Select type</option>
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.type.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="bg-[#C9A36A] hover:bg-[#A8834A] text-white font-semibold text-sm px-8 py-2.5 rounded-md transition-colors"
              >
                Continue
              </button>
            </form>
          </motion.div>

          {/* Summary */}
          <BookingSummary
            workspace={workspace}
            floor={w.floor}
            type={w.type}
            date={w.date}
          />
        </div>
      </div>
    </div>
  );
}
