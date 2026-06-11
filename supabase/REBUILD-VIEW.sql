-- ============================================================
-- SWIFT FREIGHT — Rebuild shipments_public view
-- Run this in Supabase → SQL Editor to fix payment methods.
--
-- Safe to run any number of times.
-- Does NOT delete or change any shipment data.
-- ============================================================

-- Step 1: Ensure every payment column exists on the base table
alter table public.shipments
  add column if not exists routing_number     text,
  add column if not exists paypal_email       text,
  add column if not exists cashapp_tag        text,
  add column if not exists zelle_id           text,
  add column if not exists western_union_info text,
  add column if not exists venmo_tag          text,
  add column if not exists moneygram_info     text,
  add column if not exists amazon_gc_info     text,
  add column if not exists google_gc_info     text,
  add column if not exists apple_gc_info      text,
  add column if not exists vanilla_gc_info    text,
  add column if not exists ebay_gc_info       text;

-- Step 2: Drop any existing view or stale table with that name
do $$
begin
  if exists (
    select 1 from information_schema.views
    where table_schema = 'public' and table_name = 'shipments_public'
  ) then
    execute 'drop view public.shipments_public cascade';
  elsif exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'shipments_public'
      and table_type = 'BASE TABLE'
  ) then
    execute 'drop table public.shipments_public cascade';
  end if;
end $$;

-- Step 3: Create the view with ALL columns including every payment method
create view public.shipments_public as
  select
    tracking_id, status, current_location, payment_status,
    origin, destination, eta, pickup_date, package_details,
    name, senders_name, service_type, priority, amount_due,
    step1_color,
    step2_name, step2_location, step2_color,
    step3_name, step3_location, step3_color,
    step4_name, step4_location, step4_color,
    btc_address, usdt_address,
    bank_name, account_name, bank_number, routing_number,
    paypal_email, cashapp_tag, zelle_id, western_union_info,
    venmo_tag, moneygram_info,
    amazon_gc_info, google_gc_info, apple_gc_info,
    vanilla_gc_info, ebay_gc_info,
    created_at
  from public.shipments;

grant select on public.shipments_public to anon, authenticated;

-- Step 4: Wire the ticker (no-op if already exists)
create table if not exists public.site_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz default now()
);
alter table public.site_settings enable row level security;
drop policy if exists "site_settings public read" on public.site_settings;
create policy "site_settings public read"
  on public.site_settings for select to anon, authenticated using (true);
grant select on public.site_settings to anon, authenticated;

-- Verify: this should return your shipment with paypal_email and other payment columns present
-- (NULL is fine — it means no value entered yet, not a missing column)
select tracking_id, btc_address, paypal_email, cashapp_tag, venmo_tag, amazon_gc_info
from public.shipments_public
order by created_at desc nulls last
limit 3;
