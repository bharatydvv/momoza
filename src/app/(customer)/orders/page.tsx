"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/useUser";
import { createClient } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/types";
import type { Order } from "@/lib/types";

export default function YourOrdersPage() {
  const router = useRouter();
  const { userId, loading, isLoggedIn } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
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
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setOrders((data as Order[]) || []);
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
      <h1 className="text-xl font-bold mb-1">Your Orders</h1>
      <p className="text-muted text-sm mb-4">Track and review your past orders.</p>

      {fetching ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-bg-card animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
          <span className="text-5xl">📦</span>
          <p>No orders yet.</p>
          <Link href="/" className="btn-brand">
            Browse Momos
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm">#{o.id.slice(-6)}</p>
                <span className="chip bg-bg-elevated text-xs">
                  {ORDER_STATUS_LABEL[o.status]}
                </span>
              </div>
              <p className="text-xs text-muted mb-2">
                {new Date(o.created_at).toLocaleString()}
              </p>
              <div className="space-y-1">
                {o.items.map((i) => (
                  <div key={i.product_id} className="flex justify-between text-sm">
                    <span className="truncate">
                      {i.name} × {i.quantity}
                    </span>
                    <span className="text-muted">
                      {formatMoney(i.price * i.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-line mt-2 pt-2">
                <span className="text-brand font-bold text-sm">
                  {formatMoney(o.total_amount)}
                </span>
                {o.status === "delivered" && (
                  <Link
                    href={`/refunds?order=${o.id}`}
                    className="text-xs text-muted hover:text-brand"
                  >
                    Request Refund →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
