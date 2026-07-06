"use client";

import { useEffect, useState } from "react";
import { fetchOffers } from "@/lib/data";
import { useCart } from "@/context/cart";
import { formatMoney } from "@/lib/utils";
import type { Offer } from "@/lib/types";

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const { add, setOpen } = useCart();

  useEffect(() => {
    fetchOffers().then((o) => {
      setOffers(o);
      setLoading(false);
    });
  }, []);

  const addOffer = (offer: Offer) => {
    add({
      product_id: `offer-${offer.id}`,
      name: offer.title,
      price: offer.discounted_price ?? offer.price ?? 0,
      image_url: offer.image_url,
    });
    setOpen(true);
  };

  return (
    <div className="px-3 sm:px-0 py-4">
      <h1 className="text-xl font-bold mb-1">🔥 Today&apos;s Offers</h1>
      <p className="text-muted text-sm mb-4">
        Combo deals only — grab them before they&apos;re gone.
      </p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-bg-card animate-pulse" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted gap-2">
          <span className="text-5xl">🔥</span>
          <p>No offers running right now.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {offers.map((o) => {
            const price = o.discounted_price ?? o.price ?? 0;
            const hasDiscount = o.price != null && price < o.price;
            return (
              <div key={o.id} className="card overflow-hidden flex">
                <div className="w-28 h-auto bg-bg-elevated shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {o.image_url && (
                    <img
                      src={o.image_url}
                      alt={o.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-3 flex-1 min-w-0 flex flex-col">
                  <p className="font-semibold leading-tight">{o.title}</p>
                  <p className="text-xs text-muted line-clamp-2 mt-1 flex-1">
                    {o.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-brand font-bold">{formatMoney(price)}</span>
                      {hasDiscount && (
                        <span className="text-muted text-xs line-through">
                          {formatMoney(o.price!)}
                        </span>
                      )}
                    </div>
                    <button onClick={() => addOffer(o)} className="btn-brand !py-1.5 text-sm">
                      Add +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
