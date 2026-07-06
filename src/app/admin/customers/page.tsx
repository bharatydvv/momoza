"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "customer")
        .order("created_at", { ascending: false });
      if (!error && data) setCustomers(data as Profile[]);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Customers</h1>
      <p className="text-muted text-sm mb-4">
        {customers.length} registered customer{customers.length === 1 ? "" : "s"}
      </p>

      <input
        className="input mb-4 max-w-sm"
        placeholder="Search by name, phone, email or address…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-line">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Phone</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="p-3" colSpan={4}>
                    <div className="h-4 rounded bg-bg-elevated animate-pulse" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted">
                  No customers found.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="p-3 font-medium">{c.name || "—"}</td>
                  <td className="p-3">{c.phone || "—"}</td>
                  <td className="p-3">{c.email || "—"}</td>
                  <td className="p-3 max-w-xs truncate">{c.address || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
