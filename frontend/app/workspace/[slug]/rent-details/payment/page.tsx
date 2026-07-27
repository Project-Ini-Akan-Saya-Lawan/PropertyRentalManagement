"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Landmark } from "lucide-react";
import BookingStepper from "@/components/booking/BookingStepper";
import BankTransferModal from "@/components/booking/BankTransferModal";
import { getWorkspaceBySlug } from "@/data/workspaces";
import { formatIDR } from "@/lib/utils";
import { notFound } from "next/navigation";
import Image from "next/image";
import { paymentService, type BankCode } from "@/services/payment";

// Mapping slug → pack_id
const SLUG_TO_PACK_ID: Record<string, number> = {
  "wowo-starter-pack": 1,
  "wowo-business-pack": 2,
  "wowo-executive-pack": 3,
  "wowi-starter-pack": 4,
  "wowi-business-pack": 5,
  "wowi-executive-pack": 6,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

// How often we poll our backend (which re-verifies with Midtrans) while the
// bank transfer instructions modal is open, waiting for the customer to pay.
const STATUS_POLL_INTERVAL_MS = 5000;

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  surname: z.string().min(1, "Required"),
  address: z.string().min(1, "Required"),
  stateCity: z.string().min(1, "Required"),
  countryRegion: z.string().min(1, "Required"),
  postcode: z.string().min(3, "Required"),
  email: z.string().email("Invalid email"),
  bank: z.enum(["bca", "bri", "mandiri"], {
    errorMap: () => ({ message: "Please choose a bank" }),
  }),
});

type Form = z.infer<typeof schema>;

const BANK_OPTIONS: { id: BankCode; label: string; logo: string }[] = [
  { id: "bca", label: "BCA Virtual Account", logo: "bca.png" },
  { id: "bri", label: "BRI Virtual Account", logo: "bri.png" },
  { id: "mandiri", label: "Mandiri Bill Payment", logo: "mandiri.png" },
];

// Human-readable messages for the transaction_status once we detect it.
const STATUS_MESSAGES: Record<string, string> = {
  pending:
    "We haven't detected your transfer yet. It can take a few minutes to arrive - feel free to check again shortly.",
  deny: "The payment was denied. Please try again.",
  cancel: "The payment was cancelled.",
  expire:
    "The payment window expired before we detected your transfer. Please try again.",
};

export default function PaymentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const workspace = getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const [rentData, setRentData] = useState<{
    floor?: string;
    type?: string;
    date?: string;
    commitmentTerms?: string;
    endDate?: string;
  }>({});
  const [done, setDone] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [bookingError, setBookingError] = useState<string>("");

  // Bank transfer instructions modal state.
  const [showBankModal, setShowBankModal] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [transferBank, setTransferBank] = useState<BankCode | null>(null);
  const [vaNumber, setVaNumber] = useState<string | null>(null);
  const [billerCode, setBillerCode] = useState<string | null>(null);
  const [billKey, setBillKey] = useState<string | null>(null);
  const [expiryTime, setExpiryTime] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`rent-${slug}`);
    if (raw) setRentData(JSON.parse(raw));
  }, [slug]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });
  const selectedBank = watch("bank");

  const years = rentData.commitmentTerms
    ? parseInt(rentData.commitmentTerms) || 1
    : 1;
  const yearly = workspace.monthlyPrice * years;
  const tax = yearly * workspace.taxRate;
  const total = yearly + tax;

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const finishSuccess = () => {
    sessionStorage.removeItem(`rent-${slug}`);
    sessionStorage.removeItem(`confirm-${slug}`);
    stopPolling();
    setShowBankModal(false);
    setProcessing(false);
    setDone(true);
    setTimeout(() => router.push("/account"), 3000);
  };

  // Re-checks the definitive status from our backend (which itself
  // re-verifies with Midtrans) rather than trusting a client-side timer
  // alone. Used both for the background poll and the manual "I've paid"
  // button.
  const checkStatus = async (id: string, { silent = false } = {}) => {
    if (!silent) setCheckingStatus(true);
    setStatusError("");
    try {
      const statusResult = await paymentService.getStatus(id);
      const status = statusResult.data.status;
      if (status === "paid") {
        finishSuccess();
        return;
      }
      if (["deny", "cancel", "expire"].includes(status)) {
        stopPolling();
        setStatusError(
          STATUS_MESSAGES[status] || `Payment status: ${status}.`,
        );
      } else if (!silent) {
        setStatusError(
          STATUS_MESSAGES[status] ||
            "Still waiting for your transfer to be detected.",
        );
      }
    } catch (err) {
      console.warn("checkStatus failed:", err instanceof Error ? err.message : err);
      if (!silent) {
        setStatusError(
          "Could not check payment status right now. Please try again in a moment.",
        );
      }
    } finally {
      if (!silent) setCheckingStatus(false);
    }
  };

  const startBankTransfer = async (bookingId: number, bank: BankCode) => {
    try {
      const chargeResult = await paymentService.chargeBankTransfer(
        bookingId,
        bank,
      );
      const { payment, transaction_status, va_number, biller_code, bill_key, expiry_time } =
        chargeResult.data;

      setOrderId(payment.order_id);
      setTransferBank(bank);
      setVaNumber(va_number);
      setBillerCode(biller_code);
      setBillKey(bill_key);
      setExpiryTime(expiry_time);
      setStatusError("");
      setShowBankModal(true);
      setProcessing(false);

      if (transaction_status === "settlement" || transaction_status === "capture") {
        // Extremely unlikely for bank transfer, but handle gracefully if
        // Midtrans ever reports it as already settled.
        finishSuccess();
        return;
      }

      // Poll in the background so the booking confirms automatically once
      // the transfer is detected, without the user needing to keep clicking.
      pollRef.current = setInterval(() => {
        checkStatus(payment.order_id, { silent: true });
      }, STATUS_POLL_INTERVAL_MS);
    } catch (err) {
      console.warn("startBankTransfer failed:", err instanceof Error ? err.message : err);
      setBookingError(
        err instanceof Error ? err.message : "Failed to create bank transfer.",
      );
      setProcessing(false);
    }
  };

  // Releases a booking that was created but never got a successful charge
  // request (e.g. network error) so the floor doesn't stay stuck as
  // "pending" forever and block other bookings for that period.
  const cancelBooking = async (bookingId: number, token: string) => {
    try {
      await fetch(`${API_URL}/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (cleanupErr) {
      console.warn(
        "Failed to auto-cancel unpaid booking:",
        cleanupErr instanceof Error ? cleanupErr.message : cleanupErr,
      );
    }
  };

  const onSubmit = async (formData: Form) => {
    setProcessing(true);
    setBookingError("");

    let bookingId: number | null = null;
    let token: string | null = null;

    try {
      token = localStorage.getItem("token");
      const pack_id = SLUG_TO_PACK_ID[slug];
      const floorNum = parseInt((rentData.floor || "").replace("Floor ", ""));
      const months = years * 12;

      if (!token || !pack_id || !rentData.date || !floorNum) {
        setBookingError(
          "Missing booking data. Please go back and fill in the details.",
        );
        setProcessing(false);
        return;
      }

      // 1) Create the booking first (status: pending) - only a confirmed
      // bank transfer below turns it into "confirmed".
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pack_id,
          floor_booked: floorNum,
          start_date: rentData.date,
          months,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setBookingError(
          result.message || "Failed to create booking. Please try again.",
        );
        setProcessing(false);
        return;
      }

      bookingId = result.data.booking_id;

      // 2) Ask Midtrans (via our backend) to create a bank transfer charge -
      // this returns a VA number / bill key, no sensitive data is collected.
      await startBankTransfer(bookingId as number, formData.bank);
    } catch (err) {
      console.warn("onSubmit failed:", err instanceof Error ? err.message : err);

      if (bookingId && token) {
        await cancelBooking(bookingId, token);
      }

      setBookingError(
        err instanceof Error
          ? `Payment failed: ${err.message}${bookingId ? " (your booking attempt was cancelled, please try again)" : ""}`
          : "Cannot connect to server. Please try again.",
      );
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft size={13} /> Back
        </button>

        <h1 className="font-serif text-2xl font-bold text-[#C9A36A] mb-6">
          Rent Details
        </h1>

        <BookingStepper step={3} />

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <form onSubmit={handleSubmit(onSubmit)} id="pay-form">
              {/* Billing Information */}
              <h2 className="font-semibold text-[#2B2B2B] mb-4">
                Billing Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {[
                  { name: "firstName", placeholder: "First Name" },
                  { name: "surname", placeholder: "Surname" },
                  { name: "address", placeholder: "Address", span: true },
                  { name: "stateCity", placeholder: "State / City" },
                  { name: "countryRegion", placeholder: "Country / Region" },
                  { name: "postcode", placeholder: "Postcode" },
                  { name: "email", placeholder: "Email Address", span: true },
                ].map(({ name, placeholder, span }) => (
                  <div key={name} className={span ? "sm:col-span-2" : ""}>
                    <input
                      {...register(name as keyof Form)}
                      placeholder={placeholder}
                      className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300"
                    />
                    {errors[name as keyof Form] && (
                      <p className="text-red-500 text-[10px] mt-0.5">
                        {errors[name as keyof Form]?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Payment Details */}
              <h2 className="font-semibold text-[#2B2B2B] mb-3">
                Payment Method
              </h2>
              <p className="text-xs text-gray-400 mb-3">
                Choose a bank to generate a Virtual Account (or Mandiri bill
                key) for your transfer.
              </p>

              {/* Bank selector */}
              <div className="grid sm:grid-cols-3 gap-3 mb-2">
                {BANK_OPTIONS.map((b) => (
                  <label
                    key={b.id}
                    className={`flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2.5 transition-all ${
                      selectedBank === b.id
                        ? "border-[#C9A36A] bg-amber-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value={b.id}
                      {...register("bank")}
                      className="accent-[#C9A36A] w-3 h-3"
                    />
                    <Image
                      src={`/payments/${b.logo}`}
                      alt={b.id}
                      width={40}
                      height={20}
                      className="h-5 w-auto object-contain"
                    />
                    <span className="text-xs text-gray-600">{b.label}</span>
                  </label>
                ))}
              </div>
              {errors.bank && (
                <p className="text-red-500 text-[10px] mb-3">
                  {errors.bank.message}
                </p>
              )}

              <div className="flex items-center gap-1.5 mt-3 text-[11px] text-gray-400">
                <Landmark size={11} /> Secured by Midtrans - you transfer
                directly from your own bank account, no card details are ever
                collected
              </div>

              {/* Booking error */}
              {bookingError && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                  <p className="text-red-600 text-xs font-semibold">
                    {bookingError}
                  </p>
                </div>
              )}
            </form>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="border border-gray-200 text-gray-500 font-semibold text-sm px-6 py-2.5 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                form="pay-form"
                disabled={processing}
                className="bg-[#C9A36A] hover:bg-[#A8834A] disabled:opacity-60 text-white font-semibold text-sm px-8 py-2.5 rounded-md transition-colors flex items-center gap-2"
              >
                {processing && (
                  <svg
                    className="animate-spin h-3.5 w-3.5"
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
            </div>
          </motion.div>

          {/* Right: Your Order */}
          <div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-24">
              <h4 className="text-xs font-bold text-[#2B2B2B] uppercase tracking-wider mb-4">
                Your Order
              </h4>
              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div className="flex justify-between">
                  <span>Package</span>
                  <span className="font-medium text-[#2B2B2B]">
                    {workspace.name}
                  </span>
                </div>
                {rentData.commitmentTerms && (
                  <div className="flex justify-between">
                    <span>Commitment</span>
                    <span className="font-medium text-[#2B2B2B]">
                      {rentData.commitmentTerms}
                    </span>
                  </div>
                )}
                {rentData.floor && (
                  <div className="flex justify-between">
                    <span>Floor</span>
                    <span className="font-medium text-[#2B2B2B]">
                      {rentData.floor}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Annual Fee</span>
                  <span>{formatIDR(yearly)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax + VAT (11%)</span>
                  <span>{formatIDR(tax)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-[#C9A36A] pt-3 border-t border-gray-100">
                <span className="text-xs">Total Amount</span>
                <span className="text-sm">{formatIDR(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank transfer (VA / Mandiri bill key) instructions modal */}
      <BankTransferModal
        open={showBankModal}
        bank={transferBank}
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

      {/* Success overlay */}
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
                Booking Confirmed!
              </h2>
              <p className="text-sm text-gray-500">
                Your workspace at <strong>{workspace.name}</strong> has been
                booked. Redirecting to your account…
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
