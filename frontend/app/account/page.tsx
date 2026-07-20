"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Pencil } from "lucide-react";

type UserData = {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
};

type Booking = {
  id: string;
  space: string;
  detail: string;
  date: string;
  time: string;
  status: string;
  total: string;
};

const emptyUser: UserData = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  position: "",
};

const statusColor: Record<string, string> = {
  Completed: "text-green-600",
  Progressing: "text-blue-500",
  Cancelled: "text-red-500",
  Pending: "text-orange-500",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData>(emptyUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UserData>(emptyUser);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    const token = localStorage.getItem("token");

    // Fetch profil dari API
    fetch(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((result) => {
        const parsed = result.data;
        if (!parsed) return;
        const mapped: UserData = {
          fullName: parsed.username || "",
          email: parsed.email || "",
          phone: parsed.phone_number || "",
          company: "-",
          position: "-",
        };
        setUser(mapped);
        setForm(mapped);
        setUserId(String(parsed.user_id || ""));
        // Update localStorage juga
        localStorage.setItem("user", JSON.stringify(parsed));
      })
      .catch(() => {
        // Fallback ke localStorage kalau API gagal
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            const mapped: UserData = {
              fullName: parsed.username || "",
              email: parsed.email || "",
              phone: parsed.phone_number || "",
              company: "-",
              position: "-",
            };
            setUser(mapped);
            setForm(mapped);
            setUserId(String(parsed.user_id || ""));
          } catch {}
        }
      })
      .finally(() => setLoaded(true));

    // Fetch booking history
    fetch(`${API_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          const mapped = result.data.map(
            (b: {
              booking_id: string;
              pack_id: string;
              floor_booked: string;
              start_date: string;
              end_date: string;
              total_price: number;
              status: string;
            }) => ({
              id: `BK-${b.booking_id}`,
              space: `Pack ID: ${b.pack_id}`,
              detail: `Floor ${b.floor_booked}`,
              date: new Date(b.start_date).toLocaleDateString("id-ID"),
              time: new Date(b.end_date).toLocaleDateString("id-ID"),
              status:
                b.status === "confirmed"
                  ? "Progressing"
                  : b.status === "completed"
                    ? "Completed"
                    : b.status === "cancelled"
                      ? "Cancelled"
                      : "Pending",
              total: `Rp ${Number(b.total_price).toLocaleString("id-ID")}`,
            }),
          );
          setBookings(mapped);
        }
      })
      .catch((err) => console.error("Failed to fetch bookings", err));
  }, [router]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: form.fullName,
          phone_number: form.phone,
        }),
      });

      const result = await res.json();

      if (res.ok && result.data) {
        // Update localStorage dengan data terbaru dari server
        localStorage.setItem("user", JSON.stringify(result.data));
        const updated: UserData = {
          fullName: result.data.username || "",
          email: result.data.email || "",
          phone: result.data.phone_number || "",
          company: form.company,
          position: form.position,
        };
        setUser(updated);
        setForm(updated);
      } else {
        setUser(form);
      }

      setEditing(false);
    } catch (err) {
      console.error(err);
      setUser(form);
      setEditing(false);
    }
  };

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl font-bold text-[#C9A36A] mb-6"
        >
          Account
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-[#C9A36A]/40 rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-[#C9A36A]">
                Profile Information
              </h2>
              <button
                onClick={() => {
                  setEditing(!editing);
                  setForm(user);
                }}
                className="flex items-center gap-1.5 text-xs border border-gray-300 text-gray-500 hover:border-[#C9A36A] hover:text-[#C9A36A] px-3 py-1.5 rounded transition-colors"
              >
                <Pencil size={11} /> Edit Profile
              </button>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center mb-5">
              <div className="w-14 h-14 rounded-full bg-[#C9A36A]/10 border border-[#C9A36A]/20 flex items-center justify-center mb-2">
                <User size={26} className="text-[#C9A36A]" />
              </div>
            </div>

            {editing ? (
              <div className="space-y-3">
                {[
                  { label: "Full Name", key: "fullName" },
                  { label: "Email", key: "email" },
                  { label: "Phone Number", key: "phone" },
                  { label: "Company", key: "company" },
                  { label: "Position", key: "position" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-[10px] text-gray-400 block mb-0.5">
                      {label}
                    </label>
                    <input
                      value={form[key as keyof typeof form]}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs text-gray-700 focus:border-[#C9A36A] outline-none"
                    />
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-[#C9A36A] hover:bg-[#A8834A] text-white text-xs font-semibold py-1.5 rounded transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setForm(user);
                    }}
                    className="flex-1 border border-gray-200 text-gray-400 text-xs py-1.5 rounded hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {[
                  { label: "Full Name", value: user.fullName },
                  { label: "Email", value: user.email },
                  { label: "Phone Number", value: user.phone },
                  { label: "Company", value: user.company },
                  { label: "Position", value: user.position },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-2">
                    <span className="text-xs font-semibold text-gray-500 w-28 flex-shrink-0">
                      {label}
                    </span>
                    <span className="text-xs text-gray-700">
                      {value || "-"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Booking History */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2 border border-[#C9A36A]/40 rounded-lg p-5"
          >
            <h2 className="text-sm font-semibold text-[#C9A36A] mb-5">
              Booking History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {[
                      "Booking ID",
                      "Space Type",
                      "Date",
                      "Status",
                      "Total",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`text-xs font-semibold text-gray-600 pb-2.5 ${i === 4 ? "text-right" : "text-left pr-4"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <p className="text-sm font-medium text-gray-500">
                          No booking history yet
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Your bookings will appear here after you reserve a
                          workspace.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b, i) => (
                      <tr
                        key={b.id}
                        className={`hover:bg-gray-50 ${i !== bookings.length - 1 ? "border-b border-gray-50" : ""}`}
                      >
                        <td className="py-3.5 pr-4 text-xs text-gray-700">
                          {b.id}
                        </td>
                        <td className="py-3.5 pr-4">
                          <p className="text-xs text-gray-700">{b.space}</p>
                          <p className="text-[11px] text-gray-400">
                            {b.detail}
                          </p>
                        </td>
                        <td className="py-3.5 pr-4">
                          <p className="text-xs text-gray-700">{b.date}</p>
                          <p className="text-[11px] text-gray-400">{b.time}</p>
                        </td>
                        <td className="py-3.5 pr-4">
                          <span
                            className={`text-xs font-medium ${statusColor[b.status] ?? "text-gray-500"}`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right text-xs text-gray-700">
                          {b.total}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-gray-400">
            &copy; 2026 Rupiah Building Jababeka. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <Link
              href="/privacy-policy"
              className="hover:text-[#C9A36A] transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="mx-1">|</span>
            <Link
              href="/terms-of-use"
              className="hover:text-[#C9A36A] transition-colors"
            >
              Terms of Use
            </Link>
            <span className="mx-1">|</span>
            <Link
              href="/cookie-policy"
              className="hover:text-[#C9A36A] transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
