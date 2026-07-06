"use client";

import { createClient } from "@/lib/supabase/client";
import type { DeliveryBoy } from "@/lib/types";

// Returns the delivery_boys row linked to the currently signed-in delivery account.
export async function getMyDeliveryBoy(): Promise<DeliveryBoy | null> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return null;

  const { data, error } = await supabase
    .from("delivery_boys")
    .select("*")
    .eq("user_id", uid)
    .maybeSingle();

  if (error || !data) return null;
  return data as DeliveryBoy;
}
