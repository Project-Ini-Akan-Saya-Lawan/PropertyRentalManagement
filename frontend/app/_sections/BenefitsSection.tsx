"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import { PersonStanding, Zap, Share2, Settings } from "lucide-react";

const BENEFITS = [
  {
    icon: PersonStanding,
    title: "Modern",
    desc: "Cutting-edge architectural design for the modern enterprise.",
  },
  {
    icon: Zap,
    title: "Efficient",
    desc: "Optimized energy and spatial utility for lower overheads.",
  },
  {
    icon: Share2,
    title: "Strategic",
    desc: "Proximity to toll gates, ports, and central business districts.",
  },
  {
    icon: Settings,
    title: "Trusted",
    desc: "Decades of experience in the Indonesian industrial market.",
  },
];

export default function BenefitsSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-8 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="font-serif text-2xl font-bold text-[#2B2B2B] text-center mb-10"
        >
          Value for your business
        </motion.h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white border border-[#C9A36A]/40 rounded-xl p-5 hover:shadow-sm transition-all duration-300"
            >
              <b.icon
                size={22}
                className="text-[#2B2B2B] mb-3"
                strokeWidth={1.5}
              />
              <h3 className="font-semibold text-sm text-[#2B2B2B] mb-1.5">
                {b.title}
              </h3>
              <p className="text-xs text-black-100 leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
