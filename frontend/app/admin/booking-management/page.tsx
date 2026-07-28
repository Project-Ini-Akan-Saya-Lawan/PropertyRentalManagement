"use client";
import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
} from "lucide-react";

interface Booking {
  id: string;
  bookingId: string;
  tenantName: string;
  tenantInitials: string;
  property: string;
  period: string;
  status: "Approved" | "Pending" | "Cancelled";
  total: string;
  rawStatus: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const STATUS_CONFIG = {
  Approved: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  Pending: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  Cancelled: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-400",
  },
};

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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
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
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const c = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${c.bg} ${c.text} ${c.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

function mapStatus(s: string): Booking["status"] {
  if (s === "confirmed" || s === "completed") return "Approved";
  if (s === "cancelled") return "Cancelled";
  return "Pending";
}

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<"view" | "cancel" | "pending" | null>(
    null,
  );
  const [selected, setSelected] = useState<Booking | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const PER_PAGE = 5;

  const fetchBookings = () => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/bookings/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          const mapped: Booking[] = result.data.map(
            (b: {
              booking_id: number;
              username: string;
              email: string;
              pack_id: number;
              floor_booked: number;
              start_date: string;
              end_date: string;
              total_price: number;
              status: string;
            }) => ({
              id: String(b.booking_id),
              bookingId: `BK-${b.booking_id}`,
              tenantName: b.username || b.email || "Unknown",
              tenantInitials: (b.username || "U").slice(0, 2).toUpperCase(),
              property: `Pack ${b.pack_id} - Floor ${b.floor_booked}`,
              period: `${new Date(b.start_date).toLocaleDateString("id-ID")} – ${new Date(b.end_date).toLocaleDateString("id-ID")}`,
              status: mapStatus(b.status),
              total: `Rp ${Number(b.total_price).toLocaleString("id-ID")}`,
              rawStatus: b.status,
            }),
          );
          setBookings(mapped);
        }
      })
      .catch((err) => console.error("Failed to fetch bookings:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (newStatus: Booking["status"]) => {
    if (!selected) return;
    const token = localStorage.getItem("token");
    const statusMap: Record<string, string> = {
      Approved: "confirmed",
      Pending: "pending",
      Cancelled: "cancelled",
    };
    setActionError("");
    try {
      const res = await fetch(`${API_URL}/api/bookings/${selected.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: statusMap[newStatus] }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Surface the real backend error instead of silently pretending the
        // update succeeded - previously this was swallowed, so admins saw
        // the modal close and the row appear to change while nothing was
        // actually persisted, and the next refresh reverted it back.
        setActionError(
          result.message || `Failed to update booking (${res.status}).`,
        );
        return;
      }
      setModal(null);
      setSelected(null);
      setActionNote("");
      fetchBookings();
    } catch (err) {
      console.error("Failed to update status:", err);
      setActionError(
        err instanceof Error
          ? err.message
          : "Cannot connect to server. Please try again.",
      );
    }
  };

  const filtered = bookings.filter((b) => {
    const ms =
      b.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      b.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      b.property.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "All" || b.status === filter;
    return ms && mf;
  });
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = [
    {
      label: "Pending",
      value: bookings.filter((b) => b.status === "Pending").length,
      icon: Clock,
      bg: "bg-orange-50",
      color: "text-orange-600",
    },
    {
      label: "Approved",
      value: bookings.filter((b) => b.status === "Approved").length,
      icon: CheckCircle,
      bg: "bg-green-50",
      color: "text-green-600",
    },
    {
      label: "Cancelled",
      value: bookings.filter((b) => b.status === "Cancelled").length,
      icon: XCircle,
      bg: "bg-red-50",
      color: "text-red-500",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold text-[#2B2B2B]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Booking Management
          </h1>
          <p className="text-xs font-medium text-[#2B2B2B]/50 mt-0.5 hidden sm:block">
            Manage and review all booking requests
          </p>
        </div>
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-2.5 text-[#2B2B2B]/40"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search booking, tenant..."
            className="pl-8 pr-4 py-2 text-xs border-2 border-[#C9A36A]/30 rounded-lg focus:border-[#C9A36A] outline-none w-full sm:w-56 text-[#2B2B2B]"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white border-2 border-[#C9A36A]/30 rounded-xl p-3 sm:p-4"
            >
              <div
                className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}
              >
                <Icon size={15} className={s.color} />
              </div>
              <p className="text-[9px] sm:text-[10px] font-semibold text-[#2B2B2B]/50 uppercase tracking-wider">
                {s.label}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-[#2B2B2B] mt-0.5">
                {s.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Table — full width, no right column */}
      <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[#C9A36A]/10">
          <h2 className="text-sm font-bold text-[#2B2B2B]">Recent Bookings</h2>
          <div className="flex items-center gap-1.5">
            <div className="flex gap-1">
              {["All", "Approved", "Pending", "Cancelled"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setPage(1);
                  }}
                  className={`px-2 sm:px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors ${filter === f ? "bg-[#C9A36A] text-white" : "text-[#2B2B2B]/50 hover:bg-[#C9A36A]/10"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[550px]">
            <thead className="bg-[#F5F0E8]/50">
              <tr>
                {[
                  "Booking ID",
                  "Tenant",
                  "Property",
                  "Period",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[9px] font-bold text-[#2B2B2B]/50 uppercase tracking-wider px-3 sm:px-4 py-2.5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-sm text-[#2B2B2B]/30"
                  >
                    Loading bookings...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-sm text-[#2B2B2B]/30"
                  >
                    No bookings found
                  </td>
                </tr>
              ) : (
                paginated.map((b) => (
                  <tr
                    key={b.id}
                    className="border-t border-[#C9A36A]/10 hover:bg-[#F5F0E8]/30 transition-colors"
                  >
                    <td className="px-3 sm:px-4 py-3">
                      <span className="text-xs font-bold text-[#C9A36A]">
                        #{b.bookingId}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#C9A36A]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-bold text-[#C9A36A]">
                            {b.tenantInitials}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-[#2B2B2B] truncate max-w-[80px]">
                          {b.tenantName}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <span className="text-xs text-[#2B2B2B]/70 max-w-[90px] block truncate">
                        {b.property}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <span className="text-[10px] text-[#2B2B2B]/60 whitespace-nowrap">
                        {b.period}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => {
                            setSelected(b);
                            setModal("view");
                          }}
                          className="p-1.5 hover:bg-[#C9A36A]/10 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={13} className="text-[#C9A36A]" />
                        </button>
                        {b.status !== "Pending" && (
                          <button
                            onClick={() => {
                              setSelected(b);
                              setModal("pending");
                            }}
                            className="p-1.5 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Set Pending"
                          >
                            <Clock size={13} className="text-orange-500" />
                          </button>
                        )}
                        {b.status !== "Cancelled" && (
                          <button
                            onClick={() => {
                              setSelected(b);
                              setModal("cancel");
                            }}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <XCircle size={13} className="text-red-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-[#C9A36A]/10 bg-[#F5F0E8]/20">
          <p className="text-[11px] text-[#2B2B2B]/50">
            {filtered.length === 0
              ? 0
              : Math.min((page - 1) * PER_PAGE + 1, filtered.length)}
            –{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 border-2 border-[#C9A36A]/30 rounded-lg hover:border-[#C9A36A] disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={12} className="text-[#C9A36A]" />
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
              disabled={page === totalPages}
              className="p-1.5 border-2 border-[#C9A36A]/30 rounded-lg hover:border-[#C9A36A] disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={12} className="text-[#C9A36A]" />
            </button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {modal === "view" && selected && (
        <Modal title="Booking Detail" onClose={() => setModal(null)}>
          <div className="space-y-3 mb-5">
            {[
              ["Booking ID", `#${selected.bookingId}`],
              ["Tenant", selected.tenantName],
              ["Property", selected.property],
              ["Period", selected.period],
              ["Status", selected.status],
              ["Total", selected.total],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between py-2 border-b border-[#C9A36A]/10 last:border-0"
              >
                <span className="text-xs font-semibold text-[#2B2B2B]/50">
                  {label}
                </span>
                <span className="text-xs font-bold text-[#2B2B2B] text-right max-w-[60%]">
                  {value}
                </span>
              </div>
            ))}
          </div>
          {actionError && (
            <p className="text-red-500 text-xs font-semibold mb-3">
              {actionError}
            </p>
          )}
          <div className="flex gap-2">
            {selected.status !== "Pending" && (
              <button
                onClick={() => updateStatus("Pending")}
                className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
              >
                <Clock size={13} /> Set Pending
              </button>
            )}
            {selected.status !== "Cancelled" && (
              <button
                onClick={() => {
                  setActionError("");
                  setModal("cancel");
                }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
              >
                <XCircle size={13} /> Cancel
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* Pending Modal */}
      {modal === "pending" && selected && (
        <Modal
          title="Set to Pending"
          onClose={() => {
            setModal(null);
            setActionError("");
          }}
        >
          <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
            <Clock size={20} className="text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#2B2B2B]">
                Set #{selected.bookingId} to Pending?
              </p>
              <p className="text-xs text-[#2B2B2B]/60">
                {selected.tenantName} — {selected.property}
              </p>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
              Reason (optional)
            </label>
            <textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Reason..."
              rows={3}
              className="w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none resize-none"
            />
          </div>
          {actionError && (
            <p className="text-red-500 text-xs font-semibold mb-3">
              {actionError}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setModal(null);
                setActionError("");
              }}
              className="flex-1 border-2 border-gray-200 text-[#2B2B2B] text-xs font-semibold py-2.5 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => updateStatus("Pending")}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2.5 rounded-lg transition-colors"
            >
              Confirm
            </button>
          </div>
        </Modal>
      )}

      {/* Cancel Modal */}
      {modal === "cancel" && selected && (
        <Modal
          title="Cancel Booking"
          onClose={() => {
            setModal(null);
            setActionError("");
          }}
        >
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <XCircle size={20} className="text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#2B2B2B]">
                Cancel #{selected.bookingId}?
              </p>
              <p className="text-xs text-[#2B2B2B]/60">
                {selected.tenantName} — {selected.property}
              </p>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
              Cancellation Reason *
            </label>
            <textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Provide a reason..."
              rows={3}
              className="w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none resize-none"
            />
          </div>
          {actionError && (
            <p className="text-red-500 text-xs font-semibold mb-3">
              {actionError}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setModal(null);
                setActionError("");
              }}
              className="flex-1 border-2 border-gray-200 text-[#2B2B2B] text-xs font-semibold py-2.5 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (!actionNote.trim()) {
                  setActionError("Please provide a cancellation reason.");
                  return;
                }
                updateStatus("Cancelled");
              }}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2.5 rounded-lg transition-colors"
            >
              Confirm Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
