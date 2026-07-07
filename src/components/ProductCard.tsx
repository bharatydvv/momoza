"use client";

import { useState } from "react";
import { useCart } from "@/context/cart";
import { formatMoney, cx } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const [expanded, setExpanded] = useState(false);
  const { add, setOpen } = useCart();

  const price = product.discounted_price ?? product.price;
  const hasDiscount =
    product.discounted_price != null && product.discounted_price < product.price;

  const addToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    add({
      product_id: product.id,
      name: product.name,
      price,
      image_url: product.image_url,
    });
    setOpen(true);
  };

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className={cx(
        "card text-left overflow-hidden transition-all duration-300 group",
        expanded ? "ring-1 ring-brand shadow-glow" : "hover:border-line/80"
      )}
    >
      <div className="relative aspect-square w-full bg-bg-elevated overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🥟
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-brand text-white text-[10px]
            font-bold px-2 py-0.5 rounded-full">
            SAVE {formatMoney(product.price - price)}
          </span>
        )}
      </div>

      <div className="p-2.5">
        <p className="font-semibold text-sm leading-tight line-clamp-1">
          {product.name}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-brand font-bold text-sm">{formatMoney(price)}</span>
          {hasDiscount && (
            <span className="text-muted text-xs line-through">
              {formatMoney(product.price)}
            </span>
          )}
        </div>

        {/* Expandable detail */}
        <div
          className={cx(
            "overflow-hidden transition-all duration-300",
            expanded ? "max-h-40 mt-2 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <p className="text-xs text-muted leading-relaxed">
            {product.description || "Freshly made mini momos."}
          </p>
          <div
            onClick={addToCart}
            className="btn-brand w-full mt-2.5 text-center text-sm cursor-pointer"
          >
            Add to Cart +
          </div>
        </div>

        {!expanded && (
          <div
            onClick={addToCart}
            className="mt-2 text-center text-xs font-semibold text-brand
              border border-brand/40 rounded-xl py-1.5 hover:bg-brand hover:text-white
              transition-colors cursor-pointer"
          >
            Add +
          </div>
        )}
      </div>
    </button>
  );
}
