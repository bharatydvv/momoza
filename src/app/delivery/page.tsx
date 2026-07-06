"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMyDeliveryBoy } from "@/lib/delivery";
import { formatMoney } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/types";
import type { DeliveryBoy, Order, OrderStatus, Profile } from "@/lib/types";

const ACTIVE_STATUSES: OrderStatus[] = ["packing", "out_for_delivery", "arrived"];

// out_for_delivery → arrived → delivered
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  out_for_delivery: "arrived",
  arrived: "delivered",
};

export default function MyOrdersPage() {
  const [me, setMe] = useState<DeliveryBoy | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const db = await getMyDeliveryBoy();
    setMe(db);
    if (!db) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: orderData } = await supabase
      .from("orders")
      .select("*")
      .eq("delivery_boy_id", db.id)
      .in("status", ACTIVE_STATUSES)
      .order("created_at", { ascending: true });
    const list = (orderData as Order[]) || [];

    const userIds = Array.from(
      new Set(list.map((o) => o.user_id).filter(Boolean))
    ) as string[];
    let profileMap: Record<string, Profile> = {};
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);
      (profs || []).forEach((p) => {
        profileMap[(p as Profile).id] = p as Profile;
      });
    }

    setOrders(list);
    setProfiles(profileMap);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const advance = async (order: Order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    const supabase = createClient();
    await supabase.from("orders").update({ status: next }).eq("id", order.id);
    await load();
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">My Orders</h1>
      <p className="text-muted text-sm mb-4">
        Orders assigned to you that are still on the way.
      </p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-bg-card animate-pulse" />
          ))}
        </div>
      ) : !me ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted gap-2">
          <span className="text-5xl">🛵</span>
          <p>Your delivery account isn&apos;t linked yet. Contact the admin.</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted gap-2">
          <span className="text-5xl">📦</span>
          <p>No orders assigned right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const customer = profiles[o.user_id || ""];
            const next = NEXT_STATUS[o.status];
            return (
              <div key={o.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm">#{o.id.slice(-6)}</p>
                  <span className="chip bg-bg-elevated text-xs">
                    {ORDER_STATUS_LABEL[o.status]}
                  </span>
                </div>

                <p className="text-sm font-medium">
                  {customer?.name || "Customer"}
                </p>
                <p className="text-xs text-muted">
                  {o.phone || customer?.phone || "No phone"}
                </p>
                <p className="text-xs text-muted mt-1">
                  {o.address || "No address"}
                  {o.pincode ? ` — ${o.pincode}` : ""}
                </p>

                <div className="border-t border-line mt-3 pt-2 space-y-1">
                  {o.items.map((i) => (
                    <div key={i.product_id} className="flex justify-between text-xs">
                      <span>
                        {i.name} × {i.quantity}
                      </span>
                      <span className="text-muted">
                        {formatMoney(i.price * i.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-brand font-bold text-sm">
                    {formatMoney(o.total_amount)}
                  </span>
                  {next && (
                    <button
                      onClick={() => advance(o)}
                      className="btn-brand !py-1.5 text-sm"
                    >
                      Mark {ORDER_STATUS_LABEL[next]}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
