"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  X,
  Building2,
} from "lucide-react";

interface FloorPack {
  pack_id: number;
  pack_name: string;
  property_id: number;
  description: string;
  floor_range: string;
  price: number;
}

interface FormData {
  pack_name: string;
  property_id: number;
  description: string;
  floor_range: string;
  price: number;
}

const EMPTY: FormData = {
  pack_name: "",
  property_id: 1,
  description: "",
  floor_range: "",
  price: 0,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const TOWERS = [
  { id: 1, name: "Wowo Tower" },
  { id: 2, name: "Wowi Tower" },
];

const inputCls =
  "w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none transition-all";
const textareaCls =
  "w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none transition-all resize-none";

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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3
            className="font-bold text-[#2B2B2B]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function PackForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: FormData;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState<FormData>(initial);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
          Pack Name *
        </label>
        <input
          value={form.pack_name}
          onChange={(e) => setForm({ ...form, pack_name: e.target.value })}
          placeholder="e.g. Wowo Starter Pack"
          className={inputCls}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
          Tower *
        </label>
        <select
          value={form.property_id}
          onChange={(e) =>
            setForm({ ...form, property_id: Number(e.target.value) })
          }
          className={inputCls}
        >
          {TOWERS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
          Floor Range *
        </label>
        <input
          value={form.floor_range}
          onChange={(e) => setForm({ ...form, floor_range: e.target.value })}
          placeholder="e.g. 5-10"
          className={inputCls}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
          Price (Rp/year) *
        </label>
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          className={inputCls}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          placeholder="Describe this pack..."
          className={textareaCls}
        />
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button
          onClick={onCancel}
          className="px-5 py-2 text-xs font-semibold border-2 border-gray-200 rounded-lg text-[#2B2B2B] hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit(form)}
          disabled={!form.pack_name || !form.floor_range}
          className="px-5 py-2 text-xs font-bold bg-[#C9A36A] hover:bg-[#A8834A] text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

export default function PropertyManagementPage() {
  const [packs, setPacks] = useState<FloorPack[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState<"add" | "edit" | "view" | "delete" | null>(
    null,
  );
  const [selected, setSelected] = useState<FloorPack | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetchPacks = () => {
    setLoading(true);
    fetch(`${API_URL}/api/floor-packs`)
      .then((r) => r.json())
      .then((result) => {
        if (result.data) setPacks(result.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  const handleAdd = async (data: FormData) => {
    await fetch(`${API_URL}/api/floor-packs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    fetchPacks();
    setModal(null);
  };

  const handleEdit = async (data: FormData) => {
    if (!selected) return;
    await fetch(`${API_URL}/api/floor-packs/${selected.pack_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    fetchPacks();
    setModal(null);
    setSelected(null);
  };

  const handleDelete = async () => {
    if (!selected) return;
    await fetch(`${API_URL}/api/floor-packs/${selected.pack_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPacks();
    setModal(null);
    setSelected(null);
  };

  const getTowerName = (id: number) =>
    TOWERS.find((t) => t.id === id)?.name || `Tower ${id}`;

  const filtered = packs.filter((p) => {
    const ms =
      p.pack_name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "All" || getTowerName(p.property_id) === filter;
    return ms && mf;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-[#2B2B2B]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Property Management
          </h1>
          <p className="text-xs font-medium text-[#2B2B2B]/50 mt-0.5">
            {packs.length} total packages
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 bg-[#C9A36A] hover:bg-[#A8834A] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={14} /> Add Package
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={13}
            className="absolute left-3 top-2.5 text-[#2B2B2B]/40"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search package..."
            className="w-full pl-8 pr-3 py-2 text-xs border-2 border-[#C9A36A]/30 rounded-lg focus:border-[#C9A36A] outline-none bg-white text-[#2B2B2B]"
          />
        </div>
        <div className="flex gap-1">
          {["All", "Wowo Tower", "Wowi Tower"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${filter === f ? "bg-[#C9A36A] text-white" : "border-2 border-[#C9A36A]/30 text-[#2B2B2B] hover:border-[#C9A36A]"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F5F0E8]">
            <tr>
              {[
                "Pack ID",
                "Pack Name",
                "Tower",
                "Floor Range",
                "Price/Year",
                "Description",
                "Actions",
              ].map((h) => (
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
                  colSpan={7}
                  className="py-12 text-center text-sm text-[#2B2B2B]/30"
                >
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-[#C9A36A]/10 rounded-full flex items-center justify-center">
                      <Building2 size={22} className="text-[#C9A36A]" />
                    </div>
                    <p className="text-sm font-bold text-[#2B2B2B]">
                      No packages found
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.pack_id}
                  className="border-t border-[#C9A36A]/10 hover:bg-[#F5F0E8]/50 transition-colors"
                >
                  <td className="px-4 py-3 text-xs font-bold text-[#C9A36A]">
                    #{p.pack_id}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-[#2B2B2B]">
                    {p.pack_name}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#2B2B2B]/70">
                    {getTowerName(p.property_id)}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#2B2B2B]/70">
                    Floor {p.floor_range}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-[#2B2B2B]">
                    Rp {Number(p.price).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#2B2B2B]/70 max-w-[200px] truncate">
                    {p.description || "-"}
                  </td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === p.pack_id ? null : p.pack_id)
                      }
                      className="p-1.5 hover:bg-[#C9A36A]/10 rounded-lg transition-colors"
                    >
                      <MoreVertical size={14} className="text-[#2B2B2B]/50" />
                    </button>
                    {openMenu === p.pack_id && (
                      <div className="absolute right-8 top-2 bg-white border-2 border-[#C9A36A]/20 rounded-xl shadow-lg z-20 w-32 overflow-hidden">
                        <button
                          onClick={() => {
                            setSelected(p);
                            setModal("view");
                            setOpenMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#2B2B2B] hover:bg-[#C9A36A]/10"
                        >
                          <Eye size={13} className="text-[#C9A36A]" /> View
                        </button>
                        <button
                          onClick={() => {
                            setSelected(p);
                            setModal("edit");
                            setOpenMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#2B2B2B] hover:bg-[#C9A36A]/10"
                        >
                          <Pencil size={13} className="text-blue-500" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelected(p);
                            setModal("delete");
                            setOpenMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-[#C9A36A]/10 bg-[#F5F0E8]/30">
          <p className="text-[11px] font-medium text-[#2B2B2B]/50">
            Showing {filtered.length} of {packs.length} packages
          </p>
        </div>
      </div>

      {/* Add Modal */}
      {modal === "add" && (
        <Modal title="Add New Package" onClose={() => setModal(null)}>
          <PackForm
            initial={EMPTY}
            onSubmit={handleAdd}
            onCancel={() => setModal(null)}
            submitLabel="Add Package"
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {modal === "edit" && selected && (
        <Modal title="Edit Package" onClose={() => setModal(null)}>
          <PackForm
            initial={{
              pack_name: selected.pack_name,
              property_id: selected.property_id,
              description: selected.description || "",
              floor_range: selected.floor_range || "",
              price: selected.price,
            }}
            onSubmit={handleEdit}
            onCancel={() => setModal(null)}
            submitLabel="Save Changes"
          />
        </Modal>
      )}

      {/* View Modal */}
      {modal === "view" && selected && (
        <Modal title="Package Detail" onClose={() => setModal(null)}>
          <div className="space-y-3">
            {[
              ["Pack ID", `#${selected.pack_id}`],
              ["Pack Name", selected.pack_name],
              ["Tower", getTowerName(selected.property_id)],
              ["Floor Range", `Floor ${selected.floor_range}`],
              [
                "Price/Year",
                `Rp ${Number(selected.price).toLocaleString("id-ID")}`,
              ],
              ["Description", selected.description || "-"],
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
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setModal(null)}
              className="px-5 py-2 text-xs font-bold bg-[#C9A36A] hover:bg-[#A8834A] text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {modal === "delete" && selected && (
        <Modal title="Delete Package" onClose={() => setModal(null)}>
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <p className="text-sm font-bold text-[#2B2B2B] mb-1">
              Delete &quot;{selected.pack_name}&quot;?
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

      {openMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
      )}
    </div>
  );
}
