"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const STATS = [
  { value: 115, suffix: "M+", label: "SQ M MANAGED" },
  { value: 100, suffix: "+", label: "ACTIVE TENANTS" },
  { value: 12, suffix: "", label: "STRATEGIC HUBS" },
  { value: 98, suffix: "%", label: "RETENTION RATE" },
];

function AnimatedNumber({
  target,
  suffix,
}: {
  target: number;
  suffix: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const duration = 1800;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(ease * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="bg-white py-12 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
          {STATS.map((s) => (
            <div key={s.label} className="text-center px-6 py-4">
              <p className="font-serif text-4xl md:text-5xl font-bold text-[#2B2B2B]">
                <AnimatedNumber target={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
