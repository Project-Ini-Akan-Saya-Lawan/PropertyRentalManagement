"use client";

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
  AlertCircle,
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
  status: "Paid" | "Pending" | "Refunded" | "Failed";
}

const STORAGE_KEY = "admin_transactions";

const STATUS_STYLE: Record<string, string> = {
  Paid: "bg-green-50 text-green-700 border border-green-200",
  Pending: "bg-orange-50 text-orange-700 border border-orange-200",
  Refunded: "bg-gray-100 text-gray-600 border border-gray-200",
  Failed: "bg-red-50 text-red-700 border border-red-200",
};

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

export default function PaymentManagementPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [chartTab, setChartTab] = useState("Last 6 Months");
  const [modal, setModal] = useState<"export" | "refund" | "filter" | null>(
    null,
  );
  const [refundForm, setRefundForm] = useState({
    invoiceId: "",
    reason: "",
    amount: "",
    tenantName: "",
    tenantEmail: "",
    tenantPhone: "",
    bookingId: "",
    property: "",
    refundMethod: "",
  });
  const [exportFormat, setExportFormat] = useState("PDF");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setTransactions(stored ? JSON.parse(stored) : []);
  }, []);

  const filtered = transactions.filter(
    (t) => filter === "All" || t.status === filter,
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleExport = () => {
    // TODO: GET /api/admin/payments/export?format=PDF|Excel
    alert(`Exporting as ${exportFormat}... (connect to API)`);
    setModal(null);
  };

  const handleRefund = () => {
    // TODO: POST /api/admin/payments/refund
    alert(
      `Refund submitted for invoice ${refundForm.invoiceId} (connect to API)`,
    );
    setRefundForm({
      invoiceId: "",
      reason: "",
      amount: "",
      tenantName: "",
      tenantEmail: "",
      tenantPhone: "",
      bookingId: "",
      property: "",
      refundMethod: "",
    });
    setModal(null);
  };

  const stats = [
    { label: "Daily Revenue", value: null, icon: TrendingUp },
    { label: "Monthly Revenue", value: null, icon: DollarSign },
    { label: "Total Transactions", value: null, icon: BarChart2 },
    { label: "Annual Revenue", value: null, icon: CreditCard },
  ];

  const inputCls =
    "w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none transition-all";

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
        <div className="flex gap-2">
          <button
            onClick={() => setModal("export")}
            className="flex items-center gap-1.5 border-2 border-[#C9A36A]/40 text-[#C9A36A] text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#C9A36A]/5 transition-colors"
          >
            <Download size={13} /> Export PDF
          </button>
          <button
            onClick={() => setModal("refund")}
            className="flex items-center gap-1.5 bg-[#C9A36A] hover:bg-[#A8834A] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
          >
            + Refund
          </button>
        </div>
      </div>

      {/* Stats - semua putih */}
      <div className="grid grid-cols-4 gap-3 mb-6">
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
              <p className="text-xl font-bold text-[#2B2B2B]">
                {s.value ?? "—"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Chart + Payment Methods */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Revenue Chart */}
        <div className="md:col-span-2 bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-sm font-bold text-[#2B2B2B]">
                Revenue Performance
              </p>
              <p className="text-[10px] text-[#2B2B2B]/50">
                Gold & Silver trend analysis
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
          <div className="h-40 flex items-center justify-center border-2 border-dashed border-[#C9A36A]/20 rounded-xl mt-4">
            <p className="text-xs text-[#2B2B2B]/30">
              {chartTab === "Last 6 Months"
                ? "Last 6 months chart will appear here"
                : "Last year chart will appear here"}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-[#C9A36A]/10 flex gap-4">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#2B2B2B]/60">
              <span className="w-3 h-2 rounded-sm bg-[#C9A36A] inline-block" />{" "}
              Revenue
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#2B2B2B]/60">
              <span className="w-3 h-2 rounded-sm bg-[#E8D5B0] inline-block" />{" "}
              Projected
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-5">
          <p className="text-sm font-bold text-[#2B2B2B] mb-4">
            Payment Methods
          </p>
          <div className="py-8 text-center border-2 border-dashed border-[#C9A36A]/20 rounded-xl mb-4">
            <p className="text-xs text-[#2B2B2B]/30">
              Payment method data will appear here
            </p>
          </div>
          <div className="bg-[#F5F0E8] rounded-xl p-3">
            <p className="text-[10px] font-bold text-[#C9A36A] uppercase tracking-wider mb-1">
              Efficiency Note
            </p>
            <p className="text-[10px] text-[#2B2B2B]/70 leading-relaxed">
              Transaction data will be analyzed after API integration.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#C9A36A]/10">
          <p className="text-sm font-bold text-[#2B2B2B]">
            Recent Transactions
          </p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {["All", "Paid", "Pending", "Refunded", "Failed"].map((f) => (
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

        <table className="w-full">
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
                    <p
                      className={`text-xs font-bold ${t.status === "Refunded" ? "line-through text-[#2B2B2B]/40" : "text-[#2B2B2B]"}`}
                    >
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

        {/* Pagination */}
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
              <ChevronLeft size={12} /> Previous
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

      {/* ── Export Modal ── */}
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

      {/* ── Refund Modal ── */}
      {modal === "refund" && (
        <Modal title="Process Refund" onClose={() => setModal(null)}>
          <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl p-3 mb-5">
            <AlertCircle
              size={15}
              className="text-orange-500 flex-shrink-0 mt-0.5"
            />
            <p className="text-[11px] text-orange-700">
              Refunds are irreversible. Tenant will receive an email
              notification after submission.
            </p>
          </div>

          {/* Tenant Identity */}
          <p className="text-[10px] font-bold text-[#C9A36A] uppercase tracking-wider mb-3">
            Tenant Information
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                Full Name *
              </label>
              <input
                value={refundForm.tenantName || ""}
                onChange={(e) =>
                  setRefundForm({ ...refundForm, tenantName: e.target.value })
                }
                placeholder="Tenant full name"
                className="w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                Email *
              </label>
              <input
                value={refundForm.tenantEmail || ""}
                onChange={(e) =>
                  setRefundForm({ ...refundForm, tenantEmail: e.target.value })
                }
                placeholder="tenant@email.com"
                type="email"
                className="w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                Phone Number
              </label>
              <input
                value={refundForm.tenantPhone || ""}
                onChange={(e) =>
                  setRefundForm({ ...refundForm, tenantPhone: e.target.value })
                }
                placeholder="08xxxxxxxxxx"
                className="w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                Booking ID *
              </label>
              <input
                value={refundForm.bookingId || ""}
                onChange={(e) =>
                  setRefundForm({ ...refundForm, bookingId: e.target.value })
                }
                placeholder="e.g. BK-2206-001"
                className="w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none"
              />
            </div>
          </div>

          {/* Refund Details */}
          <p className="text-[10px] font-bold text-[#C9A36A] uppercase tracking-wider mb-3">
            Refund Details
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                Invoice ID *
              </label>
              <input
                value={refundForm.invoiceId}
                onChange={(e) =>
                  setRefundForm({ ...refundForm, invoiceId: e.target.value })
                }
                placeholder="e.g. INV-2024-5551"
                className="w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                Refund Amount (Rp) *
              </label>
              <input
                value={refundForm.amount}
                onChange={(e) =>
                  setRefundForm({ ...refundForm, amount: e.target.value })
                }
                placeholder="e.g. 5000000"
                type="number"
                className="w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                Property
              </label>
              <input
                value={refundForm.property || ""}
                onChange={(e) =>
                  setRefundForm({ ...refundForm, property: e.target.value })
                }
                placeholder="e.g. Wowo Business Pack"
                className="w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                Refund Method *
              </label>
              <select
                value={refundForm.refundMethod || ""}
                onChange={(e) =>
                  setRefundForm({ ...refundForm, refundMethod: e.target.value })
                }
                className="w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none"
              >
                <option value="">Select method</option>
                <option>BCA Transfer</option>
                <option>Mandiri Transfer</option>
                <option>BNI Transfer</option>
                <option>BRI Transfer</option>
                <option>Original Payment Method</option>
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
              Reason for Refund *
            </label>
            <textarea
              value={refundForm.reason}
              onChange={(e) =>
                setRefundForm({ ...refundForm, reason: e.target.value })
              }
              placeholder="Provide a detailed reason for refund..."
              rows={3}
              className="w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none resize-none"
            />
          </div>

          {/* Email notification note */}
          <div className="flex items-center gap-2 bg-[#F5F0E8] rounded-xl p-3 mb-5">
            <div className="w-6 h-6 bg-[#C9A36A]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[10px]">✉</span>
            </div>
            <p className="text-[10px] text-[#2B2B2B]/70">
              An email notification will be sent to{" "}
              <strong>{refundForm.tenantEmail || "tenant email"}</strong> after
              submission.
              {/* TODO: backend handle email via /api/admin/refund → NodeMailer/SendGrid */}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setModal(null)}
              className="flex-1 border-2 border-gray-200 text-[#2B2B2B] text-xs font-semibold py-2.5 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRefund}
              disabled={
                !refundForm.invoiceId ||
                !refundForm.amount ||
                !refundForm.reason ||
                !refundForm.tenantEmail
              }
              className="flex-1 bg-[#C9A36A] hover:bg-[#A8834A] text-white text-xs font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              Submit Refund
            </button>
          </div>
        </Modal>
      )}

      {/* ── Filter Modal ── */}
      {modal === "filter" && (
        <Modal title="Advanced Filter" onClose={() => setModal(null)}>
          <div className="space-y-4 mb-5">
            <div>
              <label className="text-xs font-semibold text-[#2B2B2B] block mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {["All", "Paid", "Pending", "Refunded", "Failed"].map((f) => (
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
            <div>
              <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                Date From
              </label>
              <input
                type="date"
                className="w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                Date To
              </label>
              <input
                type="date"
                className="w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none"
              />
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
              Apply Filter
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
