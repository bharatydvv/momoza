"use client";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";
import { DEMO_CATEGORIES, DEMO_PRODUCTS, DEMO_OFFERS } from "@/lib/demo-data";
import type { Category, Product, Offer } from "@/lib/types";

export async function fetchCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return DEMO_CATEGORIES;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sequence_number", { ascending: true });
  if (error || !data || data.length === 0) return DEMO_CATEGORIES;
  return data as Category[];
}

export async function fetchProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return DEMO_PRODUCTS;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  if (error || !data || data.length === 0) return DEMO_PRODUCTS;
  return data as Product[];
}

export async function fetchOffers(): Promise<Offer[]> {
  if (!isSupabaseConfigured()) return DEMO_OFFERS;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  if (error || !data || data.length === 0) return DEMO_OFFERS;
  return data as Offer[];
}
