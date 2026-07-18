import Footer from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-[#C9A36A] uppercase tracking-widest mb-2">
            Legal
          </p>
          <h1
            className="text-4xl font-bold text-[#C9A36A] mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm text-[#2B2B2B]/60">Last updated: July 2026</p>
          <div className="mt-4 h-px bg-[#C9A36A]/20" />
        </div>

        {/* Content */}
        <div className="space-y-10 text-sm text-[#2B2B2B]/80 leading-relaxed">
          <section>
            <h2
              className="text-lg font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              1. Introduction
            </h2>
            <p>
              Rupiah Building Jababeka (&quot;we,&quot; &quot;our,&quot; or
              &quot;us&quot;) is committed to protecting your personal
              information and your right to privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you visit our website or use our services.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              2. Information We Collect
            </h2>
            <p className="mb-3">
              We may collect the following types of information:
            </p>
            <ul className="space-y-2 list-none">
              {[
                "Personal identification information (name, email address, phone number)",
                "Company information (company name, job title, business address)",
                "Account credentials (username and encrypted password)",
                "Payment information (processed securely through our payment partners)",
                "Usage data (pages visited, time spent, browser type, IP address)",
                "Communication records (messages sent through our contact forms)",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A36A] flex-shrink-0 mt-1.5" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              3. How We Use Your Information
            </h2>
            <p className="mb-3">
              We use the collected information for the following purposes:
            </p>
            <ul className="space-y-2 list-none">
              {[
                "To provide, operate, and maintain our services",
                "To process bookings and rental agreements",
                "To send transactional emails and notifications",
                "To respond to your inquiries and provide customer support",
                "To improve our website and service offerings",
                "To comply with legal obligations",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A36A] flex-shrink-0 mt-1.5" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              4. Data Sharing and Disclosure
            </h2>
            <p>
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information with trusted service
              providers who assist us in operating our website and conducting
              our business, provided they agree to keep your information
              confidential.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              5. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational security
              measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction. However, no method
              of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              6. Your Rights
            </h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="space-y-2 list-none">
              {[
                "Access and receive a copy of your personal data",
                "Request correction of inaccurate data",
                "Request deletion of your personal data",
                "Withdraw consent at any time",
                "Lodge a complaint with a supervisory authority",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A36A] flex-shrink-0 mt-1.5" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              7. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:info@rupiahbuilding.com"
                className="text-[#C9A36A] hover:underline"
              >
                info@rupiahbuilding.com
              </a>{" "}
              or visit our office at Jl. Sekolah Hijau No.14, Simpangan,
              Cikarang Utara, Kabupaten Bekasi, Jawa Barat 17530.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
