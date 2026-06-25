"use client";

import { useRef, useState } from "react";
import { useInView, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Mail, Clock, CheckCircle2 } from "lucide-react";
import HeroSection from "@/components/sections/HeroSection";
import Footer from "@/components/layout/Footer";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Jl.+Sekolah+Hijau+No.14+Simpangan+Cikarang+Utara+Bekasi";

const MAPS_EMBED =
  "https://maps.google.com/maps?q=Jl.+Sekolah+Hijau+No.14+Simpangan+Cikarang+Utara+Bekasi&z=15&output=embed";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type Form = z.infer<typeof schema>;

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Our Location",
    content:
      "Jl. Sekolah Hijau No.14, Simpangan,\nCikarang Utara, Kabupaten Bekasi,\nJawa Barat 17530",
    href: MAPS_URL,
    isLink: true,
  },
  {
    icon: Mail,
    label: "Email",
    content: "info@rupiahbuilding.com",
    href: "mailto:info@rupiahbuilding.com",
    isLink: true,
  },
  {
    icon: Clock,
    label: "Opening Hours",
    content: "Monday: 09.00 – 18.00\nSaturday: 09.00 – 14.00\nSunday: Closed",
    isLink: false,
  },
];

export default function ContactPage() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    await new Promise((r) => setTimeout(r, 900));
    console.log("Contact form:", data);
    setSent(true);
    reset();
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <>
      <HeroSection
        image="/buildings/building-aerial-1.png"
        tag="Contact Us"
        title="Contact Us"
        subtitle="We'd love to hear from you. Whether you have questions about our spaces, pricing, or partnership opportunities, our team is ready to assist you."
        minHeight="min-h-[360px]"
      />

      <section ref={ref} className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Row 1: Contact Info + Map */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="bg-white border border-[#C9A36A]/40 rounded-xl p-6"
            >
              <h3 className="font-semibold text-[#2B2B2B] mb-5 text-sm uppercase tracking-wider">
                Contact Information
              </h3>
              <div className="space-y-5">
                {CONTACT_INFO.map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <div className="w-8 h-8 bg-[#C9A36A]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon size={15} className="text-[#C9A36A]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                        {item.label}
                      </p>
                      {item.isLink ? (
                        <a
                          href={item.href}
                          target={
                            item.href?.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            item.href?.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="text-xs text-gray-600 whitespace-pre-line hover:text-[#C9A36A] transition-colors"
                        >
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-xs text-gray-600 whitespace-pre-line">
                          {item.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Google Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-xl overflow-hidden border border-[#C9A36A]/40 shadow-sm"
              style={{ minHeight: 320 }}
            >
              <div
                className="relative"
                style={{ height: "100%", minHeight: 320 }}
              >
                <iframe
                  src={MAPS_EMBED}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: 320 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Rupiah Building Location"
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <div className="bg-white px-4 py-2.5 border-t border-gray-100 flex justify-between items-center">
                <p className="text-xs text-gray-500 truncate">
                  Jl. Sekolah Hijau No.14, Cikarang Utara
                </p>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C9A36A] text-xs font-semibold hover:underline ml-3 whitespace-nowrap"
                >
                  Open Maps →
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
