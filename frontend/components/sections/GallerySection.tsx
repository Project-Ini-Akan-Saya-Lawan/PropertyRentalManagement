"use client";

import { useRef, useState } from "react";
import { useInView, motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";

const IMAGES = [
  { src: "/buildings/building-front.png", alt: "Twin Towers Front" },
  { src: "/buildings/building-aerial-1.png", alt: "Aerial View 1" },
  { src: "/buildings/building-aerial-2.png", alt: "Aerial View 2" },
  { src: "/buildings/building-aerial-1.png", alt: "Aerial View 3" },
  { src: "/buildings/building-aerial-2.png", alt: "Evening View" },
  { src: "/buildings/building-front.png", alt: "Lobby" },
];

export default function GallerySection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [active, setActive] = useState<null | { src: string; alt: string }>(
    null,
  );

  return (
    <section ref={ref} className="py-16 bg-[#F5F5F5] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-xl font-bold text-[#2B2B2B] mb-8"
        >
          Workspace Gallery
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {IMAGES.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="relative h-52 md:h-64 rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => setActive(img)}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
            onClick={() => setActive(null)}
          >
            <button className="absolute top-4 right-4 text-white bg-white/20 rounded-full p-2 hover:bg-white/30 transition-colors">
              <X size={22} />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={active.src}
                alt={active.alt}
                fill
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
