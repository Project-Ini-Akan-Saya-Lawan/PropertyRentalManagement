"use client";
import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  Building2,
  DollarSign,
  User,
  Search,
  Trash2,
  MailOpen,
  Mail,
  ArrowLeft,
} from "lucide-react";

interface Notification {
  id: string;
  type: "booking" | "payment" | "property" | "user";
  subject: string;
  preview: string;
  body: string;
  from: string;
  fromEmail: string;
  time: string;
  date: string;
  read: boolean;
  tag?: string;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  booking: <CheckCircle size={15} className="text-[#C9A36A]" />,
  payment: <DollarSign size={15} className="text-green-500" />,
  property: <Building2 size={15} className="text-blue-500" />,
  user: <User size={15} className="text-purple-500" />,
};
const TYPE_BG: Record<string, string> = {
  booking: "bg-[#C9A36A]/10",
  payment: "bg-green-50",
  property: "bg-blue-50",
  user: "bg-purple-50",
};
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

function detectType(title: string): Notification["type"] {
  const t = title.toLowerCase();
  if (t.includes("booking") || t.includes("rent")) return "booking";
  if (t.includes("payment") || t.includes("pay")) return "payment";
  if (t.includes("property") || t.includes("pack")) return "property";
  if (t.includes("user") || t.includes("registration")) return "user";
  return "booking";
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<Notification | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  // Mobile: show list or detail
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          const mapped: Notification[] = result.data.map(
            (n: {
              notifications_id: number;
              title: string;
              message: string;
              is_read: boolean;
              created_at: string;
            }) => ({
              id: String(n.notifications_id),
              type: detectType(n.title),
              subject: n.title,
              preview:
                n.message.length > 60
                  ? n.message.slice(0, 60) + "..."
                  : n.message,
              body: n.message,
              from: "Rupiah Building System",
              fromEmail: "system@rupiahbuilding.com",
              time: new Date(n.created_at).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              date: new Date(n.created_at).toLocaleDateString("id-ID"),
              read: n.is_read,
            }),
          );
          setNotifications(mapped);
        }
      })
      .catch((err) => console.error("Failed to fetch notifications:", err));
  }, []);

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(console.error);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(console.error);
  };

  const deleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (selected?.id === id) {
      setSelected(null);
      setMobileView("list");
    }
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/notifications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(console.error);
  };

  const handleSelect = (n: Notification) => {
    setSelected(n);
    setMobileView("detail");
    if (!n.read) markRead(n.id);
  };

  const filtered = notifications.filter((n) => {
    const ms =
      n.subject.toLowerCase().includes(search.toLowerCase()) ||
      n.preview.toLowerCase().includes(search.toLowerCase());
    const mf =
      filter === "All"
        ? true
        : filter === "Unread"
          ? !n.read
          : n.type === filter.toLowerCase();
    return ms && mf;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const DetailPanel = () =>
    selected ? (
      <div className="flex flex-col h-full">
        {/* Mobile back button */}
        <div className="md:hidden px-4 py-3 border-b border-[#C9A36A]/30">
          <button
            onClick={() => {
              setMobileView("list");
              setSelected(null);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#C9A36A]"
          >
            <ArrowLeft size={13} /> Back to notifications
          </button>
        </div>
        <div className="px-4 sm:px-6 py-4 border-b border-[#C9A36A]/30 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div
                className={`w-6 h-6 rounded-full ${TYPE_BG[selected.type]} flex items-center justify-center flex-shrink-0`}
              >
                {TYPE_ICON[selected.type]}
              </div>
              <span className="text-[10px] font-bold text-[#2B2B2B]/50 uppercase">
                {selected.type}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#2B2B2B] mb-1">
              {selected.subject}
            </h2>
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-[#2B2B2B]/50">
              <span className="font-semibold">{selected.from}</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">{selected.fromEmail}</span>
              <span>·</span>
              <span>
                {selected.date}, {selected.time}
              </span>
            </div>
          </div>
          <button
            onClick={() => deleteNotif(selected.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors ml-2 flex-shrink-0"
          >
            <Trash2 size={15} className="text-red-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
          <div className="bg-[#F5F0E8]/40 rounded-2xl p-4 sm:p-5">
            <pre className="text-sm text-[#2B2B2B]/80 leading-relaxed whitespace-pre-wrap font-sans">
              {selected.body}
            </pre>
          </div>
        </div>
        <div className="px-4 sm:px-6 py-4 border-t border-[#C9A36A]/30 flex gap-2">
          <button
            onClick={() => deleteNotif(selected.id)}
            className="flex items-center gap-1.5 border-2 border-red-200 text-red-500 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 size={13} /> Delete
          </button>
          <button
            onClick={() => {
              setSelected(null);
              setMobileView("list");
            }}
            className="flex items-center gap-1.5 border-2 border-[#C9A36A]/30 text-[#2B2B2B] text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#F5F0E8] transition-colors ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    ) : (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 bg-[#C9A36A]/10 rounded-full flex items-center justify-center">
          <Mail size={28} className="text-[#C9A36A]" />
        </div>
        <p className="text-sm font-bold text-[#2B2B2B]">
          Select a notification
        </p>
        <p className="text-xs text-[#2B2B2B]/40">
          Click any notification to read it
        </p>
      </div>
    );

  const ListPanel = () => (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-[#C9A36A]/30">
        <div className="relative mb-2">
          <Search
            size={12}
            className="absolute left-3 top-2.5 text-[#2B2B2B]/40"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-2 text-xs border-2 border-[#C9A36A]/30 rounded-lg focus:border-[#C9A36A] outline-none text-[#2B2B2B]"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {["All", "Unread", "Booking", "Payment", "User"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors border-b-2 ${
                filter === f
                  ? "border-[#C9A36A] text-[#C9A36A] bg-[#C9A36A]/5"
                  : "border-transparent bg-[#F5F0E8] text-[#2B2B2B]/60"
              }`}
            >
              {f}
              {f === "Unread" && unreadCount > 0 && (
                <span className="ml-1 bg-[#C9A36A] text-white text-[8px] px-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-[#C9A36A]/30">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Bell size={24} className="text-[#C9A36A]/30 mx-auto mb-2" />
            <p className="text-xs text-[#2B2B2B]/40">No notifications</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleSelect(n)}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all ${
                selected?.id === n.id
                  ? "bg-[#C9A36A]/10 border-r-2 border-[#C9A36A]"
                  : "hover:bg-[#F5F0E8]/60"
              } ${!n.read ? "bg-[#F5F0E8]/40" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full ${TYPE_BG[n.type] || "bg-gray-100"} flex items-center justify-center flex-shrink-0 mt-0.5`}
              >
                {TYPE_ICON[n.type] || (
                  <Bell size={15} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p
                    className={`text-xs truncate ${!n.read ? "font-bold text-[#2B2B2B]" : "font-medium text-[#2B2B2B]/70"}`}
                  >
                    {n.subject}
                  </p>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[#C9A36A] flex-shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-[#2B2B2B]/50 truncate">
                  {n.preview}
                </p>
                <p className="text-[9px] text-[#2B2B2B]/30 mt-0.5">
                  {n.date} · {n.time}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1
            className="text-xl sm:text-2xl font-bold text-[#2B2B2B]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="bg-[#C9A36A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={markAllRead}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#C9A36A] hover:underline"
        >
          <MailOpen size={13} />{" "}
          <span className="hidden sm:inline">Mark all as read</span>
        </button>
      </div>

      {/* Desktop: side by side | Mobile: toggle list/detail */}
      <div className="flex-1 min-h-0" style={{ height: "calc(100vh - 200px)" }}>
        {/* Desktop layout */}
        <div className="hidden md:flex gap-4 h-full">
          <div className="w-80 flex-shrink-0 flex flex-col border-2 border-[#C9A36A]/30 rounded-2xl overflow-hidden bg-white">
            <ListPanel />
          </div>
          <div className="flex-1 border-2 border-[#C9A36A]/30 rounded-2xl overflow-hidden bg-white flex flex-col">
            <DetailPanel />
          </div>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden h-full border-2 border-[#C9A36A]/30 rounded-2xl overflow-hidden bg-white flex flex-col">
          {mobileView === "list" ? <ListPanel /> : <DetailPanel />}
        </div>
      </div>
    </div>
  );
}
