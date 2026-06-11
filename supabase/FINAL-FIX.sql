-- ============================================================================
-- SWIFT FREIGHT — DEFINITIVE FIX  (run this ENTIRE block once, top to bottom)
--
-- Restores ALL payment methods on the tracking page + the ticker.
-- Cannot fail on a missing column. Your shipment data lives in
-- `public.shipments` and is NEVER touched or deleted by this script.
-- ============================================================================

-- 1) Guarantee EVERY column the tracking view needs exists (no-op if present).
--    This is the step the previous script was missing — that's why the view
--    creation failed and everything (incl. BTC) vanished.
alter table public.shipments
  add column if not exists created_at         timestamptz default now(),
  add column if not exists name               text,
  add column if not exists senders_name       text,
  add column if not exists origin             text,
  add column if not exists destination        text,
  add column if not exists pickup_date        text,
  add column if not exists eta                text,
  add column if not exists service_type       text,
  add column if not exists priority           text,
  add column if not exists package_details    text,
  add column if not exists status             text,
  add column if not exists current_location   text,
  add column if not exists notes              text,
  add column if not exists step1_color        text,
  add column if not exists step2_name         text,
  add column if not exists step2_location     text,
  add column if not exists step2_color        text,
  add column if not exists step3_name         text,
  add column if not exists step3_location     text,
  add column if not exists step3_color        text,
  add column if not exists step4_name         text,
  add column if not exists step4_location     text,
  add column if not exists step4_color        text,
  add column if not exists payment_status     text,
  add column if not exists amount_due         text,
  add column if not exists btc_address        text,
  add column if not exists usdt_address       text,
  add column if not exists bank_name          text,
  add column if not exists account_name       text,
  add column if not exists bank_number        text,
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

-- 2) Remove the broken/old `shipments_public` — whether it is a VIEW or a TABLE.
--    (Safe: the real data is in `public.shipments`.)
do $$
begin
  if exists (select 1 from information_schema.views
             where table_schema = 'public' and table_name = 'shipments_public') then
    execute 'drop view public.shipments_public cascade';
  elsif exists (select 1 from information_schema.tables
                where table_schema = 'public' and table_name = 'shipments_public') then
    execute 'drop table public.shipments_public cascade';
  end if;
end $$;

-- 3) Recreate it as a live view that exposes EVERY field (incl. all payments).
create view public.shipments_public as
  select
    tracking_id, status, current_location, payment_status,
    origin, destination, eta, pickup_date, package_details,
    name, senders_name, service_type, priority, amount_due,
    step1_color, step2_name, step2_location, step2_color,
    step3_name, step3_location, step3_color,
    step4_name, step4_location, step4_color,
    btc_address, usdt_address, bank_name, account_name, bank_number, routing_number,
    paypal_email, cashapp_tag, zelle_id, western_union_info, venmo_tag, moneygram_info,
    amazon_gc_info, google_gc_info, apple_gc_info, vanilla_gc_info, ebay_gc_info,
    created_at
  from public.shipments;

grant select on public.shipments_public to anon, authenticated;

-- 4) Ticker / site settings — table + public read policy.
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

-- ============================================================================
-- DONE. Verify (run on its own) — should return one row with all columns:
--   select * from public.shipments_public order by created_at desc limit 1;
-- ============================================================================
