"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchCategories, fetchProducts } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { cx } from "@/lib/utils";
import type { Category, Product } from "@/lib/types";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts()]).then(([cats, prods]) => {
      setCategories(cats);
      setProducts(prods);
      setActiveCat(cats[0]?.id ?? null);
      setLoading(false);
    });
  }, []);

  const visible = useMemo(
    () => products.filter((p) => p.category_id === activeCat),
    [products, activeCat]
  );

  const activeTitle = categories.find((c) => c.id === activeCat)?.title ?? "";

  return (
    <div className="flex gap-0 sm:gap-4">
      {/* Left sidebar — categories */}
      <aside className="w-24 sm:w-52 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)]
        overflow-y-auto no-scrollbar border-r border-line bg-bg-soft/40">
        <div className="p-2 space-y-1">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-bg-card animate-pulse" />
              ))
            : categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className={cx(
                    "w-full text-left px-2.5 py-2.5 rounded-xl text-xs sm:text-sm leading-tight transition-colors",
                    activeCat === c.id
                      ? "bg-brand text-white font-semibold shadow-glow"
                      : "text-muted hover:bg-bg-card hover:text-white"
                  )}
                >
                  {c.title}
                </button>
              ))}
        </div>
      </aside>

      {/* Right panel — products */}
      <section className="flex-1 min-w-0 px-3 sm:px-0 py-4">
        <div className="flex items-baseline justify-between mb-3">
          <h1 className="text-lg sm:text-xl font-bold">{activeTitle}</h1>
          <span className="text-xs text-muted">{visible.length} items</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-bg-card animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted gap-2">
            <span className="text-5xl">🥟</span>
            <p>No items in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
