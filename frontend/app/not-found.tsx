import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="relative w-16 h-16 mb-6">
        <Image
          src="/logos/rupiah-logo.png"
          alt="Rupiah Building"
          fill
          className="object-contain"
        />
      </div>
      <h1 className="font-serif text-6xl font-bold text-[#C9A36A] mb-3">404</h1>
      <p className="text-lg font-semibold text-[#2B2B2B] mb-2">
        Page not found
      </p>
      <p className="text-sm text-gray-400 mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="bg-[#C9A36A] hover:bg-[#A8834A] text-white font-semibold text-sm px-6 py-2.5 rounded-md transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/workspace"
          className="border border-[#C9A36A] text-[#C9A36A] font-semibold text-sm px-6 py-2.5 rounded-md hover:bg-[#C9A36A]/5 transition-colors"
        >
          View Workspaces
        </Link>
      </div>
    </div>
  );
}
