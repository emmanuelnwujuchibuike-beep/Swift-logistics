-- ============================================================================
-- FIX: expose ALL payment columns on the tracking view + wire the ticker
-- Run this whole block in Supabase → SQL Editor → Run.
-- Safe to run repeatedly.
-- ============================================================================

-- 1) Make sure every payment column exists on the base table (no-op if present)
alter table public.shipments
  add column if not exists paypal_email       text,
  add column if not exists cashapp_tag        text,
  add column if not exists zelle_id           text,
  add column if not exists western_union_info text,
  add column if not exists venmo_tag          text,
  add column if not exists moneygram_info     text,
  add column if not exists routing_number     text,
  add column if not exists amazon_gc_info     text,
  add column if not exists google_gc_info     text,
  add column if not exists apple_gc_info      text,
  add column if not exists vanilla_gc_info    text,
  add column if not exists ebay_gc_info       text;

-- 2) REBUILD the public tracking view so it exposes EVERY column.
--    (A view does NOT auto-include columns added later — it must be recreated.
--     This is why only btc/usdt/bank were showing.)
drop view if exists public.shipments_public;
create view public.shipments_public as
  select
    tracking_id, status, current_location, payment_status,
    origin, destination, eta, pickup_date, package_details,
    name, senders_name, service_type, priority, amount_due,
    step1_color, step2_name, step2_location, step2_color,
    step3_name, step3_location, step3_color,
    step4_name, step4_location, step4_color,
    btc_address, usdt_address,
    bank_name, account_name, bank_number, routing_number,
    paypal_email, cashapp_tag, zelle_id, western_union_info,
    venmo_tag, moneygram_info,
    amazon_gc_info, google_gc_info, apple_gc_info, vanilla_gc_info, ebay_gc_info,
    created_at
  from public.shipments;
grant select on public.shipments_public to anon, authenticated;

-- 3) TICKER — settings table + public read policy
create table if not exists public.site_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
drop policy if exists "site_settings public read" on public.site_settings;
create policy "site_settings public read" on public.site_settings
  for select to anon, authenticated using (true);
grant select on public.site_settings to anon, authenticated;

-- ============================================================================
-- VERIFY (optional) — run separately; should return 5 rows:
--   select column_name from information_schema.columns
--   where table_schema='public' and table_name='shipments_public'
--     and column_name in ('paypal_email','cashapp_tag','zelle_id','venmo_tag','amazon_gc_info');
-- ============================================================================
