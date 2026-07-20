"use client";

import { useEffect, useState } from "react";
import { User, Pencil } from "lucide-react";

interface AdminProfile {
  fullName:  string;
  email:     string;
  phone:     string;
  company:   string;
  position:  string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<AdminProfile>({
    fullName: "", email: "", phone: "", company: "", position: "",
  });
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState<AdminProfile>(profile);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    // TODO: fetch from API
    // const res = await fetch("/api/admin/profile").then(r => r.json());
    // setProfile(res); setForm(res);
    setLoaded(true);
  }, []);

  const handleSave = async () => {
    // TODO: PATCH /api/admin/profile
    setProfile(form);
    setEditing(false);
  };

  const fields: { label: string; key: keyof AdminProfile }[] = [
    { label: "Full Name",      key: "fullName" },
    { label: "E-mail Address", key: "email" },
    { label: "Phone Number",   key: "phone" },
    { label: "Company",        key: "company" },
    { label: "Position",       key: "position" },
  ];

  return (
    <div>
      <h1
        className="text-3xl font-bold text-[#C9A36A] mb-6"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Settings
      </h1>

      <div className="bg-white border border-[#C9A36A]/30 rounded-xl p-6 max-w-md shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-[#C9A36A]">Profile Information</h2>
          <button
            onClick={() => { setEditing(!editing); setForm(profile); }}
            className="flex items-center gap-1.5 text-xs border border-gray-200 text-gray-500 hover:border-[#C9A36A] hover:text-[#C9A36A] px-3 py-1.5 rounded transition-colors"
          >
            <Pencil size={11} /> Edit Profile
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-14 h-14 rounded-full bg-[#C9A36A]/10 border border-[#C9A36A]/20 flex items-center justify-center mb-2">
            <User size={26} className="text-[#C9A36A]" />
          </div>
          <button className="text-xs text-[#C9A36A] hover:underline">Change Profile Picture</button>
        </div>

        {/* Fields */}
        {editing ? (
          <div className="space-y-3">
            {fields.map(({ label, key }) => (
              <div key={key}>
                <label className="text-[10px] text-gray-400 block mb-0.5">{label}</label>
                <input
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:border-[#C9A36A] outline-none"
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                className="flex-1 bg-[#C9A36A] hover:bg-[#A8834A] text-white text-xs font-semibold py-2 rounded-lg transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => { setEditing(false); setForm(profile); }}
                className="flex-1 border border-gray-200 text-gray-400 text-xs py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {fields.map(({ label, key }) => (
              <div key={key} className="flex gap-3">
                <span className="text-xs font-semibold text-gray-500 w-28 flex-shrink-0">{label}</span>
                <span className="text-xs text-gray-700">
                  {profile[key] || <span className="text-gray-300">—</span>}
                </span>
              </div>
            ))}
            <button className="text-xs text-[#C9A36A] hover:underline pt-1 block">
              Change Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
