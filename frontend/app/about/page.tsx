"use client";

import { useRef } from "react";
import Image from "next/image";
import { useInView, motion } from "framer-motion";
import {
  Building2,
  Wifi,
  Star,
  Radio,
  Users,
  Shuffle,
  MapPin,
} from "lucide-react";
import Footer from "@/components/layout/Footer";

const LANDMARK_FEATURES = [
  { icon: Building2, label: "30 Storey", sub: "Grade-A Tower" },
  { icon: Wifi, label: "Smart Building", sub: "Technology" },
  { icon: Star, label: "Premium Facilities", sub: "for Productivity" },
  { icon: Radio, label: "High Speed", sub: "Conectivity" },
  { icon: Users, label: "Integrated podium &", sub: "Landscape area" },
  { icon: Shuffle, label: "Flexible Office", sub: "Configurations" },
];

export default function AboutPage() {
  const r1 = useRef<HTMLElement>(null);
  const r2 = useRef<HTMLElement>(null);
  const iv1 = useInView(r1, { once: true, margin: "-60px" });
  const iv2 = useInView(r2, { once: true, margin: "-60px" });

  return (
    <>
      {/* HERO */}
      <section className="relative w-full min-h-[560px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/buildings/building-aerial-2.png"
            alt="Rupiah Building"
            fill
            className="object-cover"
            style={{ objectPosition: "center 20%" }}
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <p
              className="text-[#C9A36A] text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              About Us
            </p>
            <h1
              className="text-3xl md:text-5xl font-bold text-white leading-tight mb-5"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Redefining Workspace Excellence in Jababeka
            </h1>
            <p
              className="text-white/70 text-sm leading-relaxed"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Rupiah Building is a premium office and workspace destination
              designed to support modern businesses in a dynamic and competitive
              environment. Located in the heart of Jababeka, we provide more
              than just space we deliver an ecosystem for growth, collaboration,
              and innovation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* LANDMARK */}
      <section ref={r1} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={iv1 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="relative h-[420px] overflow-hidden"
            >
              <Image
                src="/buildings/building-aerial-1.png"
                alt="Wowo & Wowi Twin Towers"
                fill
                className="object-cover object-center"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={iv1 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="pt-2"
            >
              <p className="text-[#C9A36A] text-xs font-bold uppercase tracking-widest mb-2">
                Our Landmark
              </p>
              <h2
                className="text-3xl font-bold text-[#2B2B2B] mb-4 leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Wowo &amp; Wowi Twin Towers
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-8">
                At the core of Rupiah Building stand our iconic twin towers Wowo
                and Wowi. These 30-storey Grade-A office towers symbolize
                balance, innovation, and strength. Designed with a modern
                architectural approach and integrated smart systems, both towers
                offer:
              </p>

              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                {LANDMARK_FEATURES.map((f) => (
                  <div key={f.label} className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#C9A36A] flex items-center justify-center flex-shrink-0">
                      <f.icon size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#2B2B2B] leading-tight">
                        {f.label}
                      </p>
                      <p className="text-xs text-[#2B2B2B] mt-0.5">{f.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-[#C9A36A] py-10 w-full">
        <div className="w-full px-10 sm:px-20">
          <div className="grid grid-cols-3 divide-x divide-white/30">
            {[
              {
                icon: (
                  <Building2
                    width="34"
                    height="34"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <rect x="3" y="3" width="7" height="18" />
                    <rect x="14" y="3" width="7" height="18" />
                  </Building2>
                ),
                value: "30",
                label: "Storey Grade Tower",
              },
              {
                icon: <MapPin size={34} strokeWidth={1.2} />,
                value: "117.000 m²",
                label: "Total Area",
              },
              {
                icon: (
                  <svg
                    width="34"
                    height="34"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ),
                value: "Premium",
                label: "Facilities & Services",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-4 px-10 first:pl-0 last:pr-0"
              >
                <div className="text-white flex-shrink-0">{s.icon}</div>
                <div>
                  <p
                    className="text-2xl md:text-4xl font-bold text-white"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {s.value}
                  </p>
                  <p className="text-white text-xs mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section ref={r2} className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid md:grid-cols-2 gap-0 divide-x divide-gray-100">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={iv2 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="pr-12"
            >
              <p className="text-[#C9A36A] text-xs font-bold uppercase tracking-widest mb-3">
                Our Vision
              </p>
              <h3
                className="text-2xl font-bold text-[#2B2B2B] mb-4 leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Empowering Business, Inspiring Growth
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                To become the leading workspace ecosystem in Indonesia that
                empowers businesses to grow, innovate, and succeed.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={iv2 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="pl-12"
            >
              <p className="text-[#C9A36A] text-xs font-bold uppercase tracking-widest mb-3">
                Our Mission
              </p>
              <ul className="space-y-2.5">
                {[
                  "Deliver premium and flexible workspace solutions",
                  "Integrate technology for smarter operations",
                  "Create an environment that fosters collaboration and productivity",
                  "Provide exceptional service and user experience",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-gray-500"
                  >
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#2B2B2B] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
