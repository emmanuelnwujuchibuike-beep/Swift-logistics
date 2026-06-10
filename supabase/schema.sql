-- ============================================================================
-- SWIFT FREIGHT LOGISTICS — full database wiring
-- Safe to run repeatedly (idempotent). Run in Supabase → SQL Editor → Run.
--
-- Wires up everything the admin dashboard writes and the tracking page reads:
--   • shipments              (base table — every column the admin form sends)
--   • shipments_public       (live VIEW the tracking page reads — always fresh)
--   • site_settings          (ticker text, etc.)
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────
-- 1) SHIPMENTS — base table (Edge Functions write here with the service role)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.shipments (
  id          uuid primary key default gen_random_uuid(),
  tracking_id text unique not null,
  created_at  timestamptz not null default now()
);

-- Ensure EVERY column the admin register/update forms send exists.
-- (ADD COLUMN IF NOT EXISTS → safe on an existing table, adds only what's missing.)
alter table public.shipments
  add column if not exists name               text,
  add column if not exists customer_email     text,
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
  -- Payment methods (add a column here too if you ever introduce a new method)
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

-- Lock the base table: only the service role (Edge Functions) can read/write it.
alter table public.shipments enable row level security;

-- ──────────────────────────────────────────────────────────────────────────
-- 2) SHIPMENTS_PUBLIC — the LIVE view the tracking page reads.
--    Because it is a view over `shipments`, it ALWAYS reflects admin edits
--    instantly (this is what fixes "destination/payment/address won't update").
--    Note: customer_email is intentionally NOT exposed.
--
--    If `shipments_public` already exists as a TABLE (not a view), uncomment
--    the DROP TABLE line once — your real data lives in `shipments`.
-- ──────────────────────────────────────────────────────────────────────────
-- drop table if exists public.shipments_public cascade;   -- only if it's a stale TABLE
drop view if exists public.shipments_public;
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
    amazon_gc_info, google_gc_info, apple_gc_info, vanilla_gc_info, ebay_gc_info,
    created_at
  from public.shipments;

grant select on public.shipments_public to anon, authenticated;

-- ──────────────────────────────────────────────────────────────────────────
-- 3) SITE_SETTINGS — ticker text and any other key/value site settings.
--    Admin saves via the `update-setting` Edge Function (service role);
--    the public site reads the ticker value with the anon key.
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.site_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings public read" on public.site_settings;
create policy "site_settings public read"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

grant select on public.site_settings to anon, authenticated;

-- Seed the ticker row so it always exists (won't overwrite an existing value).
insert into public.site_settings (key, value)
values (
  'ticker',
  'Swift Freight · Network Active · Air Freight · Priority Dispatch · Ocean Routes · 150+ Countries · Cargo Insured · Full Coverage · Last Mile · 99.4% On-Time · Supply Chain · 24/7 Operations · Customs · Expedited Clearance · Tracking · Real-Time Global'
)
on conflict (key) do nothing;

-- ============================================================================
-- DONE. After running this:
--   • New/extra payment methods, addresses, origin & destination saved in the
--     admin dashboard appear on the tracking page (within a few seconds, live).
--   • The ticker value saved in admin is readable by the site.
-- ============================================================================
