-- ============================================================
-- SWIFT FREIGHT — Set Global Default Payment Methods
--
-- Run this ONCE in Supabase → SQL Editor to seed the global
-- payment methods that show on ALL shipments by default.
--
-- After running, go to Admin → Settings → Global Payment Methods
-- and edit/save to update them at any time (no SQL needed then).
-- ============================================================

-- Ensure site_settings table exists
CREATE TABLE IF NOT EXISTS public.site_settings (
  key        text PRIMARY KEY,
  value      text,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_settings public read" ON public.site_settings;
CREATE POLICY "site_settings public read"
  ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON public.site_settings TO anon, authenticated;

-- Seed default payment methods (edit the values to match your real details)
INSERT INTO public.site_settings (key, value, updated_at)
VALUES (
  'default_payments',
  '{
    "btc_address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "usdt_address": "TXYZdemoUSDTtronaddress1234567890",
    "bank_name": "Chase Bank",
    "account_name": "Swift Freight Logistics",
    "bank_number": "0123456789",
    "routing_number": "021000021",
    "paypal_email": "payments@swiftfreight.com",
    "cashapp_tag": "$SwiftFreight",
    "zelle_id": "pay@swiftfreight.com",
    "western_union_info": "Receiver: Swift Freight Logistics",
    "venmo_tag": "@SwiftFreight",
    "moneygram_info": "Receiver: Swift Freight Logistics",
    "amazon_gc_info": "Send to payments@swiftfreight.com",
    "google_gc_info": "Send to payments@swiftfreight.com",
    "apple_gc_info": "Send to payments@swiftfreight.com",
    "vanilla_gc_info": "Card: 4111 1111 1111 1111 | PIN: 1234",
    "ebay_gc_info": "Send to payments@swiftfreight.com"
  }',
  now()
)
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value, updated_at = now();

-- Verify
SELECT key, left(value, 120) AS value_preview FROM public.site_settings WHERE key = 'default_payments';
