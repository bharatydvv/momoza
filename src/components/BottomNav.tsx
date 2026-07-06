"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart";
import { cx } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/offers", label: "Offers", icon: "🔥" },
  { href: "__cart", label: "Cart", icon: "🛒" },
  { href: "/orders", label: "Orders", icon: "📦" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { count, setOpen } = useCart();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-bg-soft/95 backdrop-blur
        border-t border-line"
    >
      <div className="flex items-stretch justify-around h-16 max-w-5xl mx-auto">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          if (item.href === "__cart") {
            return (
              <button
                key="cart"
                onClick={() => setOpen(true)}
                className="relative flex-1 flex flex-col items-center justify-center gap-0.5 text-muted"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px]">{item.label}</span>
                {count > 0 && (
                  <span className="absolute top-2 right-1/4 bg-brand text-white text-[10px]
                    min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cx(
                "flex-1 flex flex-col items-center justify-center gap-0.5",
                active ? "text-brand" : "text-muted"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
