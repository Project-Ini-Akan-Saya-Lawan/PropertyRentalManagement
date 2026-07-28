"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // pathname is already identical on the server's first render and the
  // client's hydration pass (Next.js derives it from the request URL both
  // times), so this is enough on its own - no "mounted" or window check
  // needed. The previous version fell through to <Navbar /> on the client's
  // very first render (before its useEffect had run) while the server had
  // already rendered null for /admin/* pages, causing a hydration mismatch
  // on every single admin page.
  if (pathname?.startsWith("/admin")) return null;

  return <Navbar />;
}
