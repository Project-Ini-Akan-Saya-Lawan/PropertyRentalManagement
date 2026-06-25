"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import Image from "next/image";

export default function FeaturedSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative h-72 md:h-[420px] overflow-hidden"
          >
            <Image
              src="/buildings/building-front.png"
              alt="Wowo & Wowi Twin Towers"
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Text - sesuai ss kedua */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2B2B2B] mb-5 leading-tight">
              The Standard of Industrial Excellence in Jababeka
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Our flagship twin towers, Wowo and Wowi, stand as a symbol of
              modern excellence in Jababeka&apos;s evolving business district.
              Designed with a seamless blend of innovation and sophistication,
              these 30-storey Grade-A buildings redefine the standard of
              corporate workspace.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
