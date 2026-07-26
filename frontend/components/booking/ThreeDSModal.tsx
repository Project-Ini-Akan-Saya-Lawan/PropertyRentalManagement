"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  url: string | null;
  onClose: () => void;
}

/**
 * Displays the 3DS authentication page (redirect_url from the Midtrans
 * charge response) inside an iframe modal, as recommended by Midtrans
 * (performAuthentication callback of MidtransNew3ds.authenticate).
 */
export default function ThreeDSModal({ url, onClose }: Props) {
  return (
    <AnimatePresence>
      {url && (
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
            className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[600px] max-h-[90vh] relative overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-[#2B2B2B]">
                3D Secure Verification
              </span>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <iframe
              src={url}
              title="3D Secure Authentication"
              className="w-full flex-1 border-0"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
