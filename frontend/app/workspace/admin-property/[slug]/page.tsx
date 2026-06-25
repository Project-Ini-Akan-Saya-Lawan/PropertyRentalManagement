"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Users,
  MapPin,
  ArrowLeft,
  ChevronRight,
  Building2,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import WorkspaceCard from "@/components/cards/WorkspaceCard";
import { Workspace } from "@/types";
import { getWowoWorkspaces, getWowiWorkspaces } from "@/data/workspaces";

interface Property {
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

const STORAGE_KEY = "admin_properties";

function adminToWorkspace(p: Property): Workspace {
  return {
    id: p.id,
    slug: `admin-property/${p.slug || p.id}`,
    name: p.name,
    tower: p.tower as "Wowo Tower" | "Wiwi Tower",
    pack: p.type as string,
    description: p.description || `${p.type} at ${p.tower}`,
    longDescription: p.longDescription || "",
    image: p.image || "/buildings/building-front.png",
    gallery: [p.image],
    capacity: p.capacity,
    workspaceType: p.type,
    floorRange: p.floor,
    monthlyPrice: p.price,
    taxRate: 0.11,
    securityDeposit: p.price * 2,
    features: p.features?.filter(Boolean) || [],
    availability:
      p.status === "Available"
        ? "Available"
        : p.status === "Occupied"
          ? "Full"
          : "Limited",
    relatedSlugs: [],
  };
}

export default function AdminPropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [related, setRelated] = useState<Workspace[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const adminAll: Property[] = stored ? JSON.parse(stored) : [];

    // Find current property
    const found = adminAll.find(
      (p) => p.slug === params.slug || p.id === params.slug,
    );
    setProperty(found || null);

    // Related: static workspaces + other admin properties, max 3
    const staticAll: Workspace[] = [
      ...getWowoWorkspaces(),
      ...getWowiWorkspaces(),
    ];
    const adminOthers: Workspace[] = adminAll
      .filter((p) => p.id !== found?.id)
      .map(adminToWorkspace);

    const relatedAll = [...staticAll, ...adminOthers];
    setRelated(relatedAll.slice(0, 3));

    setLoaded(true);
  }, [params.slug]);

  if (!loaded)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A36A] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!property)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-bold text-[#2B2B2B]">Property not found</p>
        <Link
          href="/workspace"
          className="text-xs text-[#C9A36A] hover:underline"
        >
          ← Back to Workspace
        </Link>
      </div>
    );

  const features = property.features?.filter(Boolean) || [];
  const half = Math.ceil(features.length / 2);
  const col1 = features.slice(0, half);
  const col2 = features.slice(half);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative w-full min-h-[380px] overflow-hidden">
        <Image
          src={property.image}
          alt={property.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 flex flex-col justify-end min-h-[380px]">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-semibold mb-4 w-fit"
          >
            <ArrowLeft size={13} /> Back to Workspaces
          </button>

          <div className="flex gap-2 mb-3">
            <span className="text-[10px] font-bold bg-[#C9A36A] text-white px-2.5 py-1 rounded-full">
              {property.tower}
            </span>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                property.status === "Available"
                  ? "bg-white/20 text-white border border-white/40"
                  : property.status === "Occupied"
                    ? "bg-white/20 text-white border border-white/40"
                    : "bg-white/20 text-white border border-white/40"
              }`}
            >
              {property.status}
            </span>
          </div>

          <h1
            className="text-3xl md:text-4xl font-bold text-white"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {property.name}
          </h1>
        </div>
      </section>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Left col */}
          <div className="md:col-span-2">
            {/* Chips */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                {
                  icon: <Users size={20} className="text-[#C9A36A]" />,
                  label: "Capacity",
                  value: `${property.capacity} people`,
                },
                {
                  icon: <Building2 size={20} className="text-[#C9A36A]" />,
                  label: "Tower",
                  value: property.tower,
                },
                {
                  icon: <MapPin size={20} className="text-[#C9A36A]" />,
                  label: "Floors",
                  value: property.floor,
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="border border-gray-100 rounded-xl p-4 flex flex-col items-center gap-1 shadow-sm"
                >
                  {c.icon}
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    {c.label}
                  </p>
                  <p className="text-sm font-bold text-[#2B2B2B]">{c.value}</p>
                </div>
              ))}
            </div>

            {/* About */}
            {(property.description || property.longDescription) && (
              <div className="mb-8">
                <h2
                  className="text-lg font-bold text-[#2B2B2B] mb-3"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  About
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {property.longDescription || property.description}
                </p>
              </div>
            )}

            {/* What's Included */}
            {features.length > 0 && (
              <div className="mb-8">
                <h2
                  className="text-lg font-bold text-[#2B2B2B] mb-4"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  What&apos;s Included
                </h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
                  {col1.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle
                        size={15}
                        className="text-[#C9A36A] flex-shrink-0"
                      />{" "}
                      {f}
                    </div>
                  ))}
                  {col2.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle
                        size={15}
                        className="text-[#C9A36A] flex-shrink-0"
                      />{" "}
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            <div className="mb-8">
              <h2
                className="text-lg font-bold text-[#2B2B2B] mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Gallery
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {[property.image, property.image, property.image].map(
                  (img, i) => (
                    <div
                      key={i}
                      className="relative h-32 rounded-xl overflow-hidden"
                    >
                      <Image
                        src={img}
                        alt={`${property.name} ${i + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Right: Booking card */}
          <div>
            <div className="border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-24">
              <p className="text-xs text-gray-400 mb-1">Starting from</p>
              <p
                className="text-2xl font-bold text-[#2B2B2B] mb-0.5"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Rp {property.price.toLocaleString("id-ID")},00
              </p>
              <p className="text-xs text-gray-400 mb-1">/month</p>
              <p className="text-xs text-[#C9A36A] mb-5">+ 11% tax</p>

              <div className="space-y-2.5 mb-5">
                {[
                  { label: "Type", value: property.type },
                  { label: "Floors", value: property.floor },
                  { label: "Capacity", value: `${property.capacity} people` },
                  {
                    label: "Availability",
                    value: property.status,
                    color: "text-[#C9A36A]",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="flex justify-between text-xs border-b border-gray-50 pb-2 last:border-0"
                  >
                    <span className="text-gray-400">{label}</span>
                    <span
                      className={`font-semibold ${color || "text-[#2B2B2B]"}`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href={`/workspace/admin-property/${property.slug}/rent-details`}
                className="w-full flex items-center justify-center gap-2 bg-[#C9A36A] hover:bg-[#A8834A] text-white font-bold text-sm py-3 rounded-xl transition-colors mb-3"
              >
                Rent Now <ChevronRight size={16} />
              </Link>

              <button className="w-full border border-gray-200 text-[#2B2B2B] text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Ask a Question
              </button>
            </div>
          </div>
        </div>

        {/* Related Packages - static + admin */}
        {related.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h2
              className="text-xl font-bold text-[#2B2B2B] mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Related Packages
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((ws, i) => (
                <motion.div
                  key={ws.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <WorkspaceCard workspace={ws} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
