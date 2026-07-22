"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Workspace", href: "/workspace" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const loggedIn = !!localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          setUsername(user.username || "");
        } catch {}
      }
    }
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setUsername("");
    router.push("/");
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-200 h-[72px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="relative w-9 h-9">
              <Image
                src="/logos/rupiah-logo.png"
                alt="Rupiah Building"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-semibold text-[15px] text-[#2B2B2B] tracking-wide uppercase">
              Rupiah Building
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative text-sm pb-1 transition-colors",
                  isActive(href)
                    ? "font-semibold text-[#2B2B2B]"
                    : "font-normal text-[#6B7280] hover:text-[#2B2B2B]",
                )}
              >
                {label}
                {/* Underline — pakai scaleX bukan layoutId supaya animasinya konsisten */}
                <motion.span
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9A36A] rounded-full origin-left"
                  initial={false}
                  animate={{
                    scaleX: isActive(href) ? 1 : 0,
                    opacity: isActive(href) ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-2">
                {username && (
                  <span className="text-xs text-gray-500 font-medium">
                    Hi, {username.split(" ")[0]}
                  </span>
                )}
                <Link
                  href="/account"
                  className="bg-[#C9A36A] hover:bg-[#A8834A] text-white text-sm font-semibold px-5 py-2 rounded-md transition-colors"
                >
                  Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-300 px-4 py-2 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex bg-[#C9A36A] hover:bg-[#A8834A] text-white text-sm font-semibold px-5 py-2 rounded-md transition-colors"
              >
                Account
              </Link>
            )}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <div className="h-[72px]" />

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col p-6 gap-6"
            >
              <div className="flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                  <div className="relative w-8 h-8">
                    <Image
                      src="/logos/rupiah-logo.png"
                      alt="Rupiah Building"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="font-semibold text-sm uppercase tracking-wide">
                    Rupiah Building
                  </span>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-800"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {NAV.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm transition-colors",
                      isActive(href)
                        ? "bg-[#C9A36A]/10 text-[#C9A36A] font-semibold"
                        : "text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-2">
                {isLoggedIn ? (
                  <>
                    {username && (
                      <p className="text-xs text-center text-gray-500">
                        Hi, {username.split(" ")[0]}
                      </p>
                    )}
                    <Link
                      href="/account"
                      className="flex items-center justify-center bg-[#C9A36A] text-white font-semibold py-2.5 rounded-md text-sm hover:bg-[#A8834A] transition-colors"
                    >
                      Account
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center border border-red-200 text-red-400 font-semibold py-2.5 rounded-md text-sm hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center justify-center bg-[#C9A36A] text-white font-semibold py-2.5 rounded-md text-sm hover:bg-[#A8834A] transition-colors"
                    >
                      Account
                    </Link>
                    <Link
                      href="/signup"
                      className="flex items-center justify-center border border-[#C9A36A] text-[#C9A36A] font-semibold py-2.5 rounded-md text-sm hover:bg-[#C9A36A]/5 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
