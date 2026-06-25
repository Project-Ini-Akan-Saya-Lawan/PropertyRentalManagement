"use client";

import { useState, useEffect } from "react";
import {
  MoreVertical,
  Plus,
  Download,
  User,
  Building2,
  Users,
  Briefcase,
  Search,
  Pencil,
  Trash2,
  X,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Home,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Owner {
  id: string;
  ownerName: string;
  email: string;
  phone: string;
  status: string;
  propertyCount: string;
  totalRevenue: string;
  joinDate: string;
}
interface Tenant {
  id: string;
  tenantName: string;
  email: string;
  phone: string;
  workspace: string;
  status: string;
  startDate: string;
  endDate: string;
}
interface Staff {
  id: string;
  staffName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  lastLogin: string;
}
type AnyUser = Owner | Tenant | Staff;

const KEYS = ["admin_owners", "admin_tenants", "admin_staff"];

const STATUS_STYLE: Record<string, string> = {
  Verified: "bg-green-50 text-green-700 border border-green-200",
  Active: "bg-blue-50 text-blue-700 border border-blue-200",
  Inactive: "bg-gray-100 text-gray-500 border border-gray-200",
  Suspended: "bg-red-50 text-red-700 border border-red-200",
  Pending: "bg-orange-50 text-orange-700 border border-orange-200",
};

const inputCls =
  "w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none transition-all";

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

function exportCSV(data: AnyUser[], tabLabel: string) {
  if (data.length === 0) {
    alert("No data to export.");
    return;
  }
  const headers = Object.keys(data[0]).filter((k) => k !== "id");
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
  a.download = `${tabLabel.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── OWNER CARD ─────────────────────────────────────────────────────────────
function OwnerCard({
  u,
  onEdit,
  onDelete,
}: {
  u: Owner;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border-2 border-[#C9A36A]/20 rounded-2xl p-5 hover:shadow-md hover:border-[#C9A36A]/40 transition-all relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#C9A36A]/15 flex items-center justify-center flex-shrink-0">
            <User size={18} className="text-[#C9A36A]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#2B2B2B]">{u.ownerName}</p>
            <p className="text-xs text-[#2B2B2B]/50 flex items-center gap-1">
              <Mail size={10} />
              {u.email}
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical size={14} className="text-gray-400" />
          </button>
          {open && (
            <div className="absolute right-0 top-8 bg-white border-2 border-[#C9A36A]/20 rounded-xl shadow-lg z-20 w-28 overflow-hidden">
              <button
                onClick={() => {
                  onEdit();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[#C9A36A]/10"
              >
                <Pencil size={12} className="text-blue-500" /> Edit
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="bg-[#F5F0E8] rounded-lg p-2 text-center">
          <p className="text-[10px] text-[#2B2B2B]/50 mb-0.5">Properties</p>
          <p className="text-sm font-bold text-[#2B2B2B]">
            {u.propertyCount || "—"}
          </p>
        </div>
        <div className="bg-[#F5F0E8] rounded-lg p-2 text-center">
          <p className="text-[10px] text-[#2B2B2B]/50 mb-0.5">Revenue</p>
          <p className="text-xs font-bold text-[#2B2B2B] truncate">
            {u.totalRevenue || "—"}
          </p>
        </div>
        <div className="bg-[#F5F0E8] rounded-lg p-2 text-center">
          <p className="text-[10px] text-[#2B2B2B]/50 mb-0.5">Status</p>
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_STYLE[u.status] || "bg-gray-50 text-gray-500"}`}
          >
            {u.status || "—"}
          </span>
        </div>
      </div>
      <p className="text-[10px] text-[#2B2B2B]/40 mt-2 flex items-center gap-1">
        <Calendar size={9} /> Joined {u.joinDate || "—"}
      </p>
      {open && (
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}

// ── TENANT ROW ─────────────────────────────────────────────────────────────
function TenantRow({
  u,
  onEdit,
  onDelete,
}: {
  u: Tenant;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <tr className="border-t border-[#C9A36A]/10 hover:bg-blue-50/30 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <User size={13} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#2B2B2B]">{u.tenantName}</p>
            <p className="text-[10px] text-[#2B2B2B]/50">{u.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs text-[#2B2B2B]">
          <Home size={12} className="text-blue-400" />
          {u.workspace || "—"}
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_STYLE[u.status] || "bg-gray-50 text-gray-500"}`}
        >
          {u.status || "—"}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-[#2B2B2B]/70">
        {u.startDate || "—"}
      </td>
      <td className="px-4 py-3 text-xs text-[#2B2B2B]/70">
        {u.endDate || "—"}
      </td>
      <td className="px-4 py-3 relative">
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 hover:bg-blue-50 rounded-lg"
        >
          <MoreVertical size={14} className="text-gray-400" />
        </button>
        {open && (
          <div className="absolute right-8 top-2 bg-white border-2 border-[#C9A36A]/20 rounded-xl shadow-lg z-20 w-28 overflow-hidden">
            <button
              onClick={() => {
                onEdit();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[#C9A36A]/10"
            >
              <Pencil size={12} className="text-blue-500" /> Edit
            </button>
            <button
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
        {open && (
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
        )}
      </td>
    </tr>
  );
}

// ── STAFF ROW ──────────────────────────────────────────────────────────────
function StaffRow({
  u,
  onEdit,
  onDelete,
}: {
  u: Staff;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const roleColors: Record<string, string> = {
    Admin: "bg-purple-100 text-purple-700",
    Manager: "bg-indigo-100 text-indigo-700",
    Staff: "bg-gray-100 text-gray-600",
    Support: "bg-teal-100 text-teal-700",
  };
  return (
    <tr className="border-t border-[#C9A36A]/10 hover:bg-purple-50/30 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <User size={13} className="text-purple-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#2B2B2B]">{u.staffName}</p>
            <p className="text-[10px] text-[#2B2B2B]/50">{u.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full ${roleColors[u.role] || "bg-gray-100 text-gray-600"}`}
        >
          {u.role || "—"}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-[#2B2B2B]/70">
        {u.department || "—"}
      </td>
      <td className="px-4 py-3">
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_STYLE[u.status] || "bg-gray-50 text-gray-500"}`}
        >
          {u.status || "—"}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-[#2B2B2B]/50">
        {u.lastLogin || "—"}
      </td>
      <td className="px-4 py-3 relative">
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 hover:bg-purple-50 rounded-lg"
        >
          <MoreVertical size={14} className="text-gray-400" />
        </button>
        {open && (
          <div className="absolute right-8 top-2 bg-white border-2 border-[#C9A36A]/20 rounded-xl shadow-lg z-20 w-28 overflow-hidden">
            <button
              onClick={() => {
                onEdit();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[#C9A36A]/10"
            >
              <Pencil size={12} className="text-blue-500" /> Edit
            </button>
            <button
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
        {open && (
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
        )}
      </td>
    </tr>
  );
}

// ── Form fields config ──────────────────────────────────────────────────────
const FIELDS = [
  [
    // Owners
    { key: "ownerName", label: "Owner Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Verified", "Pending", "Suspended"],
    },
    { key: "propertyCount", label: "Property Count" },
    { key: "totalRevenue", label: "Total Revenue" },
    { key: "joinDate", label: "Join Date", type: "date" },
  ],
  [
    // Tenants
    { key: "tenantName", label: "Tenant Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "workspace", label: "Workspace" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Active", "Inactive", "Pending"],
    },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
  ],
  [
    // Staff
    { key: "staffName", label: "Staff Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    {
      key: "role",
      label: "Role",
      type: "select",
      options: ["Admin", "Manager", "Staff", "Support"],
    },
    {
      key: "department",
      label: "Department",
      type: "select",
      options: ["Property", "Finance", "Operations", "IT", "HR"],
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Active", "Inactive", "Suspended"],
    },
    { key: "lastLogin", label: "Last Login", type: "date" },
  ],
];

const TAB_LABELS = ["Property Owners", "Tenants", "Staff Account"];
const TAB_ICONS = [Building2, Users, Briefcase];
const ADD_LABELS = ["Add Owner", "Add Tenant", "Add Staff"];

const STATS_CONFIG = [
  [
    { label: "Total Owners", icon: Building2 },
    { label: "Verified Owners", icon: User },
    { label: "Total Properties", icon: Home },
  ],
  [
    { label: "Total Tenants", icon: Users },
    { label: "Active Leases", icon: Calendar },
    { label: "Total Revenue", icon: DollarSign },
  ],
  [
    { label: "Total Staff", icon: Briefcase },
    { label: "Active Staff", icon: User },
    { label: "Departments", icon: Building2 },
  ],
];

// ── Page ────────────────────────────────────────────────────────────────────
export default function UserManagementPage() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<AnyUser[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<AnyUser | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    const s = localStorage.getItem(KEYS[tab]);
    setData(s ? JSON.parse(s) : []);
    setSearch("");
  }, [tab]);

  const save = (u: AnyUser[]) => {
    setData(u);
    localStorage.setItem(KEYS[tab], JSON.stringify(u));
  };

  const handleAdd = () => {
    save([...data, { ...form, id: Date.now().toString() } as AnyUser]);
    setModal(null);
    setForm({});
  };
  const handleEdit = () => {
    if (!selected) return;
    save(data.map((u) => (u.id === selected.id ? { ...u, ...form } : u)));
    setModal(null);
    setSelected(null);
    setForm({});
  };
  const handleDelete = () => {
    if (!selected) return;
    save(data.filter((u) => u.id !== selected.id));
    setModal(null);
    setSelected(null);
  };

  const filtered = data.filter((u) =>
    Object.values(u).join(" ").toLowerCase().includes(search.toLowerCase()),
  );
  const fields = FIELDS[tab];
  const stats = STATS_CONFIG[tab];

  const renderForm = (onSubmit: () => void, label: string) => (
    <>
      <div className="grid grid-cols-2 gap-4 mb-5">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
              {f.label}
            </label>
            {f.type === "select" ? (
              <select
                value={form[f.key] || ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className={inputCls}
              >
                <option value="">Select...</option>
                {f.options?.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                type={f.type || "text"}
                value={form[f.key] || ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.label}
                className={inputCls}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => {
            setModal(null);
            setForm({});
          }}
          className="px-5 py-2 text-xs font-semibold border-2 border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="px-5 py-2 text-xs font-bold bg-[#C9A36A] hover:bg-[#A8834A] text-white rounded-lg"
        >
          {label}
        </button>
      </div>
    </>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-[#2B2B2B]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            User Management
          </h1>
          <p className="text-xs font-medium text-[#2B2B2B]/50 mt-0.5">
            {data.length} {TAB_LABELS[tab].toLowerCase()} registered
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setForm({});
              setModal("add");
            }}
            className="flex items-center gap-1.5 bg-[#C9A36A] hover:bg-[#A8834A] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={13} /> {ADD_LABELS[tab]}
          </button>
          <button
            onClick={() => exportCSV(data, TAB_LABELS[tab])}
            className="flex items-center gap-1.5 border-2 border-[#C9A36A]/40 text-[#C9A36A] text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#C9A36A]/5 transition-colors"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TAB_LABELS.map((t, i) => {
          const Icon = TAB_ICONS[i];
          return (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${tab === i ? "bg-[#C9A36A] text-white shadow-sm" : "border-2 border-[#C9A36A]/30 text-[#2B2B2B] hover:border-[#C9A36A]"}`}
            >
              <Icon size={13} /> {t}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          const count = s.label.startsWith("Total")
            ? filtered.length
            : s.label === "Verified Owners"
              ? filtered.filter(
                  (u) =>
                    (u as unknown as Record<string, string>)["status"] ===
                    "Verified",
                ).length
              : s.label === "Active Leases" || s.label === "Active Staff"
                ? filtered.filter(
                    (u) =>
                      (u as unknown as Record<string, string>)["status"] ===
                      "Active",
                  ).length
                : "—";
          return (
            <div
              key={s.label}
              className="bg-white border-2 border-[#C9A36A]/30 rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 bg-[#C9A36A]/10 rounded-lg flex items-center justify-center">
                <Icon size={15} className="text-[#C9A36A]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#2B2B2B]/50 uppercase tracking-wider">
                  {s.label}
                </p>
                <p className="text-xl font-bold text-[#2B2B2B]">{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-xs mb-5">
        <Search
          size={13}
          className="absolute left-3 top-2.5 text-[#2B2B2B]/40"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${TAB_LABELS[tab].toLowerCase()}...`}
          className="w-full pl-8 pr-3 py-2 text-xs border-2 border-[#C9A36A]/30 rounded-lg focus:border-[#C9A36A] outline-none text-[#2B2B2B]"
        />
      </div>

      {/* ── TAB 0: Property Owners — CARD GRID ── */}
      {tab === 0 &&
        (filtered.length === 0 ? (
          <div className="py-16 text-center border-2 border-[#C9A36A]/20 border-dashed rounded-2xl">
            <Building2 size={32} className="text-[#C9A36A]/40 mx-auto mb-3" />
            <p className="text-sm font-bold text-[#2B2B2B]">
              No property owners yet
            </p>
            <p className="text-xs text-[#2B2B2B]/40 mt-1">
              Click &quot;Add Owner&quot; to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((u) => (
              <OwnerCard
                key={u.id}
                u={u as Owner}
                onEdit={() => {
                  setSelected(u);
                  setForm(u as unknown as Record<string, string>);
                  setModal("edit");
                }}
                onDelete={() => {
                  setSelected(u);
                  setModal("delete");
                }}
              />
            ))}
          </div>
        ))}

      {/* ── TAB 1: Tenants — TABLE ── */}
      {tab === 1 && (
        <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={32} className="text-blue-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-[#2B2B2B]">No tenants yet</p>
              <p className="text-xs text-[#2B2B2B]/40 mt-1">
                Click &quot;Add Tenant&quot; to get started
              </p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-blue-50">
                  <tr>
                    {[
                      "Tenant",
                      "Workspace",
                      "Status",
                      "Start Date",
                      "End Date",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left text-[10px] font-bold text-blue-400 uppercase tracking-wider px-4 py-3"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <TenantRow
                      key={u.id}
                      u={u as Tenant}
                      onEdit={() => {
                        setSelected(u);
                        setForm(u as unknown as Record<string, string>);
                        setModal("edit");
                      }}
                      onDelete={() => {
                        setSelected(u);
                        setModal("delete");
                      }}
                    />
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 border-t border-blue-50 bg-blue-50/30">
                <p className="text-[11px] font-medium text-[#2B2B2B]/50">
                  Showing {filtered.length} of {data.length} tenants
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB 2: Staff — TABLE ── */}
      {tab === 2 && (
        <div className="bg-white border-2 border-purple-200 rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Briefcase size={32} className="text-purple-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-[#2B2B2B]">
                No staff accounts yet
              </p>
              <p className="text-xs text-[#2B2B2B]/40 mt-1">
                Click &quot;Add Staff&quot; to get started
              </p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-purple-50">
                  <tr>
                    {[
                      "Staff",
                      "Role",
                      "Department",
                      "Status",
                      "Last Login",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left text-[10px] font-bold text-purple-400 uppercase tracking-wider px-4 py-3"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <StaffRow
                      key={u.id}
                      u={u as Staff}
                      onEdit={() => {
                        setSelected(u);
                        setForm(u as unknown as Record<string, string>);
                        setModal("edit");
                      }}
                      onDelete={() => {
                        setSelected(u);
                        setModal("delete");
                      }}
                    />
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 border-t border-purple-50 bg-purple-50/30">
                <p className="text-[11px] font-medium text-[#2B2B2B]/50">
                  Showing {filtered.length} of {data.length} staff
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modals */}
      {modal === "add" && (
        <Modal
          title={ADD_LABELS[tab]}
          onClose={() => {
            setModal(null);
            setForm({});
          }}
        >
          {renderForm(handleAdd, "Add")}
        </Modal>
      )}
      {modal === "edit" && selected && (
        <Modal
          title={`Edit ${TAB_LABELS[tab].slice(0, -1)}`}
          onClose={() => {
            setModal(null);
            setForm({});
          }}
        >
          {renderForm(handleEdit, "Save Changes")}
        </Modal>
      )}
      {modal === "delete" && selected && (
        <Modal title="Delete User" onClose={() => setModal(null)}>
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <p className="text-sm font-bold text-[#2B2B2B] mb-1">
              Delete this user?
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
