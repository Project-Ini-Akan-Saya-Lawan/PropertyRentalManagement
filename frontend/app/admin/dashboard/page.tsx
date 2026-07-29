"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  UserPlus,
  TrendingUp,
  Home,
  Users2,
  Clock,
  FileText,
} from "lucide-react";

interface DashboardStats {
  totalProperties: number | null;
  totalTenants: number | null;
  monthlyRevenue: string | null;
  occupancyRate: string | null;
  pendingApprovals: number | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

// Compact currency label - full "Rp x.xxx.xxx.xxx,00" formatting is too
// long to fit in a stat card or under a narrow chart bar.
function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return String(amount);
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number | null;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border-2 border-[#C9A36A]/30 rounded-xl p-4 flex flex-col gap-2 transition-all duration-200 hover:shadow-lg hover:shadow-[#C9A36A]/15 hover:border-[#C9A36A]/60 cursor-default">
      <div className="w-8 h-8 rounded-lg bg-[#C9A36A]/10 flex items-center justify-center text-[#C9A36A]">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#2B2B2B]/50 mb-0.5">
          {label}
        </p>
        <p className="text-2xl font-bold text-[#2B2B2B]">
          {value ?? <span className="text-[#2B2B2B]/20 text-sm">—</span>}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: null,
    totalTenants: null,
    monthlyRevenue: null,
    occupancyRate: null,
    pendingApprovals: null,
  });
  const [revenueTab, setRevenueTab] = useState<"monthly" | "quarterly">(
    "monthly",
  );
  const [recentBookings, setRecentBookings] = useState<
    { title: string; sub: string; time: string }[]
  >([]);
  const [totalPacks, setTotalPacks] = useState<number>(0);
  const [confirmedPacks, setConfirmedPacks] = useState<number>(0);
  const [bookings, setBookings] = useState<
    { status: string; total_price: number; booking_date: string }[]
  >([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    // Fetch total properties (towers)
    fetch(`${API_URL}/api/properties`)
      .then((r) => r.json())
      .then((result) => {
        if (result.data)
          setStats((prev) => ({
            ...prev,
            totalProperties: result.data.length,
          }));
      })
      .catch(console.error);

    // Fetch total tenants
    fetch(`${API_URL}/api/users`, { headers })
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          const tenants = result.data.filter(
            (u: { role_id: number }) => u.role_id === 2,
          );
          setStats((prev) => ({ ...prev, totalTenants: tenants.length }));
        }
      })
      .catch(console.error);

    // Fetch floor packs → total units for occupancy
    fetch(`${API_URL}/api/floor-packs`)
      .then((r) => r.json())
      .then((result) => {
        if (result.data) setTotalPacks(result.data.length);
      })
      .catch(console.error);

    // Fetch all bookings → pending + recent activity + occupancy
    fetch(`${API_URL}/api/bookings/all`, { headers })
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          const bookings = result.data;
          const pending = bookings.filter(
            (b: { status: string }) => b.status === "pending",
          ).length;
          // Distinct packs currently confirmed, not a raw count of every
          // confirmed booking ever made - a pack rebooked multiple times
          // over the months would otherwise push this past totalPacks and
          // produce a >100% "utilization" figure.
          const confirmed = new Set(
            bookings
              .filter((b: { status: string }) => b.status === "confirmed")
              .map((b: { pack_id: number }) => b.pack_id),
          ).size;
          setConfirmedPacks(confirmed);
          setStats((prev) => ({ ...prev, pendingApprovals: pending }));
          setBookings(bookings);

          const recent = bookings
            .slice(0, 4)
            .map(
              (b: {
                username: string;
                booking_id: number;
                booking_date: string;
              }) => ({
                title: "New Booking Received",
                sub: `${b.username} — BK-${b.booking_id}`,
                time: new Date(b.booking_date).toLocaleDateString("id-ID"),
              }),
            );
          setRecentBookings(recent);
        }
      })
      .catch(console.error);
  }, []);

  // Hitung occupancy rate
  useEffect(() => {
    if (totalPacks > 0) {
      const rate = Math.round((confirmedPacks / totalPacks) * 100);
      setStats((prev) => ({ ...prev, occupancyRate: `${rate}%` }));
    }
  }, [totalPacks, confirmedPacks]);

  // Real revenue chart data - confirmed/completed bookings only, since
  // those are the ones that were actually paid for. Replaces the old
  // hardcoded placeholder arrays that never reflected real data at all.
  const REVENUE_STATUSES = ["confirmed", "completed"];
  const now = new Date();
  const revenueByMonth = Array(12).fill(0);
  bookings
    .filter((b) => REVENUE_STATUSES.includes(b.status))
    .forEach((b) => {
      const d = new Date(b.booking_date);
      if (d.getFullYear() === now.getFullYear()) {
        revenueByMonth[d.getMonth()] += Number(b.total_price || 0);
      }
    });
  const revenueByQuarter = [0, 0, 0, 0];
  revenueByMonth.forEach((amt, i) => {
    revenueByQuarter[Math.floor(i / 3)] += amt;
  });

  const MONTHLY_DATA = revenueByMonth;
  const MONTHLY_LABELS = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const QUARTERLY_DATA = revenueByQuarter;
  const QUARTERLY_LABELS = ["Q1", "Q2", "Q3", "Q4"];

  const chartData = revenueTab === "monthly" ? MONTHLY_DATA : QUARTERLY_DATA;
  const chartLabels =
    revenueTab === "monthly" ? MONTHLY_LABELS : QUARTERLY_LABELS;
  const maxVal = Math.max(...chartData, 1);
  const hasRevenueData = chartData.some((v) => v > 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-[#2B2B2B]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Dashboard Overview
        </h1>
        <p className="text-xs font-medium text-[#2B2B2B]/60 mt-0.5">
          Welcome back. Here is what&apos;s happening across your properties
          today.
        </p>
      </div>

      {/* Stats — 5 cards, no Total Owners */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatCard
          label="Total Properties"
          value={stats.totalProperties}
          icon={<Home size={15} />}
        />
        <StatCard
          label="Total Tenants"
          value={stats.totalTenants}
          icon={<Users2 size={15} />}
        />
        <StatCard
          label="Monthly Revenue"
          value={
            revenueByMonth[now.getMonth()] > 0
              ? `Rp ${formatCompactCurrency(revenueByMonth[now.getMonth()])}`
              : null
          }
          icon={<TrendingUp size={15} />}
        />
        <StatCard
          label="Occupancy Rate"
          value={stats.occupancyRate}
          icon={<Clock size={15} />}
        />
        <StatCard
          label="Pending Approvals"
          value={stats.pendingApprovals}
          icon={<FileText size={15} />}
        />
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Revenue Trend */}
        <div className="min-w-0 md:col-span-2 bg-white border-2 border-[#C9A36A]/30 rounded-xl p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-[#2B2B2B]">Revenue Trend</p>
              <p className="text-[10px] font-medium text-[#2B2B2B]/50">
                Confirmed &amp; completed bookings ({now.getFullYear()})
              </p>
            </div>
            <div className="flex gap-1 border-2 border-[#C9A36A]/30 rounded-lg p-0.5 self-start">
              <button
                onClick={() => setRevenueTab("monthly")}
                className={`text-[10px] px-3 py-1 rounded-md font-bold transition-colors ${revenueTab === "monthly" ? "bg-[#C9A36A] text-white" : "text-[#2B2B2B]/60 hover:text-[#2B2B2B]"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setRevenueTab("quarterly")}
                className={`text-[10px] px-3 py-1 rounded-md font-bold transition-colors ${revenueTab === "quarterly" ? "bg-[#C9A36A] text-white" : "text-[#2B2B2B]/60 hover:text-[#2B2B2B]"}`}
              >
                Quarterly
              </button>
            </div>
          </div>
          <div className="h-44 overflow-x-auto no-scrollbar -mx-2 px-2">
            <div className="h-full flex items-end gap-2 min-w-[420px] sm:min-w-0">
              {chartData.map((val, i) => (
                <div
                  key={chartLabels[i]}
                  className="flex-1 min-w-0 flex flex-col items-center gap-1.5 h-full justify-end"
                >
                  <span className="text-[9px] font-bold text-[#2B2B2B]/60">
                    {val > 0 ? formatCompactCurrency(val) : ""}
                  </span>
                  <div
                    className="w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: `${(val / maxVal) * 80}%`,
                      backgroundColor:
                        i === chartData.length - 1 ? "#C9A36A" : "#E8D5B0",
                      minHeight: val > 0 ? "8px" : "0",
                    }}
                  />
                  <span className="text-[9px] font-semibold text-[#2B2B2B]/60">
                    {chartLabels[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#C9A36A]/20 flex items-center gap-3">
            <div className="flex gap-3 text-[10px] font-semibold text-[#2B2B2B]/60">
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-sm bg-[#C9A36A] inline-block" />{" "}
                {revenueTab === "monthly" ? "Current Month" : "Current Quarter"}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-sm bg-[#E8D5B0] inline-block" />{" "}
                {revenueTab === "monthly"
                  ? "Previous Months"
                  : "Prior Quarters"}
              </span>
            </div>
            {!hasRevenueData && (
              <span className="ml-auto text-[10px] font-medium text-[#2B2B2B]/30">
                No paid bookings yet this year
              </span>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border-2 border-[#C9A36A]/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-[#2B2B2B]">Recent Activity</p>
            <button
              onClick={() => router.push("/admin/booking-management")}
              className="text-[10px] font-bold text-[#C9A36A] hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentBookings.length === 0 ? (
              <p className="text-xs text-[#2B2B2B]/30 text-center py-4">
                No recent activity
              </p>
            ) : (
              recentBookings.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText size={12} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#2B2B2B] leading-tight">
                      {a.title}
                    </p>
                    <p className="text-[10px] font-medium text-[#2B2B2B]/50">
                      {a.sub}
                    </p>
                  </div>
                  <span className="text-[9px] font-semibold text-[#2B2B2B]/30 whitespace-nowrap">
                    {a.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Booking Trend */}
        <div className="bg-white border-2 border-[#C9A36A]/30 rounded-xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#2B2B2B]/50 mb-1">
            Booking Trend
          </p>
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-2xl font-bold text-[#2B2B2B]">
              {stats.pendingApprovals ?? "—"}
            </p>
            <span className="text-xs font-bold text-orange-500">Pending</span>
          </div>
          <p className="text-[10px] font-medium text-[#2B2B2B]/60 mb-3">
            Total pending bookings
          </p>
          <div className="h-14 flex items-end gap-1">
            {[20, 35, 28, 45, 38, 50, 42, 60].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}%`,
                  backgroundColor: i === 7 ? "#C9A36A" : "#E8D5B0",
                }}
              />
            ))}
          </div>
        </div>

        {/* Capacity Utilization */}
        <div className="bg-white border-2 border-[#C9A36A]/30 rounded-xl p-5 flex flex-col items-center justify-center">
          <p className="text-sm font-bold text-[#2B2B2B] mb-1">
            Capacity Utilization
          </p>
          <p className="text-[10px] font-medium text-[#2B2B2B]/50 mb-4">
            Confirmed bookings / total packs
          </p>
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="#E8D5B0"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="#C9A36A"
                strokeWidth="3"
                strokeDasharray={`${stats.occupancyRate ? parseInt(stats.occupancyRate) : 0} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-[#2B2B2B]">
                {stats.occupancyRate ?? "—"}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-[#2B2B2B]/40 mt-3">
            {confirmedPacks} confirmed / {totalPacks} total packs
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/admin/property-management")}
            className="bg-white border-2 border-[#C9A36A]/40 rounded-xl p-4 flex items-center gap-3 hover:bg-[#C9A36A] group transition-all duration-200 hover:border-[#C9A36A] hover:shadow-md text-left"
          >
            <div className="w-9 h-9 bg-[#C9A36A]/10 group-hover:bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
              <Plus
                size={16}
                className="text-[#C9A36A] group-hover:text-white transition-colors"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2B2B2B] group-hover:text-white transition-colors">
                Add Property
              </p>
              <p className="text-[10px] font-medium text-[#2B2B2B]/50 group-hover:text-white/70 transition-colors">
                Register a new luxury unit
              </p>
            </div>
          </button>
          <button
            onClick={() => router.push("/admin/user-management")}
            className="bg-white border-2 border-[#C9A36A]/40 rounded-xl p-4 flex items-center gap-3 hover:bg-[#C9A36A] group transition-all duration-200 hover:border-[#C9A36A] hover:shadow-md text-left"
          >
            <div className="w-9 h-9 bg-[#C9A36A]/10 group-hover:bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
              <UserPlus
                size={16}
                className="text-[#C9A36A] group-hover:text-white transition-colors"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2B2B2B] group-hover:text-white transition-colors">
                Manage Users
              </p>
              <p className="text-[10px] font-medium text-[#2B2B2B]/50 group-hover:text-white/70 transition-colors">
                View and manage tenants
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
