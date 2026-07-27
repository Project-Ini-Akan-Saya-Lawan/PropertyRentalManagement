"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarCheck,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  User,
  ArrowLeft,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    label: "Property Management",
    href: "/admin/property-management",
    icon: Building2,
  },
  { label: "User Management", href: "/admin/user-management", icon: Users },
  {
    label: "Booking Management",
    href: "/admin/booking-management",
    icon: CalendarCheck,
  },
  {
    label: "Payment Management",
    href: "/admin/payment-management",
    icon: CreditCard,
  },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
];

const BOTTOM_NAV = [
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState("Admin");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) router.push("/login");
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.username) setUsername(u.username);
      } catch {}
    }
  }, [router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    router.push("/");
  };

  const isActive = (href: string) => pathname === href;
  const navClass = (href: string) =>
    cn(
      "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all font-medium",
      isActive(href)
        ? "bg-[#C9A36A]/25 text-[#2B2B2B] font-bold"
        : "text-[#2B2B2B] hover:bg-[#C9A36A]/15",
    );
  const iconClass = (href: string) =>
    cn(isActive(href) ? "text-[#2B2B2B]" : "text-[#2B2B2B]/60");

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <nav className="px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className={navClass(href)}>
            <Icon
              size={15}
              strokeWidth={isActive(href) ? 2 : 1.5}
              className={iconClass(href)}
            />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-2 space-y-0.5 border-t-2 border-[#C9A36A]/40 pt-2">
        {BOTTOM_NAV.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className={navClass(href)}>
            <Icon
              size={15}
              strokeWidth={isActive(href) ? 2 : 1.5}
              className={iconClass(href)}
            />
            {label}
          </Link>
        ))}
      </div>
      <div className="flex-1" />
      <div className="px-4 py-3 border-t-2 border-[#C9A36A]/40">
        <p className="text-[9px] font-medium text-[#2B2B2B]/40 text-center">
          &copy; 2026 Rupiah Building Jababeka
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-200 h-[72px] flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-[#2B2B2B]" />
          </button>

          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9">
              <Image
                src="/logos/rupiah-logo.png"
                alt="Rupiah Building"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="hidden sm:block font-semibold text-[15px] text-[#2B2B2B] tracking-wide uppercase">
              Rupiah Building
            </span>
          </Link>
        </div>

        {/* Admin dropdown */}
        <div className="relative group">
          <div className="flex flex-col items-center gap-0.5 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-[#C9A36A] flex items-center justify-center group-hover:bg-[#A8834A] transition-colors">
              <User size={18} className="text-white" />
            </div>
            <span className="hidden sm:block text-[10px] font-semibold text-[#2B2B2B] group-hover:text-[#C9A36A] transition-colors">
              Admin
            </span>
          </div>
          <div className="absolute right-0 top-14 w-48 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-bold text-[#2B2B2B]">{username}</p>
              <p className="text-[10px] text-gray-400">Administrator</p>
            </div>
            <Link
              href="/account"
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#2B2B2B] hover:bg-[#C9A36A]/10 transition-colors"
            >
              <ExternalLink size={12} className="text-[#C9A36A]" /> My Account
            </Link>
            <Link
              href="/workspace"
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#2B2B2B] hover:bg-[#C9A36A]/10 transition-colors"
            >
              <ExternalLink size={12} className="text-[#C9A36A]" /> View Website
            </Link>
            <div className="border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-b-xl transition-colors"
              >
                <LogOut size={12} /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#F5F0E8] flex flex-col border-r-2 border-[#C9A36A]/40">
            <div className="flex items-center justify-between px-4 py-4 border-b-2 border-[#C9A36A]/40">
              <span className="font-semibold text-sm text-[#2B2B2B] uppercase tracking-wide">
                Menu
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-[#C9A36A]/10 rounded-lg"
              >
                <X size={16} className="text-[#2B2B2B]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent />
            </div>
          </aside>
        </div>
      )}

      {/* Body */}
      <div
        className="flex pt-[72px]"
        style={{ minHeight: "100vh", backgroundColor: "#F5F0E8" }}
      >
        {/* Desktop sidebar — sticky, nempel di bawah header */}
        <aside className="hidden md:flex w-56 flex-shrink-0 flex-col border-r-2 border-[#C9A36A]/40 bg-[#F5F0E8] sticky top-[72px] self-start h-[calc(100vh-72px)]">
          <SidebarContent />
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-white p-4 sm:p-6 min-w-0 min-h-[calc(100vh-72px)]">
          {children}
        </main>
      </div>
    </>
  );
}
