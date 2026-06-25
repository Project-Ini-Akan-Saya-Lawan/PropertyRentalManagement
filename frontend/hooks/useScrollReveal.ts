"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";

export function useScrollReveal(margin = "-80px") {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin });
  return { ref, inView };
}
