"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMyDeliveryBoy } from "@/lib/delivery";
import { formatMoney } from "@/lib/utils";
import type { DeliveryBoy, Order, Profile } from "@/lib/types";

export default function DeliveredOrdersPage() {
  const [me, setMe] = useState<DeliveryBoy | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        .eq("status", "delivered")
        .order("created_at", { ascending: false });
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
    load();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Delivered Orders</h1>
      <p className="text-muted text-sm mb-4">Your completed deliveries.</p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-bg-card animate-pulse" />
          ))}
        </div>
      ) : !me ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted gap-2">
          <span className="text-5xl">🛵</span>
          <p>Your delivery account isn&apos;t linked yet. Contact the admin.</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted gap-2">
          <span className="text-5xl">✅</span>
          <p>No deliveries completed yet.</p>
        </div>
      ) : (
        <div className="card divide-y divide-line">
          {orders.map((o) => (
            <div key={o.id} className="p-3.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  #{o.id.slice(-6)} · {profiles[o.user_id || ""]?.name || "Customer"}
                </p>
                <p className="text-xs text-muted truncate">
                  {new Date(o.created_at).toLocaleString()}
                </p>
              </div>
              <span className="text-brand font-semibold text-sm shrink-0">
                {formatMoney(o.total_amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
