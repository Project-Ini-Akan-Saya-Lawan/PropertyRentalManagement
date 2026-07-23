"use client";

import { useEffect, useState } from "react";
import HeroSection from "@/components/sections/HeroSection";
import AmenitiesSection from "@/components/sections/AmenitiesSection";
import Footer from "@/components/layout/Footer";
import WorkspaceCard from "@/components/cards/WorkspaceCard";
import {
  apiPackToWorkspace,
  getWowoWorkspaces,
  getWowiWorkspaces,
} from "@/data/workspaces";
import { Workspace } from "@/types";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

function WorkspaceCarousel({
  title,
  workspaces,
  bg,
}: {
  title: string;
  workspaces: Workspace[];
  bg?: string;
}) {
  const [index, setIndex] = useState(0);
  const VISIBLE = 3;
  const total = workspaces.length;
  const maxIndex = Math.max(0, total - VISIBLE);

  if (total === 0) return null;

  const visible = workspaces.slice(index, index + VISIBLE);

  return (
    <section className={`py-10 border-t border-gray-100 ${bg || "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-bold text-[#C9A36A]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {title}
          </h2>
          {total > VISIBLE && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#2B2B2B]/50">
                {index + 1}–{Math.min(index + VISIBLE, total)} of {total}
              </span>
              <button
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                className="w-8 h-8 rounded-full border-2 border-[#C9A36A]/40 flex items-center justify-center hover:bg-[#C9A36A] hover:text-white text-[#C9A36A] transition-all disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
                disabled={index >= maxIndex}
                className="w-8 h-8 rounded-full border-2 border-[#C9A36A]/40 flex items-center justify-center hover:bg-[#C9A36A] hover:text-white text-[#C9A36A] transition-all disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((ws, i) => (
            <motion.div
              key={ws.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="flex"
            >
              <WorkspaceCard workspace={ws} />
            </motion.div>
          ))}
        </div>

        {total > VISIBLE && (
          <div className="flex justify-center gap-1.5 mt-5">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`rounded-full transition-all ${i === index ? "w-5 h-2 bg-[#C9A36A]" : "w-2 h-2 bg-[#C9A36A]/30"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function WorkspacePage() {
  const [wowoWorkspaces, setWowoWorkspaces] =
    useState<Workspace[]>(getWowoWorkspaces());
  const [wowiWorkspaces, setWowiWorkspaces] =
    useState<Workspace[]>(getWowiWorkspaces());

  useEffect(() => {
    // Fetch dari API dan merge dengan static data
    fetch(`${API_URL}/api/floor-packs`)
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          const all = result.data.map(apiPackToWorkspace);
          const wowo = all.filter((w: Workspace) => w.tower === "Wowo Tower");
          const wowi = all.filter((w: Workspace) => w.tower === "Wiwi Tower");
          if (wowo.length > 0) setWowoWorkspaces(wowo);
          if (wowi.length > 0) setWowiWorkspaces(wowi);
        }
      })
      .catch(() => {
        // Fallback ke static data sudah di-set di useState default
      });
  }, []);

  return (
    <>
      <HeroSection
        image="/buildings/buildview.png"
        title="Premium Workspaces at Rupiah Building"
        subtitle="Choose from our curated packages in Wowo Tower and Wowi Tower."
        minHeight="min-h-[420px]"
      />
      <WorkspaceCarousel
        title="Our services at Wowo Tower"
        workspaces={wowoWorkspaces}
      />
      <div className="bg-[#F5F5F5]">
        <WorkspaceCarousel
          title="Our services at Wowi Tower"
          workspaces={wowiWorkspaces}
          bg="bg-[#F5F5F5]"
        />
      </div>
      <AmenitiesSection />
      <Footer />
    </>
  );
}
