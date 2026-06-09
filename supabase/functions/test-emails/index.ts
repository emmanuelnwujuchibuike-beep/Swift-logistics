/* ═══════════════════════════════════════════════════════════════════════
   TEST-EMAILS — fires every email template to verify premium design
   DEV USE ONLY — deploy and run once, can be removed after verification
   ═══════════════════════════════════════════════════════════════════════ */
import { CORS_HEADERS, json } from '../_shared/cors.ts';
import { sendEmail }          from '../_shared/resend.ts';
import {
  shipmentRegisteredEmail,
  quoteReceivedEmail,
  locationUpdateEmail,
  paymentRequiredEmail,
  delayedEmail,
  customsHoldEmail,
  outForDeliveryEmail,
  deliveredEmail,
  subscribeNotificationEmail,
  contactNotificationEmail,
  contactAutoReplyEmail,
} from '../_shared/templates.ts';

const SUPABASE_FUNC_URL = Deno.env.get('SUPABASE_URL')
  ? `${Deno.env.get('SUPABASE_URL')!.replace('https://', 'https://')}/functions/v1`
  : 'https://oltbgccsceipedoadgka.supabase.co/functions/v1';

const ADMIN = 'swiftfreightlogix@gmail.com';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST')   return json({ error: 'Method not allowed' }, 405);

  let to = 'emilywakeforrd@gmail.com';
  try { const b = await req.json(); if (b.to) to = b.to; } catch { /* default */ }

  const results: Record<string, string | { ok: boolean; error?: string }> = {};
  const tid = `SFL-DEMO${Date.now().toString().slice(-5)}`;

  async function fire(
    label: string,
    recipient: string,
    { subject, html }: { subject: string; html: string },
  ) {
    try {
      const r = await sendEmail({ to: recipient, subject, html });
      results[label] = 'error' in r && r.error ? { ok: false, error: r.error } : { ok: true };
    } catch (e) {
      results[label] = { ok: false, error: String(e) };
    }
  }

  // ── 1. Shipment Registered → user ─────────────────────────────────────
  await fire('01-shipment-registered', to, shipmentRegisteredEmail({
    name:           'Emily Wakeford',
    trackingId:     tid,
    origin:         'Lagos, Nigeria',
    destination:    'London, United Kingdom',
    eta:            'June 20, 2026',
    senderName:     'James Wakeford',
    packageDetails: 'High-value electronics — 2 units, fragile',
    serviceType:    'Premium Express',
  }));

  // ── 2. Quote Received → user ──────────────────────────────────────────
  await fire('02-quote-received', to, quoteReceivedEmail({
    name:        'Emily Wakeford',
    origin:      'Lagos, Nigeria',
    destination: 'London, United Kingdom',
    cargoType:   'Consumer Electronics',
    refCode:     'QR-LUX2026',
  }));

  // ── 3. Location Update → user ─────────────────────────────────────────
  await fire('03-location-update', to, locationUpdateEmail({
    name:        'Emily Wakeford',
    trackingId:  tid,
    newLocation: 'Frankfurt International Hub, Germany',
    status:      'In transit · Customs cleared · Proceeding to UK',
    eta:         'June 18, 2026',
  }));

  // ── 4. Payment Required → user ────────────────────────────────────────
  await fire('04-payment-required', to, paymentRequiredEmail({
    name:        'Emily Wakeford',
    trackingId:  tid,
    amountDue:   '$1,480.00',
    destination: 'London, United Kingdom',
    btcAddress:  'bc1qxy2kgdygjrsqtzq2n0yrf249c1fy5r6cnm4cqf',
    usdtAddress: 'TRx7NHqjeKQxGTCi8q8ZY4pL5Zae3KZnJd',
    bankName:    'Chase International',
    accountName: 'Swift Freight Logistics LLC',
    bankNumber:  '****4829',
  }));

  // ── 5. Delayed → user ────────────────────────────────────────────────
  await fire('05-delayed', to, delayedEmail({
    name:            'Emily Wakeford',
    trackingId:      tid,
    reason:          'Adverse weather conditions at Frankfurt hub causing 48-hour hold',
    newEta:          'June 22, 2026',
    currentLocation: 'Frankfurt International Hub, Germany',
  }));

  // ── 6. Customs Hold → user ────────────────────────────────────────────
  await fire('06-customs-hold', to, customsHoldEmail({
    name:             'Emily Wakeford',
    trackingId:       tid,
    customsLocation:  'Heathrow Customs Clearance Centre, London',
    estimatedDelay:   '2–3 business days',
  }));

  // ── 7. Out for Delivery → user ────────────────────────────────────────
  await fire('07-out-for-delivery', to, outForDeliveryEmail({
    name:            'Emily Wakeford',
    trackingId:      tid,
    deliveryAddress: '14 Kensington Gardens Square, London W2 4BH',
    estimatedTime:   'Between 2:00 PM – 6:00 PM',
  }));

  // ── 8. Delivered → user ──────────────────────────────────────────────
  await fire('08-delivered', to, deliveredEmail({
    name:             'Emily Wakeford',
    trackingId:       tid,
    deliveryDate:     new Date().toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' }),
    deliveryLocation: '14 Kensington Gardens Square, London W2 4BH',
  }));

  // ── 9. Subscribe Notification → admin ────────────────────────────────
  await fire('09-subscribe-notification', ADMIN, subscribeNotificationEmail({
    subscriberEmail: to,
    subscribedAt:    new Date().toUTCString(),
  }));

  // ── 10. Contact Notification → admin ─────────────────────────────────
  await fire('10-contact-notification', ADMIN, contactNotificationEmail({
    name:          'Emily Wakeford',
    email:         to,
    phone:         '+44 7700 900123',
    inquiryType:   'Shipment Tracking',
    trackingNumber: tid,
    message:       'I need help understanding the current status of my shipment. It has been in Frankfurt for 3 days with no update on the portal. Please advise on next steps.',
    submittedAt:   new Date().toUTCString(),
  }));

  // ── 11. Contact Auto-Reply → user ─────────────────────────────────────
  await fire('11-contact-auto-reply', to, contactAutoReplyEmail({
    name:    'Emily Wakeford',
    email:   to,
    message: 'I need help understanding the current status of my shipment. It has been in Frankfurt for 3 days with no update on the portal.',
  }));

  // ── 12. Package Confirm → via package-confirm function ────────────────
  try {
    const pcRes = await fetch(`${SUPABASE_FUNC_URL}/package-confirm`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        trackingId:   tid,
        visitorName:  'Emily Wakeford',
        visitorEmail: to,
        pageUrl:      'https://swiftfreightlogix.netlify.app/src/confirm.html',
      }),
    });
    const pcJson = await pcRes.json();
    results['12-package-confirmed'] = pcJson.success ? { ok: true } : { ok: false, error: JSON.stringify(pcJson) };
  } catch (e) {
    results['12-package-confirmed'] = { ok: false, error: String(e) };
  }

  const total   = Object.keys(results).length;
  const passed  = Object.values(results).filter(r => typeof r === 'object' && r.ok).length;

  return json({
    summary: `${passed}/${total} emails sent successfully`,
    sentTo:  { user: to, admin: ADMIN },
    results,
  });
});
