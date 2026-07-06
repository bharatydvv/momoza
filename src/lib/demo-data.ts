import type { Category, Product, Offer } from "./types";

// Fallback demo content so the UI is fully browsable before Supabase is wired.
export const DEMO_CATEGORIES: Category[] = [
  { id: "c1", title: "Mini Steam Momo", sequence_number: 1, created_at: "" },
  { id: "c2", title: "Mini Fry Momo", sequence_number: 2, created_at: "" },
  { id: "c3", title: "Mini Kurkure Momo", sequence_number: 3, created_at: "" },
  { id: "c4", title: "Mini Peri Peri Momo", sequence_number: 4, created_at: "" },
  { id: "c5", title: "Mini Cheese Filled Momo", sequence_number: 5, created_at: "" },
  { id: "c6", title: "Mini Afghani Momo", sequence_number: 6, created_at: "" },
];

const img = (id: string) =>
  `https://images.unsplash.com/${id}?w=400&q=70&auto=format&fit=crop`;

export const DEMO_PRODUCTS: Product[] = [
  { id: "p1", name: "Veg Steam Momo", description: "Classic steamed veg momos, soft and juicy with house spicy chutney.", price: 90, discounted_price: 70, image_url: img("photo-1625938145312-c92c2f2b0d1a"), category_id: "c1", is_active: true, created_at: "" },
  { id: "p2", name: "Paneer Steam Momo", description: "Steamed momos stuffed with fresh spiced paneer.", price: 120, discounted_price: 99, image_url: img("photo-1601050690597-df0568f70950"), category_id: "c1", is_active: true, created_at: "" },
  { id: "p3", name: "Veg Fry Momo", description: "Crispy fried veg momos served with tangy sauce.", price: 100, discounted_price: 80, image_url: img("photo-1563379091339-03b21ab4a4f8"), category_id: "c2", is_active: true, created_at: "" },
  { id: "p4", name: "Chicken Fry Momo", description: "Golden fried chicken momos, crunchy outside soft inside.", price: 140, discounted_price: 120, image_url: img("photo-1496116218417-1a781b1c416c"), category_id: "c2", is_active: true, created_at: "" },
  { id: "p5", name: "Kurkure Momo", description: "Momos coated in crunchy kurkure crumbs.", price: 130, discounted_price: 110, image_url: img("photo-1568096889942-6eedde686635"), category_id: "c3", is_active: true, created_at: "" },
  { id: "p6", name: "Peri Peri Momo", description: "Spicy peri peri tossed momos for the heat lovers.", price: 130, discounted_price: 105, image_url: img("photo-1626074353765-517a681e40be"), category_id: "c4", is_active: true, created_at: "" },
  { id: "p7", name: "Cheese Filled Momo", description: "Molten cheese core in every bite.", price: 150, discounted_price: 130, image_url: img("photo-1585032226651-759b368d7246"), category_id: "c5", is_active: true, created_at: "" },
  { id: "p8", name: "Afghani Momo", description: "Creamy afghani gravy tossed momos.", price: 160, discounted_price: 135, image_url: img("photo-1534422298391-e4f8c172dddb"), category_id: "c6", is_active: true, created_at: "" },
];

export const DEMO_OFFERS: Offer[] = [
  { id: "o1", title: "6 Steam Momo + Free Coldrink", description: "Get 6 pcs steam momo with a free chilled coldrink.", image_url: img("photo-1625938145312-c92c2f2b0d1a"), product_ids: [], price: 150, discounted_price: 99, is_active: true, created_at: "" },
  { id: "o2", title: "Fry + Kurkure Combo", description: "6 fry momos and 6 kurkure momos at a special price.", image_url: img("photo-1568096889942-6eedde686635"), product_ids: [], price: 260, discounted_price: 199, is_active: true, created_at: "" },
  { id: "o3", title: "Cheese Lover Combo", description: "6 cheese filled momos + garlic dip + coldrink.", image_url: img("photo-1585032226651-759b368d7246"), product_ids: [], price: 220, discounted_price: 175, is_active: true, created_at: "" },
];
