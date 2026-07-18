"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import BookingStepper from "@/components/booking/BookingStepper";
import { getWorkspaceBySlug } from "@/data/workspaces";
import { formatIDR } from "@/lib/utils";
import { notFound } from "next/navigation";
import Image from "next/image";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  surname: z.string().min(1, "Required"),
  address: z.string().min(1, "Required"),
  stateCity: z.string().min(1, "Required"),
  countryRegion: z.string().min(1, "Required"),
  postcode: z.string().min(3, "Required"),
  email: z.string().email("Invalid email"),
  cardNumber: z.string().min(16, "Required"),
  cardholderName: z.string().min(2, "Required"),
  expiryDate: z.string().min(4, "MM/YY required"),
  cvv: z.string().min(3, "Required"),
});

type Form = z.infer<typeof schema>;

const PAYMENT_LOGOS = [
  { id: "visa", file: "visa.png" },
  { id: "jcb", file: "jcb.png" },
  { id: "mandiri", file: "mandiri.png" },
  { id: "bca", file: "bca.png" },
  { id: "mastercard", file: "mastercard.png" },
  { id: "bri", file: "bri.png" },
];

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
  }>({});
  const [done, setDone] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string>("");

  useEffect(() => {
    const raw = sessionStorage.getItem(`rent-${slug}`);
    if (raw) setRentData(JSON.parse(raw));
  }, [slug]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const formatCard = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length >= 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const years = rentData.commitmentTerms
    ? parseInt(rentData.commitmentTerms) || 1
    : 1;
  const yearly = workspace.monthlyPrice * years;
  const tax = yearly * workspace.taxRate;
  const total = yearly + tax;

  const onSubmit = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1800));
    setProcessing(false);
    setDone(true);
    setTimeout(() => router.push("/"), 3000);
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
          {/* Form */}
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
                Payment Details
              </h2>

              {/* Card type selector */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-xs text-gray-400">Card Type</span>
                {PAYMENT_LOGOS.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-1.5 cursor-pointer border rounded-md px-2 py-1.5 transition-all ${
                      selectedCard === p.id
                        ? "border-[#C9A36A] bg-amber-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cardType"
                      value={p.id}
                      checked={selectedCard === p.id}
                      onChange={() => setSelectedCard(p.id)}
                      className="accent-[#C9A36A] w-3 h-3"
                    />
                    <Image
                      src={`/payments/${p.file}`}
                      alt={p.id}
                      width={48}
                      height={24}
                      className="h-6 w-auto object-contain"
                    />
                  </label>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {/* Card Number */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    Card Number
                  </label>
                  <input
                    {...register("cardNumber")}
                    placeholder="1234 5678 9012 3456"
                    onChange={(e) =>
                      setValue("cardNumber", formatCard(e.target.value))
                    }
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300"
                  />
                  {errors.cardNumber && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {errors.cardNumber.message}
                    </p>
                  )}
                </div>

                {/* Cardholder Name */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    Cardholder Name
                  </label>
                  <input
                    {...register("cardholderName")}
                    placeholder="Name as it appears on card"
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300"
                  />
                  {errors.cardholderName && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {errors.cardholderName.message}
                    </p>
                  )}
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    Expiry Date (MM/YY)
                  </label>
                  <input
                    {...register("expiryDate")}
                    placeholder="MM/YY"
                    onChange={(e) =>
                      setValue("expiryDate", formatExpiry(e.target.value))
                    }
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300"
                  />
                  {errors.expiryDate && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {errors.expiryDate.message}
                    </p>
                  )}
                </div>

                {/* CVV */}
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    CVV / Security Code
                  </label>
                  <input
                    {...register("cvv")}
                    type="password"
                    placeholder="3 or 4 digits"
                    maxLength={4}
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300"
                  />
                  {errors.cvv && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {errors.cvv.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-3 text-[11px] text-gray-400">
                <Lock size={11} /> Secured with 256-bit SSL encryption
              </div>
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
                {processing ? "Processing..." : "Pay Now"}
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
                booked. Redirecting…
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
