"use client";
import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, CheckCircle2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import BankTransferModal from "@/components/booking/BankTransferModal";
import { paymentService, type BankCode } from "@/services/payment";
import { formatIDR } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const STATUS_POLL_INTERVAL_MS = 5000;

const BANK_OPTIONS: { id: BankCode; label: string; logo: string }[] = [
  { id: "bca", label: "BCA Virtual Account", logo: "bca.png" },
  { id: "bri", label: "BRI Virtual Account", logo: "bri.png" },
  { id: "mandiri", label: "Mandiri Bill Payment", logo: "mandiri.png" },
];

// Covers every bank the backend can return for an active session (including
// bni/permata, which aren't offered as pickable options above but can still
// come back from an existing payment created another way), so the "active
// session" panel always has a readable label regardless of bank.
const BANK_LABELS: Record<BankCode, string> = {
  bca: "BCA Virtual Account",
  bni: "BNI Virtual Account",
  bri: "BRI Virtual Account",
  permata: "Permata Virtual Account",
  mandiri: "Mandiri Bill Payment",
};

const STATUS_MESSAGES: Record<string, string> = {
  pending: "We haven't detected your transfer yet. It can take a few minutes.",
  deny: "The payment was denied. Please try again.",
  cancel: "The payment was cancelled.",
  expire: "The payment window expired. Please try again.",
};

interface BookingData {
  booking_id: number;
  pack_id: number;
  floor_booked: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
}

interface PaymentData {
  payment_id: number;
  booking_id: number;
  order_id: string;
  status: string;
  bank: BankCode | null;
  va_number: string | null;
  biller_code: string | null;
  bill_key: string | null;
  expiry_time: string | null;
  created_at: string;
}

// Payment statuses that mean "this VA/bill is still usable, or already
// paid" - anything in this list should be shown to the user directly
// instead of letting them generate a brand new charge.
const REUSABLE_PAYMENT_STATUSES = ["paid", "challenge", "pending"];

function isPaymentStillValid(payment: PaymentData): boolean {
  if (!REUSABLE_PAYMENT_STATUSES.includes(payment.status)) return false;
  if (!payment.expiry_time) return true;
  // Same WIB-offset fix as BankTransferModal's countdown - see comment
  // there. Midtrans's timestamp has no timezone suffix, so it must be
  // parsed as WIB (+07:00) explicitly rather than as local time.
  return (
    new Date(`${payment.expiry_time.replace(" ", "T")}+07:00`).getTime() >
    Date.now()
  );
}

export default function PayPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);
  const router = useRouter();

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [selectedBank, setSelectedBank] = useState<BankCode | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [vaNumber, setVaNumber] = useState<string | null>(null);
  const [billerCode, setBillerCode] = useState<string | null>(null);
  const [billKey, setBillKey] = useState<string | null>(null);
  const [expiryTime, setExpiryTime] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  // True once we've detected an existing, still-valid payment session for
  // this booking (from the initial fetch, or from a charge attempt that the
  // backend answered with "existing payment found"). While true, the bank
  // picker + generate button are hidden so the user can't pick a *different*
  // bank than the one the active session was actually created for - doing
  // so wouldn't create a second session (the backend still only allows one),
  // but it would show a misleading modal (e.g. label "Mandiri Bill Payment"
  // while displaying the original BCA VA number, since the backend keeps
  // returning the one real session regardless of which bank button is
  // clicked afterwards).
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${API_URL}/api/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((result) => {
        if (!result.data) {
          setError("Booking not found.");
          return;
        }
        const { payments, ...bookingData } = result.data as BookingData & {
          payments: PaymentData[];
        };
        setBooking(bookingData);

        // Booking ini sudah pernah generate VA sebelumnya dan masih valid
        // (belum expired) - langsung tampilkan VA yang sama, jangan suruh
        // user pilih bank & generate baru lagi.
        const existing = (payments || [])
          .slice()
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )
          .find(isPaymentStillValid);

        if (existing) {
          setSelectedBank(existing.bank);
          setOrderId(existing.order_id);
          setVaNumber(existing.va_number);
          setBillerCode(existing.biller_code);
          setBillKey(existing.bill_key);
          setExpiryTime(existing.expiry_time);
          setShowBankModal(true);
          setHasActiveSession(true);

          if (existing.status === "paid") {
            finishSuccess();
          } else {
            pollRef.current = setInterval(() => {
              checkStatus(existing.order_id, { silent: true });
            }, STATUS_POLL_INTERVAL_MS);
          }
        }
      })
      .catch(() => setError("Failed to load booking."));

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [bookingId, router]);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const finishSuccess = () => {
    stopPolling();
    setShowBankModal(false);
    setProcessing(false);
    setDone(true);
    setTimeout(() => router.push("/account"), 3000);
  };

  const checkStatus = async (id: string, { silent = false } = {}) => {
    if (!silent) setCheckingStatus(true);
    setStatusError("");
    try {
      const result = await paymentService.getStatus(id);
      const status = result.data.status;
      if (status === "paid") {
        finishSuccess();
        return;
      }
      if (["deny", "cancel", "expire"].includes(status)) {
        stopPolling();
        setStatusError(STATUS_MESSAGES[status] || `Payment status: ${status}.`);
        // The session we were tracking is now dead (Midtrans-side), so the
        // backend will no longer treat it as "existing" on the next charge
        // attempt - let the user pick a bank and generate a fresh one
        // instead of leaving them stuck looking at instructions for a
        // payment that can never be completed.
        setHasActiveSession(false);
        setSelectedBank(null);
        setVaNumber(null);
        setBillerCode(null);
        setBillKey(null);
        setExpiryTime(null);
        setOrderId(null);
      } else if (!silent) {
        setStatusError(
          STATUS_MESSAGES[status] || "Still waiting for your transfer.",
        );
      }
    } catch {
      if (!silent) setStatusError("Could not check status. Please try again.");
    } finally {
      if (!silent) setCheckingStatus(false);
    }
  };

  const handlePay = async () => {
    if (!selectedBank || !booking) return;
    setProcessing(true);
    setError("");
    try {
      const chargeResult = await paymentService.chargeBankTransfer(
        booking.booking_id,
        selectedBank,
      );
      const {
        payment,
        transaction_status,
        bank,
        va_number,
        biller_code,
        bill_key,
        expiry_time,
      } = chargeResult.data;
      // `bank` reflects the session the backend actually returned - if one
      // was already active, this may differ from whichever bank button the
      // user had clicked just now. Syncing it back keeps the modal's label
      // and displayed fields (VA vs biller/bill key) consistent.
      setSelectedBank(bank);
      setOrderId(payment.order_id);
      setVaNumber(va_number);
      setBillerCode(biller_code);
      setBillKey(bill_key);
      setExpiryTime(expiry_time);
      setStatusError("");
      setShowBankModal(true);
      setHasActiveSession(true);
      setProcessing(false);
      if (
        transaction_status === "settlement" ||
        transaction_status === "capture"
      ) {
        finishSuccess();
        return;
      }
      pollRef.current = setInterval(() => {
        checkStatus(payment.order_id, { silent: true });
      }, STATUS_POLL_INTERVAL_MS);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create payment.",
      );
      setProcessing(false);
    }
  };

  const total = booking ? Number(booking.total_price) : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-10">
        <button
          onClick={() => router.push("/account")}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft size={13} /> Back to Account
        </button>

        <h1 className="font-serif text-2xl font-bold text-[#C9A36A] mb-2">
          Complete Payment
        </h1>
        <p className="text-sm text-gray-500 mb-6">Booking #{bookingId}</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            <p className="text-red-600 text-xs font-semibold">{error}</p>
          </div>
        )}

        {booking && (
          <div className="bg-[#F5F0E8]/50 rounded-xl p-4 mb-6 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Pack ID</span>
              <span className="font-semibold text-[#2B2B2B]">
                {booking.pack_id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Floor</span>
              <span className="font-semibold text-[#2B2B2B]">
                {booking.floor_booked}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Start Date</span>
              <span className="font-semibold text-[#2B2B2B]">
                {new Date(booking.start_date).toLocaleDateString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#C9A36A]/20 pt-2 mt-2">
              <span className="font-bold text-[#C9A36A]">Total</span>
              <span className="font-bold text-[#C9A36A]">
                {formatIDR(total)}
              </span>
            </div>
          </div>
        )}

        {hasActiveSession ? (
          /* An active payment session already exists for this booking - the
             bank picker is hidden entirely so the user can't attempt to
             "switch" bank here. Doing so wouldn't create a second session
             (the backend still only allows one active payment per booking),
             but it would show a mismatched modal - e.g. a "Mandiri Bill
             Payment" label over the original BCA VA number - since the
             backend keeps returning the one real session no matter which
             bank button was clicked. To actually pay with a different
             method, the existing session must be cancelled first. */
          <div className="bg-[#F5F0E8]/50 border border-[#C9A36A]/20 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-[#2B2B2B] mb-1">
              You already have a payment session for this booking
            </p>
            <p className="text-xs text-gray-500 mb-4">
              {selectedBank
                ? `Method: ${BANK_LABELS[selectedBank]}. `
                : ""}
              Complete or wait for it to expire before starting a new one.
            </p>
            <button
              onClick={() => setShowBankModal(true)}
              className="w-full bg-[#C9A36A] hover:bg-[#A8834A] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              View Payment Instructions
            </button>
          </div>
        ) : (
          <>
            {/* Bank selector */}
            <h2 className="font-semibold text-sm text-[#2B2B2B] mb-3">
              Choose Payment Method
            </h2>
            <div className="space-y-2 mb-6">
              {BANK_OPTIONS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBank(b.id)}
                  className={`w-full flex items-center gap-3 border rounded-xl px-4 py-3 transition-all ${
                    selectedBank === b.id
                      ? "border-[#C9A36A] bg-amber-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedBank === b.id ? "border-[#C9A36A]" : "border-gray-300"}`}
                  >
                    {selectedBank === b.id && (
                      <div className="w-2 h-2 rounded-full bg-[#C9A36A]" />
                    )}
                  </div>
                  <Image
                    src={`/payments/${b.logo}`}
                    alt={b.id}
                    width={40}
                    height={20}
                    className="h-6 w-auto object-contain"
                  />
                  <span className="text-sm text-gray-700">{b.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-6">
              <Landmark size={11} /> Secured by Midtrans — transfer directly
              from your bank, no card details collected
            </div>

            <button
              onClick={handlePay}
              disabled={!selectedBank || processing || !booking}
              className="w-full bg-[#C9A36A] hover:bg-[#A8834A] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {processing && (
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {processing ? "Processing..." : "Generate Payment Details"}
            </button>
          </>
        )}
      </div>

      <BankTransferModal
        open={showBankModal}
        bank={selectedBank}
        vaNumber={vaNumber}
        billerCode={billerCode}
        billKey={billKey}
        expiryTime={expiryTime}
        amount={total}
        checking={checkingStatus}
        errorMessage={statusError}
        onCheckStatus={() => orderId && checkStatus(orderId)}
        onClose={() => setShowBankModal(false)}
      />

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-10 text-center max-w-sm mx-4 shadow-2xl"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={36} className="text-green-600" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#2B2B2B] mb-2">
                Payment Successful!
              </h2>
              <p className="text-sm text-gray-500">
                Your booking has been confirmed. Redirecting to your account…
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}