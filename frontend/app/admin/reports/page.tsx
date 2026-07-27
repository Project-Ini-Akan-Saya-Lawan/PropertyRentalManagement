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

interface Booking {
  status: string;
  end_date: string;
  pack_id: number;
  booking_date: string;
}

const TABS = ["Revenue", "Occupancy", "Bookings", "Tenants"];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

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

// Bar chart dengan SVG
function BarChart({
  data,
  labels,
  color = "#C9A36A",
  height = 160,
}: {
  data: number[];
  labels: string[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data, 1);
  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end gap-1 h-full pb-5 relative">
        {data.map((val, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
          >
            <span className="text-[9px] font-bold text-[#2B2B2B]/60">
              {val > 0 ? val : ""}
            </span>
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: `${(val / max) * 80}%`,
                backgroundColor: i === data.length - 1 ? color : `${color}80`,
                minHeight: val > 0 ? "4px" : "0",
              }}
            />
            <span className="text-[9px] font-semibold text-[#2B2B2B]/50 truncate w-full text-center">
              {labels[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pie/Donut chart
function DonutChart({
  segments,
  labels,
}: {
  segments: { value: number; color: string }[];
  labels: string[];
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let cumulative = 0;
  const paths = segments.map((seg) => {
    const pct = seg.value / total;
    const start = cumulative;
    cumulative += pct;
    const startAngle = start * 2 * Math.PI - Math.PI / 2;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const x1 = 18 + 12 * Math.cos(startAngle);
    const y1 = 18 + 12 * Math.sin(startAngle);
    const x2 = 18 + 12 * Math.cos(endAngle);
    const y2 = 18 + 12 * Math.sin(endAngle);
    const largeArc = pct > 0.5 ? 1 : 0;
    return {
      d: `M 18 18 L ${x1} ${y1} A 12 12 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: seg.color,
      value: seg.value,
    };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 36 36" className="w-28 h-28 flex-shrink-0">
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} />
        ))}
        <circle cx="18" cy="18" r="6" fill="white" />
      </svg>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-[#2B2B2B]/70">{labels[i]}</span>
            <span className="text-xs font-bold text-[#2B2B2B] ml-auto">
              {seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [tab, setTab] = useState(0);
  const [period, setPeriod] = useState("This Month");
  const [bookings, setBookings] = useState<Booking[]>([]);
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

    fetch(`${API_URL}/api/users`, { headers })
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          const tenants = result.data.filter(
            (u: { role_id: number }) => u.role_id === 2,
          );
          const newThis = tenants.filter((u: { created_at?: string }) => {
            if (!u.created_at) return false;
            const d = new Date(u.created_at);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
          }).length;
          setStats((prev) => ({
            ...prev,
            totalTenants: tenants.length,
            newThisMonth: newThis,
          }));
        }
      })
      .catch(console.error);

    fetch(`${API_URL}/api/bookings/all`, { headers })
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          const bks = result.data as Booking[];
          setBookings(bks);
          const pending = bks.filter((b) => b.status === "pending").length;
          const active = bks.filter((b) => b.status === "confirmed").length;
          const expiring = bks.filter((b) => {
            const end = new Date(b.end_date);
            return (
              end.getMonth() === thisMonth &&
              end.getFullYear() === thisYear &&
              b.status === "confirmed"
            );
          }).length;
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

    fetch(`${API_URL}/api/floor-packs`)
      .then((r) => r.json())
      .then((result) => {
        if (result.data)
          setStats((prev) => ({ ...prev, totalUnits: result.data.length }));
      })
      .catch(console.error);
  }, [period]);

  useEffect(() => {
    if (stats.totalUnits && stats.occupiedUnits !== null) {
      const rate = Math.round((stats.occupiedUnits / stats.totalUnits) * 100);
      setStats((prev) => ({ ...prev, occupancyRate: `${rate}%` }));
    }
  }, [stats.totalUnits, stats.occupiedUnits]);

  // Build monthly booking chart data (last 6 months)
  const bookingByMonth = Array(6).fill(0);
  const monthLabels: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(MONTHS[d.getMonth()]);
    bookingByMonth[5 - i] = bookings.filter((b) => {
      const bd = new Date(b.booking_date);
      return (
        bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear()
      );
    }).length;
  }

  // Booking status breakdown
  const pending = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  const completed = bookings.filter((b) => b.status === "completed").length;

  // Wowo vs Wowi bookings
  const wowoPacks = [1, 2, 3];
  const wowiPacks = [4, 5, 6];
  const wowoBooked = bookings.filter(
    (b) => wowoPacks.includes(b.pack_id) && b.status === "confirmed",
  ).length;
  const wowiBooked = bookings.filter(
    (b) => wowiPacks.includes(b.pack_id) && b.status === "confirmed",
  ).length;
  const wowoRate = stats.totalUnits ? Math.round((wowoBooked / 3) * 100) : 0;
  const wowiRate = stats.totalUnits ? Math.round((wowiBooked / 3) * 100) : 0;

  const handleExport = (format: string) => {
    alert(`Exporting ${TABS[tab]} report as ${format}... (connect to API)`);
  };

  return (
    <div>
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
              sub="Waiting for payment data"
            />
            <StatCard
              label="Revenue Last Month"
              value={stats.revenueLastMonth}
              icon={<TrendingUp size={16} />}
              sub="Waiting for payment data"
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
          <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5">
            <p className="text-sm font-bold text-[#2B2B2B] mb-1">
              Revenue Trend
            </p>
            <p className="text-[10px] text-[#2B2B2B]/50 mb-4">
              Monthly booking count (revenue data available after payment
              integration)
            </p>
            <BarChart data={bookingByMonth} labels={monthLabels} />
          </div>
          <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5">
            <p className="text-sm font-bold text-[#2B2B2B] mb-4">
              Revenue by Tower
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { name: "Wowo Tower", booked: wowoBooked, rate: wowoRate },
                { name: "Wowi Tower", booked: wowiBooked, rate: wowiRate },
              ].map((t) => (
                <div key={t.name}>
                  <div className="flex justify-between text-xs font-semibold text-[#2B2B2B] mb-1.5">
                    <span>{t.name}</span>
                    <span className="text-[#C9A36A]">{t.rate}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C9A36A] rounded-full transition-all duration-500"
                      style={{ width: `${t.rate}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#2B2B2B]/40 mt-1">
                    {t.booked} confirmed bookings
                  </p>
                </div>
              ))}
            </div>
          </div>
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
            {[
              { name: "Wowo Tower", booked: wowoBooked, rate: wowoRate },
              { name: "Wowi Tower", booked: wowiBooked, rate: wowiRate },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5"
              >
                <p className="text-sm font-bold text-[#2B2B2B] mb-4">
                  {t.name} Occupancy
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full border-8 border-[#C9A36A] flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-[#2B2B2B]">
                      {t.rate}%
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-[#C9A36A] rounded-full"
                        style={{ width: `${t.rate}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[#2B2B2B]/50">
                      {t.booked} of 3 packs occupied
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5">
            <p className="text-sm font-bold text-[#2B2B2B] mb-4">
              Occupancy by Pack Type
            </p>
            <BarChart
              data={[1, 2, 3, 4, 5, 6].map(
                (id) =>
                  bookings.filter(
                    (b) => b.pack_id === id && b.status === "confirmed",
                  ).length,
              )}
              labels={[
                "Wowo\nStarter",
                "Wowo\nBusiness",
                "Wowo\nExec",
                "Wowi\nStarter",
                "Wowi\nBusiness",
                "Wowi\nExec",
              ]}
              height={180}
            />
          </div>
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
            <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5">
              <p className="text-sm font-bold text-[#2B2B2B] mb-1">
                Booking Trend
              </p>
              <p className="text-[10px] text-[#2B2B2B]/50 mb-4">
                New bookings per month (last 6 months)
              </p>
              <BarChart data={bookingByMonth} labels={monthLabels} />
            </div>
            <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5">
              <p className="text-sm font-bold text-[#2B2B2B] mb-4">
                Booking Status Breakdown
              </p>
              {bookings.length > 0 ? (
                <DonutChart
                  segments={[
                    { value: confirmed, color: "#22c55e" },
                    { value: pending, color: "#f97316" },
                    { value: cancelled, color: "#ef4444" },
                    { value: completed, color: "#3b82f6" },
                  ]}
                  labels={["Confirmed", "Pending", "Cancelled", "Completed"]}
                />
              ) : (
                <div className="flex items-center justify-center h-32 text-xs text-[#2B2B2B]/30">
                  No booking data
                </div>
              )}
            </div>
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
            <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5">
              <p className="text-sm font-bold text-[#2B2B2B] mb-1">
                Tenant by Tower
              </p>
              <p className="text-[10px] text-[#2B2B2B]/50 mb-4">
                Distribution of confirmed bookings per tower
              </p>
              {bookings.length > 0 ? (
                <DonutChart
                  segments={[
                    { value: wowoBooked, color: "#C9A36A" },
                    { value: wowiBooked, color: "#A8834A" },
                  ]}
                  labels={["Wowo Tower", "Wowi Tower"]}
                />
              ) : (
                <div className="flex items-center justify-center h-32 text-xs text-[#2B2B2B]/30">
                  No booking data
                </div>
              )}
            </div>
            <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5">
              <p className="text-sm font-bold text-[#2B2B2B] mb-1">
                Monthly Bookings
              </p>
              <p className="text-[10px] text-[#2B2B2B]/50 mb-4">
                Bookings created per month
              </p>
              <BarChart
                data={bookingByMonth}
                labels={monthLabels}
                color="#A8834A"
              />
            </div>
          </div>
          <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5">
            <p className="text-sm font-bold text-[#2B2B2B] mb-3">
              Lease Expiry Timeline
            </p>
            {bookings.filter((b) => b.status === "confirmed").length > 0 ? (
              <div className="space-y-2">
                {bookings
                  .filter((b) => b.status === "confirmed")
                  .map((b, i) => {
                    const end = new Date(b.end_date);
                    const diff = Math.ceil(
                      (end.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                    );
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-24 text-[10px] text-[#2B2B2B]/50 flex-shrink-0">
                          Pack #{b.pack_id}
                        </div>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.max(0, Math.min(100, (diff / 365) * 100))}%`,
                              backgroundColor:
                                diff < 30
                                  ? "#ef4444"
                                  : diff < 90
                                    ? "#f97316"
                                    : "#C9A36A",
                            }}
                          />
                        </div>
                        <span
                          className={`text-[10px] font-bold w-20 text-right flex-shrink-0 ${diff < 30 ? "text-red-500" : diff < 90 ? "text-orange-500" : "text-[#C9A36A]"}`}
                        >
                          {diff > 0 ? `${diff}d left` : "Expired"}
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="h-16 flex items-center justify-center text-xs text-[#2B2B2B]/30">
                No active leases
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
