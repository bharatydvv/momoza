"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/types";
import type { Order, OrderStatus, Profile } from "@/lib/types";

const STATUS_OPTIONS: OrderStatus[] = [
  "order_received",
  "cooking",
  "packing",
  "out_for_delivery",
  "arrived",
  "delivered",
  "cancelled",
];

// Admin controls the kitchen stages only; out_for_delivery → arrived → delivered
// is advanced from the Delivery Boy panel.
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  order_received: "cooking",
  cooking: "packing",
  packing: "out_for_delivery",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"" | "new" | OrderStatus>("");
  const [pincodeFilter, setPincodeFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    const supabase = createClient();
    const { data: orderData } = await supabase
      .from("orders")
      .select("*")
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

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter === "new" && o.status !== "order_received") return false;
      if (
        statusFilter &&
        statusFilter !== "new" &&
        o.status !== statusFilter
      )
        return false;
      if (
        pincodeFilter.trim() &&
        !(o.pincode || "").includes(pincodeFilter.trim())
      )
        return false;
      return true;
    });
  }, [orders, statusFilter, pincodeFilter]);

  const selected = orders.find((o) => o.id === selectedId) || null;

  const advance = async (order: Order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    const supabase = createClient();
    await supabase.from("orders").update({ status: next }).eq("id", order.id);
    await load();
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Orders</h1>
      <p className="text-muted text-sm mb-4">
        {orders.length} total order{orders.length === 1 ? "" : "s"}
      </p>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          className="input w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
        >
          <option value="">All Statuses</option>
          <option value="new">New Orders</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <input
          className="input w-auto"
          placeholder="Filter by pincode…"
          value={pincodeFilter}
          onChange={(e) => setPincodeFilter(e.target.value)}
        />
      </div>

      <div className="grid lg:grid-cols-[1fr,340px] gap-4">
        {/* Order list */}
        <div className="card divide-y divide-line overflow-hidden">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="h-5 rounded bg-bg-elevated animate-pulse" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted">No orders found.</div>
          ) : (
            filtered.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                className={`w-full text-left p-3.5 flex items-center gap-3 transition-colors ${
                  selectedId === o.id ? "bg-bg-elevated" : "hover:bg-bg-elevated/60"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    #{o.id.slice(-6)} · {profiles[o.user_id || ""]?.name || "Guest"}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {o.pincode ? `PIN ${o.pincode} · ` : ""}
                    {new Date(o.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="chip bg-bg-card text-xs shrink-0">
                  {ORDER_STATUS_LABEL[o.status]}
                </span>
                <span className="text-brand font-semibold text-sm shrink-0">
                  {formatMoney(o.total_amount)}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Detail panel */}
        <div className="card p-4">
          {!selected ? (
            <p className="text-muted text-sm text-center py-10">
              Select an order to view details.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-bold">Order #{selected.id.slice(-6)}</p>
                <p className="text-xs text-muted">
                  {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted mb-1">Customer</p>
                <p className="text-sm font-medium">
                  {profiles[selected.user_id || ""]?.name || "Guest"}
                </p>
                <p className="text-xs text-muted">
                  {selected.phone || profiles[selected.user_id || ""]?.phone}
                </p>
                <p className="text-xs text-muted">
                  {profiles[selected.user_id || ""]?.email}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted mb-1">Delivery Address</p>
                <p className="text-sm">{selected.address || "—"}</p>
                {selected.pincode && (
                  <p className="text-xs text-muted">PIN {selected.pincode}</p>
                )}
              </div>

              <div>
                <p className="text-xs text-muted mb-1">Items</p>
                <div className="space-y-1.5">
                  {selected.items.map((i) => (
                    <div
                      key={i.product_id}
                      className="flex justify-between text-sm"
                    >
                      <span className="truncate">
                        {i.name} × {i.quantity}
                      </span>
                      <span className="text-muted">
                        {formatMoney(i.price * i.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-line mt-2 pt-2">
                  <span>Total</span>
                  <span className="text-brand">
                    {formatMoney(selected.total_amount)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="chip bg-bg-card text-xs">
                  {ORDER_STATUS_LABEL[selected.status]}
                </span>
                {NEXT_STATUS[selected.status] && (
                  <button
                    onClick={() => advance(selected)}
                    className="btn-brand !py-1.5 text-sm"
                  >
                    Mark as {ORDER_STATUS_LABEL[NEXT_STATUS[selected.status]!]}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
