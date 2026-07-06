-- ============================================================================
-- Momoza — Seed / Demo Data
-- Run AFTER schema.sql. Optional; provides sample categories, products, offers.
-- ============================================================================

-- Categories
insert into public.categories (title, sequence_number) values
  ('Mini Steam Momo', 1),
  ('Mini Fry Momo', 2),
  ('Mini Kurkure Momo', 3),
  ('Mini Peri Peri Momo', 4),
  ('Mini Cheese Filled Momo', 5),
  ('Mini Afghani Momo', 6)
on conflict do nothing;

-- Products (linked to categories by title)
insert into public.products (name, description, price, discounted_price, image_url, category_id)
select p.name, p.description, p.price, p.discounted_price, p.image_url, c.id
from (values
  ('Veg Steam Momo', 'Classic steamed veg momos, soft and juicy with house spicy chutney.', 90, 70, 'https://images.unsplash.com/photo-1625938145312-c92c2f2b0d1a?w=400', 'Mini Steam Momo'),
  ('Paneer Steam Momo', 'Steamed momos stuffed with fresh spiced paneer.', 120, 99, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', 'Mini Steam Momo'),
  ('Veg Fry Momo', 'Crispy fried veg momos served with tangy sauce.', 100, 80, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', 'Mini Fry Momo'),
  ('Chicken Fry Momo', 'Golden fried chicken momos, crunchy outside soft inside.', 140, 120, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400', 'Mini Fry Momo'),
  ('Kurkure Momo', 'Momos coated in crunchy kurkure crumbs.', 130, 110, 'https://images.unsplash.com/photo-1568096889942-6eedde686635?w=400', 'Mini Kurkure Momo'),
  ('Peri Peri Momo', 'Spicy peri peri tossed momos for the heat lovers.', 130, 105, 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400', 'Mini Peri Peri Momo'),
  ('Cheese Filled Momo', 'Molten cheese core in every bite.', 150, 130, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400', 'Mini Cheese Filled Momo'),
  ('Afghani Momo', 'Creamy afghani gravy tossed momos.', 160, 135, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400', 'Mini Afghani Momo')
) as p(name, description, price, discounted_price, image_url, cat_title)
join public.categories c on c.title = p.cat_title
on conflict do nothing;

-- Combo Offers
insert into public.offers (title, description, image_url, price, discounted_price) values
  ('6 Steam Momo + Free Coldrink', 'Get 6 pcs steam momo with a free chilled coldrink.', 'https://images.unsplash.com/photo-1625938145312-c92c2f2b0d1a?w=400', 150, 99),
  ('Fry + Kurkure Combo', '6 fry momos and 6 kurkure momos at a special price.', 'https://images.unsplash.com/photo-1568096889942-6eedde686635?w=400', 260, 199),
  ('Cheese Lover Combo', '6 cheese filled momos + garlic dip + coldrink.', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400', 220, 175)
on conflict do nothing;
