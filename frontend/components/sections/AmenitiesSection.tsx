"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import Image from "next/image";
import {
  Users,
  CalendarDays,
  Monitor,
  Sparkles,
  Phone,
  Lock,
  Clock,
  Coffee,
  Briefcase,
  Sofa,
  Moon,
  Wifi,
  Car,
  Armchair,
  Building2,
  Server,
  KeyRound,
} from "lucide-react";

const COL1 = [
  { icon: <Users size={16} />, label: "4 Meeting Rooms" },
  { icon: <CalendarDays size={16} />, label: "Community & Networking Events" },
  { icon: <Monitor size={16} />, label: "IT Support Services" },
  { icon: <Sparkles size={16} />, label: "Housekeeping Services" },
  { icon: <Phone size={16} />, label: "Call Rooms" },
  { icon: <Lock size={16} />, label: "Lockers" },
];

const COL2 = [
  { icon: <Clock size={16} />, label: "24/7 Office Access" },
  { icon: <Coffee size={16} />, label: "Pantry Refreshments" },
  { icon: <Briefcase size={16} />, label: "Business Concierge Support" },
  { icon: <Sofa size={16} />, label: "Members Lounge" },
  { icon: <Moon size={16} />, label: "Prayer Rooms" },
  { icon: <Wifi size={16} />, label: "High-Speed Wi-Fi" },
];

const COL3 = [
  { icon: <Car size={16} />, label: "Chauffeur Services" },
  { icon: <Armchair size={16} />, label: "Dedicated Desks" },
  { icon: <Building2 size={16} />, label: "Function Rooms" },
  { icon: <Server size={16} />, label: "Mini Data Centres" },
  { icon: <KeyRound size={16} />, label: "Secure Keyless Locking System" },
];

const PHOTOS = [
  { src: "/buildings/recep.png", label: "Reception" },
  { src: "/buildings/cafe.png", label: "Café" },
  { src: "/buildings/lounge.png", label: "Lounge" },
  { src: "/buildings/works.png", label: "Workstation" },
];

export default function AmenitiesSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-12 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="font-serif text-2xl font-bold text-[#C9A36A] mb-8"
        >
          Amenities
        </motion.h2>

        {/* 3 kolom list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 mb-10"
        >
          {[COL1, COL2, COL3].map((col, ci) => (
            <ul
              key={ci}
              className={`space-y-3 ${ci > 0 ? "mt-3 sm:mt-0" : ""}`}
            >
              {col.map((a) => (
                <li
                  key={a.label}
                  className="flex items-center gap-3 text-sm text-gray-600"
                >
                  <span className="w-5 flex-shrink-0 text-[#1A3A6B] flex items-center justify-center">
                    {a.icon}
                  </span>
                  {a.label}
                </li>
              ))}
            </ul>
          ))}
        </motion.div>

        {/* 4 foto */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {PHOTOS.map((p) => (
            <div key={p.label}>
              <div className="relative h-40 rounded-xl overflow-hidden mb-2">
                <Image
                  src={p.src}
                  alt={p.label}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-xs text-gray-500">{p.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
