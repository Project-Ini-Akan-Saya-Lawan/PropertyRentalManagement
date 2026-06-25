"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface ReportStats {
  annualYield:      string | null;
  averageRevenue:   string | null;
  totalOccupancy:   string | null;
  netProfitMargin:  string | null;
}

const TABS = ["Revenue", "Occupancy"];

export default function ReportsPage() {
  const [tab, setTab]   = useState(0);
  const [stats, setStats] = useState<ReportStats>({
    annualYield: null, averageRevenue: null,
    totalOccupancy: null, netProfitMargin: null,
  });

  useEffect(() => {
    // TODO: fetch from API
    // const res = await fetch(`/api/admin/reports?type=${tab === 0 ? "revenue" : "occupancy"}`).then(r => r.json());
    // setStats(res.stats);
  }, [tab]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-3xl font-bold text-[#C9A36A]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Reports
        </h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 border border-[#C9A36A] text-[#C9A36A] text-xs font-semibold px-4 py-1.5 rounded-md hover:bg-[#C9A36A]/5 transition-colors">
            <Download size={12} /> Export Excel
          </button>
          <button className="flex items-center gap-1.5 border border-[#C9A36A] text-[#C9A36A] text-xs font-semibold px-4 py-1.5 rounded-md hover:bg-[#C9A36A]/5 transition-colors">
            <Download size={12} /> Export PDF
          </button>
        </div>
      </div>

      {/* Tabs + Period */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex gap-1">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                tab === i
                  ? "bg-[#C9A36A] text-white"
                  : "border border-gray-200 text-gray-500 hover:border-[#C9A36A]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 ml-2">Fiscal year 2025 (1 Jan - 31 Dec)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Annual Yield",      value: stats.annualYield,     sub: "" },
          { label: "Average Revenue",   value: stats.averageRevenue,  sub: "Based on 112 Active Units" },
          { label: "Total Occupancy",   value: stats.totalOccupancy,  sub: "Retention rate 88%" },
          { label: "Net Profit Margin", value: stats.netProfitMargin, sub: "Benchmark 53%" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-xl font-bold text-[#2B2B2B]">
              {s.value ?? <span className="text-gray-200 text-sm">—</span>}
            </p>
            {s.sub && <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#2B2B2B] mb-3">Occupancy Heatmap</p>
          <div className="h-48 flex items-center justify-center border border-dashed border-gray-100 rounded-lg text-gray-200 text-xs">
            Heatmap chart will appear here
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#2B2B2B] mb-3">Tenant Growth</p>
          <div className="h-48 flex items-center justify-center border border-dashed border-gray-100 rounded-lg text-gray-200 text-xs">
            Growth chart will appear here
          </div>
        </div>
      </div>
    </div>
  );
}
