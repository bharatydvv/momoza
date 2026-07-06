"use client";

import Link from "next/link";
import { useCart } from "@/context/cart";
import { formatMoney } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, setOpen, setQty, remove, subtotal, count } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 animate-fade-in"
        onClick={() => setOpen(false)}
      />
      <aside className="relative w-full max-w-md bg-bg-soft border-l border-line
        flex flex-col animate-slide-up sm:animate-fade-in h-full">
        <div className="flex items-center justify-between px-4 h-14 border-b border-line">
          <h2 className="font-bold text-lg">Your Cart ({count})</h2>
          <button onClick={() => setOpen(false)} className="btn-ghost !px-3 !py-1.5">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted gap-2">
              <span className="text-5xl">🛒</span>
              <p>Your cart is empty</p>
              <button onClick={() => setOpen(false)} className="btn-brand mt-2">
                Browse Momos
              </button>
            </div>
          ) : (
            items.map((i) => (
              <div key={i.product_id} className="card p-3 flex gap-3 items-center">
                <div className="w-14 h-14 rounded-xl bg-bg-elevated overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {i.image_url && (
                    <img
                      src={i.image_url}
                      alt={i.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{i.name}</p>
                  <p className="text-brand text-sm">{formatMoney(i.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQty(i.product_id, i.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-bg-elevated hover:bg-line"
                  >
                    −
                  </button>
                  <span className="w-5 text-center">{i.quantity}</span>
                  <button
                    onClick={() => setQty(i.product_id, i.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-bg-elevated hover:bg-line"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => remove(i.product_id)}
                  className="text-muted hover:text-brand ml-1"
                  aria-label="Remove"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line p-4 space-y-3">
            <div className="flex justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span className="text-brand">{formatMoney(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="btn-brand w-full text-center block"
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
