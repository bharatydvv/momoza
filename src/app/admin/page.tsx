"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  todayOrders: number;
  totalCustomers: number;
  pendingOrders: number;
}

const PENDING_STATUSES = [
  "order_received",
  "cooking",
  "packing",
  "out_for_delivery",
  "arrived",
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [todayOrders, totalCustomers, pendingOrders] = await Promise.all([
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startOfToday.toISOString()),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "customer"),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .in("status", PENDING_STATUSES),
      ]);

      setStats({
        todayOrders: todayOrders.count ?? 0,
        totalCustomers: totalCustomers.count ?? 0,
        pendingOrders: pendingOrders.count ?? 0,
      });
      setLoading(false);
    };
    load();
  }, []);

  const cards = [
    { label: "Today's Orders", value: stats?.todayOrders ?? 0, icon: "📅" },
    { label: "Total Customers", value: stats?.totalCustomers ?? 0, icon: "👥" },
    { label: "Pending Orders", value: stats?.pendingOrders ?? 0, icon: "⏳" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Dashboard</h1>
      <p className="text-muted text-sm mb-5">
        Quick overview of today&apos;s activity.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted text-sm">{c.label}</span>
              <span className="text-2xl">{c.icon}</span>
            </div>
            <p className="text-3xl font-bold mt-3 text-brand">
              {loading ? (
                <span className="inline-block w-12 h-8 rounded-lg bg-bg-elevated animate-pulse" />
              ) : (
                c.value
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
