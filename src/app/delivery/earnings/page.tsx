"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMyDeliveryBoy } from "@/lib/delivery";
import { formatMoney } from "@/lib/utils";
import { DELIVERY_EARNING_PER_ORDER } from "@/lib/config";
import type { DeliveryBoy, Order } from "@/lib/types";

type Range = "day" | "week" | "month";

function startOf(range: Range): Date {
  const d = new Date();
  if (range === "day") {
    d.setHours(0, 0, 0, 0);
  } else if (range === "week") {
    const day = d.getDay(); // 0 = Sunday
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
  } else {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

export default function EarningsPage() {
  const [me, setMe] = useState<DeliveryBoy | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("day");

  useEffect(() => {
    const load = async () => {
      const db = await getMyDeliveryBoy();
      setMe(db);
      if (!db) {
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("delivery_boy_id", db.id)
        .eq("status", "delivered")
        .order("created_at", { ascending: false });
      setOrders((data as Order[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const from = startOf(range);
    return orders.filter((o) => new Date(o.created_at) >= from);
  }, [orders, range]);

  const earnings = filtered.length * DELIVERY_EARNING_PER_ORDER;
  const totalEarnings = orders.length * DELIVERY_EARNING_PER_ORDER;

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Earnings</h1>
      <p className="text-muted text-sm mb-4">
        {formatMoney(DELIVERY_EARNING_PER_ORDER)} per completed delivery.
      </p>

      <div className="flex gap-2 mb-4">
        {(["day", "week", "month"] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`chip text-xs ${
              range === r ? "bg-brand text-white" : "bg-bg-card text-muted"
            }`}
          >
            {r === "day" ? "Today" : r === "week" ? "This Week" : "This Month"}
          </button>
        ))}
      </div>

      <div className="card p-5 mb-4">
        <p className="text-muted text-sm">
          {range === "day" ? "Today's" : range === "week" ? "This week's" : "This month's"}{" "}
          earnings
        </p>
        <p className="text-3xl font-bold mt-2 text-brand">
          {loading ? (
            <span className="inline-block w-24 h-8 rounded-lg bg-bg-elevated animate-pulse" />
          ) : (
            formatMoney(earnings)
          )}
        </p>
        <p className="text-xs text-muted mt-1">{filtered.length} deliveries</p>
      </div>

      <div className="card p-5">
        <p className="text-muted text-sm">All-time earnings</p>
        <p className="text-2xl font-bold mt-2">
          {loading ? (
            <span className="inline-block w-24 h-7 rounded-lg bg-bg-elevated animate-pulse" />
          ) : (
            formatMoney(totalEarnings)
          )}
        </p>
        <p className="text-xs text-muted mt-1">{orders.length} deliveries</p>
      </div>

      {!loading && !me && (
        <p className="text-muted text-sm text-center mt-6">
          Your delivery account isn&apos;t linked yet. Contact the admin.
        </p>
      )}
    </div>
  );
}
