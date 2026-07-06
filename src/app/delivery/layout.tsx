"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/useUser";
import { cx } from "@/lib/utils";

const NAV = [
  { href: "/delivery", label: "My Orders", icon: "📦" },
  { href: "/delivery/delivered", label: "Delivered", icon: "✅" },
  { href: "/delivery/earnings", label: "Earnings", icon: "💰" },
  { href: "/delivery/profile", label: "Profile", icon: "👤" },
];

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading, isLoggedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const authorized = isLoggedIn && profile?.role === "delivery";

  useEffect(() => {
    if (loading) return;
    if (!authorized) router.replace("/login");
  }, [loading, authorized, router]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-sm">
        Checking delivery access…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header
        className="sticky top-0 z-30 bg-bg-soft/95 backdrop-blur border-b border-line
        h-14 flex items-center justify-between px-4"
      >
        <span className="font-bold">
          Momo<span className="text-brand">za</span> Delivery
        </span>
        <Link href="/" className="text-xs text-brand font-semibold">
          Store →
        </Link>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-3 sm:px-4 py-4 pb-24">
        {children}
      </main>

      <nav
        className="fixed bottom-0 inset-x-0 z-40 bg-bg-soft/95 backdrop-blur
        border-t border-line"
      >
        <div className="flex items-stretch justify-around h-16 max-w-2xl mx-auto">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cx(
                  "flex-1 flex flex-col items-center justify-center gap-0.5",
                  active ? "text-brand" : "text-muted"
                )}
              >
                <span className="text-xl">{n.icon}</span>
                <span className="text-[10px]">{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
