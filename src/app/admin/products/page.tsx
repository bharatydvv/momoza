"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/utils";
import type { Category, Product } from "@/lib/types";

const emptyForm = {
  id: "",
  name: "",
  description: "",
  price: "",
  discounted_price: "",
  category_id: "",
  image_url: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const supabase = createClient();
    const [prodRes, catRes] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sequence_number", { ascending: true }),
    ]);
    if (prodRes.data) setProducts(prodRes.data as Product[]);
    if (catRes.data) setCategories(catRes.data as Category[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => setForm(emptyForm);

  const editProduct = (p: Product) =>
    setForm({
      id: p.id,
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      discounted_price: p.discounted_price != null ? String(p.discounted_price) : "",
      category_id: p.category_id || "",
      image_url: p.image_url || "",
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.price) {
      setError("Name and price are required.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price) || 0,
      discounted_price: form.discounted_price ? Number(form.discounted_price) : null,
      category_id: form.category_id || null,
      image_url: form.image_url.trim() || null,
    };

    const { error } = form.id
      ? await supabase.from("products").update(payload).eq("id", form.id)
      : await supabase.from("products").insert(payload);

    if (error) setError(error.message);
    else {
      resetForm();
      await load();
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) setError(error.message);
    else await load();
  };

  const toggleActive = async (p: Product) => {
    const supabase = createClient();
    await supabase
      .from("products")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    await load();
  };

  const previewPrice = form.discounted_price ? Number(form.discounted_price) : Number(form.price) || 0;
  const previewHasDiscount =
    form.discounted_price !== "" && Number(form.discounted_price) < Number(form.price);

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Products</h1>
      <p className="text-muted text-sm mb-4">
        Add, edit or remove products shown on the storefront.
      </p>

      <div className="grid lg:grid-cols-[1fr,260px] gap-5 mb-6">
        <form onSubmit={submit} className="card p-4 space-y-3">
          <input
            className="input"
            placeholder="Product name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="input"
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
            <input
              className="input"
              type="number"
              placeholder="Discounted price"
              value={form.discounted_price}
              onChange={(e) =>
                setForm((f) => ({ ...f, discounted_price: e.target.value }))
              }
            />
          </div>
          <select
            className="input"
            value={form.category_id}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Image URL"
            value={form.image_url}
            onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
          />

          {error && <p className="text-brand text-sm">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-brand flex-1">
              {saving ? "Saving…" : form.id ? "Update Product" : "Add Product"}
            </button>
            {form.id && (
              <button type="button" onClick={resetForm} className="btn-ghost">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Live card preview */}
        <div>
          <p className="text-xs text-muted mb-2">Live preview</p>
          <div className="card overflow-hidden w-full max-w-[220px]">
            <div className="relative aspect-square w-full bg-bg-elevated overflow-hidden">
              {form.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.image_url}
                  alt={form.name || "Preview"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  🥟
                </div>
              )}
              {previewHasDiscount && (
                <span
                  className="absolute top-2 left-2 bg-brand text-white text-[10px]
                  font-bold px-2 py-0.5 rounded-full"
                >
                  SAVE {formatMoney(Number(form.price) - previewPrice)}
                </span>
              )}
            </div>
            <div className="p-2.5">
              <p className="font-semibold text-sm leading-tight line-clamp-1">
                {form.name || "Product name"}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-brand font-bold text-sm">
                  {formatMoney(previewPrice)}
                </span>
                {previewHasDiscount && (
                  <span className="text-muted text-xs line-through">
                    {formatMoney(Number(form.price))}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted leading-relaxed mt-2 line-clamp-3">
                {form.description || "Freshly made mini momos."}
              </p>
              <div className="btn-brand w-full mt-2.5 text-center text-sm">
                Add to Cart +
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-line">
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="p-3" colSpan={5}>
                    <div className="h-4 rounded bg-bg-elevated animate-pulse" />
                  </td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  No products yet.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="p-3 font-medium flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-bg-elevated overflow-hidden shrink-0">
                      {p.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    {p.name}
                  </td>
                  <td className="p-3 text-muted">
                    {categories.find((c) => c.id === p.category_id)?.title || "—"}
                  </td>
                  <td className="p-3">
                    <span className="text-brand font-semibold">
                      {formatMoney(p.discounted_price ?? p.price)}
                    </span>
                    {p.discounted_price != null && p.discounted_price < p.price && (
                      <span className="text-muted text-xs line-through ml-1">
                        {formatMoney(p.price)}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleActive(p)}
                      className={
                        p.is_active
                          ? "chip bg-green-500/15 text-green-400 text-xs"
                          : "chip bg-bg-elevated text-muted text-xs"
                      }
                    >
                      {p.is_active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => editProduct(p)}
                      className="btn-ghost !px-3 !py-1.5 text-xs mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="text-brand hover:text-brand-hover text-xs px-2"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
