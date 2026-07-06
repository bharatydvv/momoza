"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/utils";
import type { Offer, Product } from "@/lib/types";

const emptyForm = {
  id: "",
  title: "",
  description: "",
  image_url: "",
  price: "",
  discounted_price: "",
  product_ids: [] as string[],
};

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const supabase = createClient();
    const [offerRes, productRes] = await Promise.all([
      supabase.from("offers").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("name", { ascending: true }),
    ]);
    if (offerRes.data) setOffers(offerRes.data as Offer[]);
    if (productRes.data) setProducts(productRes.data as Product[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => setForm(emptyForm);

  const editOffer = (o: Offer) =>
    setForm({
      id: o.id,
      title: o.title,
      description: o.description || "",
      image_url: o.image_url || "",
      price: o.price != null ? String(o.price) : "",
      discounted_price: o.discounted_price != null ? String(o.discounted_price) : "",
      product_ids: o.product_ids || [],
    });

  const toggleProduct = (id: string) =>
    setForm((f) => ({
      ...f,
      product_ids: f.product_ids.includes(id)
        ? f.product_ids.filter((p) => p !== id)
        : [...f.product_ids, id],
    }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      price: form.price ? Number(form.price) : null,
      discounted_price: form.discounted_price ? Number(form.discounted_price) : null,
      product_ids: form.product_ids,
    };

    const { error } = form.id
      ? await supabase.from("offers").update(payload).eq("id", form.id)
      : await supabase.from("offers").insert(payload);

    if (error) setError(error.message);
    else {
      resetForm();
      await load();
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this offer?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("offers").delete().eq("id", id);
    if (error) setError(error.message);
    else await load();
  };

  const toggleActive = async (o: Offer) => {
    const supabase = createClient();
    await supabase.from("offers").update({ is_active: !o.is_active }).eq("id", o.id);
    await load();
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Offers</h1>
      <p className="text-muted text-sm mb-4">
        Combo offers shown in Today&apos;s Offers.
      </p>

      <form onSubmit={submit} className="card p-4 mb-6 space-y-3">
        <input
          className="input"
          placeholder="Offer title (e.g. 6 Steam Momo + Free Coldrink)"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <textarea
          className="input min-h-[70px] resize-none"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input"
            type="number"
            placeholder="Original price"
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
        <input
          className="input"
          placeholder="Image URL"
          value={form.image_url}
          onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
        />

        <div>
          <p className="text-xs text-muted mb-2">Included products</p>
          <div className="flex flex-wrap gap-2">
            {products.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => toggleProduct(p.id)}
                className={`chip text-xs ${
                  form.product_ids.includes(p.id)
                    ? "bg-brand text-white"
                    : "bg-bg-card text-muted"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-brand text-sm">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-brand flex-1">
            {saving ? "Saving…" : form.id ? "Update Offer" : "Add Offer"}
          </button>
          {form.id && (
            <button type="button" onClick={resetForm} className="btn-ghost">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="card divide-y divide-line">
        {loading ? (
          <div className="p-4">
            <div className="h-5 rounded bg-bg-elevated animate-pulse" />
          </div>
        ) : offers.length === 0 ? (
          <div className="p-8 text-center text-muted">No offers yet.</div>
        ) : (
          offers.map((o) => (
            <div key={o.id} className="p-3.5 flex flex-wrap items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-bg-elevated overflow-hidden shrink-0">
                {o.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={o.image_url}
                    alt={o.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-[140px]">
                <p className="font-medium text-sm">{o.title}</p>
                <p className="text-xs text-muted">
                  {o.discounted_price != null
                    ? formatMoney(o.discounted_price)
                    : o.price != null
                    ? formatMoney(o.price)
                    : "—"}
                </p>
              </div>
              <button
                onClick={() => toggleActive(o)}
                className={
                  o.is_active
                    ? "chip bg-green-500/15 text-green-400 text-xs"
                    : "chip bg-bg-elevated text-muted text-xs"
                }
              >
                {o.is_active ? "Active" : "Hidden"}
              </button>
              <button
                onClick={() => editOffer(o)}
                className="btn-ghost !px-3 !py-1.5 text-xs"
              >
                Edit
              </button>
              <button
                onClick={() => remove(o.id)}
                className="text-brand hover:text-brand-hover text-xs px-2"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
