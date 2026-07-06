"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/context/useUser";
import { createClient } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/utils";
import type { Order, Refund, RefundStatus } from "@/lib/types";

const STATUS_STYLE: Record<RefundStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  approved: "bg-green-500/15 text-green-400",
  rejected: "bg-brand/15 text-brand",
};

function RefundsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId, loading, isLoggedIn } = useUser();

  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [reason, setReason] = useState("");
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const supabase = createClient();
    const [refundRes, orderRes] = await Promise.all([
      supabase
        .from("refunds")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "delivered")
        .order("created_at", { ascending: false }),
    ]);
    const refundList = (refundRes.data as Refund[]) || [];
    const orderList = (orderRes.data as Order[]) || [];
    setRefunds(refundList);

    // Only delivered orders without a pending/approved refund can be raised again.
    const claimedOrderIds = new Set(
      refundList.filter((r) => r.status !== "rejected").map((r) => r.order_id)
    );
    const eligible = orderList.filter((o) => !claimedOrderIds.has(o.id));
    setOrders(eligible);

    const preselect = searchParams.get("order");
    if (preselect && eligible.some((o) => o.id === preselect)) {
      setSelectedOrder(preselect);
    } else if (eligible.length > 0) {
      setSelectedOrder(eligible[0].id);
    }
    setFetching(false);
  };

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isLoggedIn, userId, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedOrder) {
      setError("Select an order to raise a refund for.");
      return;
    }
    if (!reason.trim()) {
      setError("Please describe the issue.");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("refunds").insert({
      order_id: selectedOrder,
      user_id: userId,
      reason: reason.trim(),
      status: "pending",
    });
    if (error) setError(error.message);
    else {
      setReason("");
      await load();
    }
    setSubmitting(false);
  };

  if (loading || !isLoggedIn) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted text-sm">
        Checking your account…
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-1">Your Refunds</h1>
      <p className="text-muted text-sm mb-4">
        Raise a refund request for a delivered order.
      </p>

      {!fetching && orders.length > 0 && (
        <form onSubmit={submit} className="card p-4 mb-5 space-y-3">
          <select
            className="input"
            value={selectedOrder}
            onChange={(e) => setSelectedOrder(e.target.value)}
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                #{o.id.slice(-6)} — {formatMoney(o.total_amount)}
              </option>
            ))}
          </select>
          <textarea
            className="input min-h-[70px] resize-none"
            placeholder="What went wrong?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {error && <p className="text-brand text-sm">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-brand w-full">
            {submitting ? "Submitting…" : "Request Refund"}
          </button>
        </form>
      )}

      <p className="text-sm font-semibold mb-2">Your Requests</p>
      {fetching ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-bg-card animate-pulse" />
          ))}
        </div>
      ) : refunds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted gap-2">
          <span className="text-4xl">💸</span>
          <p>No refund requests yet.</p>
        </div>
      ) : (
        <div className="card divide-y divide-line">
          {refunds.map((r) => (
            <div key={r.id} className="p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm truncate">
                  Order #{r.order_id.slice(-6)}
                </p>
                <p className="text-xs text-muted truncate">
                  {r.reason || "No reason provided."}
                </p>
              </div>
              <span
                className={`chip text-xs shrink-0 ${STATUS_STYLE[r.status]}`}
              >
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RefundsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-muted text-sm">
          Loading…
        </div>
      }
    >
      <RefundsContent />
    </Suspense>
  );
}
