"use client";

import { useEffect, useState } from "react";
import { getActiveOrder } from "@/lib/orders";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";
import { ORDER_FLOW, ORDER_STATUS_LABEL } from "@/lib/types";
import { cx } from "@/lib/utils";
import type { Order } from "@/lib/types";

const STEP_ICON: Record<string, string> = {
  cooking: "🍳",
  packing: "📦",
  out_for_delivery: "🛵",
  arrived: "📍",
};

export function TrackingBar() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setInterval> | undefined;

    const refresh = async () => {
      const o = await getActiveOrder();
      if (mounted) setOrder(o);
    };
    refresh();

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const channel = supabase
        .channel("active-order")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          () => refresh()
        )
        .subscribe();
      // Also refresh when a new order is placed in this tab.
      window.addEventListener("momoza:order-placed", refresh);
      return () => {
        mounted = false;
        supabase.removeChannel(channel);
        window.removeEventListener("momoza:order-placed", refresh);
      };
    }

    // Demo mode: poll to advance the simulated status.
    timer = setInterval(refresh, 3000);
    window.addEventListener("momoza:order-placed", refresh);
    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
      window.removeEventListener("momoza:order-placed", refresh);
    };
  }, []);

  if (!order) return null;

  const currentIdx = ORDER_FLOW.indexOf(order.status);

  return (
    <div className="fixed inset-x-0 bottom-16 sm:bottom-0 z-30 px-3 pb-2 pointer-events-none">
      <div className="mx-auto max-w-5xl pointer-events-auto">
        <div className="card bg-bg-elevated/95 backdrop-blur p-3 shadow-glow border-brand/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">
              🥟 Order on the way — {ORDER_STATUS_LABEL[order.status]}
            </p>
            <span className="text-xs text-muted">#{order.id.slice(-5)}</span>
          </div>
          <div className="flex items-center">
            {ORDER_FLOW.map((step, i) => {
              const done = i <= currentIdx;
              return (
                <div key={step} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={cx(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors",
                        done ? "bg-brand text-white" : "bg-bg-card text-muted"
                      )}
                    >
                      {STEP_ICON[step]}
                    </div>
                    <span
                      className={cx(
                        "text-[9px] mt-1 text-center leading-tight",
                        done ? "text-white" : "text-muted"
                      )}
                    >
                      {ORDER_STATUS_LABEL[step]}
                    </span>
                  </div>
                  {i < ORDER_FLOW.length - 1 && (
                    <div
                      className={cx(
                        "h-0.5 flex-1 -mt-4 transition-colors",
                        i < currentIdx ? "bg-brand" : "bg-line"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
