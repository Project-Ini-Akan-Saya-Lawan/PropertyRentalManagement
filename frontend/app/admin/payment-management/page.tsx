"use client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState, useEffect } from "react";
import {
  Download,
  Filter,
  TrendingUp,
  CreditCard,
  DollarSign,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface Transaction {
  id: string;
  invoiceId: string;
  tenant: string;
  property: string;
  date: string;
  method: string;
  amount: string;
  amountRaw: number;
  status: "Paid" | "Pending" | "Failed";
  month: number;
  year: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const STATUS_STYLE: Record<string, string> = {
  Paid: "bg-green-50 text-green-700 border border-green-200",
  Pending: "bg-orange-50 text-orange-700 border border-orange-200",
  Failed: "bg-red-50 text-red-700 border border-red-200",
};

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
const PER_PAGE = 5;

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3
            className="font-bold text-[#2B2B2B]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">{children}</div>
      </div>
    </div>
  );
}

// Simple bar chart
function BarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((val, i) => (
        <div
          key={i}
          className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
        >
          <div
            className="w-full rounded-t-sm transition-all duration-500"
            style={{
              height: `${(val / max) * 85}%`,
              backgroundColor: i === data.length - 1 ? "#C9A36A" : "#E8D5B0",
              minHeight: val > 0 ? "3px" : "0",
            }}
          />
          <span className="text-[9px] font-semibold text-[#2B2B2B]/50">
            {labels[i]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function PaymentManagementPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [chartTab, setChartTab] = useState("Last 6 Months");
  const [modal, setModal] = useState<"export" | "filter" | null>(null);
  const [exportFormat, setExportFormat] = useState("PDF");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/payments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          const mapped: Transaction[] = result.data.map(
            (p: {
              payment_id: number;
              booking_id: number;
              amount: number;
              payment_method: string;
              status: string;
              order_id: string;
              bank: string;
              created_at: string;
              username: string;
              email: string;
              pack_id: number;
              floor_booked: number;
            }) => {
              const d = new Date(p.created_at);
              return {
                id: String(p.payment_id),
                invoiceId: p.order_id || `PAY-${p.payment_id}`,
                tenant: p.username || p.email || "Unknown",
                property: `Pack ${p.pack_id} - Floor ${p.floor_booked}`,
                date: d.toLocaleDateString("id-ID"),
                method: p.bank ? p.bank.toUpperCase() : p.payment_method,
                amount: `Rp ${Number(p.amount).toLocaleString("id-ID")}`,
                amountRaw: Number(p.amount),
                status:
                  p.status === "paid"
                    ? "Paid"
                    : p.status === "pending"
                      ? "Pending"
                      : ("Failed" as Transaction["status"]),
                month: d.getMonth(),
                year: d.getFullYear(),
              };
            },
          );
          setTransactions(mapped);
        }
      })
      .catch((err) => console.error("Failed to fetch payments:", err));
  }, []);

  // Build chart data
  const now = new Date();
  const chartMonths = chartTab === "Last 6 Months" ? 6 : 12;
  const chartLabels: string[] = [];
  const chartData: number[] = [];

  for (let i = chartMonths - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    chartLabels.push(MONTHS[d.getMonth()]);
    chartData.push(
      transactions
        .filter(
          (t) =>
            t.status === "Paid" &&
            t.month === d.getMonth() &&
            t.year === d.getFullYear(),
        )
        .reduce((sum, t) => sum + t.amountRaw, 0) / 1_000_000, // in millions
    );
  }

  // Stats
  const paidTotal = transactions
    .filter((t) => t.status === "Paid")
    .reduce((s, t) => s + t.amountRaw, 0);
  const thisMonth = transactions
    .filter(
      (t) =>
        t.status === "Paid" &&
        t.month === now.getMonth() &&
        t.year === now.getFullYear(),
    )
    .reduce((s, t) => s + t.amountRaw, 0);
  const totalTx = transactions.length;

  // Payment method breakdown
  const methodCount: Record<string, number> = {};
  transactions.forEach((t) => {
    methodCount[t.method] = (methodCount[t.method] || 0) + 1;
  });

  const filtered = transactions.filter(
    (t) => filter === "All" || t.status === filter,
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);

    if (exportFormat === "CSV" || exportFormat === "Excel") {
      const headers = [
        "Invoice #",
        "Tenant",
        "Property",
        "Date",
        "Method",
        "Amount",
        "Status",
      ];
      const rows = transactions.map((t) => [
        t.invoiceId,
        t.tenant,
        t.property,
        t.date,
        t.method,
        t.amount,
        t.status,
      ]);
      const csv = [
        headers.join(","),
        ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Transactions_${date}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === "PDF") {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(201, 163, 106);
      doc.text("Rupiah Building", 14, 18);
      doc.setFontSize(12);
      doc.setTextColor(43, 43, 43);
      doc.text("Revenue Management Report", 14, 28);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated: ${date}`, 14, 36);

      // Summary
      doc.setFontSize(10);
      doc.setTextColor(43, 43, 43);
      doc.text(
        `Monthly Revenue: ${thisMonth > 0 ? "Rp " + (thisMonth / 1_000_000).toFixed(0) + "M" : "—"}`,
        14,
        46,
      );
      doc.text(
        `Total Revenue: ${paidTotal > 0 ? "Rp " + (paidTotal / 1_000_000).toFixed(0) + "M" : "—"}`,
        14,
        54,
      );
      doc.text(`Total Transactions: ${transactions.length}`, 14, 62);

      autoTable(doc, {
        head: [
          [
            "Invoice #",
            "Tenant",
            "Property",
            "Date",
            "Method",
            "Amount",
            "Status",
          ],
        ],
        body: transactions.map((t) => [
          t.invoiceId,
          t.tenant,
          t.property,
          t.date,
          t.method,
          t.amount,
          t.status,
        ]),
        startY: 70,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: {
          fillColor: [201, 163, 106],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [245, 240, 232] },
        margin: { left: 14, right: 14 },
      });
      doc.save(`Transactions_${date}.pdf`);
    } else if (exportFormat === "JSON") {
      const json = JSON.stringify(transactions, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Transactions_${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setModal(null);
  };

  const stats = [
    {
      label: "Monthly Revenue",
      value: thisMonth > 0 ? `Rp ${(thisMonth / 1_000_000).toFixed(0)}M` : "—",
      icon: TrendingUp,
    },
    {
      label: "Total Revenue",
      value: paidTotal > 0 ? `Rp ${(paidTotal / 1_000_000).toFixed(0)}M` : "—",
      icon: DollarSign,
    },
    { label: "Total Transactions", value: totalTx || "—", icon: BarChart2 },
    {
      label: "Paid Transactions",
      value: transactions.filter((t) => t.status === "Paid").length || "—",
      icon: CreditCard,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-[#2B2B2B]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Revenue Management
          </h1>
          <p className="text-xs font-medium text-[#2B2B2B]/50 mt-0.5">
            Detailed financial overview and transaction ledger
          </p>
        </div>
        <button
          onClick={() => setModal("export")}
          className="flex items-center gap-1.5 border-2 border-[#C9A36A]/40 text-[#C9A36A] text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#C9A36A]/5 transition-colors"
        >
          <Download size={13} /> Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white border-2 border-[#C9A36A]/30 rounded-xl p-4 hover:shadow-md hover:shadow-[#C9A36A]/10 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-[#C9A36A]/10 flex items-center justify-center mb-2">
                <Icon size={15} className="text-[#C9A36A]" />
              </div>
              <p className="text-[10px] font-semibold text-[#2B2B2B]/50 uppercase tracking-wider mb-0.5">
                {s.label}
              </p>
              <p className="text-xl font-bold text-[#2B2B2B]">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Chart + Payment Methods */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Revenue Chart */}
        <div className="md:col-span-2 bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-[#2B2B2B]">
                Revenue Performance
              </p>
              <p className="text-[10px] text-[#2B2B2B]/50">
                Monthly revenue in millions (Rp)
              </p>
            </div>
            <div className="flex gap-1 border-2 border-[#C9A36A]/30 rounded-lg p-0.5">
              {["Last 6 Months", "Last Year"].map((t) => (
                <button
                  key={t}
                  onClick={() => setChartTab(t)}
                  className={`text-[10px] px-2.5 py-1 rounded-md font-bold transition-colors ${chartTab === t ? "bg-[#C9A36A] text-white" : "text-[#2B2B2B]/50 hover:text-[#2B2B2B]"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {transactions.length > 0 ? (
            <BarChart data={chartData} labels={chartLabels} />
          ) : (
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-[#C9A36A]/20 rounded-xl">
              <p className="text-xs text-[#2B2B2B]/30">No payment data yet</p>
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-[#C9A36A]/10 flex gap-4">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#2B2B2B]/60">
              <span className="w-3 h-2 rounded-sm bg-[#C9A36A] inline-block" />{" "}
              Current Month
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#2B2B2B]/60">
              <span className="w-3 h-2 rounded-sm bg-[#E8D5B0] inline-block" />{" "}
              Previous Months
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5">
          <p className="text-sm font-bold text-[#2B2B2B] mb-4">
            Payment Methods
          </p>
          {Object.keys(methodCount).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(methodCount).map(([method, count]) => {
                const total = transactions.length;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={method}>
                    <div className="flex justify-between text-xs font-semibold text-[#2B2B2B] mb-1">
                      <span>{method}</span>
                      <span className="text-[#C9A36A]">{pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#C9A36A] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[#2B2B2B]/40 mt-0.5">
                      {count} transactions
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center border-2 border-dashed border-[#C9A36A]/20 rounded-xl">
              <p className="text-xs text-[#2B2B2B]/30">No payment data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#C9A36A]/10">
          <p className="text-sm font-bold text-[#2B2B2B]">
            Recent Transactions
          </p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 flex-wrap">
              {["All", "Paid", "Pending", "Failed"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors ${filter === f ? "bg-[#C9A36A] text-white" : "text-[#2B2B2B]/50 hover:bg-[#C9A36A]/10"}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={() => setModal("filter")}
              className="p-1.5 border-2 border-[#C9A36A]/30 rounded-lg hover:border-[#C9A36A] hover:bg-[#C9A36A]/5 transition-colors"
            >
              <Filter size={12} className="text-[#C9A36A]" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-[#F5F0E8]">
              <tr>
                {[
                  "Invoice #",
                  "Tenant",
                  "Property",
                  "Date",
                  "Method",
                  "Amount",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[9px] font-bold text-[#2B2B2B]/50 uppercase tracking-wider px-4 py-2.5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-sm text-[#2B2B2B]/30"
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                paginated.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-[#C9A36A]/10 hover:bg-[#F5F0E8]/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold text-[#C9A36A]">
                        {t.invoiceId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-[#2B2B2B]">
                        {t.tenant}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-[#2B2B2B]/70 max-w-[120px] truncate">
                        {t.property}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#2B2B2B]/60">
                      {t.date}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold bg-[#F5F0E8] text-[#C9A36A] px-2 py-1 rounded-lg">
                        {t.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-[#2B2B2B]">
                        {t.amount}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_STYLE[t.status]}`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#C9A36A]/10 bg-[#F5F0E8]/20">
          <p className="text-[11px] text-[#2B2B2B]/50">
            Showing{" "}
            {filtered.length === 0
              ? 0
              : Math.min((page - 1) * PER_PAGE + 1, filtered.length)}
            –{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}{" "}
            transactions
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 border-2 border-[#C9A36A]/30 rounded-lg text-[10px] font-bold text-[#C9A36A] hover:border-[#C9A36A] disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={12} /> Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-7 h-7 text-[11px] font-bold rounded-lg transition-colors ${page === i + 1 ? "bg-[#C9A36A] text-white" : "border-2 border-[#C9A36A]/30 text-[#2B2B2B] hover:border-[#C9A36A]"}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 border-2 border-[#C9A36A]/30 rounded-lg text-[10px] font-bold text-[#C9A36A] hover:border-[#C9A36A] disabled:opacity-30 transition-colors"
            >
              Next <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {modal === "export" && (
        <Modal title="Export Report" onClose={() => setModal(null)}>
          <p className="text-xs text-[#2B2B2B]/60 mb-4">
            Choose export format for the transaction report.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {["PDF", "Excel", "CSV", "JSON"].map((f) => (
              <button
                key={f}
                onClick={() => setExportFormat(f)}
                className={`py-3 text-sm font-bold rounded-xl border-2 transition-all ${exportFormat === f ? "bg-[#C9A36A] text-white border-[#C9A36A]" : "border-[#C9A36A]/30 text-[#2B2B2B] hover:border-[#C9A36A]"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setModal(null)}
              className="flex-1 border-2 border-gray-200 text-[#2B2B2B] text-xs font-semibold py-2.5 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="flex-1 bg-[#C9A36A] hover:bg-[#A8834A] text-white text-xs font-bold py-2.5 rounded-lg transition-colors"
            >
              <Download size={13} className="inline mr-1" /> Export{" "}
              {exportFormat}
            </button>
          </div>
        </Modal>
      )}

      {/* Filter Modal */}
      {modal === "filter" && (
        <Modal title="Filter Transactions" onClose={() => setModal(null)}>
          <div className="space-y-4 mb-5">
            <div>
              <label className="text-xs font-semibold text-[#2B2B2B] block mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {["All", "Paid", "Pending", "Failed"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-colors ${filter === f ? "bg-[#C9A36A] text-white border-[#C9A36A]" : "border-[#C9A36A]/30 text-[#2B2B2B] hover:border-[#C9A36A]"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setFilter("All");
                setModal(null);
              }}
              className="flex-1 border-2 border-gray-200 text-[#2B2B2B] text-xs font-semibold py-2.5 rounded-lg hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={() => setModal(null)}
              className="flex-1 bg-[#C9A36A] hover:bg-[#A8834A] text-white text-xs font-bold py-2.5 rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
