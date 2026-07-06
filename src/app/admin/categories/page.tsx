"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";

const emptyForm = { id: "", title: "", sequence_number: 0 };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sequence_number", { ascending: true });
    if (!error && data) setCategories(data as Category[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => setForm(emptyForm);

  const editCategory = (c: Category) =>
    setForm({ id: c.id, title: c.title, sequence_number: c.sequence_number });

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
      sequence_number: Number(form.sequence_number) || 0,
    };

    const { error } = form.id
      ? await supabase.from("categories").update(payload).eq("id", form.id)
      : await supabase.from("categories").insert(payload);

    if (error) setError(error.message);
    else {
      resetForm();
      await load();
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this category? Products in it will become uncategorized."))
      return;
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) setError(error.message);
    else await load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = categories[index + dir];
    const current = categories[index];
    if (!target || !current) return;
    const supabase = createClient();
    await Promise.all([
      supabase
        .from("categories")
        .update({ sequence_number: target.sequence_number })
        .eq("id", current.id),
      supabase
        .from("categories")
        .update({ sequence_number: current.sequence_number })
        .eq("id", target.id),
    ]);
    await load();
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Categories</h1>
      <p className="text-muted text-sm mb-4">
        Add, edit or reorder categories shown in the sidebar.
      </p>

      <form onSubmit={submit} className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <input
          className="input flex-1"
          placeholder="Title (e.g. Mini Steam Momo)"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <input
          className="input sm:w-32"
          type="number"
          placeholder="Sequence #"
          value={form.sequence_number}
          onChange={(e) =>
            setForm((f) => ({ ...f, sequence_number: Number(e.target.value) }))
          }
        />
        <button type="submit" disabled={saving} className="btn-brand shrink-0">
          {saving ? "Saving…" : form.id ? "Update" : "Add Category"}
        </button>
        {form.id && (
          <button
            type="button"
            onClick={resetForm}
            className="btn-ghost shrink-0"
          >
            Cancel
          </button>
        )}
      </form>

      {error && <p className="text-brand text-sm mb-3">{error}</p>}

      <div className="card divide-y divide-line">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="h-5 rounded bg-bg-elevated animate-pulse" />
            </div>
          ))
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-muted">No categories yet.</div>
        ) : (
          categories.map((c, i) => (
            <div key={c.id} className="p-3 flex items-center gap-3">
              <div className="flex flex-col">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="text-muted hover:text-white disabled:opacity-30 leading-none"
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === categories.length - 1}
                  className="text-muted hover:text-white disabled:opacity-30 leading-none"
                  aria-label="Move down"
                >
                  ▼
                </button>
              </div>
              <span className="text-muted text-xs w-8 shrink-0">
                #{c.sequence_number}
              </span>
              <span className="flex-1 font-medium">{c.title}</span>
              <button
                onClick={() => editCategory(c)}
                className="btn-ghost !px-3 !py-1.5 text-xs"
              >
                Edit
              </button>
              <button
                onClick={() => remove(c.id)}
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
