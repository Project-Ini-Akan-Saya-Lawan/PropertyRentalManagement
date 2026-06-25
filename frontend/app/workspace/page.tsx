"use client";

import { useEffect, useState } from "react";
import HeroSection from "@/components/sections/HeroSection";
import AmenitiesSection from "@/components/sections/AmenitiesSection";
import Footer from "@/components/layout/Footer";
import WorkspaceCard from "@/components/cards/WorkspaceCard";
import { getWowoWorkspaces, getWowiWorkspaces } from "@/data/workspaces";
import { Workspace } from "@/types";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STORAGE_KEY = "admin_properties";

interface AdminProperty {
  id: string;
  name: string;
  tower: string;
  floor: string;
  type: string;
  capacity: number;
  price: number;
  status: "Available" | "Occupied" | "Maintenance";
  owner: string;
  createdAt: string;
  image: string;
  slug: string;
  description: string;
  longDescription: string;
  features: string[];
}

function adminToWorkspace(p: AdminProperty): Workspace {
  return {
    id: p.id,
    slug: `admin-property/${p.slug || p.id}`,
    name: p.name,
    tower: p.tower as "Wowo Tower" | "Wiwi Tower",
    pack: (p.type || "Starter Pack") as
      | "Starter Pack"
      | "Business Pack"
      | "Executive Pack",
    description: p.description || `${p.type} at ${p.tower}`,
    longDescription:
      p.longDescription ||
      `${p.name} is a premium workspace at ${p.tower}, ${p.floor}.`,
    image: p.image || "/buildings/building-front.png",
    gallery: [p.image || "/buildings/building-front.png"],
    capacity: p.capacity,
    workspaceType: p.type,
    floorRange: p.floor,
    monthlyPrice: p.price,
    taxRate: 0.11,
    securityDeposit: p.price * 2,
    features: p.features?.filter(Boolean) || [
      p.floor,
      `Up to ${p.capacity} people`,
      p.type,
    ],
    availability:
      p.status === "Available"
        ? "Available"
        : p.status === "Occupied"
          ? "Full"
          : "Limited",
    relatedSlugs: [],
  };
}

function WorkspaceCarousel({
  title,
  workspaces,
}: {
  title: string;
  workspaces: Workspace[];
}) {
  const [index, setIndex] = useState(0);
  const VISIBLE = 3;
  const total = workspaces.length;
  const maxIndex = Math.max(0, total - VISIBLE);

  if (total === 0) return null;

  const visible = workspaces.slice(index, index + VISIBLE);

  return (
    <section className="py-10 bg-white border-t border-gray-100">
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
  const [adminProperties, setAdminProperties] = useState<AdminProperty[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setAdminProperties(JSON.parse(stored));
  }, []);

  const staticWowo = getWowoWorkspaces();
  const staticWowi = getWowiWorkspaces();

  const adminWowo = adminProperties
    .filter((p) => p.tower === "Wowo Tower")
    .map(adminToWorkspace);
  const adminWowi = adminProperties
    .filter((p) => p.tower === "Wowi Tower")
    .map(adminToWorkspace);

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
        workspaces={[...staticWowo, ...adminWowo]}
      />
      <div className="bg-[#F5F5F5]">
        <WorkspaceCarousel
          title="Our services at Wowi Tower"
          workspaces={[...staticWowi, ...adminWowi]}
        />
      </div>
      <AmenitiesSection />
      <Footer />
    </>
  );
}
