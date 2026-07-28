"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Users,
  Building2,
  MapPin,
  ArrowLeft,
  ChevronRight,
  LogIn,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Footer from "@/components/layout/Footer";
import { formatIDR } from "@/lib/utils";
import { getWorkspaceBySlug } from "@/data/workspaces";
import WorkspaceDetailClient from "./WorkspaceDetailClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const TOWERS: Record<number, string> = { 1: "Wowo Tower", 2: "Wowi Tower" };

interface Pack {
  pack_id: number;
  pack_name: string;
  property_id: number;
  description: string;
  floor_range: string;
  price: number;
  image_url?: string;
}

function WorkspaceDetailAPI({ pack }: { pack: Pack }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("isLoggedIn"));
  }, []);

  const slug = `pack-${pack.pack_id}`;
  const price = Number(pack.price);
  const tax = price * 0.11;
  const total = price + tax;
  const tower = TOWERS[pack.property_id] || `Tower ${pack.property_id}`;
  const image = pack.image_url || "/buildings/building-front.png";

  const handleRentNow = () => {
    if (!isLoggedIn) {
      setShowModal(true);
      return;
    }
    router.push(`/workspace/${slug}/rent-details`);
  };

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X size={15} className="text-gray-400" />
              </button>
              <div className="w-14 h-14 bg-[#C9A36A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn size={24} className="text-[#C9A36A]" />
              </div>
              <h3
                className="text-lg font-bold text-[#2B2B2B] text-center mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Sign In Required
              </h3>
              <p className="text-xs text-[#2B2B2B]/60 text-center mb-6 leading-relaxed">
                You need an account to rent a workspace.
              </p>
              <div className="space-y-2.5">
                <Link
                  href={`/login?redirect=/workspace/${slug}/rent-details`}
                  className="flex items-center justify-center gap-2 w-full bg-[#C9A36A] hover:bg-[#A8834A] text-white font-bold text-sm py-3 rounded-xl transition-colors"
                >
                  <LogIn size={15} /> Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-2 w-full border-2 border-[#C9A36A]/40 text-[#2B2B2B] font-semibold text-sm py-3 rounded-xl hover:bg-[#C9A36A]/5 transition-colors"
                >
                  <UserPlus size={15} /> Create Account
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-[320px] overflow-hidden">
        <img
          src={image}
          alt={pack.pack_name}
          className="w-full h-full object-cover"
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
              {tower}
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">
            {pack.pack_name}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { icon: Building2, label: "Tower", value: tower },
                {
                  icon: MapPin,
                  label: "Floor Range",
                  value: `Floor ${pack.floor_range}`,
                },
                { icon: Users, label: "Pack ID", value: `#${pack.pack_id}` },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-[#F5F5F5] rounded-xl p-4 text-center"
                >
                  <s.icon size={18} className="text-[#C9A36A] mx-auto mb-1.5" />
                  <p className="text-[10px] text-gray-400">{s.label}</p>
                  <p className="font-semibold text-xs text-[#2B2B2B] mt-0.5">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
            <h2 className="font-semibold text-[#2B2B2B] mb-3">About</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {pack.description ||
                "Premium workspace package at Rupiah Building, Jababeka."}
            </p>
          </div>

          <div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
              <p className="text-xs text-gray-400 mb-1">Annual Fee</p>
              <p className="font-bold text-2xl text-[#2B2B2B]">
                {formatIDR(price)}
                <span className="text-sm font-normal text-gray-400">/year</span>
              </p>
              <p className="text-xs text-gray-400 mt-1 mb-5">+ 11% tax</p>
              <div className="space-y-2 text-xs text-gray-500 mb-5 pb-5 border-b border-gray-100">
                <div className="flex justify-between">
                  <span>Tower</span>
                  <span className="font-medium text-[#2B2B2B]">{tower}</span>
                </div>
                <div className="flex justify-between">
                  <span>Floors</span>
                  <span className="font-medium text-[#2B2B2B]">
                    Floor {pack.floor_range}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax + VAT</span>
                  <span className="font-medium text-[#2B2B2B]">
                    {formatIDR(tax)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-[#C9A36A]">
                  <span>Total</span>
                  <span>{formatIDR(total)}</span>
                </div>
              </div>
              <button
                onClick={handleRentNow}
                className="flex items-center justify-center gap-2 w-full bg-[#C9A36A] hover:bg-[#A8834A] text-white font-semibold text-sm py-3 rounded-md transition-colors group"
              >
                Rent Now{" "}
                <ChevronRight
                  size={15}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </button>
              <Link
                href="/contact"
                className="flex items-center justify-center w-full border border-gray-200 text-gray-500 text-xs font-medium py-2.5 rounded-md mt-2 hover:bg-gray-50 transition-colors"
              >
                Ask a Question
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function WorkspaceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [pack, setPack] = useState<Pack | null>(null);
  const [loading, setLoading] = useState(true);

  // Check static data first
  const staticWorkspace = getWorkspaceBySlug(slug);

  useEffect(() => {
    if (staticWorkspace) {
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/api/floor-packs`)
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          // Match by pack-{id} slug OR by name slug
          const packIdMatch = slug.match(/^pack-(\d+)$/);
          const found = packIdMatch
            ? result.data.find(
                (p: Pack) => p.pack_id === Number(packIdMatch[1]),
              )
            : result.data.find(
                (p: Pack) =>
                  p.pack_name.toLowerCase().replace(/\s+/g, "-") === slug,
              );
          setPack(found || null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (staticWorkspace)
    return <WorkspaceDetailClient workspace={staticWorkspace} />;
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  if (!pack)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Package not found.</p>
      </div>
    );
  return <WorkspaceDetailAPI pack={pack} />;
}
