"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/utils";
import type { Order, Profile, Refund, RefundStatus } from "@/lib/types";

const STATUS_STYLE: Record<RefundStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  approved: "bg-green-500/15 text-green-400",
  rejected: "bg-brand/15 text-brand",
};

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [orders, setOrders] = useState<Record<string, Order>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"" | RefundStatus>("");

  const load = async () => {
    const supabase = createClient();
    const { data: refundData } = await supabase
      .from("refunds")
      .select("*")
      .order("created_at", { ascending: false });
    const list = (refundData as Refund[]) || [];

    const orderIds = Array.from(new Set(list.map((r) => r.order_id)));
    const userIds = Array.from(new Set(list.map((r) => r.user_id)));

    const [orderRes, profileRes] = await Promise.all([
      orderIds.length
        ? supabase.from("orders").select("*").in("id", orderIds)
        : Promise.resolve({ data: [] as Order[] }),
      userIds.length
        ? supabase.from("profiles").select("*").in("id", userIds)
        : Promise.resolve({ data: [] as Profile[] }),
    ]);

    const orderMap: Record<string, Order> = {};
    (orderRes.data || []).forEach((o) => {
      orderMap[(o as Order).id] = o as Order;
    });
    const profileMap: Record<string, Profile> = {};
    (profileRes.data || []).forEach((p) => {
      profileMap[(p as Profile).id] = p as Profile;
    });

    setRefunds(list);
    setOrders(orderMap);
    setProfiles(profileMap);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (refund: Refund, status: RefundStatus) => {
    const supabase = createClient();
    await supabase.from("refunds").update({ status }).eq("id", refund.id);
    await load();
  };

  const filtered = filter ? refunds.filter((r) => r.status === filter) : refunds;

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Refunds</h1>
      <p className="text-muted text-sm mb-4">
        Review and action refund requests from customers.
      </p>

      <div className="flex gap-2 mb-4">
        {(["", "pending", "approved", "rejected"] as const).map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilter(s)}
            className={`chip text-xs ${
              filter === s ? "bg-brand text-white" : "bg-bg-card text-muted"
            }`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
          </button>
        ))}
      </div>

      <div className="card divide-y divide-line">
        {loading ? (
          <div className="p-4">
            <div className="h-5 rounded bg-bg-elevated animate-pulse" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted">No refund requests found.</div>
        ) : (
          filtered.map((r) => {
            const order = orders[r.order_id];
            const profile = profiles[r.user_id];
            return (
              <div key={r.id} className="p-3.5 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[160px]">
                  <p className="font-medium text-sm">
                    {profile?.name || "Customer"} · Order #
                    {r.order_id.slice(-6)}
                  </p>
                  <p className="text-xs text-muted line-clamp-1">
                    {r.reason || "No reason provided."}
                  </p>
                </div>
                {order && (
                  <span className="text-brand font-semibold text-sm shrink-0">
                    {formatMoney(order.total_amount)}
                  </span>
                )}
                <span
                  className={`chip text-xs shrink-0 ${STATUS_STYLE[r.status]}`}
                >
                  {r.status}
                </span>
                {r.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => updateStatus(r, "approved")}
                      className="btn-ghost !px-3 !py-1.5 text-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(r, "rejected")}
                      className="text-brand hover:text-brand-hover text-xs px-2"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
