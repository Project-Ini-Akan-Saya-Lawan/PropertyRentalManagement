import Footer from "@/components/layout/Footer";

export default function TermsOfUsePage() {
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
            Terms of Use
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
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using the Rupiah Building website and services,
              you accept and agree to be bound by these Terms of Use. If you do
              not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              2. Use of Services
            </h2>
            <p className="mb-3">When using our services, you agree to:</p>
            <ul className="space-y-2 list-none">
              {[
                "Provide accurate and complete information during registration and booking",
                "Maintain the confidentiality of your account credentials",
                "Use our services only for lawful purposes",
                "Not engage in any activity that disrupts or interferes with our services",
                "Comply with all applicable laws and regulations",
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
              3. Booking and Rental Agreement
            </h2>
            <p>
              All bookings made through our platform are subject to availability
              and confirmation by Rupiah Building management. A booking is only
              confirmed upon receipt of the required deposit and written
              confirmation from our team. Rental agreements are governed by
              separate lease contracts signed between the tenant and Rupiah
              Building.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              4. Payment Terms
            </h2>
            <p>
              All prices listed on our website are in Indonesian Rupiah (IDR)
              and are subject to applicable taxes. Payments must be made in
              accordance with the payment schedule outlined in your rental
              agreement. Late payments may incur additional charges as specified
              in the agreement.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              5. Cancellation Policy
            </h2>
            <p>
              Cancellation policies vary depending on the type of workspace and
              rental duration. Please refer to your specific rental agreement
              for cancellation terms. Deposits may be non-refundable depending
              on the timing of cancellation.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              6. Intellectual Property
            </h2>
            <p>
              All content on this website, including but not limited to text,
              images, logos, and graphics, is the property of Rupiah Building
              Jababeka and is protected by applicable intellectual property
              laws. Unauthorized use, reproduction, or distribution is strictly
              prohibited.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              7. Limitation of Liability
            </h2>
            <p>
              Rupiah Building shall not be liable for any indirect, incidental,
              special, or consequential damages arising from your use of our
              services. Our total liability shall not exceed the amount paid by
              you for the specific service giving rise to the claim.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              8. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms of Use at any time.
              Changes will be effective immediately upon posting to the website.
              Your continued use of our services after changes are posted
              constitutes your acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              9. Contact Us
            </h2>
            <p>
              For questions regarding these Terms of Use, please contact us at{" "}
              <a
                href="mailto:info@rupiahbuilding.com"
                className="text-[#C9A36A] hover:underline"
              >
                info@rupiahbuilding.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
