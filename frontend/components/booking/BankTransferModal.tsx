"use client";

import { useEffect, useState } from "react";
import { X, Copy, Check, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { BankCode } from "@/services/payment";
import { formatIDR } from "@/lib/utils";

const BANK_LABELS: Record<BankCode, string> = {
  bca: "BCA Virtual Account",
  bni: "BNI Virtual Account",
  bri: "BRI Virtual Account",
  permata: "Permata Virtual Account",
  mandiri: "Mandiri Bill Payment",
};

const BANK_LOGOS: Partial<Record<BankCode, string>> = {
  bca: "/payments/bca.png",
  bri: "/payments/bri.png",
  mandiri: "/payments/mandiri.png",
};

interface Props {
  open: boolean;
  bank: BankCode | null;
  vaNumber: string | null;
  billerCode: string | null;
  billKey: string | null;
  expiryTime: string | null;
  amount: number;
  checking: boolean;
  errorMessage: string;
  onCheckStatus: () => void;
  onClose: () => void;
}

function useCountdown(expiryTime: string | null) {
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    if (!expiryTime) {
      setLabel("");
      return;
    }
    // Midtrans expiry_time is "yyyy-MM-dd HH:mm:ss" in the merchant's
    // configured timezone (WIB/Asia/Jakarta by default for ID accounts).
    const expiry = new Date(expiryTime.replace(" ", "T"));

    const tick = () => {
      const diffMs = expiry.getTime() - Date.now();
      if (diffMs <= 0) {
        setLabel("Expired");
        return;
      }
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setLabel(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiryTime]);

  return label;
}

/**
 * Shows the payment instructions after a Midtrans Core API bank transfer
 * charge: a Virtual Account number (BCA/BNI/BRI/Permata) or a Mandiri
 * biller_code/bill_key pair, plus a countdown to expiry and a manual
 * "I've paid, check status" action (the page also polls in the background).
 */
export default function BankTransferModal({
  open,
  bank,
  vaNumber,
  billerCode,
  billKey,
  expiryTime,
  amount,
  checking,
  errorMessage,
  onCheckStatus,
  onClose,
}: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const countdown = useCountdown(expiryTime);

  const copy = (value: string, key: string) => {
    navigator.clipboard?.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-[300] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="text-sm font-semibold text-[#2B2B2B]">
                Complete Your Bank Transfer
              </span>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              <div className="flex items-center gap-2">
                {bank && BANK_LOGOS[bank] && (
                  <Image
                    src={BANK_LOGOS[bank] as string}
                    alt={bank}
                    width={40}
                    height={22}
                    className="h-5 w-auto object-contain"
                  />
                )}
                <span className="text-sm font-semibold text-[#2B2B2B]">
                  {bank ? BANK_LABELS[bank] : "Bank Transfer"}
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-xs text-gray-400">Amount to transfer</span>
                <span className="text-lg font-bold text-[#C9A36A]">
                  {formatIDR(amount)}
                </span>
              </div>

              {vaNumber && (
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    Virtual Account Number
                  </label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2.5">
                    <span className="flex-1 font-mono text-sm text-[#2B2B2B] tracking-wider">
                      {vaNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => copy(vaNumber, "va")}
                      className="text-gray-400 hover:text-[#C9A36A] transition-colors"
                      aria-label="Copy VA number"
                    >
                      {copied === "va" ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {billerCode && billKey && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      Biller Code
                    </label>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2.5">
                      <span className="flex-1 font-mono text-sm text-[#2B2B2B]">
                        {billerCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => copy(billerCode, "biller")}
                        className="text-gray-400 hover:text-[#C9A36A] transition-colors"
                        aria-label="Copy biller code"
                      >
                        {copied === "biller" ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      Bill Key
                    </label>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2.5">
                      <span className="flex-1 font-mono text-sm text-[#2B2B2B]">
                        {billKey}
                      </span>
                      <button
                        type="button"
                        onClick={() => copy(billKey, "billkey")}
                        className="text-gray-400 hover:text-[#C9A36A] transition-colors"
                        aria-label="Copy bill key"
                      >
                        {copied === "billkey" ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {countdown && (
                <div className="text-xs text-gray-400">
                  Complete your transfer within{" "}
                  <span className="font-semibold text-[#2B2B2B]">
                    {countdown}
                  </span>
                </div>
              )}

              <p className="text-[11px] text-gray-400 leading-relaxed">
                Pay the exact amount above from your {bank ? bank.toUpperCase() : ""}{" "}
                mobile/internet banking, ATM, or teller. Your booking will be
                confirmed automatically once we detect the transfer - this can
                take a few minutes.
              </p>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                  <p className="text-red-600 text-xs font-semibold">
                    {errorMessage}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={onCheckStatus}
                disabled={checking}
                className="w-full bg-[#C9A36A] hover:bg-[#A8834A] disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                {checking && <Loader2 size={14} className="animate-spin" />}
                {checking ? "Checking..." : "I've paid, check status"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
