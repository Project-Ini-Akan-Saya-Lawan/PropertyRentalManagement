"use client";
import { useState, useEffect } from "react";
import {
  Download,
  Building2,
  Users,
  TrendingUp,
  AlertCircle,
  Calendar,
  BarChart2,
} from "lucide-react";

interface ReportStats {
  revenueThisMonth: string | null;
  revenueLastMonth: string | null;
  revenueGrowth: string | null;
  annualYield: string | null;
  netProfitMargin: string | null;
  totalUnits: number | null;
  occupiedUnits: number | null;
  occupancyRate: string | null;
  wowoOccupancy: string | null;
  wowiOccupancy: string | null;
  pendingApprovals: number | null;
  activeLeases: number | null;
  expiringThisMonth: number | null;
  totalTenants: number | null;
  newThisMonth: number | null;
  churnRate: string | null;
}

const TABS = ["Revenue", "Occupancy", "Bookings", "Tenants"];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

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
        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${alert ? "bg-orange-100" : "bg-[#C9A36A]/10"}`}
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

export default function ReportsPage() {
  const [tab, setTab] = useState(0);
  const [period, setPeriod] = useState("This Month");
  const [stats, setStats] = useState<ReportStats>({
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
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {};
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // Fetch users → total tenants + new this month
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

    // Fetch all bookings → pending, active, expiring
    fetch(`${API_URL}/api/bookings/all`, { headers })
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          const bookings = result.data;
          const pending = bookings.filter(
            (b: { status: string }) => b.status === "pending",
          ).length;
          const active = bookings.filter(
            (b: { status: string }) => b.status === "confirmed",
          ).length;
          const expiring = bookings.filter(
            (b: { end_date: string; status: string }) => {
              const end = new Date(b.end_date);
              return (
                end.getMonth() === thisMonth &&
                end.getFullYear() === thisYear &&
                b.status === "confirmed"
              );
            },
          ).length;

          setStats((prev) => ({
            ...prev,
            pendingApprovals: pending,
            activeLeases: active,
            expiringThisMonth: expiring,
            occupiedUnits: active,
          }));
        }
      })
      .catch(console.error);

    // Fetch floor packs → total units
    fetch(`${API_URL}/api/floor-packs`)
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          setStats((prev) => ({ ...prev, totalUnits: result.data.length }));
        }
      })
      .catch(console.error);
  }, [period]);

  // Calculate occupancy rate
  useEffect(() => {
    if (stats.totalUnits && stats.occupiedUnits !== null) {
      const rate = Math.round((stats.occupiedUnits / stats.totalUnits) * 100);
      setStats((prev) => ({ ...prev, occupancyRate: `${rate}%` }));
    }
  }, [stats.totalUnits, stats.occupiedUnits]);

  const handleExport = (format: string) => {
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

      {/* TAB 0: Revenue */}
      {tab === 0 && (
        <div className="space-y-5">
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
          <div className="grid md:grid-cols-3 gap-4 items-stretch">
            <div className="md:col-span-2 flex flex-col">
              <ChartBox title="Revenue Trend" sub="Monthly revenue vs target" />
            </div>
            <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5 flex flex-col gap-4 h-full">
              <p className="text-sm font-bold text-[#2B2B2B]">
                Revenue Breakdown
              </p>
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
              <div className="border-t border-[#C9A36A]/10 pt-3">
                <p className="text-[10px] font-semibold text-[#2B2B2B]/50 uppercase tracking-wider mb-2">
                  Top Revenue Source
                </p>
                <p className="text-xs font-bold text-[#2B2B2B]">—</p>
                <p className="text-[10px] text-[#2B2B2B]/40">Data from API</p>
              </div>
            </div>
          </div>
          <ChartBox
            title="Revenue by Tower"
            sub="Wowo Tower vs Wowi Tower comparison"
          />
        </div>
      )}

      {/* TAB 1: Occupancy */}
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
                stats.totalUnits && stats.occupiedUnits !== null
                  ? stats.totalUnits - stats.occupiedUnits
                  : null
              }
              icon={<Building2 size={16} />}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {["Wowo Tower", "Wowi Tower"].map((t) => (
              <div
                key={t}
                className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5"
              >
                <p className="text-sm font-bold text-[#2B2B2B] mb-4">
                  {t} Occupancy
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full border-8 border-[#C9A36A] flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-[#2B2B2B]">
                      {stats.occupancyRate ?? "—"}
                    </span>
                  </div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C9A36A] rounded-full"
                      style={{ width: stats.occupancyRate ?? "0%" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ChartBox
            title="Occupancy Heatmap"
            sub="Floor-by-floor occupancy across both towers"
          />
        </div>
      )}

      {/* TAB 2: Bookings */}
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
                : "No pending approvals."}{" "}
              {stats.expiringThisMonth
                ? `${stats.expiringThisMonth} leases are expiring this month.`
                : ""}
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: Tenants */}
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
