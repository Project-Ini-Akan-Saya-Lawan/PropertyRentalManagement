"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  step: 1 | 2 | 3;
}

const STEPS = [
  { n: 1, label: "Rent Information" },
  { n: 2, label: "Confirm Details" },
  { n: 3, label: "Payment" },
];

export default function BookingStepper({ step }: Props) {
  return (
    <div className="flex items-center w-full mb-8">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center flex-1 last:flex-none">
          {/* Circle */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all",
                step > s.n
                  ? "bg-[#C9A36A] border-[#C9A36A] text-white"
                  : step === s.n
                    ? "border-[#C9A36A] text-[#C9A36A] bg-white"
                    : "border-gray-300 text-gray-300 bg-white",
              )}
            >
              {step > s.n ? <Check size={13} /> : s.n}
            </div>
            <span
              className={cn(
                "text-[10px] mt-1 whitespace-nowrap",
                step >= s.n ? "text-[#C9A36A] font-semibold" : "text-gray-400",
              )}
            >
              {s.label}
            </span>
          </div>

          {/* Connector (not after last) */}
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "flex-1 h-[1px] mx-2 mb-5 transition-colors",
                step > s.n ? "bg-[#C9A36A]" : "bg-gray-200",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
