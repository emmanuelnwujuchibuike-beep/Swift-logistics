-- ════════════════════════════════════════════════════
--  Swift Freight Logistics — Supabase Schema
--  Run once in: Supabase Dashboard → SQL Editor → Run
-- ════════════════════════════════════════════════════

-- ── Shipments ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shipments (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tracking_id       TEXT NOT NULL UNIQUE,

  -- Customer (not exposed in public tracking view)
  customer_email    TEXT NOT NULL,

  -- Recipient & sender (shown in tracking UI)
  name              TEXT NOT NULL,
  senders_name      TEXT,

  -- Shipment info
  status            TEXT NOT NULL DEFAULT 'Pending',
  current_location  TEXT,
  origin            TEXT,
  destination       TEXT NOT NULL,
  pickup_date       TEXT,
  eta               TEXT,
  package_details   TEXT,
  service_type      TEXT,
  priority          TEXT,
  notes             TEXT,

  -- Payment
  payment_status    TEXT NOT NULL DEFAULT 'not-required',
  amount_due        TEXT,
  btc_address       TEXT,
  usdt_address      TEXT,
  bank_name         TEXT,
  account_name      TEXT,
  bank_number       TEXT,

  -- Transit timeline (4 steps; step1 = current status row)
  step1_color       TEXT DEFAULT 'text-blue-500',
  step2_name        TEXT,
  step2_location    TEXT,
  step2_color       TEXT DEFAULT 'text-blue-500',
  step3_name        TEXT,
  step3_location    TEXT,
  step3_color       TEXT DEFAULT 'text-blue-500',
  step4_name        TEXT,
  step4_location    TEXT,
  step4_color       TEXT DEFAULT 'text-green-500',

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Quote Requests ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  origin        TEXT,
  destination   TEXT,
  cargo_type    TEXT,
  weight        TEXT,
  message       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Auto-update updated_at ─────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS shipments_updated_at ON public.shipments;
CREATE TRIGGER shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Indexes ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_id
  ON public.shipments (tracking_id);

CREATE INDEX IF NOT EXISTS idx_quote_requests_email
  ON public.quote_requests (email);

-- ── Row Level Security ─────────────────────────────────
ALTER TABLE public.shipments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Public can read shipments (tracking UI) — customer_email excluded via view
CREATE POLICY "anon_read_shipments" ON public.shipments
  FOR SELECT TO anon USING (true);

-- Service role has full access to both tables
CREATE POLICY "service_all_shipments" ON public.shipments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_all_quotes" ON public.quote_requests
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Public tracking view (hides customer_email) ────────
CREATE OR REPLACE VIEW public.shipments_public AS
SELECT
  id, tracking_id, status, current_location,
  origin, destination, pickup_date, eta,
  package_details, service_type, priority,
  name, senders_name,
  payment_status, amount_due,
  btc_address, usdt_address,
  bank_name, account_name, bank_number,
  step1_color,
  step2_name, step2_location, step2_color,
  step3_name, step3_location, step3_color,
  step4_name, step4_location, step4_color,
  created_at, updated_at
FROM public.shipments;
