"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  UserPlus,
  TrendingUp,
  Home,
  Users,
  Users2,
  Clock,
  FileText,
  Calendar,
} from "lucide-react";

interface DashboardStats {
  totalProperties: number | null;
  totalOwners: number | null;
  totalTenants: number | null;
  monthlyRevenue: string | null;
  occupancyRate: string | null;
  pendingApprovals: number | null;
}

const MONTHLY_DATA = [25, 40, 33, 52, 60, 78];
const MONTHLY_LABELS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"];
const QUARTERLY_DATA = [45, 62, 55, 80];
const QUARTERLY_LABELS = ["Q1", "Q2", "Q3", "Q4"];

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
    totalOwners: null,
    totalTenants: null,
    monthlyRevenue: null,
    occupancyRate: null,
    pendingApprovals: null,
  });
  const [revenueTab, setRevenueTab] = useState<"monthly" | "quarterly">(
    "monthly",
  );

  useEffect(() => {
    // TODO: fetch from API
    // const s = await fetch("/api/admin/dashboard/stats").then(r => r.json());
    // setStats(s);
  }, []);

  const chartData = revenueTab === "monthly" ? MONTHLY_DATA : QUARTERLY_DATA;
  const chartLabels =
    revenueTab === "monthly" ? MONTHLY_LABELS : QUARTERLY_LABELS;
  const maxVal = Math.max(...chartData);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-[#2B2B2B]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Portfolio Overview
        </h1>
        <p className="text-xs font-medium text-[#2B2B2B]/60 mt-0.5">
          Welcome back. Here is what&apos;s happening across your properties
          today.
        </p>
      </div>

      {/* Stats - no sub badges */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard
          label="Total Properties"
          value={stats.totalProperties}
          icon={<Home size={15} />}
        />
        <StatCard
          label="Total Owners"
          value={stats.totalOwners}
          icon={<Users size={15} />}
        />
        <StatCard
          label="Total Tenants"
          value={stats.totalTenants}
          icon={<Users2 size={15} />}
        />
        <StatCard
          label="Monthly Revenue"
          value={stats.monthlyRevenue}
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
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {/* Revenue Trend */}
        <div className="md:col-span-2 bg-white border-2 border-[#C9A36A]/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-[#2B2B2B]">Revenue Trend</p>
              <p className="text-[10px] font-medium text-[#2B2B2B]/50">
                {revenueTab === "monthly"
                  ? "Projected vs Actual Revenue (Monthly)"
                  : "Projected vs Actual Revenue (Quarterly)"}
              </p>
            </div>
            <div className="flex gap-1 border-2 border-[#C9A36A]/30 rounded-lg p-0.5">
              <button
                onClick={() => setRevenueTab("monthly")}
                className={`text-[10px] px-3 py-1 rounded-md font-bold transition-colors ${
                  revenueTab === "monthly"
                    ? "bg-[#C9A36A] text-white"
                    : "text-[#2B2B2B]/60 hover:text-[#2B2B2B]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setRevenueTab("quarterly")}
                className={`text-[10px] px-3 py-1 rounded-md font-bold transition-colors ${
                  revenueTab === "quarterly"
                    ? "bg-[#C9A36A] text-white"
                    : "text-[#2B2B2B]/60 hover:text-[#2B2B2B]"
                }`}
              >
                Quarterly
              </button>
            </div>
          </div>

          {/* Bar chart */}
          <div className="h-44 flex items-end gap-2 px-2">
            {chartData.map((val, i) => (
              <div
                key={chartLabels[i]}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${(val / maxVal) * 100}%`,
                    backgroundColor:
                      i === chartData.length - 1 ? "#C9A36A" : "#E8D5B0",
                    minHeight: "8px",
                  }}
                />
                <span className="text-[9px] font-semibold text-[#2B2B2B]/60">
                  {chartLabels[i]}
                </span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-3 pt-3 border-t border-[#C9A36A]/20 flex items-center gap-3">
            {revenueTab === "monthly" ? (
              <>
                <div className="flex gap-3 text-[10px] font-semibold text-[#2B2B2B]/60">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-2 rounded-sm bg-[#C9A36A] inline-block" />{" "}
                    Current Month
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-2 rounded-sm bg-[#E8D5B0] inline-block" />{" "}
                    Previous Months
                  </span>
                </div>
                <span className="ml-auto text-[10px] font-bold text-green-600">
                  ↑ Trending up
                </span>
              </>
            ) : (
              <>
                <div className="flex gap-3 text-[10px] font-semibold text-[#2B2B2B]/60">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-2 rounded-sm bg-[#C9A36A] inline-block" />{" "}
                    Q4 (Latest)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-2 rounded-sm bg-[#E8D5B0] inline-block" />{" "}
                    Prior Quarters
                  </span>
                </div>
                <span className="ml-auto text-[10px] font-bold text-[#C9A36A]">
                  Full Year View
                </span>
              </>
            )}
          </div>
          <p className="text-center text-[10px] font-medium text-[#2B2B2B]/20 mt-1">
            Connect API to show real data
          </p>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border-2 border-[#C9A36A]/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-[#2B2B2B]">Recent Activity</p>
            <button className="text-[10px] font-bold text-[#C9A36A] hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {[
              {
                title: "New Booking Received",
                sub: "—",
                time: "—",
                bg: "bg-blue-100",
                icon: <FileText size={12} className="text-blue-600" />,
              },
              {
                title: "Property Approved",
                sub: "—",
                time: "—",
                bg: "bg-green-100",
                icon: <Home size={12} className="text-green-600" />,
              },
              {
                title: "Payout Disbursed",
                sub: "—",
                time: "—",
                bg: "bg-red-100",
                icon: <TrendingUp size={12} className="text-red-600" />,
              },
              {
                title: "Support Ticket Resolved",
                sub: "—",
                time: "—",
                bg: "bg-[#C9A36A]/15",
                icon: <Calendar size={12} className="text-[#C9A36A]" />,
              },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg ${a.bg} flex items-center justify-center flex-shrink-0`}
                >
                  {a.icon}
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
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Booking Trend */}
        <div className="bg-white border-2 border-[#C9A36A]/30 rounded-xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#2B2B2B]/50 mb-1">
            Booking Trend
          </p>
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-2xl font-bold text-[#2B2B2B]">—</p>
            <span className="text-xs font-bold text-green-600">+12%</span>
          </div>
          <p className="text-[10px] font-medium text-[#2B2B2B]/60 mb-3">
            Total new bookings this month
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
            Across all luxury units
          </p>
          <div className="w-20 h-20 rounded-full border-8 border-[#C9A36A] flex items-center justify-center">
            <span className="text-lg font-bold text-[#2B2B2B]">—</span>
          </div>
          <p className="text-[10px] font-medium text-[#2B2B2B]/30 mt-3">
            API data pending
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
                New Owner
              </p>
              <p className="text-[10px] font-medium text-[#2B2B2B]/50 group-hover:text-white/70 transition-colors">
                Onboard a property owner
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
