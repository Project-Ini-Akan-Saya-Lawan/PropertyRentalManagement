"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError("Login dengan Google gagal. Silakan coba lagi.");
      setTimeout(() => router.push("/login?error=google_failed"), 1500);
      return;
    }

    // Token dari query string cuma bawa identitas, ambil data user lengkap
    // dengan token itu supaya konsisten dengan flow login manual.
    fetch(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Gagal mengambil data user.");
        return r.json();
      })
      .then((result) => {
        const user = result.data;
        if (!user) throw new Error("Data user tidak ditemukan.");

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isLoggedIn", "true");

        if (user.role_id === 1) {
          localStorage.setItem("isAdmin", "true");
          router.push("/admin/dashboard");
        } else {
          router.push("/account");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Terjadi kesalahan saat menyelesaikan login. Silakan coba lagi.");
        setTimeout(() => router.push("/login?error=google_failed"), 1500);
      });
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="text-center">
        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          <>
            <div className="w-8 h-8 mx-auto mb-4 border-2 border-[#C9A36A] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Menyelesaikan proses login...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}