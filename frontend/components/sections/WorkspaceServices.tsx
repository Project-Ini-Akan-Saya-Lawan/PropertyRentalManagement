"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import WorkspaceCard from "@/components/cards/WorkspaceCard";
import { Workspace } from "@/types";

interface Props {
  title: string;
  workspaces: Workspace[];
}

export default function WorkspaceServices({ title, workspaces }: Props) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Title - gold serif sama seperti Amenities */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="font-serif text-2xl font-bold text-[#C9A36A] mb-6"
        >
          {title}
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws, i) => (
            <motion.div
              key={ws.id}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex"
            >
              <WorkspaceCard workspace={ws} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
