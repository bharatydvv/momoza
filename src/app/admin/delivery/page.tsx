"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ORDER_STATUS_LABEL } from "@/lib/types";
import type { DeliveryBoy, Order, Profile } from "@/lib/types";

const emptyForm = { name: "", phone: "", email: "" };

export default function AdminDeliveryPage() {
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const supabase = createClient();
    const [dbRes, orderRes] = await Promise.all([
      supabase.from("delivery_boys").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    if (dbRes.data) setDeliveryBoys(dbRes.data as DeliveryBoy[]);
    if (orderRes.data) setOrders(orderRes.data as Order[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addDeliveryBoy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    const supabase = createClient();

    // The person must already have a Momoza account (sign up as a customer first),
    // then admin promotes that account to the delivery role.
    const { data: existingProfile, error: findError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", form.email.trim())
      .maybeSingle();

    if (findError || !existingProfile) {
      setError(
        "No account found for this email. Ask them to sign up first, then add them here."
      );
      setSaving(false);
      return;
    }

    const profile = existingProfile as Profile;

    const { error: roleError } = await supabase
      .from("profiles")
      .update({ role: "delivery" })
      .eq("id", profile.id);

    if (roleError) {
      setError(roleError.message);
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from("delivery_boys").insert({
      user_id: profile.id,
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim(),
    });

    if (insertError) setError(insertError.message);
    else {
      setForm(emptyForm);
      await load();
    }
    setSaving(false);
  };

  const toggleActive = async (db: DeliveryBoy) => {
    const supabase = createClient();
    await supabase
      .from("delivery_boys")
      .update({ is_active: !db.is_active })
      .eq("id", db.id);
    await load();
  };

  const assignOrder = async (orderId: string, deliveryBoyId: string) => {
    const supabase = createClient();
    await supabase
      .from("orders")
      .update({ delivery_boy_id: deliveryBoyId || null })
      .eq("id", orderId);
    await load();
  };

  // Orders ready to be assigned/reassigned to a rider.
  const assignableOrders = useMemo(
    () =>
      orders.filter((o) =>
        ["packing", "out_for_delivery", "arrived"].includes(o.status)
      ),
    [orders]
  );

  const statsFor = (dbId: string) => {
    const assigned = orders.filter((o) => o.delivery_boy_id === dbId);
    const delivered = assigned.filter((o) => o.status === "delivered").length;
    const pending = assigned.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length;
    return { delivered, pending, total: assigned.length };
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Delivery</h1>
      <p className="text-muted text-sm mb-4">
        Manage delivery boys and assign them to orders.
      </p>

      <form onSubmit={addDeliveryBoy} className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <input
          className="input flex-1"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <input
          className="input flex-1"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
        <input
          className="input flex-1"
          placeholder="Account email (must already have signed up)"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <button type="submit" disabled={saving} className="btn-brand shrink-0">
          {saving ? "Adding…" : "Add Delivery Boy"}
        </button>
      </form>
      {error && <p className="text-brand text-sm mb-4">{error}</p>}

      <div className="card divide-y divide-line mb-6">
        {loading ? (
          <div className="p-4">
            <div className="h-5 rounded bg-bg-elevated animate-pulse" />
          </div>
        ) : deliveryBoys.length === 0 ? (
          <div className="p-8 text-center text-muted">No delivery boys added yet.</div>
        ) : (
          deliveryBoys.map((db) => {
            const s = statsFor(db.id);
            return (
              <div key={db.id} className="p-3.5 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[140px]">
                  <p className="font-medium text-sm">{db.name}</p>
                  <p className="text-xs text-muted">{db.phone || db.email}</p>
                </div>
                <span className="chip bg-bg-card text-xs">
                  ✅ {s.delivered} delivered
                </span>
                <span className="chip bg-bg-card text-xs">
                  ⏳ {s.pending} pending
                </span>
                <button
                  onClick={() => toggleActive(db)}
                  className={
                    db.is_active
                      ? "chip bg-green-500/15 text-green-400 text-xs"
                      : "chip bg-bg-elevated text-muted text-xs"
                  }
                >
                  {db.is_active ? "Active" : "Inactive"}
                </button>
              </div>
            );
          })
        )}
      </div>

      <h2 className="text-lg font-bold mb-3">Assign Orders</h2>
      <div className="card divide-y divide-line">
        {loading ? (
          <div className="p-4">
            <div className="h-5 rounded bg-bg-elevated animate-pulse" />
          </div>
        ) : assignableOrders.length === 0 ? (
          <div className="p-8 text-center text-muted">
            No orders ready for assignment right now.
          </div>
        ) : (
          assignableOrders.map((o) => (
            <div key={o.id} className="p-3.5 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[140px]">
                <p className="font-medium text-sm">#{o.id.slice(-6)}</p>
                <p className="text-xs text-muted">
                  {ORDER_STATUS_LABEL[o.status]} · PIN {o.pincode || "—"}
                </p>
              </div>
              <select
                className="input w-auto"
                value={o.delivery_boy_id || ""}
                onChange={(e) => assignOrder(o.id, e.target.value)}
              >
                <option value="">Unassigned</option>
                {deliveryBoys
                  .filter((db) => db.is_active)
                  .map((db) => (
                    <option key={db.id} value={db.id}>
                      {db.name}
                    </option>
                  ))}
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
