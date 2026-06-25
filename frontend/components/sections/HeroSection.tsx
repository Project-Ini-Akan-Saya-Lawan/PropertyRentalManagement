"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface HeroProps {
  image?: string;
  tag?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  minHeight?: string;
  align?: "left" | "right";
  objectPosition?: string;
}

export default function HeroSection({
  image = "/buildings/building-aerial-2.png",
  tag,
  title,
  subtitle,
  ctaLabel,
  ctaHref = "/workspace",
  minHeight = "min-h-[520px]",
  align = "left",
  objectPosition = "center 30%",
}: HeroProps) {
  return (
    <section
      className={`relative w-full ${minHeight} flex items-center overflow-hidden`}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={image}
          alt="Rupiah Building"
          fill
          className="object-cover"
          style={{ objectPosition }}
          priority
          quality={90}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Gradient fade to white at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className={`max-w-xl ${align === "right" ? "ml-auto" : ""}`}>
          {tag && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[#C9A36A] text-xs font-semibold uppercase tracking-widest mb-3"
            >
              {tag}
            </motion.p>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white"
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 text-gray-200 text-base leading-relaxed"
            >
              {subtitle}
            </motion.p>
          )}

          {ctaLabel && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8"
            >
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 bg-[#C9A36A] hover:bg-[#A8834A] text-white font-semibold text-sm px-7 py-3 rounded-md transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                {ctaLabel}
                <ChevronRight size={16} />
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
