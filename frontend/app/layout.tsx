import type { Metadata } from "next";
import "@/styles/globals.css";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar";

export const metadata: Metadata = {
  title: "Rupiah Building – Premium Workspace in Jababeka",
  description:
    "Find your perfect office or workspace at Rupiah Building in Jababeka. Premium coworking, private suites, and executive floors.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ConditionalNavbar />
        {children}

        {/* TEMPORARY DEBUG SCRIPT — hapus setelah overflow ketemu.
            Nge-log ke console setiap elemen yang lebih lebar dari viewport,
            beserta tag & className-nya, supaya gampang dicari di kode. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', () => {
                const docWidth = document.documentElement.clientWidth;
                document.querySelectorAll('*').forEach((el) => {
                  if (el.scrollWidth > docWidth + 5) {
                    console.log(
                      'OVERFLOW:',
                      el.tagName,
                      el.className,
                      'scrollWidth:', el.scrollWidth,
                      'vs viewport:', docWidth,
                      el
                    );
                  }
                });
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
