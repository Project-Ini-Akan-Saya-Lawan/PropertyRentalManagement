"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import Image from "next/image";

const PARTNERS = [
  { id: "x", src: "/partners/x.png", alt: "X" },
  { id: "oracle", src: "/partners/oracle.png", alt: "Oracle" },
  { id: "sap", src: "/partners/sap.png", alt: "SAP" },
  { id: "hermes", src: "/partners/hermes.png", alt: "Hermes Paris" },
  { id: "cartier", src: "/partners/cartier.png", alt: "Cartier" },
  { id: "nike", src: "/partners/nike.png", alt: "Nike" },
  { id: "lv", src: "/partners/lv.png", alt: "Louis Vuitton" },
  { id: "toyota", src: "/partners/toyota.png", alt: "Toyota" },
];

// Triple duplicate for truly seamless infinite loop
const TRIPLED = [...PARTNERS, ...PARTNERS, ...PARTNERS];

export default function MembersSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-10 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-[#2B2B2B] mb-1"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Our Members
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xs text-gray-400 whitespace-nowrap"
        >
          With 15 years of expertise in flexible workspace solutions, we have
          empowered businesses of all sizes to enhance their flexible working
          experience.
        </motion.p>
      </div>

      {/* Infinite Carousel - no gap/pause */}
      <div className="overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <style>{`
          @keyframes marquee-loop {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-33.333%); }
          }
          .marquee-inner {
            display: flex;
            align-items: center;
            animation: marquee-loop 20s linear infinite;
            will-change: transform;
          }
          .marquee-inner:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="marquee-inner">
          {TRIPLED.map((p, i) => (
            <div key={`${p.id}-${i}`} className="flex-shrink-0 px-10">
              <Image
                src={p.src}
                alt={p.alt}
                width={130}
                height={60}
                className="object-contain h-14 w-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
