"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Notification {
  id:      string;
  title:   string;
  message: string;
  time:    string;
  read:    boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage]   = useState(1);

  useEffect(() => {
    // TODO: fetch from API
    // const res = await fetch(`/api/admin/notifications?page=${page}`).then(r => r.json());
    // setNotifications(res.data); setTotal(res.total);
  }, [page]);

  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      <h1
        className="text-3xl font-bold text-[#C9A36A] mb-6"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Notifications
      </h1>

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <p className="text-sm font-semibold text-[#2B2B2B] mb-4">Recent Activity</p>

        {notifications.length === 0 ? (
          <div className="h-48 flex items-center justify-center border border-dashed border-gray-100 rounded-lg text-gray-200 text-xs">
            No notifications. Data will appear after API integration.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div key={n.id} className={`flex items-start justify-between py-3 ${!n.read ? "bg-[#C9A36A]/5 -mx-5 px-5" : ""}`}>
                <div>
                  <p className="text-xs font-semibold text-[#2B2B2B]">{n.title}</p>
                  <p className="text-[11px] text-gray-400">{n.message}</p>
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-4">{n.time}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">Showing 1–{Math.min(10, notifications.length)} Registered Owners</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded border border-gray-200 text-gray-400 disabled:opacity-30"
            >
              <ChevronLeft size={12} />
            </button>
            <span className="px-2.5 py-1 text-[11px] bg-[#C9A36A] text-white rounded font-semibold">{page}</span>
            {totalPages > 1 && (
              <span className="px-2.5 py-1 text-[11px] border border-gray-200 rounded">{totalPages}</span>
            )}
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded border border-gray-200 text-gray-400 disabled:opacity-30"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
