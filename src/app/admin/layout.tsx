"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/useUser";
import { cx } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/customers", label: "Customers", icon: "👥" },
  { href: "/admin/categories", label: "Categories", icon: "🗂️" },
  { href: "/admin/products", label: "Products", icon: "🥟" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/delivery", label: "Delivery", icon: "🛵" },
  { href: "/admin/offers", label: "Offers", icon: "🔥" },
  { href: "/admin/refunds", label: "Refunds", icon: "💸" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading, isLoggedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const authorized = isLoggedIn && profile?.role === "admin";

  useEffect(() => {
    if (loading) return;
    if (!authorized) router.replace("/login");
  }, [loading, authorized, router]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-sm">
        Checking admin access…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Desktop sidebar */}
      <aside className="w-56 shrink-0 border-r border-line bg-bg-soft hidden sm:flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-line shrink-0">
          <span className="font-extrabold text-lg tracking-tight">
            Momo<span className="text-brand">za</span>{" "}
            <span className="text-muted font-medium text-sm">Admin</span>
          </span>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cx(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors",
                pathname === n.href
                  ? "bg-brand text-white font-semibold shadow-glow"
                  : "text-muted hover:bg-bg-card hover:text-white"
              )}
            >
              <span>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="m-2 btn-ghost text-center text-sm shrink-0">
          ← Back to Store
        </Link>
      </aside>

      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <header
          className="sm:hidden sticky top-0 z-30 bg-bg-soft/95 backdrop-blur
          border-b border-line h-14 flex items-center px-4 justify-between"
        >
          <span className="font-bold">
            Momo<span className="text-brand">za</span> Admin
          </span>
          <Link href="/" className="text-xs text-brand font-semibold">
            Store →
          </Link>
        </header>
        <nav
          className="sm:hidden flex overflow-x-auto no-scrollbar gap-1.5 px-3 py-2
          border-b border-line bg-bg-soft/60 sticky top-14 z-20"
        >
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cx(
                "chip whitespace-nowrap text-xs shrink-0",
                pathname === n.href
                  ? "bg-brand text-white"
                  : "bg-bg-card text-muted"
              )}
            >
              {n.icon} {n.label}
            </Link>
          ))}
        </nav>

        <main className="p-4 sm:p-6 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
