"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Users } from "lucide-react";
import { Workspace } from "@/types";
import { formatIDR } from "@/lib/utils";

export default function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.10)" }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="bg-white border border-[#C9A36A]/40 rounded-xl overflow-hidden flex flex-col h-full w-full"
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden flex-shrink-0">
        <Image
          src={workspace.image}
          alt={workspace.name}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* Body */}
      <div className="px-3 pt-2.5 pb-3 flex flex-col flex-1">
        {/* Name */}
        <h3 className="font-semibold text-sm text-[#2B2B2B] leading-tight">
          {workspace.name}
        </h3>

        {/* Floor range */}
        <p className="text-[11px] text-[#C9A36A] mt-0.5 mb-1.5">
          {workspace.floorRange}
        </p>

        {/* Features */}
        <ul className="space-y-0.5 mb-2 flex-1">
          {workspace.features.slice(0, 4).map((f) => (
            <li
              key={f}
              className="flex items-start gap-1.5 text-[11px] text-gray-500 leading-snug"
            >
              <CheckCircle2
                size={11}
                className="text-[#C9A36A] mt-0.5 flex-shrink-0"
              />
              {f}
            </li>
          ))}
        </ul>

        {/* Capacity + Price */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mb-2">
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <Users size={11} />
            <span>{workspace.capacity} pax</span>
          </div>
          <p className="text-xs font-bold text-[#2B2B2B]">
            {formatIDR(workspace.monthlyPrice)}
            <span className="font-normal text-[11px] text-gray-400">/mo</span>
          </p>
        </div>

        {/* CTA */}
        <Link
          href={`/workspace/${workspace.slug}`}
          className="block text-center bg-[#C9A36A] hover:bg-[#A8834A] text-white text-xs font-semibold py-2 rounded-md transition-colors"
        >
          Learn More
        </Link>
      </div>
    </motion.div>
  );
}
