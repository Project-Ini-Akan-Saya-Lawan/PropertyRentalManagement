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
  floor: z.string().min(1, "Required"),
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

// Mapping slug → pack_id dari database
const SLUG_TO_PACK_ID: Record<string, number> = {
  "wowo-starter-pack": 1,
  "wowo-business-pack": 2,
  "wowo-executive-pack": 3,
  "wowi-starter-pack": 4,
  "wowi-business-pack": 5,
  "wowi-executive-pack": 6,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

function calcEndDate(date: string, commitmentTerms: string): string | null {
  if (!date || !commitmentTerms) return null;
  const start = new Date(date);
  const y = parseInt(commitmentTerms) || 1;
  start.setFullYear(start.getFullYear() + y);
  start.setDate(start.getDate() - 1);
  return start.toISOString().split("T")[0];
}

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
    defaultValues: {},
  });

  const w = watch();
  const endDate = calcEndDate(w.date, w.commitmentTerms);

  const onSubmit = async (data: Form) => {
    // Simpan ke sessionStorage dulu untuk halaman berikutnya
    sessionStorage.setItem(
      `rent-${slug}`,
      JSON.stringify({
        ...data,
        tower: workspace.tower,
        type: workspace.workspaceType,
        endDate,
      }),
    );

    // Kirim booking ke backend
    const token = localStorage.getItem("token");
    const pack_id = SLUG_TO_PACK_ID[slug];
    const floorNum = parseInt(data.floor.replace("Floor ", ""));
    const years = parseInt(data.commitmentTerms) || 1;
    const months = years * 12;

    if (token && pack_id) {
      try {
        await fetch(`${API_URL}/api/bookings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pack_id,
            floor_booked: floorNum,
            start_date: data.date,
            months,
          }),
        });
      } catch (err) {
        console.error("Failed to create booking:", err);
      }
    }

    router.push(`/workspace/${slug}/rent-details/confirm-details`);
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

        <BookingStepper step={1} />

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-5 mb-5">
                {/* Tower - static */}
                <div>
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    Tower
                  </label>
                  <div className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-[#F5F5F5]">
                    {workspace.tower === "Wiwi Tower"
                      ? "Wowi Tower"
                      : workspace.tower}
                  </div>
                </div>

                {/* Type Office - static */}
                <div>
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    Type Office
                  </label>
                  <div className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-[#F5F5F5]">
                    {workspace.workspaceType}
                  </div>
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

                {/* Start Date */}
                <div>
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    Start Date
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

                {/* End Date - auto calculated */}
                <div>
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    End Date
                  </label>
                  <div
                    className={`w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm bg-[#F5F5F5] ${endDate ? "text-[#C9A36A] font-semibold" : "text-gray-300"}`}
                  >
                    {endDate ||
                      "Auto-filled after selecting Start Date & Commitment Terms"}
                  </div>
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
            type={workspace.workspaceType}
            date={w.date}
            commitmentTerms={w.commitmentTerms}
          />
        </div>
      </div>
    </div>
  );
}
