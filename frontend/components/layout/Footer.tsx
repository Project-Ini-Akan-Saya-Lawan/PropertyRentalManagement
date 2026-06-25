import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Clock } from "lucide-react";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Jl.+Sekolah+Hijau+No.14+Simpangan+Cikarang+Utara+Bekasi";

const payments = [
  { id: "visa", src: "/payments/visa.png", alt: "Visa" },
  { id: "bca", src: "/payments/bca.png", alt: "BCA" },
  { id: "jcb", src: "/payments/jcb.png", alt: "JCB" },
  { id: "mastercard", src: "/payments/mastercard.png", alt: "Mastercard" },
  { id: "mandiri", src: "/payments/mandiri.png", alt: "Mandiri" },
  { id: "bri", src: "/payments/bri.png", alt: "BRI" },
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Workspace", href: "/workspace" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const legalLinks = ["Privacy Policy", "Terms of Use", "Cookie Policy"];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Col 1 - Logo */}
        <div>
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="relative w-9 h-9">
              <Image
                src="/logos/rupiah-logo.png"
                alt="Rupiah Building"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-semibold text-sm uppercase tracking-wide text-[#2B2B2B]">
              Rupiah Building
            </span>
          </Link>
          <p className="text-xs text-gray-500 leading-relaxed">
            Premium office and workspace solutions in the heart of
            Jababeka&apos;s business district. Designed for businesses to grow,
            connect, and succeed.
          </p>
        </div>

        {/* Col 2 - Navigation */}
        <div>
          <h4 className="text-xs font-bold text-[#2B2B2B] uppercase tracking-widest mb-4">
            Navigation
          </h4>
          <ul className="space-y-2">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-xs text-gray-500 hover:text-[#C9A36A] transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 - Contact */}
        <div>
          <h4 className="text-xs font-bold text-[#2B2B2B] uppercase tracking-widest mb-4">
            Contact Us
          </h4>
          <ul className="space-y-3 text-xs text-gray-500">
            <li>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-2 hover:text-[#C9A36A] transition-colors"
              >
                <MapPin
                  size={13}
                  className="mt-0.5 flex-shrink-0 text-[#C9A36A]"
                />
                <span>
                  Jl. Sekolah Hijau No.14, Simpangan, Cikarang Utara, Kabupaten
                  Bekasi, Jawa Barat 17530
                </span>
              </a>
            </li>
            <li className="flex gap-2 items-start">
              <Mail size={13} className="mt-0.5 flex-shrink-0 text-[#C9A36A]" />
              <a
                href="mailto:info@rupiahbuilding.com"
                className="hover:text-[#C9A36A] transition-colors"
              >
                info@rupiahbuilding.com
              </a>
            </li>
            <li className="flex gap-2 items-start">
              <Clock
                size={13}
                className="mt-0.5 flex-shrink-0 text-[#C9A36A]"
              />
              <span>Monday - Friday, 08.00 - 18.00 WIB</span>
            </li>
          </ul>
        </div>

        {/* Col 4 - Secure Payment */}
        <div>
          <h4 className="text-xs font-bold text-[#2B2B2B] uppercase tracking-widest mb-4">
            Secure Payment
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {payments.map((p) => (
              <div
                key={p.id}
                className="relative h-8 rounded overflow-hidden bg-gray-50 border border-gray-100"
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  className="object-contain p-1"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-400">
            &copy; 2026 Rupiah Building Jababeka. All rights reserved.
          </p>
          <div className="flex gap-5">
            {legalLinks.map((t) => (
              <Link
                key={t}
                href="#"
                className="text-[11px] text-gray-400 hover:text-[#C9A36A] transition-colors"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
