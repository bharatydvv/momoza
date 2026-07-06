-- ============================================================================
-- Momoza — Momo Delivery App :: Database Schema (Phase 1)
-- Run this in Supabase SQL Editor.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('customer', 'admin', 'delivery');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'order_received', 'cooking', 'packing', 'out_for_delivery', 'arrived', 'delivered', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type refund_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- PROFILES (extends auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  email text,
  address text,
  role user_role not null default 'customer',
  coins_balance integer not null default 0,
  referral_code text unique,
  referred_by text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sequence_number integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  discounted_price numeric(10,2),
  image_url text,
  category_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- OFFERS (combo offers for "Today's Offers")
-- ---------------------------------------------------------------------------
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  product_ids uuid[] default '{}',
  price numeric(10,2),
  discounted_price numeric(10,2),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- DELIVERY BOYS
-- ---------------------------------------------------------------------------
create table if not exists public.delivery_boys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  items jsonb not null default '[]',
  total_amount numeric(10,2) not null default 0,
  coins_redeemed integer not null default 0,
  coins_earned integer not null default 0,
  address text,
  pincode text,
  phone text,
  status order_status not null default 'order_received',
  delivery_boy_id uuid references public.delivery_boys(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ORDER STATUS LOG
-- ---------------------------------------------------------------------------
create table if not exists public.order_status_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  status order_status not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- REFUNDS
-- ---------------------------------------------------------------------------
create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  reason text,
  status refund_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- COIN TRANSACTIONS
-- ---------------------------------------------------------------------------
create table if not exists public.coin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  coins_earned integer not null default 0,
  coins_redeemed integer not null default 0,
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- HELPER: is_admin()
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.is_delivery()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'delivery'
  );
$$;

-- ---------------------------------------------------------------------------
-- TRIGGER: auto-create profile on signup + generate referral code
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_referred_by text;
  v_referrer_id uuid;
  -- Keep this in sync with REFERRAL_BONUS in src/lib/config.ts
  v_referral_bonus integer := 50;
begin
  v_referred_by := new.raw_user_meta_data->>'referred_by';

  insert into public.profiles (id, name, email, phone, referral_code, referred_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', ''),
    upper(substr(md5(new.id::text), 1, 8)),
    v_referred_by
  )
  on conflict (id) do nothing;

  -- Award referral bonus coins to both the new signup and whoever referred them.
  if v_referred_by is not null and v_referred_by <> '' then
    select id into v_referrer_id from public.profiles
      where referral_code = v_referred_by
      limit 1;

    if v_referrer_id is not null then
      update public.profiles set coins_balance = coins_balance + v_referral_bonus
        where id = new.id;
      update public.profiles set coins_balance = coins_balance + v_referral_bonus
        where id = v_referrer_id;

      insert into public.coin_transactions (user_id, coins_earned, note)
      values (new.id, v_referral_bonus, 'Referral signup bonus');
      insert into public.coin_transactions (user_id, coins_earned, note)
      values (v_referrer_id, v_referral_bonus, 'Referral bonus — friend joined using your code');
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- FUNCTION: referral_count — number of people who signed up with a given code
-- (security definer so a customer can see their own referral count without
-- being granted broader read access to other users' profiles)
-- ---------------------------------------------------------------------------
create or replace function public.referral_count(code text)
returns integer language sql stable security definer as $$
  select count(*)::integer from public.profiles where referred_by = code;
$$;

-- ---------------------------------------------------------------------------
-- TRIGGER: log order status changes
-- ---------------------------------------------------------------------------
create or replace function public.log_order_status()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') or (new.status is distinct from old.status) then
    insert into public.order_status_log (order_id, status)
    values (new.id, new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_status_change on public.orders;
create trigger on_order_status_change
  after insert or update on public.orders
  for each row execute function public.log_order_status();

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.offers enable row level security;
alter table public.orders enable row level security;
alter table public.order_status_log enable row level security;
alter table public.delivery_boys enable row level security;
alter table public.refunds enable row level security;
alter table public.coin_transactions enable row level security;

-- PROFILES
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id or public.is_admin());
drop policy if exists "profiles self insert" on public.profiles;
create policy "profiles self insert" on public.profiles
  for insert with check (auth.uid() = id);
-- Allow a delivery boy to see the profile of a customer whose order is assigned to them
drop policy if exists "profiles delivery read assigned" on public.profiles;
create policy "profiles delivery read assigned" on public.profiles
  for select using (
    public.is_delivery() and id in (
      select o.user_id from public.orders o
      join public.delivery_boys db on db.id = o.delivery_boy_id
      where db.user_id = auth.uid()
    )
  );

-- CATEGORIES: public read, admin write
drop policy if exists "categories read" on public.categories;
create policy "categories read" on public.categories for select using (true);
drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- PRODUCTS: public read, admin write
drop policy if exists "products read" on public.products;
create policy "products read" on public.products for select using (true);
drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- OFFERS: public read, admin write
drop policy if exists "offers read" on public.offers;
create policy "offers read" on public.offers for select using (true);
drop policy if exists "offers admin write" on public.offers;
create policy "offers admin write" on public.offers
  for all using (public.is_admin()) with check (public.is_admin());

-- ORDERS: customer own, admin all, delivery assigned
drop policy if exists "orders customer read" on public.orders;
create policy "orders customer read" on public.orders
  for select using (
    auth.uid() = user_id
    or public.is_admin()
    or (public.is_delivery() and delivery_boy_id in (
        select id from public.delivery_boys where user_id = auth.uid()))
  );
drop policy if exists "orders customer insert" on public.orders;
create policy "orders customer insert" on public.orders
  for insert with check (auth.uid() = user_id);
drop policy if exists "orders update" on public.orders;
create policy "orders update" on public.orders
  for update using (
    public.is_admin()
    or (public.is_delivery() and delivery_boy_id in (
        select id from public.delivery_boys where user_id = auth.uid()))
  );

-- ORDER STATUS LOG: readable by whoever can read the order
drop policy if exists "status log read" on public.order_status_log;
create policy "status log read" on public.order_status_log
  for select using (
    order_id in (select id from public.orders)
  );

-- DELIVERY BOYS: admin manage, self read
drop policy if exists "delivery read" on public.delivery_boys;
create policy "delivery read" on public.delivery_boys
  for select using (public.is_admin() or user_id = auth.uid());
drop policy if exists "delivery admin write" on public.delivery_boys;
create policy "delivery admin write" on public.delivery_boys
  for all using (public.is_admin()) with check (public.is_admin());
-- Allow a delivery boy to edit their own basic profile fields (Phase 6)
drop policy if exists "delivery self update" on public.delivery_boys;
create policy "delivery self update" on public.delivery_boys
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- REFUNDS: customer own + admin
drop policy if exists "refunds read" on public.refunds;
create policy "refunds read" on public.refunds
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "refunds insert" on public.refunds;
create policy "refunds insert" on public.refunds
  for insert with check (auth.uid() = user_id);
drop policy if exists "refunds admin update" on public.refunds;
create policy "refunds admin update" on public.refunds
  for update using (public.is_admin());

-- COIN TRANSACTIONS: customer own + admin
drop policy if exists "coins read" on public.coin_transactions;
create policy "coins read" on public.coin_transactions
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "coins insert" on public.coin_transactions;
create policy "coins insert" on public.coin_transactions
  for insert with check (auth.uid() = user_id or public.is_admin());

-- ---------------------------------------------------------------------------
-- REALTIME: enable for orders + status log
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_status_log;
