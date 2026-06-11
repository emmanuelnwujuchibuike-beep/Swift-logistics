-- ============================================================
-- SWIFT FREIGHT — Payment Proof Feature Setup
-- Run this ONCE in Supabase → SQL Editor → Run All
--
-- Creates:
--   • payment_submissions  table (tracks every proof submission)
--   • storage bucket policies  (allows service role to upload)
--   • customer_email column    (if missing from shipments)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1) Ensure customer_email column exists on shipments
-- ─────────────────────────────────────────────────────────────
alter table public.shipments
  add column if not exists customer_email text;

-- ─────────────────────────────────────────────────────────────
-- 2) payment_submissions — log every proof submission
-- ─────────────────────────────────────────────────────────────
create table if not exists public.payment_submissions (
  id           uuid        primary key default gen_random_uuid(),
  tracking_id  text        not null,
  method       text        not null,
  image_paths  text[]      default '{}',
  status       text        not null default 'under_review',
  submitted_at timestamptz not null default now()
);

-- Index for fast admin lookups by tracking ID
create index if not exists payment_submissions_tracking_id_idx
  on public.payment_submissions (tracking_id);

-- RLS: service role bypasses this automatically;
-- anon/authenticated cannot read submissions (private admin data)
alter table public.payment_submissions enable row level security;

-- Allow the service role (edge functions) to insert — actually
-- service role bypasses RLS, but this explicit policy is good practice.
drop policy if exists "service role full access" on public.payment_submissions;

-- Admin can read all submissions (add this if your admin uses anon key + custom auth)
-- Uncomment the lines below if you want the admin dashboard to query this table:
-- create policy "admin read submissions"
--   on public.payment_submissions for select
--   to authenticated using (true);

-- ─────────────────────────────────────────────────────────────
-- 3) Storage bucket: payment-proofs
--    The bucket itself must already exist (create it in
--    Storage → New bucket → name: payment-proofs → Private).
--
--    The service role key bypasses storage RLS, so no extra
--    policy is strictly needed for Edge Function uploads.
--    The policy below lets the admin dashboard generate signed
--    URLs via the anon key (optional, edge function does it too).
-- ─────────────────────────────────────────────────────────────

-- Allow service role to do everything in the bucket
-- (Not required — service role always bypasses — but explicit is clearer)
-- INSERT policy for authenticated uploads (if you ever add client-side upload):
-- insert into storage.policies (bucket_id, name, definition, command)
-- values ('payment-proofs', 'service role upload', 'true', 'INSERT')
-- on conflict do nothing;

-- ─────────────────────────────────────────────────────────────
-- 4) Verify
-- ─────────────────────────────────────────────────────────────
select
  column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name   = 'shipments'
  and column_name  = 'customer_email';

select
  table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name   = 'payment_submissions'
order by ordinal_position;

-- Should show: id, tracking_id, method, image_paths, status, submitted_at
