"use client";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";
import type { Order } from "@/lib/types";

const ACTIVE_STATUSES = [
  "order_received",
  "cooking",
  "packing",
  "out_for_delivery",
  "arrived",
];

// Returns the current user's most recent active (undelivered) order, or null.
export async function getActiveOrder(): Promise<Order | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();

  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return null;

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", uid)
    .in("status", ACTIVE_STATUSES)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as Order;
}
