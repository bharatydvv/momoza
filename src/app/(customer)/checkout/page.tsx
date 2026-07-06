"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/cart";
import { useUser } from "@/context/useUser";
import { createClient } from "@/lib/supabase/client";
import { COINS_EARN_RATE, COIN_VALUE, isSupabaseConfigured } from "@/lib/config";
import { formatMoney } from "@/lib/utils";
import type { CartItem } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const { profile, userId, loading, isLoggedIn } = useUser();

  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [redeemCoins, setRedeemCoins] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    if (profile) {
      setAddress(profile.address || "");
      setPhone(profile.phone || "");
    }
  }, [loading, isLoggedIn, profile, router]);

  const maxRedeemable = Math.max(
    0,
    Math.min(profile?.coins_balance ?? 0, Math.floor(subtotal))
  );
  const total = Math.max(0, subtotal - redeemCoins);
  const coinsEarned = Math.round(total * COINS_EARN_RATE);

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!address.trim() || !pincode.trim() || !phone.trim()) {
      setError("Please fill in address, pincode and phone.");
      return;
    }
    if (!userId || !profile) return;

    setPlacing(true);
    const supabase = createClient();

    const orderItems: CartItem[] = items.map((i) => ({
      product_id: i.product_id,
      name: i.name,
      price: i.price,
      image_url: i.image_url,
      quantity: i.quantity,
    }));

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        items: orderItems,
        total_amount: total,
        coins_redeemed: redeemCoins,
        coins_earned: coinsEarned,
        address: address.trim(),
        pincode: pincode.trim(),
        phone: phone.trim(),
        status: "order_received",
      })
      .select()
      .single();

    if (orderError || !order) {
      setError(orderError?.message || "Could not place order.");
      setPlacing(false);
      return;
    }

    await Promise.all([
      supabase
        .from("profiles")
        .update({
          coins_balance: profile.coins_balance - redeemCoins + coinsEarned,
        })
        .eq("id", userId),
      supabase.from("coin_transactions").insert({
        user_id: userId,
        order_id: order.id,
        coins_earned: coinsEarned,
        coins_redeemed: redeemCoins,
        note: `Order #${String(order.id).slice(-6)}`,
      }),
    ]);

    clear();
    window.dispatchEvent(new Event("momoza:order-placed"));
    router.push("/orders");
  };

  if (loading || !isLoggedIn) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted text-sm">
        Checking your account…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted gap-3 px-4">
        <span className="text-5xl">🛒</span>
        <p>Your cart is empty.</p>
        <Link href="/" className="btn-brand">
          Browse Momos
        </Link>
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="text-sm bg-brand-soft border border-brand/40 text-brand rounded-xl p-4">
          Demo mode: connect Supabase (see <code>.env.example</code>) to place
          real orders.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Checkout</h1>

      <div className="card p-4 mb-4 space-y-2">
        <p className="text-sm font-semibold mb-1">Order Summary</p>
        {items.map((i) => (
          <div key={i.product_id} className="flex justify-between text-sm">
            <span className="truncate">
              {i.name} × {i.quantity}
            </span>
            <span className="text-muted">
              {formatMoney(i.price * i.quantity)}
            </span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-semibold border-t border-line pt-2">
          <span>Subtotal</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
      </div>

      <form onSubmit={placeOrder} className="card p-4 space-y-3">
        <textarea
          className="input min-h-[70px] resize-none"
          placeholder="Delivery address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input"
            placeholder="Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        {maxRedeemable > 0 && (
          <div className="bg-bg-elevated rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">
                🪙 Redeem coins (you have {profile?.coins_balance})
              </span>
              <span className="text-brand text-sm font-semibold">
                -{formatMoney(redeemCoins)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={maxRedeemable}
              value={redeemCoins}
              onChange={(e) => setRedeemCoins(Number(e.target.value))}
              className="w-full accent-brand"
            />
          </div>
        )}

        <div className="border-t border-line pt-3 space-y-1">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-brand">{formatMoney(total)}</span>
          </div>
          <p className="text-xs text-muted">
            You&apos;ll earn ~{coinsEarned} coins ({Math.round(COINS_EARN_RATE * 100)}
            %) on this order — 1 coin = {formatMoney(COIN_VALUE)}.
          </p>
        </div>

        {error && <p className="text-brand text-sm">{error}</p>}

        <button type="submit" disabled={placing} className="btn-brand w-full">
          {placing ? "Placing order…" : `Place Order — ${formatMoney(total)}`}
        </button>
      </form>
    </div>
  );
}
