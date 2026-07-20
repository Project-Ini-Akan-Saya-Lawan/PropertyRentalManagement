"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";

export function useScrollReveal(
  margin = "-80px" as const
) {
  const ref = useRef<HTMLElement | null>(null);

  const inView = useInView(ref, {
    once: true,
    margin,
  });

  return { ref, inView };
}