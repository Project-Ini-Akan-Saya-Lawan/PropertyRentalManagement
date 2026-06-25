"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView, motion } from "framer-motion";
import {
  Users,
  Building2,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { Workspace } from "@/types";
import { formatIDR } from "@/lib/utils";
import { getWorkspaceBySlug } from "@/data/workspaces";
import WorkspaceCard from "@/components/cards/WorkspaceCard";
import Footer from "@/components/layout/Footer";

export default function WorkspaceDetailClient({
  workspace,
}: {
  workspace: Workspace;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const related = workspace.relatedSlugs
    .map(getWorkspaceBySlug)
    .filter(Boolean) as Workspace[];

  return (
    <>
      {/* Hero */}
      <div className="relative h-[380px] overflow-hidden">
        <Image
          src={workspace.image}
          alt={workspace.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
          <Link
            href="/workspace"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs mb-3 transition-colors"
          >
            <ArrowLeft size={13} /> Back to Workspaces
          </Link>
          <div className="flex gap-2 mb-2">
            <span className="bg-[#C9A36A] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded">
              {workspace.tower}
            </span>
            <span className="bg-white/20 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded">
              {workspace.availability}
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">
            {workspace.name}
          </h1>
        </div>
      </div>

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              {/* Quick specs */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  {
                    icon: Users,
                    label: "Capacity",
                    value: `${workspace.capacity} people`,
                  },
                  { icon: Building2, label: "Tower", value: workspace.tower },
                  {
                    icon: MapPin,
                    label: "Floors",
                    value: workspace.floorRange,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-[#F5F5F5] rounded-xl p-4 text-center"
                  >
                    <s.icon
                      size={18}
                      className="text-[#C9A36A] mx-auto mb-1.5"
                    />
                    <p className="text-[10px] text-gray-400">{s.label}</p>
                    <p className="font-semibold text-xs text-[#2B2B2B] mt-0.5">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              <h2 className="font-semibold text-[#2B2B2B] mb-3">About</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {workspace.longDescription}
              </p>

              <h2 className="font-semibold text-[#2B2B2B] mb-3">
                What&apos;s Included
              </h2>
              <div className="grid sm:grid-cols-2 gap-2.5 mb-8">
                {workspace.features.map((f) => (
                  <div
                    key={f}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <CheckCircle2
                      size={14}
                      className="text-[#C9A36A] mt-0.5 flex-shrink-0"
                    />
                    {f}
                  </div>
                ))}
              </div>

              {/* Gallery */}
              <h2 className="font-semibold text-[#2B2B2B] mb-3">Gallery</h2>
              <div className="grid grid-cols-3 gap-2">
                {workspace.gallery.map((img, i) => (
                  <div
                    key={i}
                    className="relative h-28 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={img}
                      alt={`Gallery ${i + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right – Pricing CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
              <p className="text-xs text-gray-400 mb-1">Starting from</p>
              <p className="font-bold text-2xl text-[#2B2B2B]">
                {formatIDR(workspace.monthlyPrice)}
                <span className="text-sm font-normal text-gray-400">
                  /month
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1 mb-5">
                + {(workspace.taxRate * 100).toFixed(0)}% tax
              </p>

              <div className="space-y-2 text-xs text-gray-500 mb-5 pb-5 border-b border-gray-100">
                <div className="flex justify-between">
                  <span>Type</span>
                  <span className="font-medium text-[#2B2B2B]">
                    {workspace.workspaceType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Floors</span>
                  <span className="font-medium text-[#2B2B2B]">
                    {workspace.floorRange}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Capacity</span>
                  <span className="font-medium text-[#2B2B2B]">
                    {workspace.capacity} people
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Availability</span>
                  <span
                    className={`font-semibold ${workspace.availability === "Available" ? "text-green-600" : "text-orange-500"}`}
                  >
                    {workspace.availability}
                  </span>
                </div>
              </div>

              <Link
                href={`/workspace/${workspace.slug}/rent-details`}
                className="flex items-center justify-center gap-2 w-full bg-[#C9A36A] hover:bg-[#A8834A] text-white font-semibold text-sm py-3 rounded-md transition-colors group"
              >
                Rent Now
                <ChevronRight
                  size={15}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-center w-full border border-gray-200 text-gray-500 text-xs font-medium py-2.5 rounded-md mt-2 hover:bg-gray-50 transition-colors"
              >
                Ask a Question
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-100">
            <h2 className="font-semibold text-[#2B2B2B] mb-6">
              Related Packages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((ws) => (
                <WorkspaceCard key={ws.id} workspace={ws} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
