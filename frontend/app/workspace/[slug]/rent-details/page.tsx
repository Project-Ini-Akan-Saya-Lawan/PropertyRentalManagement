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
import { getWorkspaceBySlug, apiPackToWorkspace } from "@/data/workspaces";
import { Workspace } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const schema = z.object({
  floor: z.string().min(1, "Required"),
  commitmentTerms: z.string().min(1, "Required"),
  date: z.string().min(1, "Required"),
});
type Form = z.infer<typeof schema>;

const TERMS = ["1 Year", "5 Years", "10 Years", "15 Years", "20 Years"];

function getFloorOptions(floorRange: string): string[] {
  const match = floorRange.match(/(\d+)\D+(\d+)/);
  if (!match) return [];
  const min = Number(match[1]);
  const max = Number(match[2]);
  if (isNaN(min) || isNaN(max) || min > max) return [];
  const floors: string[] = [];
  for (let f = min; f <= max; f++) floors.push(`Floor ${f}`);
  return floors;
}

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
  const [workspace, setWorkspace] = useState<Workspace | null>(
    getWorkspaceBySlug(slug) || null,
  );
  const [loading, setLoading] = useState(!workspace);

  useEffect(() => {
    if (workspace) return;
    // Fetch from API for non-static slugs (e.g. pack-8)
    fetch(`${API_URL}/api/floor-packs`)
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          const packIdMatch = slug.match(/^pack-(\d+)$/);
          const found = packIdMatch
            ? result.data.find(
                (p: { pack_id: number }) =>
                  p.pack_id === Number(packIdMatch[1]),
              )
            : result.data.find(
                (p: { pack_name: string }) =>
                  p.pack_name.toLowerCase().replace(/\s+/g, "-") === slug,
              );
          if (found) setWorkspace(apiPackToWorkspace(found));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

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
  const floorOptions = workspace ? getFloorOptions(workspace.floorRange) : [];

  const onSubmit = (data: Form) => {
    if (!workspace) return;
    sessionStorage.setItem(
      `rent-${slug}`,
      JSON.stringify({
        ...data,
        tower: workspace.tower,
        type: workspace.workspaceType,
        endDate,
      }),
    );
    router.push(`/workspace/${slug}/rent-details/confirm-details`);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );

  if (!workspace)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Package not found.</p>
      </div>
    );

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
                <div>
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    Type Office
                  </label>
                  <div className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-[#F5F5F5]">
                    {workspace.workspaceType}
                  </div>
                </div>
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
                <div>
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    Floor
                  </label>
                  <select
                    {...register("floor")}
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-white"
                    disabled={floorOptions.length === 0}
                  >
                    <option value="">
                      {floorOptions.length > 0
                        ? "Select floor"
                        : "No floors available"}
                    </option>
                    {floorOptions.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Available: {workspace.floorRange}
                  </p>
                  {errors.floor && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.floor.message}
                    </p>
                  )}
                </div>
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
