"use client";

import { useState } from "react";
import {
  Download,
  Building2,
  Users,
  TrendingUp,
  AlertCircle,
  Calendar,
  BarChart2,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface ReportStats {
  // Revenue
  revenueThisMonth: string | null;
  revenueLastMonth: string | null;
  revenueGrowth: string | null;
  annualYield: string | null;
  netProfitMargin: string | null;
  // Occupancy
  totalUnits: number | null;
  occupiedUnits: number | null;
  occupancyRate: string | null;
  wowoOccupancy: string | null;
  wowiOccupancy: string | null;
  // Bookings
  pendingApprovals: number | null;
  activeLeases: number | null;
  expiringThisMonth: number | null;
  // Tenants
  totalTenants: number | null;
  newThisMonth: number | null;
  churnRate: string | null;
}

const TABS = ["Revenue", "Occupancy", "Bookings", "Tenants"];

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon,
  alert,
}: {
  label: string;
  value: string | number | null;
  sub?: string;
  icon: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-xl p-4 border-2 transition-all hover:shadow-md ${
        alert
          ? "border-orange-200 bg-orange-50/30"
          : "border-[#C9A36A]/30 hover:shadow-[#C9A36A]/10"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
          alert ? "bg-orange-100" : "bg-[#C9A36A]/10"
        }`}
      >
        <span className={alert ? "text-orange-500" : "text-[#C9A36A]"}>
          {icon}
        </span>
      </div>
      <p className="text-[10px] font-semibold text-[#2B2B2B]/50 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p
        className={`text-2xl font-bold ${alert ? "text-orange-600" : "text-[#2B2B2B]"}`}
      >
        {value ?? <span className="text-gray-200 text-sm">—</span>}
      </p>
      {sub && <p className="text-[10px] text-[#2B2B2B]/40 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Chart placeholder ──────────────────────────────────────────────────────
function ChartBox({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5 h-full flex flex-col">
      <p className="text-sm font-bold text-[#2B2B2B] mb-0.5">{title}</p>
      {sub && <p className="text-[10px] text-[#2B2B2B]/50 mb-4">{sub}</p>}
      <div className="flex-1 min-h-[176px] flex items-center justify-center border-2 border-dashed border-[#C9A36A]/20 rounded-xl">
        <p className="text-xs text-[#2B2B2B]/30">
          Chart will appear after API integration
        </p>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [tab, setTab] = useState(0);
  const [period, setPeriod] = useState("This Month");

  // All null — backend will fill these
  const stats: ReportStats = {
    revenueThisMonth: null,
    revenueLastMonth: null,
    revenueGrowth: null,
    annualYield: null,
    netProfitMargin: null,
    totalUnits: null,
    occupiedUnits: null,
    occupancyRate: null,
    wowoOccupancy: null,
    wowiOccupancy: null,
    pendingApprovals: null,
    activeLeases: null,
    expiringThisMonth: null,
    totalTenants: null,
    newThisMonth: null,
    churnRate: null,
  };

  // TODO: fetch from API
  // useEffect(() => {
  //   fetch(`/api/admin/reports?tab=${TABS[tab]}&period=${period}`)
  //     .then(r => r.json()).then(setStats);
  // }, [tab, period]);

  const handleExport = (format: string) => {
    // TODO: GET /api/admin/reports/export?format=PDF&tab=...&period=...
    alert(`Exporting ${TABS[tab]} report as ${format}... (connect to API)`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-[#2B2B2B]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Reports
          </h1>
          <p className="text-xs font-medium text-[#2B2B2B]/50 mt-0.5">
            Business performance overview and analytics
          </p>
        </div>
        <div className="flex gap-2">
          {/* Period selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border-2 border-[#C9A36A]/30 rounded-xl px-3 py-2 text-xs font-semibold text-[#2B2B2B] focus:border-[#C9A36A] outline-none"
          >
            {[
              "This Month",
              "Last Month",
              "Last 3 Months",
              "Last 6 Months",
              "This Year",
            ].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <button
            onClick={() => handleExport("Excel")}
            className="flex items-center gap-1.5 border-2 border-[#C9A36A]/40 text-[#C9A36A] text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#C9A36A]/5 transition-colors"
          >
            <Download size={13} /> Export Excel
          </button>
          <button
            onClick={() => handleExport("PDF")}
            className="flex items-center gap-1.5 bg-[#C9A36A] hover:bg-[#A8834A] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
          >
            <Download size={13} /> Export PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              tab === i
                ? "bg-[#C9A36A] text-white shadow-sm"
                : "border-2 border-[#C9A36A]/30 text-[#2B2B2B] hover:border-[#C9A36A]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Period label */}
      <div className="flex items-center gap-2 mb-5">
        <Calendar size={13} className="text-[#C9A36A]" />
        <p className="text-xs font-semibold text-[#2B2B2B]/60">
          Showing data for: <span className="text-[#C9A36A]">{period}</span>
        </p>
      </div>

      {/* ── TAB 0: Revenue ── */}
      {tab === 0 && (
        <div className="space-y-5">
          {/* Top stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Revenue This Month"
              value={stats.revenueThisMonth}
              icon={<TrendingUp size={16} />}
              sub="Current period"
            />
            <StatCard
              label="Revenue Last Month"
              value={stats.revenueLastMonth}
              icon={<TrendingUp size={16} />}
              sub="Previous period"
            />
            <StatCard
              label="Revenue Growth"
              value={stats.revenueGrowth}
              icon={<BarChart2 size={16} />}
              sub="vs last month"
            />
            <StatCard
              label="Annual Yield"
              value={stats.annualYield}
              icon={<TrendingUp size={16} />}
              sub="Full year"
            />
          </div>

          {/* Charts row */}
          <div className="grid md:grid-cols-3 gap-4 items-stretch">
            <div className="md:col-span-2 flex flex-col">
              <ChartBox title="Revenue Trend" sub="Monthly revenue vs target" />
            </div>

            {/* Revenue breakdown card */}
            <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5 flex flex-col gap-4 h-full">
              <p className="text-sm font-bold text-[#2B2B2B]">
                Revenue Breakdown
              </p>

              {/* Net Profit */}
              <div className="bg-[#F5F0E8] rounded-xl p-4">
                <p className="text-[10px] font-semibold text-[#2B2B2B]/50 uppercase tracking-wider mb-1">
                  Net Profit Margin
                </p>
                <p className="text-2xl font-bold text-[#2B2B2B]">
                  {stats.netProfitMargin ?? "—"}
                </p>
                <p className="text-[10px] text-[#2B2B2B]/40 mt-0.5">
                  After operational costs
                </p>
              </div>

              {/* Tower breakdown */}
              <div>
                <p className="text-xs font-semibold text-[#2B2B2B]/60 mb-3">
                  By Tower
                </p>
                <div className="space-y-2.5">
                  {["Wowo Tower", "Wowi Tower"].map((t) => (
                    <div key={t}>
                      <div className="flex justify-between text-[10px] font-semibold text-[#2B2B2B] mb-1">
                        <span>{t}</span>
                        <span className="text-[#2B2B2B]/40">—</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div
                          className="h-full bg-[#C9A36A] rounded-full"
                          style={{ width: "0%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top paying tenant */}
              <div className="border-t border-[#C9A36A]/10 pt-3">
                <p className="text-[10px] font-semibold text-[#2B2B2B]/50 uppercase tracking-wider mb-2">
                  Top Revenue Source
                </p>
                <p className="text-xs font-bold text-[#2B2B2B]">—</p>
                <p className="text-[10px] text-[#2B2B2B]/40">Data from API</p>
              </div>
            </div>
          </div>

          {/* Bottom chart */}
          <ChartBox
            title="Revenue by Tower"
            sub="Wowo Tower vs Wowi Tower comparison"
          />
        </div>
      )}

      {/* ── TAB 1: Occupancy ── */}
      {tab === 1 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Total Units"
              value={stats.totalUnits}
              icon={<Building2 size={16} />}
              sub="All towers"
            />
            <StatCard
              label="Occupied Units"
              value={stats.occupiedUnits}
              icon={<Building2 size={16} />}
            />
            <StatCard
              label="Occupancy Rate"
              value={stats.occupancyRate}
              icon={<BarChart2 size={16} />}
              sub="Overall"
            />
            <StatCard
              label="Available Units"
              value={
                stats.totalUnits && stats.occupiedUnits
                  ? stats.totalUnits - stats.occupiedUnits
                  : null
              }
              icon={<Building2 size={16} />}
            />
          </div>

          {/* Per tower */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5">
              <p className="text-sm font-bold text-[#2B2B2B] mb-4">
                Wowo Tower Occupancy
              </p>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full border-8 border-[#C9A36A] flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-[#2B2B2B]">
                    {stats.wowoOccupancy ?? "—"}
                  </span>
                </div>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C9A36A] rounded-full"
                    style={{ width: stats.wowoOccupancy ?? "0%" }}
                  />
                </div>
              </div>
            </div>
            <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5">
              <p className="text-sm font-bold text-[#2B2B2B] mb-4">
                Wowi Tower Occupancy
              </p>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full border-8 border-[#C9A36A] flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-[#2B2B2B]">
                    {stats.wowiOccupancy ?? "—"}
                  </span>
                </div>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C9A36A] rounded-full"
                    style={{ width: stats.wowiOccupancy ?? "0%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <ChartBox
            title="Occupancy Heatmap"
            sub="Floor-by-floor occupancy across both towers"
          />
        </div>
      )}

      {/* ── TAB 2: Bookings ── */}
      {tab === 2 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard
              label="Pending Approvals"
              value={stats.pendingApprovals}
              icon={<AlertCircle size={16} />}
              sub="Needs action"
              alert={!!stats.pendingApprovals && stats.pendingApprovals > 0}
            />
            <StatCard
              label="Active Leases"
              value={stats.activeLeases}
              icon={<Building2 size={16} />}
            />
            <StatCard
              label="Expiring This Month"
              value={stats.expiringThisMonth}
              icon={<Calendar size={16} />}
              sub="Renewal needed"
              alert={!!stats.expiringThisMonth && stats.expiringThisMonth > 0}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <ChartBox title="Booking Trend" sub="New bookings per month" />
            <ChartBox
              title="Booking Status Breakdown"
              sub="Approved vs Pending vs Cancelled"
            />
          </div>

          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-orange-500" />
              <p className="text-sm font-bold text-orange-700">
                Action Required
              </p>
            </div>
            <p className="text-xs text-orange-600">
              {stats.pendingApprovals
                ? `${stats.pendingApprovals} bookings are waiting for approval.`
                : "Pending approval data will appear after API integration."}{" "}
              {stats.expiringThisMonth
                ? `${stats.expiringThisMonth} leases are expiring this month.`
                : ""}
            </p>
          </div>
        </div>
      )}

      {/* ── TAB 3: Tenants ── */}
      {tab === 3 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard
              label="Total Tenants"
              value={stats.totalTenants}
              icon={<Users size={16} />}
            />
            <StatCard
              label="New This Month"
              value={stats.newThisMonth}
              icon={<Users size={16} />}
              sub="New registrations"
            />
            <StatCard
              label="Churn Rate"
              value={stats.churnRate}
              icon={<TrendingUp size={16} />}
              sub="Tenants who left"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <ChartBox
              title="Tenant Growth"
              sub="Cumulative tenant count over time"
            />
            <ChartBox
              title="Tenant by Tower"
              sub="Distribution across Wowo & Wowi"
            />
          </div>

          <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5">
            <p className="text-sm font-bold text-[#2B2B2B] mb-3">
              Lease Expiry Timeline
            </p>
            <div className="h-24 flex items-center justify-center border-2 border-dashed border-[#C9A36A]/20 rounded-xl">
              <p className="text-xs text-[#2B2B2B]/30">
                Timeline will appear after API integration
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
