"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render Navbar immediately on server for non-admin pages
  // On client, hide if admin page
  if (mounted && pathname.startsWith("/admin")) return null;

  // Don't render on admin pages even before mount (SSR check via pathname)
  if (typeof window === "undefined" && pathname?.startsWith("/admin"))
    return null;

  return <Navbar />;
}
