import Footer from "@/components/layout/Footer";

export default function CookiePolicyPage() {
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
            Cookie Policy
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
              1. What Are Cookies?
            </h2>
            <p>
              Cookies are small text files that are stored on your device when
              you visit a website. They are widely used to make websites work
              more efficiently, provide a better user experience, and give
              website owners information about how their site is being used.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              2. How We Use Cookies
            </h2>
            <p className="mb-3">
              Rupiah Building uses cookies for the following purposes:
            </p>
            <ul className="space-y-2 list-none">
              {[
                "Essential cookies: Required for the website to function properly",
                "Authentication cookies: To keep you logged in during your session",
                "Preference cookies: To remember your settings and preferences",
                "Analytics cookies: To understand how visitors interact with our website",
                "Security cookies: To protect against fraudulent activity",
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
              3. Types of Cookies We Use
            </h2>
            <div className="space-y-4">
              {[
                {
                  type: "Session Cookies",
                  desc: "These are temporary cookies that expire when you close your browser. They are essential for the proper functioning of our website.",
                },
                {
                  type: "Persistent Cookies",
                  desc: "These cookies remain on your device for a set period. They help us remember your preferences for future visits.",
                },
                {
                  type: "Third-Party Cookies",
                  desc: "We may use third-party services such as analytics providers that set their own cookies on your device.",
                },
              ].map((c, i) => (
                <div key={i} className="bg-[#F5F5F5] rounded-xl p-4">
                  <p className="font-bold text-[#2B2B2B] mb-1">{c.type}</p>
                  <p className="text-[#2B2B2B]/70">{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              4. Managing Cookies
            </h2>
            <p className="mb-3">
              You can control and manage cookies in your browser settings. Most
              browsers allow you to:
            </p>
            <ul className="space-y-2 list-none mb-3">
              {[
                "View what cookies are stored on your device",
                "Delete all or specific cookies",
                "Block cookies from specific websites",
                "Block all cookies from being set",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A36A] flex-shrink-0 mt-1.5" />
                  {item}
                </li>
              ))}
            </ul>
            <p>
              Please note that disabling certain cookies may affect the
              functionality of our website and your ability to use some of our
              services.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              5. Updates to This Policy
            </h2>
            <p>
              We may update this Cookie Policy from time to time to reflect
              changes in technology or legal requirements. We will notify you of
              any significant changes by posting the updated policy on our
              website with a new effective date.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-[#2B2B2B] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              6. Contact Us
            </h2>
            <p>
              If you have any questions about our use of cookies, please contact
              us at{" "}
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
