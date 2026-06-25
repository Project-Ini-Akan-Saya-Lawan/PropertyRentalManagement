"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  X,
  Building2,
  Upload,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";

interface Property {
  id: string;
  name: string;
  tower: string;
  floor: string;
  type: string;
  capacity: number;
  price: number;
  status: "Available" | "Occupied" | "Maintenance";
  owner: string;
  createdAt: string;
  image: string;
  slug: string;
  description: string;
  longDescription: string;
  features: string[];
}
type FormData = Omit<Property, "id" | "createdAt" | "slug">;

const EMPTY: FormData = {
  name: "",
  tower: "",
  floor: "",
  type: "",
  capacity: 0,
  price: 0,
  status: "Available",
  owner: "",
  image: "",
  description: "",
  longDescription: "",
  features: ["", "", "", ""],
};

const STATUS_STYLE: Record<string, string> = {
  Available: "bg-green-50 text-green-700 border border-green-200",
  Occupied: "bg-blue-50 text-blue-700 border border-blue-200",
  Maintenance: "bg-orange-50 text-orange-700 border border-orange-200",
};

const STORAGE_KEY = "admin_properties";
const inputCls =
  "w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none transition-all";
const textareaCls =
  "w-full border-2 border-[#C9A36A]/30 rounded-lg px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none transition-all resize-none";

function toSlug(n: string) {
  return n
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
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
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function PropertyForm({
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
  const [name, setName] = useState(initial.name);
  const [tower, setTower] = useState(initial.tower);
  const [floor, setFloor] = useState(initial.floor);
  const [type, setType] = useState(initial.type);
  const [capacity, setCapacity] = useState(initial.capacity);
  const [price, setPrice] = useState(initial.price);
  const [status, setStatus] = useState(initial.status);
  const [owner, setOwner] = useState(initial.owner);
  const [image, setImage] = useState(initial.image);
  const [description, setDescription] = useState(initial.description);
  const [longDescription, setLongDescription] = useState(
    initial.longDescription,
  );
  const [features, setFeatures] = useState<string[]>(
    initial.features.length ? initial.features : ["", "", "", ""],
  );
  const imgRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const setFeature = (i: number, v: string) => {
    const f = [...features];
    f[i] = v;
    setFeatures(f);
  };

  return (
    <>
      {/* Section 1: Basic Info */}
      <p className="text-xs font-bold text-[#C9A36A] uppercase tracking-wider mb-3">
        Basic Information
      </p>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
            Property Name *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Wowo Starter Pack"
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
            Tower *
          </label>
          <select
            value={tower}
            onChange={(e) => setTower(e.target.value)}
            className={inputCls}
          >
            <option value="">Select tower</option>
            <option>Wowo Tower</option>
            <option>Wowi Tower</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
            Floor Range *
          </label>
          <input
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            placeholder="e.g. Floor 5-10"
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
            Workspace Type *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputCls}
          >
            <option value="">Select type</option>
            <option>Coworking Desk</option>
            <option>Business Executive</option>
            <option>Executive Suite</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
            Capacity (pax)
          </label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(+e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
            Monthly Price (Rp)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(+e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Property["status"])}
            className={inputCls}
          >
            <option>Available</option>
            <option>Occupied</option>
            <option>Maintenance</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
            Owner Name
          </label>
          <input
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Owner name"
            className={inputCls}
          />
        </div>
      </div>

      {/* Section 2: Description */}
      <p className="text-xs font-bold text-[#C9A36A] uppercase tracking-wider mb-3">
        Description
      </p>
      <div className="space-y-4 mb-5">
        <div>
          <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
            Short Description{" "}
            <span className="text-[#2B2B2B]/40 font-normal">
              (shown on card)
            </span>
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Ideal for startups and small teams"
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
            Full Description{" "}
            <span className="text-[#2B2B2B]/40 font-normal">
              (shown on detail page)
            </span>
          </label>
          <textarea
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            placeholder="Describe the workspace in detail — location, ambience, what makes it special..."
            rows={4}
            className={textareaCls}
          />
        </div>
      </div>

      {/* Section 3: Features */}
      <p className="text-xs font-bold text-[#C9A36A] uppercase tracking-wider mb-3">
        Features{" "}
        <span className="text-[#2B2B2B]/40 font-normal normal-case">
          (shown as bullet points on detail page)
        </span>
      </p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {features.map((f, i) => (
          <div key={i}>
            <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
              Feature {i + 1}
            </label>
            <input
              value={f}
              onChange={(e) => setFeature(i, e.target.value)}
              placeholder={
                [
                  "Available in floors " + floor,
                  "Ideal for teams",
                  "Shared lounge & pantry access",
                  "Hot desk with secure locker",
                ][i] || "Feature..."
              }
              className={inputCls}
            />
          </div>
        ))}
      </div>

      {/* Section 4: Image */}
      <p className="text-xs font-bold text-[#C9A36A] uppercase tracking-wider mb-3">
        Workspace Image *
      </p>
      <input
        ref={imgRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <div
        onClick={() => imgRef.current?.click()}
        className="border-2 border-dashed border-[#C9A36A]/40 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#C9A36A] hover:bg-[#C9A36A]/5 transition-all min-h-[100px] mb-5"
      >
        {image ? (
          <div className="relative w-full h-36 rounded-lg overflow-hidden">
            <Image src={image} alt="Preview" fill className="object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setImage("");
              }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
            >
              <X size={10} />
            </button>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 bg-[#C9A36A]/10 rounded-full flex items-center justify-center">
              <Upload size={18} className="text-[#C9A36A]" />
            </div>
            <p className="text-xs font-semibold text-[#2B2B2B]">
              Click to upload image
            </p>
            <p className="text-[10px] text-[#2B2B2B]/40">PNG, JPG up to 5MB</p>
          </>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-5 py-2 text-xs font-semibold border-2 border-gray-200 rounded-lg text-[#2B2B2B] hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() =>
            onSubmit({
              name,
              tower,
              floor,
              type,
              capacity,
              price,
              status,
              owner,
              image,
              description,
              longDescription,
              features: features.filter(Boolean),
            })
          }
          disabled={!name || !tower || !image}
          className="px-5 py-2 text-xs font-bold bg-[#C9A36A] hover:bg-[#A8834A] text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </>
  );
}

export default function PropertyManagementPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilter] = useState("All");
  const [modal, setModal] = useState<"add" | "edit" | "view" | "delete" | null>(
    null,
  );
  const [selected, setSelected] = useState<Property | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) setProperties(JSON.parse(s));
  }, []);

  const save = (updated: Property[]) => {
    setProperties(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const filtered = properties.filter((p) => {
    const ms =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus === "All" || p.status === filterStatus;
    return ms && mf;
  });

  const handleAdd = (data: FormData) => {
    save([
      {
        ...data,
        id: Date.now().toString(),
        slug: toSlug(data.name),
        createdAt: new Date().toLocaleDateString("en-GB"),
      },
      ...properties,
    ]);
    setModal(null);
  };

  const handleEdit = (data: FormData) => {
    if (!selected) return;
    save(
      properties.map((p) =>
        p.id === selected.id ? { ...p, ...data, slug: toSlug(data.name) } : p,
      ),
    );
    setModal(null);
    setSelected(null);
  };

  const handleDelete = () => {
    if (!selected) return;
    save(properties.filter((p) => p.id !== selected.id));
    setModal(null);
    setSelected(null);
  };

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
            {properties.length} total properties
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 bg-[#C9A36A] hover:bg-[#A8834A] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={14} /> Add Property
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
            placeholder="Search property or owner..."
            className="w-full pl-8 pr-3 py-2 text-xs border-2 border-[#C9A36A]/30 rounded-lg focus:border-[#C9A36A] outline-none bg-white text-[#2B2B2B]"
          />
        </div>
        <div className="flex gap-1">
          {["All", "Available", "Occupied", "Maintenance"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${filterStatus === s ? "bg-[#C9A36A] text-white" : "border-2 border-[#C9A36A]/30 text-[#2B2B2B] hover:border-[#C9A36A]"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F5F0E8]">
            <tr>
              {[
                "Image",
                "Property Name",
                "Tower",
                "Floor",
                "Type",
                "Capacity",
                "Price/mo",
                "Status",
                "Owner",
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-[#C9A36A]/10 rounded-full flex items-center justify-center">
                      <Building2 size={22} className="text-[#C9A36A]" />
                    </div>
                    <p className="text-sm font-bold text-[#2B2B2B]">
                      No properties yet
                    </p>
                    <p className="text-xs text-[#2B2B2B]/40">
                      Click &quot;Add Property&quot; to get started
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-[#C9A36A]/10 hover:bg-[#F5F0E8]/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="w-12 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.name}
                          width={48}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <ImageIcon size={14} className="text-gray-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-[#2B2B2B]">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#2B2B2B]/70">
                    {p.tower}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#2B2B2B]/70">
                    {p.floor}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#2B2B2B]/70">
                    {p.type}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#2B2B2B]/70">
                    {p.capacity} pax
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-[#2B2B2B]">
                    Rp {p.price.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_STYLE[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#2B2B2B]/70">
                    {p.owner}
                  </td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === p.id ? null : p.id)
                      }
                      className="p-1.5 hover:bg-[#C9A36A]/10 rounded-lg transition-colors"
                    >
                      <MoreVertical size={14} className="text-[#2B2B2B]/50" />
                    </button>
                    {openMenu === p.id && (
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
            Showing {filtered.length} of {properties.length} properties
          </p>
        </div>
      </div>

      {modal === "add" && (
        <Modal title="Add New Property" onClose={() => setModal(null)}>
          <PropertyForm
            initial={EMPTY}
            onSubmit={handleAdd}
            onCancel={() => setModal(null)}
            submitLabel="Add Property"
          />
        </Modal>
      )}
      {modal === "edit" && selected && (
        <Modal title="Edit Property" onClose={() => setModal(null)}>
          <PropertyForm
            initial={{
              name: selected.name,
              tower: selected.tower,
              floor: selected.floor,
              type: selected.type,
              capacity: selected.capacity,
              price: selected.price,
              status: selected.status,
              owner: selected.owner,
              image: selected.image,
              description: selected.description || "",
              longDescription: selected.longDescription || "",
              features: selected.features || ["", "", "", ""],
            }}
            onSubmit={handleEdit}
            onCancel={() => setModal(null)}
            submitLabel="Save Changes"
          />
        </Modal>
      )}
      {modal === "view" && selected && (
        <Modal title="Property Detail" onClose={() => setModal(null)}>
          {selected.image && (
            <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4">
              <Image
                src={selected.image}
                alt={selected.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="space-y-2.5">
            {(
              [
                ["Property Name", selected.name],
                ["Tower", selected.tower],
                ["Floor", selected.floor],
                ["Type", selected.type],
                ["Capacity", `${selected.capacity} pax`],
                [
                  "Monthly Price",
                  `Rp ${selected.price.toLocaleString("id-ID")}`,
                ],
                ["Status", selected.status],
                ["Owner", selected.owner],
                ["Short Description", selected.description || "—"],
                ["Full Description", selected.longDescription || "—"],
                [
                  "Features",
                  (selected.features || []).filter(Boolean).join(", ") || "—",
                ],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between py-2 border-b border-[#C9A36A]/10 last:border-0 gap-4"
              >
                <span className="text-xs font-semibold text-[#2B2B2B]/50 flex-shrink-0">
                  {label}
                </span>
                <span className="text-xs font-bold text-[#2B2B2B] text-right">
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
      {modal === "delete" && selected && (
        <Modal title="Delete Property" onClose={() => setModal(null)}>
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
      {openMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
      )}
    </div>
  );
}
