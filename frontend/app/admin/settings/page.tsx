"use client";

import { useState, useRef } from "react";
import {
  User,
  Shield,
  Settings,
  CreditCard,
  Save,
  ChevronRight,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

const inputCls =
  "w-full border-2 border-[#C9A36A]/30 rounded-xl px-4 py-2.5 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none transition-all bg-white";
const selectCls =
  "border-2 border-[#C9A36A]/30 rounded-xl px-4 py-2.5 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none transition-all bg-white";

const SIDEBAR_ITEMS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "security", label: "Security", icon: Shield },
  { key: "payment", label: "Payment Gateways", icon: CreditCard },
];

// ── Payment Gateways Tab Component ─────────────────────────────────────────
const INITIAL_GATEWAYS = [
  {
    id: "bca",
    name: "BCA",
    desc: "Bank Central Asia — Transfer & Virtual Account",
    merchantId: "BCA-****",
    env: "Production",
    active: true,
  },
  {
    id: "mandiri",
    name: "Mandiri",
    desc: "Bank Mandiri — Transfer & Virtual Account",
    merchantId: "MDR-****",
    env: "Production",
    active: true,
  },
  {
    id: "bri",
    name: "BRI",
    desc: "Bank Rakyat Indonesia — Transfer",
    merchantId: "BRI-****",
    env: "Production",
    active: true,
  },
  {
    id: "bni",
    name: "BNI",
    desc: "Bank Negara Indonesia — Transfer",
    merchantId: "BNI-****",
    env: "Production",
    active: true,
  },
  {
    id: "visa",
    name: "Visa",
    desc: "Visa Credit & Debit Card",
    merchantId: "VIS-****",
    env: "Production",
    active: true,
  },
  {
    id: "master",
    name: "Mastercard",
    desc: "Mastercard Credit & Debit Card",
    merchantId: "MSC-****",
    env: "Production",
    active: true,
  },
  {
    id: "jcb",
    name: "JCB",
    desc: "JCB Credit Card",
    merchantId: "JCB-****",
    env: "Staging",
    active: false,
  },
];

interface Gateway {
  id: string;
  name: string;
  desc: string;
  merchantId: string;
  env: string;
  active: boolean;
}

function PaymentGatewaysTab() {
  const [gateways, setGateways] = useState<Gateway[]>(INITIAL_GATEWAYS);
  const [configModal, setConfigModal] = useState<Gateway | null>(null);

  const toggleActive = (id: string) => {
    setGateways((prev) =>
      prev.map((g) => (g.id === id ? { ...g, active: !g.active } : g)),
    );
  };

  const iCls =
    "w-full border-2 border-[#C9A36A]/30 rounded-xl px-3 py-2 text-sm text-[#2B2B2B] focus:border-[#C9A36A] outline-none";

  return (
    <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-base font-bold text-[#2B2B2B]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Payment Gateways
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {gateways.map((g) => (
          <div
            key={g.id}
            className={`border-2 rounded-xl p-4 transition-all ${g.active ? "border-[#C9A36A]/30" : "border-gray-100 opacity-60"}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F5F0E8] rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard size={18} className="text-[#C9A36A]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#2B2B2B]">{g.name}</p>
                  <p className="text-[10px] text-[#2B2B2B]/50">{g.desc}</p>
                </div>
              </div>
              <button
                onClick={() => toggleActive(g.id)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                  g.active
                    ? "bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                }`}
              >
                {g.active ? "ACTIVE" : "INACTIVE"}
              </button>
            </div>

            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-[#2B2B2B]/50">Merchant ID</span>
                <span className="font-semibold text-[#2B2B2B]">
                  {g.merchantId}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#2B2B2B]/50">Environment</span>
                <span
                  className={`font-semibold ${g.env === "Production" ? "text-green-600" : "text-orange-500"}`}
                >
                  {g.env}
                </span>
              </div>
            </div>

            <button
              onClick={() => setConfigModal(g)}
              className="w-full border-2 border-[#C9A36A]/30 text-[#2B2B2B] text-xs font-bold py-2 rounded-xl hover:bg-[#C9A36A]/5 hover:border-[#C9A36A] transition-colors"
            >
              Configure API
            </button>
          </div>
        ))}
      </div>

      {/* Configure Modal */}
      {configModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-[#2B2B2B]">
                Configure {configModal.name}
              </h3>
              <button
                onClick={() => setConfigModal(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                  API Key
                </label>
                <input
                  type="password"
                  defaultValue="••••••••••••••••"
                  className={iCls}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                  Secret Key
                </label>
                <input
                  type="password"
                  defaultValue="••••••••••••••••"
                  className={iCls}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                  Environment
                </label>
                <select defaultValue={configModal.env} className={iCls}>
                  <option>Production</option>
                  <option>Staging</option>
                </select>
              </div>
              <div className="bg-[#F5F0E8] rounded-xl p-3">
                <p className="text-[10px] text-[#2B2B2B]/60">
                  {/* TODO: PATCH /api/admin/settings/payment-gateways/:id */}
                  Changes will be applied after connecting to backend API.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfigModal(null)}
                  className="flex-1 border-2 border-gray-200 text-[#2B2B2B] text-xs font-semibold py-2.5 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setConfigModal(null)}
                  className="flex-1 bg-[#C9A36A] hover:bg-[#A8834A] text-white text-xs font-bold py-2.5 rounded-xl"
                >
                  Save Config
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    company: "PT Rupiah Building Jababeka",
  });

  const handleSave = () => {
    // TODO: PATCH /api/admin/settings/profile
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-[#2B2B2B]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          System Settings
        </h1>
        <p className="text-xs font-medium text-[#2B2B2B]/50 mt-0.5">
          Manage your administrative profile, security configurations, and
          global system preferences.
        </p>
      </div>

      <div className="flex gap-5">
        {/* ── Sidebar ── */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl overflow-hidden">
            {SIDEBAR_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-semibold transition-all ${
                    i < SIDEBAR_ITEMS.length - 1
                      ? "border-b border-[#C9A36A]/10"
                      : ""
                  } ${
                    activeTab === item.key
                      ? "bg-[#C9A36A]/10 text-[#C9A36A]"
                      : "text-[#2B2B2B]/60 hover:bg-[#F5F0E8] hover:text-[#2B2B2B]"
                  }`}
                >
                  <Icon
                    size={15}
                    strokeWidth={activeTab === item.key ? 2 : 1.5}
                  />
                  {item.label}
                  {activeTab === item.key && (
                    <ChevronRight size={12} className="ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 space-y-5">
          {/* ── Profile Tab ── */}
          {activeTab === "profile" && (
            <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-6">
              <h2
                className="text-base font-bold text-[#2B2B2B] mb-5"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Profile Settings
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-5 mb-6 pb-6 border-b border-[#C9A36A]/10">
                <div className="w-20 h-20 rounded-full bg-[#C9A36A]/20 flex items-center justify-center flex-shrink-0">
                  <User size={36} className="text-[#C9A36A]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#2B2B2B] mb-0.5">
                    {profile.fullName || "Admin User"}
                  </p>
                  <p className="text-xs text-[#2B2B2B]/50 mb-2">
                    {profile.jobTitle || "Administrator"}
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    Full Name
                  </label>
                  <input
                    value={profile.fullName}
                    onChange={(e) =>
                      setProfile({ ...profile, fullName: e.target.value })
                    }
                    placeholder="Your full name"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    Job Title
                  </label>
                  <input
                    value={profile.jobTitle}
                    onChange={(e) =>
                      setProfile({ ...profile, jobTitle: e.target.value })
                    }
                    placeholder="e.g. Senior Property Manager"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    Email Address
                  </label>
                  <input
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    placeholder="admin@rupiahbuilding.com"
                    type="email"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    Phone Number
                  </label>
                  <input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    placeholder="08xxxxxxxxxx"
                    className={inputCls}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    Company
                  </label>
                  <input
                    value={profile.company}
                    onChange={(e) =>
                      setProfile({ ...profile, company: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 text-xs font-bold px-6 py-2.5 rounded-xl transition-all ${
                    saved
                      ? "bg-green-500 text-white"
                      : "bg-[#C9A36A] hover:bg-[#A8834A] text-white"
                  }`}
                >
                  <Save size={13} />
                  {saved ? "Saved!" : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ── Security Tab ── */}
          {activeTab === "security" && (
            <div className="bg-white border-2 border-[#C9A36A]/30 rounded-2xl p-6">
              <h2
                className="text-base font-bold text-[#2B2B2B] mb-5"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Security Settings
              </h2>

              <div className="space-y-4 mb-5">
                <div>
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPw ? "text" : "password"}
                      placeholder="Enter current password"
                      className={inputCls + " pr-10"}
                    />
                    <button
                      onClick={() => setShowOldPw(!showOldPw)}
                      className="absolute right-3 top-3 text-[#2B2B2B]/40 hover:text-[#2B2B2B]"
                    >
                      {showOldPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      placeholder="Enter new password"
                      className={inputCls + " pr-10"}
                    />
                    <button
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-3 text-[#2B2B2B]/40 hover:text-[#2B2B2B]"
                    >
                      {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#2B2B2B] block mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfPw ? "text" : "password"}
                      placeholder="Confirm new password"
                      className={inputCls + " pr-10"}
                    />
                    <button
                      onClick={() => setShowConfPw(!showConfPw)}
                      className="absolute right-3 top-3 text-[#2B2B2B]/40 hover:text-[#2B2B2B]"
                    >
                      {showConfPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#F5F0E8] rounded-xl p-4 mb-5">
                <p className="text-xs font-bold text-[#C9A36A] mb-1">
                  Password Requirements
                </p>
                <ul className="space-y-1">
                  {[
                    "Minimum 8 characters",
                    "At least one uppercase letter",
                    "At least one number",
                    "At least one special character",
                  ].map((r) => (
                    <li
                      key={r}
                      className="text-[11px] text-[#2B2B2B]/60 flex items-center gap-1.5"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#C9A36A]/60 inline-block" />{" "}
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end">
                <button className="flex items-center gap-2 bg-[#C9A36A] hover:bg-[#A8834A] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors">
                  <Save size={13} /> Update Password
                </button>
              </div>
            </div>
          )}

          {/* ── Payment Gateways Tab ── */}
          {activeTab === "payment" && <PaymentGatewaysTab />}
        </div>
      </div>
    </div>
  );
}