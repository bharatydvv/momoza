"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/useUser";
import { createClient } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/utils";
import type { CoinTransaction } from "@/lib/types";

export default function WalletPage() {
  const router = useRouter();
  const { profile, userId, loading, isLoggedIn } = useUser();
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("coin_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setTransactions((data as CoinTransaction[]) || []);
      setFetching(false);
    };
    load();
  }, [loading, isLoggedIn, userId, router]);

  if (loading || !isLoggedIn) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted text-sm">
        Checking your account…
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-1">Your Coins</h1>
      <p className="text-muted text-sm mb-4">
        Earn coins on every order and redeem them at checkout.
      </p>

      <div className="card p-6 mb-5 text-center">
        <p className="text-muted text-sm">Current Balance</p>
        <p className="text-4xl font-bold text-brand mt-2">
          🪙 {profile?.coins_balance ?? 0}
        </p>
      </div>

      <p className="text-sm font-semibold mb-2">Transaction History</p>
      {fetching ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-bg-card animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted gap-2">
          <span className="text-4xl">🪙</span>
          <p>No coin activity yet.</p>
        </div>
      ) : (
        <div className="card divide-y divide-line">
          {transactions.map((t) => {
            const net = t.coins_earned - t.coins_redeemed;
            return (
              <div key={t.id} className="p-3.5 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm truncate">{t.note || "Coin activity"}</p>
                  <p className="text-xs text-muted">
                    {new Date(t.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold shrink-0 ${
                    net >= 0 ? "text-green-400" : "text-brand"
                  }`}
                >
                  {net >= 0 ? "+" : ""}
                  {net}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
