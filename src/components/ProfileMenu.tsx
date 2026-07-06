"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";
import { formatMoney } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const LINKS = [
  { href: "/wallet", label: "Your Coins", icon: "🪙" },
  { href: "/orders", label: "Your Orders", icon: "📦" },
  { href: "/referral", label: "Referral & Points", icon: "🎁" },
  { href: "/refunds", label: "Your Refunds", icon: "💸" },
  { href: "/help", label: "Help / Support", icon: "❓" },
];

export function ProfileMenu({
  profile,
  onClose,
}: {
  profile: Profile | null;
  onClose: () => void;
}) {
  const router = useRouter();

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await createClient().auth.signOut();
    }
    onClose();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-11 z-50 w-60 card p-2 animate-fade-in">
        <div className="px-3 py-2 border-b border-line mb-1">
          <p className="font-semibold truncate">
            {profile?.name || "Momoza User"}
          </p>
          <p className="text-xs text-muted truncate">{profile?.email}</p>
          <p className="text-xs text-brand mt-1">
            🪙 {formatMoney(profile?.coins_balance ?? 0).replace("₹", "")} coins
          </p>
        </div>
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-bg-elevated text-sm"
          >
            <span>{l.icon}</span>
            {l.label}
          </Link>
        ))}
        {profile?.role === "admin" && (
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-bg-elevated text-sm"
          >
            <span>🛠️</span> Admin Panel
          </Link>
        )}
        {profile?.role === "delivery" && (
          <Link
            href="/delivery"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-bg-elevated text-sm"
          >
            <span>🛵</span> Delivery Panel
          </Link>
        )}
        <button
          onClick={signOut}
          className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl
            hover:bg-brand-soft text-sm text-brand mt-1"
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </>
  );
}
