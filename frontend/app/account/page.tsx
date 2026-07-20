"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Pencil } from "lucide-react";

const mockUser = {
  fullName: "Bahlil",
  email: "bahlil@bensin.com",
  phone: "089878785656",
  company: "PT Bensin Ketan Hitam",
  position: "Operation Manager",
};

const mockBookings = [
  {
    id: "BK-2206-003",
    space: "Business Office",
    detail: "Tower Wowo, Floor 17-19",
    date: "22 June 2026",
    time: "14.00 WIB",
    status: "Completed",
    total: "Rp 12.000.000",
  },
  {
    id: "BK-2206-002",
    space: "Starter Office",
    detail: "Tower Wowi, Floor 8",
    date: "22 June 2026",
    time: "12.00 WIB",
    status: "Progressing",
    total: "Rp 2.000.000",
  },
  {
    id: "BK-2206-001",
    space: "Executive Office",
    detail: "Tower Wowo, Floor 29",
    date: "22 June 2026",
    time: "09.00 wib",
    status: "Completed",
    total: "Rp 300.000.000",
  },
];

const statusColor: Record<string, string> = {
  Completed: "text-green-600",
  Progressing: "text-blue-500",
  Cancelled: "text-red-500",
  Pending: "text-orange-500",
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(mockUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(mockUser);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    const email = localStorage.getItem("userEmail");
    if (email) setUser((prev) => ({ ...prev, email }));
    setLoaded(true);
  }, [router]);

  const handleSave = () => {
    setUser(form);
    setEditing(false);
  };

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Page Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl font-bold text-[#C9A36A] mb-6"
        >
          Account
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Left: Profile Information ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-[#C9A36A]/40 rounded-lg p-5"
          >
            {/* Header */}
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
                <Pencil size={11} />
                Edit Profile
              </button>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center mb-5">
              <div className="w-14 h-14 rounded-full bg-[#C9A36A]/10 border border-[#C9A36A]/20 flex items-center justify-center mb-2">
                <User size={26} className="text-[#C9A36A]" />
              </div>
              <button className="text-xs text-[#C9A36A] hover:underline">
                Change Profile Picture
              </button>
            </div>

            {/* Fields */}
            {editing ? (
              <div className="space-y-3">
                {[
                  { label: "Full Name", key: "fullName" },
                  { label: "E-mail Address", key: "email" },
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
                  { label: "E-mail Address", value: user.email },
                  { label: "Phone Number", value: user.phone },
                  { label: "Company", value: user.company },
                  { label: "Position", value: user.position },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-2">
                    <span className="text-xs font-semibold text-gray-500 w-28 flex-shrink-0">
                      {label}
                    </span>
                    <span className="text-xs text-gray-700">{value}</span>
                  </div>
                ))}
                <button className="text-xs text-[#C9A36A] hover:underline pt-1 block">
                  Change Password
                </button>
              </div>
            )}
          </motion.div>

          {/* ── Right: Booking History ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2 border border-[#C9A36A]/40 rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-[#C9A36A]">
                Booking History
              </h2>
              <button className="text-xs border border-[#C9A36A] text-[#C9A36A] hover:bg-[#C9A36A] hover:text-white px-4 py-1.5 rounded transition-colors font-semibold">
                View All Bookings
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-600 pb-2.5 pr-4">
                      Booking ID
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 pb-2.5 pr-4">
                      Space Type
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 pb-2.5 pr-4">
                      Date
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 pb-2.5 pr-4">
                      Status
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-600 pb-2.5">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockBookings.map((b, i) => (
                    <tr
                      key={b.id}
                      className={`hover:bg-gray-50/60 transition-colors ${i < mockBookings.length - 1 ? "border-b border-gray-50" : ""}`}
                    >
                      <td className="py-3.5 pr-4">
                        <span className="text-xs text-gray-700">{b.id}</span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <p className="text-xs text-gray-700">{b.space}</p>
                        <p className="text-[11px] text-gray-400">{b.detail}</p>
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
                      <td className="py-3.5 text-right">
                        <span className="text-xs text-gray-700">{b.total}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="border-t border-gray-100 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-gray-400">
            &copy; 2026 Rupiah Building Jababeka. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <Link href="#" className="hover:text-[#C9A36A] transition-colors">
              Privacy Policy
            </Link>
            <span className="mx-1">|</span>
            <Link href="#" className="hover:text-[#C9A36A] transition-colors">
              Terms of Use
            </Link>
            <span className="mx-1">|</span>
            <Link href="#" className="hover:text-[#C9A36A] transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
