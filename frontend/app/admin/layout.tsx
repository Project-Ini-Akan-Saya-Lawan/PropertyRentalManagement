"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, CalendarCheck,
  CreditCard, BarChart3, Bell, Settings, User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard",           href: "/admin/dashboard",           icon: LayoutDashboard },
  { label: "Property Management", href: "/admin/property-management", icon: Building2 },
  { label: "User Management",     href: "/admin/user-management",     icon: Users },
  { label: "Booking Management",  href: "/admin/booking-management",  icon: CalendarCheck },
  { label: "Payment Management",  href: "/admin/payment-management",  icon: CreditCard },
  { label: "Reports",             href: "/admin/reports",             icon: BarChart3 },
];

const BOTTOM_NAV = [
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Settings",      href: "/admin/settings",      icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) router.push("/login");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminEmail");
    router.push("/");
  };

  const isActive = (href: string) => pathname === href;

  const navClass = (href: string) => cn(
    "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all font-medium",
    isActive(href)
      ? "bg-[#C9A36A]/25 text-[#2B2B2B] font-bold"
      : "text-[#2B2B2B] hover:bg-[#C9A36A]/15"
  );

  const iconClass = (href: string) => cn(
    isActive(href) ? "text-[#2B2B2B]" : "text-[#2B2B2B]/60"
  );

  return (
    <>
      {/* ── Header ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-200 h-[72px] flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="relative w-9 h-9">
            <Image src="/logos/rupiah-logo.png" alt="Rupiah Building" fill className="object-contain" priority />
          </div>
          <span className="font-semibold text-[15px] text-[#2B2B2B] tracking-wide uppercase">
            Rupiah Building
          </span>
        </Link>

        {/* Admin avatar + dropdown */}
        <div className="relative group">
          <div className="flex flex-col items-center gap-0.5 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-[#C9A36A] flex items-center justify-center group-hover:bg-[#A8834A] transition-colors">
              <User size={18} className="text-white" />
            </div>
            <span className="text-[10px] font-semibold text-[#2B2B2B] group-hover:text-[#C9A36A] transition-colors">
              Admin
            </span>
          </div>

          {/* Dropdown */}
          <div className="absolute right-0 top-16 w-40 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-bold text-[#2B2B2B]">Admin User</p>
              <p className="text-[10px] text-gray-400">Super User</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-b-xl transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex bg-[#F5F0E8]" style={{ minHeight: "calc(100vh - 72px)" }}>

        {/* Sidebar */}
        <aside
          className="w-56 flex-shrink-0 flex flex-col border-r-2 border-[#C9A36A]/40"
          style={{ backgroundColor: "#F5F0E8", minHeight: "calc(100vh - 72px)" }}
        >
          {/* Main Nav */}
          <nav className="px-2 py-3 space-y-0.5">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} className={navClass(href)}>
                <Icon size={15} strokeWidth={isActive(href) ? 2 : 1.5} className={iconClass(href)} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Bottom Nav */}
          <div className="px-2 space-y-0.5 border-t-2 border-[#C9A36A]/40 pt-2">
            {BOTTOM_NAV.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} className={navClass(href)}>
                <Icon size={15} strokeWidth={isActive(href) ? 2 : 1.5} className={iconClass(href)} />
                {label}
              </Link>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer */}
          <div className="px-4 py-3 border-t-2 border-[#C9A36A]/40">
            <p className="text-[9px] font-medium text-[#2B2B2B]/40 text-center">
              &copy; 2026 Rupiah Building Jababeka. All rights reserved.
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-white p-6">
          {children}
        </main>

      </div>
    </>
  );
}