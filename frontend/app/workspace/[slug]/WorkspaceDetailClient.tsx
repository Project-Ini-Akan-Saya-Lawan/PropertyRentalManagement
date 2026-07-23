"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInView, motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Building2,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Workspace } from "@/types";
import { formatIDR } from "@/lib/utils";
import { getWorkspaceBySlug } from "@/data/workspaces";
import WorkspaceCard from "@/components/cards/WorkspaceCard";
import Footer from "@/components/layout/Footer";

// Mapping filename → room name
const GALLERY_NAMES: Record<string, string> = {
  // Wowo Starter
  cofsec: "Coffee Section",
  store: "Storage Room",
  winseat: "Window Seat",
  // Wowo Business
  bmeetroom: "Meeting Room",
  bopen: "Open Space",
  bpan: "Pantry",
  // Wowo Executive
  ebath: "Bathroom",
  emeet: "Meeting Room",
  eopen: "Open Space",
  epan: "Pantry",
  // Wowi Starter
  sipan: "Pantry",
  sisto: "Storage Room",
  siwin: "Window Seat",
  // Wowi Business
  bimeet: "Meeting Room",
  biopen: "Open Space",
  bipan: "Pantry",
  // Wowi Executive
  eibath: "Bathroom",
  eimeet: "Meeting Room",
  eiopen: "Open Space",
  eipan: "Pantry",
};

function getGalleryName(imgPath: string): string {
  const filename = imgPath.split("/").pop()?.replace(".png", "") || "";
  return GALLERY_NAMES[filename] || filename;
}

export default function WorkspaceDetailClient({
  workspace,
}: {
  workspace: Workspace;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [lightboxName, setLightboxName] = useState<string>("");
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxImg(workspace.gallery[index]);
    setLightboxName(getGalleryName(workspace.gallery[index]));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex =
      (lightboxIndex - 1 + workspace.gallery.length) % workspace.gallery.length;
    setLightboxIndex(newIndex);
    setLightboxImg(workspace.gallery[newIndex]);
    setLightboxName(getGalleryName(workspace.gallery[newIndex]));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = (lightboxIndex + 1) % workspace.gallery.length;
    setLightboxIndex(newIndex);
    setLightboxImg(workspace.gallery[newIndex]);
    setLightboxName(getGalleryName(workspace.gallery[newIndex]));
  };

  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(!!logged);
  }, []);

  const handleRentNow = () => {
    if (!isLoggedIn) {
      setShowModal(true);
      return;
    }
    router.push(`/workspace/${workspace.slug}/rent-details`);
  };

  const related = workspace.relatedSlugs
    .map(getWorkspaceBySlug)
    .filter(Boolean) as Workspace[];

  return (
    <>
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxImg(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setLightboxImg(null)}
                className="absolute -top-10 right-0 text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <X size={14} /> Close
              </button>

              {/* Image */}
              <div className="relative w-full h-[70vh] rounded-xl overflow-hidden">
                <Image
                  src={lightboxImg}
                  alt={lightboxName}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={prevImage}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronLeft size={20} className="text-white" />
                </button>
                <div className="text-center">
                  <p className="text-white font-semibold text-sm">
                    {lightboxName}
                  </p>
                  <p className="text-white/50 text-xs mt-0.5">
                    {lightboxIndex + 1} / {workspace.gallery.length}
                  </p>
                </div>
                <button
                  onClick={nextImage}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronRight size={20} className="text-white" />
                </button>
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                {workspace.gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(i);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === lightboxIndex ? "bg-[#C9A36A] w-4" : "bg-white/40"}`}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
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
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
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
                You need to have an account to rent a workspace. Please sign in
                or create a new account to continue.
              </p>
              <div className="space-y-2.5">
                <Link
                  href={`/login?redirect=/workspace/${workspace.slug}/rent-details`}
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
                    className="relative rounded-lg overflow-hidden group cursor-pointer"
                    onClick={() => openLightbox(i)}
                  >
                    <div className="relative h-28">
                      <Image
                        src={img}
                        alt={getGalleryName(img)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {/* Room name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                      <p className="text-white text-[10px] font-semibold truncate">
                        {getGalleryName(img)}
                      </p>
                    </div>
                    {/* Hover zoom icon */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold bg-black/40 px-2 py-1 rounded-full">
                        View
                      </span>
                    </div>
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
                <span className="text-sm font-normal text-gray-400">/year</span>
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
              <button
                onClick={handleRentNow}
                className="flex items-center justify-center gap-2 w-full bg-[#C9A36A] hover:bg-[#A8834A] text-white font-semibold text-sm py-3 rounded-md transition-colors group"
              >
                Rent Now
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
