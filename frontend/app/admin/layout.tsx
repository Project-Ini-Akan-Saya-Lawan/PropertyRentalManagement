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
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import NotFound from "@/app/not-found";

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
  // Tri-state auth guard: null = still checking (render nothing), false =
  // not an admin (render 404), true = verified admin (render the panel).
  // This replaces the old approach of rendering the panel immediately and
  // redirecting inside a useEffect, which let the real admin content flash
  // on screen for a moment before a non-admin visitor got bounced.
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");

    let role_id: number | null = null;
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.username) setUsername(u.username);
        role_id = u.role_id ?? null;
      } catch {}
    }

    // Require both the token and the isAdmin/role_id=1 flag - a visitor with
    // no session at all, or a regular tenant who forged the isAdmin flag in
    // localStorage, should never see the panel.
    if (!token || !isAdmin || role_id !== 1) {
      setIsAuthorized(false);
      return;
    }
    setIsAuthorized(true);
  }, [pathname]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    ["isAdmin", "isLoggedIn", "token", "user", "userEmail"].forEach((k) =>
      localStorage.removeItem(k),
    );
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

  const SidebarLinks = () => (
    <>
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
      <div className="px-4 py-3 border-t-2 border-[#C9A36A]/40 mt-auto">
        <p className="text-[9px] font-medium text-[#2B2B2B]/40 text-center">
          &copy; 2026 Rupiah Building Jababeka
        </p>
      </div>
    </>
  );

  // Still verifying - render nothing rather than the panel, so there is no
  // flash of admin content while we check localStorage.
  if (isAuthorized === null) {
    return <div style={{ minHeight: "100vh", background: "#F5F0E8" }} />;
  }

  // Not an admin (or no session at all) - show the same 404 experience as
  // any other nonexistent route (e.g. /login/admin) instead of a redirect
  // that happens after the panel has already been shown.
  if (isAuthorized === false) {
    return <NotFound />;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          flexShrink: 0,
          height: 72,
          borderBottom: "1px solid #e5e7eb",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ display: "none" }}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-[#2B2B2B]" />
          </button>
          {/* Show hamburger on mobile via Tailwind */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-[#2B2B2B]" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-9 h-9">
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

      {/* ── Body ── */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          background: "#F5F0E8",
        }}
      >
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-56 flex-shrink-0 border-r-2 border-[#C9A36A]/40 bg-[#F5F0E8] overflow-y-auto">
          <SidebarLinks />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-white p-4 sm:p-6 min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
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
            <div className="flex flex-col flex-1 overflow-y-auto">
              <SidebarLinks />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
