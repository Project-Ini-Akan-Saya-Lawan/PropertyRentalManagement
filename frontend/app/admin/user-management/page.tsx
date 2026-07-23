"use client";

import { useState, useEffect } from "react";
import {
  Download,
  User,
  Users,
  Search,
  Pencil,
  Trash2,
  X,
  Mail,
  Home,
  Calendar,
} from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  workspace: string;
  status: string;
  role_id: number;
}

const STATUS_STYLE: Record<string, string> = {
  active: "bg-blue-50 text-blue-700 border border-blue-200",
  inactive: "bg-gray-100 text-gray-500 border border-gray-200",
  suspended: "bg-red-50 text-red-700 border border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};

const inputCls =
  "w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none transition-all";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
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

function exportCSV(data: Tenant[]) {
  if (data.length === 0) {
    alert("No data to export.");
    return;
  }
  const headers = ["name", "email", "phone", "company", "status"];
  const rows = data.map((row) =>
    headers
      .map((h) => `"${(row as unknown as Record<string, string>)[h] ?? ""}"`)
      .join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Users_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function UserManagementPage() {
  const [data, setData] = useState<Tenant[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState<"edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Tenant | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${API_URL}/api/users`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          const mapped: Tenant[] = result.data.map(
            (u: {
              user_id: number;
              username: string;
              email: string;
              phone_number: string;
              company: string;
              status: string;
              role_id: number;
            }) => ({
              id: String(u.user_id),
              name: u.username || "",
              email: u.email || "",
              phone: u.phone_number || "",
              company: u.company || "",
              workspace: "",
              status: u.status || "active",
              role_id: u.role_id,
            }),
          );
          setData(mapped);
        }
      })
      .catch((err) => console.error("Failed to fetch users:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async () => {
    if (!selected || !newStatus) return;
    await fetch(`${API_URL}/api/users/${selected.id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchUsers();
    setModal(null);
    setSelected(null);
    setNewStatus("");
  };

  const handleDelete = async () => {
    if (!selected) return;
    // TODO: DELETE /api/users/:id (admin endpoint)
    setData(data.filter((u) => u.id !== selected.id));
    setModal(null);
    setSelected(null);
  };

  const tenants = data.filter((u) => u.role_id === 2);
  const filtered = tenants.filter((u) => {
    const ms = [u.name, u.email, u.phone, u.company]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());
    const mf = filter === "All" || u.status === filter.toLowerCase();
    return ms && mf;
  });

  const stats = [
    {
      label: "Total Users",
      value: tenants.length,
      color: "bg-[#C9A36A]/10 text-[#C9A36A]",
      icon: Users,
    },
    {
      label: "Active",
      value: tenants.filter((u) => u.status === "active").length,
      color: "bg-blue-50 text-blue-600",
      icon: User,
    },
    {
      label: "Inactive",
      value: tenants.filter((u) => u.status === "inactive").length,
      color: "bg-gray-100 text-gray-500",
      icon: User,
    },
    {
      label: "Suspended",
      value: tenants.filter((u) => u.status === "suspended").length,
      color: "bg-red-50 text-red-500",
      icon: User,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-[#2B2B2B]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            User Management
          </h1>
          <p className="text-xs font-medium text-[#2B2B2B]/50 mt-0.5">
            Manage registered users (tenants & prospects)
          </p>
        </div>
        <button
          onClick={() => exportCSV(tenants)}
          className="flex items-center gap-1.5 border-2 border-[#C9A36A]/40 text-[#C9A36A] text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#C9A36A]/5 transition-colors"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white border-2 border-[#C9A36A]/30 rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-all"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}
              >
                <Icon size={15} />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#2B2B2B]/50 uppercase tracking-wider">
                  {s.label}
                </p>
                <p className="text-xl font-bold text-[#2B2B2B]">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={13}
            className="absolute left-3 top-2.5 text-[#2B2B2B]/40"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-8 pr-3 py-2 text-xs border-2 border-[#C9A36A]/30 rounded-lg focus:border-[#C9A36A] outline-none text-[#2B2B2B]"
          />
        </div>
        <div className="flex gap-1">
          {["All", "Active", "Inactive", "Suspended"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${filter === s ? "bg-[#C9A36A] text-white" : "border-2 border-[#C9A36A]/30 text-[#2B2B2B] hover:border-[#C9A36A]"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F5F0E8]">
            <tr>
              {["User", "Company", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] font-bold text-[#2B2B2B]/60 uppercase tracking-wider px-4 py-3"
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
                  colSpan={4}
                  className="py-16 text-center text-sm text-[#2B2B2B]/40"
                >
                  Loading users...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <Users size={28} className="text-[#C9A36A]/30 mx-auto mb-2" />
                  <p className="text-sm font-bold text-[#2B2B2B]">
                    No users found
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-[#C9A36A]/10 hover:bg-[#F5F0E8]/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#C9A36A]/15 flex items-center justify-center flex-shrink-0">
                        <User size={13} className="text-[#C9A36A]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#2B2B2B]">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-[#2B2B2B]/50 flex items-center gap-1">
                          <Mail size={9} /> {u.email}
                        </p>
                        {u.phone && (
                          <p className="text-[10px] text-[#2B2B2B]/40">
                            {u.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#2B2B2B]/70">
                    {u.company || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_STYLE[u.status] || "bg-gray-50 text-gray-500"}`}
                    >
                      {STATUS_LABEL[u.status] || u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelected(u);
                          setNewStatus(u.status);
                          setModal("edit");
                        }}
                        className="p-1.5 hover:bg-[#C9A36A]/10 rounded-lg transition-colors"
                        title="Edit Status"
                      >
                        <Pencil size={13} className="text-[#C9A36A]" />
                      </button>
                      <button
                        onClick={() => {
                          setSelected(u);
                          setModal("delete");
                        }}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-[#C9A36A]/10 bg-[#F5F0E8]/30">
          <p className="text-[11px] font-medium text-[#2B2B2B]/50">
            Showing {filtered.length} of {tenants.length} users
          </p>
        </div>
      </div>

      {/* Edit Status Modal */}
      {modal === "edit" && selected && (
        <Modal
          title="Update User Status"
          onClose={() => {
            setModal(null);
            setNewStatus("");
          }}
        >
          <div className="mb-5">
            <div className="flex items-center gap-3 bg-[#F5F0E8] rounded-xl p-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#C9A36A]/20 flex items-center justify-center">
                <User size={18} className="text-[#C9A36A]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#2B2B2B]">
                  {selected.name}
                </p>
                <p className="text-xs text-[#2B2B2B]/50">{selected.email}</p>
              </div>
            </div>
            <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
              Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className={inputCls}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setModal(null);
                setNewStatus("");
              }}
              className="px-5 py-2 text-xs font-semibold border-2 border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateStatus}
              className="px-5 py-2 text-xs font-bold bg-[#C9A36A] hover:bg-[#A8834A] text-white rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {modal === "delete" && selected && (
        <Modal title="Delete User" onClose={() => setModal(null)}>
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <p className="text-sm font-bold text-[#2B2B2B] mb-1">
              Delete &quot;{selected.name}&quot;?
            </p>
            <p className="text-xs text-[#2B2B2B]/50">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 justify-center mt-2">
            <button
              onClick={() => setModal(null)}
              className="px-6 py-2 text-xs font-semibold border-2 border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2 text-xs font-bold bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
