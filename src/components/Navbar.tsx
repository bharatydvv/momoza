"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/cart";
import { useUser } from "@/context/useUser";
import { ProfileMenu } from "./ProfileMenu";

export function Navbar({ onOffersClick }: { onOffersClick?: () => void }) {
  const { count, setOpen } = useCart();
  const { isLoggedIn, profile } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-bg-soft/95 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🥟</span>
          <span className="font-extrabold text-lg tracking-tight">
            Momo<span className="text-brand">za</span>
          </span>
        </Link>

        {/* Today's Offers */}
        <button
          onClick={onOffersClick}
          className="chip bg-brand-soft text-brand hover:bg-brand hover:text-white
            border border-brand/40 hidden sm:inline-flex"
        >
          🔥 Today&apos;s Offers
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="relative btn-ghost !px-3 !py-2"
            aria-label="Cart"
          >
            🛒
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand text-white text-xs
                min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>

          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-brand text-white font-bold
                  flex items-center justify-center"
                aria-label="Profile"
              >
                {(profile?.name || profile?.email || "U").charAt(0).toUpperCase()}
              </button>
              {menuOpen && (
                <ProfileMenu profile={profile} onClose={() => setMenuOpen(false)} />
              )}
            </div>
          ) : (
            <Link href="/login" className="btn-brand !py-2">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
