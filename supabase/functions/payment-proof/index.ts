import { createClient }           from 'jsr:@supabase/supabase-js@2';
import { CORS_HEADERS, json, err } from '../_shared/cors.ts';

const RESEND_API  = 'https://api.resend.com/emails';
const ADMIN_EMAIL = 'swiftfreightlogix@gmail.com';
const BUCKET      = 'payment-proofs';

const METHOD_LABELS: Record<string, string> = {
  BTC:      'Bitcoin (BTC)',
  USDT:     'USDT Tether (TRC20/ERC20)',
  WIRE:     'Bank Wire / ACH Transfer',
  PAYPAL:   'PayPal',
  CASHAPP:  'Cash App',
  ZELLE:    'Zelle',
  WU:       'Western Union',
  VENMO:    'Venmo',
  MONEYGRAM:'MoneyGram',
  AMAZON:   'Amazon Gift Card',
  GOOGLE:   'Google Play Gift Card',
  APPLE:    'Apple Gift Card',
  VANILLA:  'Vanilla Visa Prepaid',
  EBAY:     'eBay Gift Card',
};

function esc(s: unknown) {
  return String(s ?? '').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c]!);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST')   return err('Method not allowed', 405);

  try {
    const body = await req.json() as {
      trackingId: string;
      method:     string;
      amount?:    string;
      images?:    Array<{ filename: string; content: string; mimeType: string; label: string }>;
    };

    if (!body.trackingId) return err('Missing trackingId');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // ── Fetch customer details ─────────────────────────────────
    const { data: rows } = await supabase
      .from('shipments')
      .select('customer_email, name, amount_due')
      .eq('tracking_id', body.trackingId)
      .limit(1);

    const shipment      = rows?.[0] ?? {};
    const customerEmail = String(shipment.customer_email ?? '');
    const customerName  = String(shipment.name           ?? 'Valued Customer');
    const amount        = String(body.amount || shipment.amount_due || '');
    const images        = body.images ?? [];
    const methodLabel   = METHOD_LABELS[body.method] ?? body.method;
    const ts            = Date.now();

    // ── Upload images to Supabase Storage ──────────────────────
    const storagePaths:  string[]          = [];
    // Parallel array: one entry per image (null if upload failed)
    const imageSignedUrls: (string | null)[] = [];

    for (const img of images) {
      let signedUrl: string | null = null;
      try {
        const bytes    = Uint8Array.from(atob(img.content), c => c.charCodeAt(0));
        const safeName = img.filename.replace(/[^a-z0-9._-]/gi, '_');
        const path     = `${body.trackingId}/${ts}-${safeName}`;

        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, bytes, { contentType: img.mimeType, upsert: true });

        if (!upErr) {
          storagePaths.push(path);
          // Generate 14-day signed URL for admin to view the image
          const { data: su } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(path, 60 * 60 * 24 * 14);
          signedUrl = su?.signedUrl ?? null;
        }
      } catch (_) { /* skip failed uploads silently */ }
      imageSignedUrls.push(signedUrl);
    }

    // ── Log submission to payment_submissions table ────────────
    await supabase.from('payment_submissions').insert({
      tracking_id:  body.trackingId,
      method:       body.method,
      image_paths:  storagePaths,
      status:       'under_review',
    });

    // ── Build email parts ──────────────────────────────────────
    const apiKey = Deno.env.get('RESEND_API_KEY');
    // FROM_EMAIL must be a Resend-verified sender, e.g. "Swift Freight <noreply@yourdomain.com>"
    // or leave unset to use the Resend shared test address (can only deliver to your own account email).
    const from   = Deno.env.get('FROM_EMAIL') ?? 'Swift Freight Logistics <onboarding@resend.dev>';
    if (!apiKey) return err('RESEND_API_KEY not set', 500);

    // Email attachments (raw files for admin to download)
    const attachments = images.map(img => ({
      filename: img.filename,
      content:  img.content,
    }));

    // Inline image HTML — use signed URLs when available, fall back to base64 data URL
    const imgHtml = images.length
      ? images.map((img, i) => {
          const signedSrc = imageSignedUrls[i];   // null if upload failed
          const b64Src    = `data:${img.mimeType};base64,${img.content}`;
          const src       = signedSrc || b64Src;  // prefer signed URL to keep email small
          return `
          <div style="margin:14px 0;">
            <p style="margin:0 0 7px;font-size:11px;font-weight:700;color:#94a3b8;
                      text-transform:uppercase;letter-spacing:.08em;">${esc(img.label || `Image ${i + 1}`)}</p>
            <a href="${esc(signedSrc || '#')}" target="_blank" style="display:block;">
              <img src="${esc(src)}"
                   style="max-width:520px;width:100%;border-radius:10px;
                          border:1px solid rgba(59,130,246,.2);" alt="Payment proof">
            </a>
            ${signedSrc ? `<a href="${esc(signedSrc)}" target="_blank"
               style="display:inline-block;margin-top:6px;font-size:11px;color:#60a5fa;text-decoration:none;">
               &#128279; View full resolution (14 days) &rarr;</a>` : ''}
          </div>`;
        }).join('')
      : `<p style="color:#64748b;font-style:italic;font-size:13px;">No images uploaded.</p>`;

    // ── Send admin email ───────────────────────────────────────
    const adminFetch = fetch(RESEND_API, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to:          [ADMIN_EMAIL],
        subject:     `💳 Payment Proof — ${body.trackingId}`,
        html:        buildAdminEmail({ trackingId: body.trackingId, methodLabel, amount, customerName, customerEmail, imgHtml, imageCount: images.length, storedCount: storagePaths.length }),
        attachments,
      }),
    });

    // ── Send customer confirmation email ───────────────────────
    const customerFetch = customerEmail
      ? fetch(RESEND_API, {
          method:  'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from,
            to:      [customerEmail],
            subject: `✅ Payment Received & Under Review — ${body.trackingId}`,
            html:    buildCustomerEmail({ trackingId: body.trackingId, amount, customerName }),
          }),
        })
      : Promise.resolve();

    await Promise.all([adminFetch, customerFetch]);
    return json({ success: true, stored: storagePaths.length });

  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN EMAIL
// ─────────────────────────────────────────────────────────────────────────────
function buildAdminEmail(p: {
  trackingId: string; methodLabel: string; amount: string;
  customerName: string; customerEmail: string; imgHtml: string;
  imageCount: number; storedCount: number;
}) {
  const rows = [
    ['TRACKING ID',    `<span style="font-family:monospace;font-size:14px;font-weight:700;color:#60a5fa;">${esc(p.trackingId)}</span>`],
    ['CUSTOMER',       esc(p.customerName)],
    ['EMAIL',          `<a href="mailto:${esc(p.customerEmail)}" style="color:#60a5fa;text-decoration:none;">${esc(p.customerEmail || 'Not on file')}</a>`],
    ['PAYMENT METHOD', esc(p.methodLabel)],
    ['AMOUNT',         `<span style="font-size:18px;font-weight:800;color:#22c55e;">${esc(p.amount || '—')}</span>`],
    ['IMAGES',         p.imageCount > 0
      ? `<span style="color:#a78bfa;">${p.imageCount} uploaded${p.storedCount > 0 ? ` · ${p.storedCount} saved to storage` : ''}</span>`
      : '<span style="color:#64748b;">None</span>'],
  ];

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#070d18;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#070d18;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <tr><td style="background:linear-gradient(135deg,#0f2340,#172d50);border-radius:18px 18px 0 0;
                  padding:30px 36px 26px;border:1px solid rgba(59,130,246,.22);border-bottom:none;">
    <table width="100%"><tr>
      <td><span style="font-size:18px;font-weight:900;color:#fff;">Swift Freight</span>
          <span style="font-size:11px;color:#475569;margin-left:6px;">LOGISTICS</span></td>
      <td align="right"><span style="background:rgba(245,158,11,.14);color:#f59e0b;
                              border:1px solid rgba(245,158,11,.38);border-radius:20px;
                              padding:5px 14px;font-size:11px;font-weight:800;letter-spacing:.08em;">
        💳&nbsp;PAYMENT PROOF</span></td>
    </tr></table>
    <h1 style="margin:18px 0 5px;font-size:24px;font-weight:800;color:#f8fafc;letter-spacing:-.02em;">
      New Payment Submission</h1>
    <p style="margin:0;font-size:14px;color:#64748b;">Review and confirm in your admin dashboard</p>
  </td></tr>

  <tr><td style="background:#0d1a2d;padding:32px 36px;
                  border:1px solid rgba(59,130,246,.12);border-top:none;border-bottom:none;">

    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:rgba(255,255,255,.03);border-radius:12px;
                  border:1px solid rgba(255,255,255,.07);margin-bottom:28px;">
      ${rows.map(([label, val], i) => `
      <tr style="${i < rows.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,.05);' : ''}">
        <td style="padding:13px 18px;font-size:11px;font-weight:700;color:#475569;
                   text-transform:uppercase;letter-spacing:.07em;width:42%;">${label}</td>
        <td style="padding:13px 18px;font-size:13px;color:#e2e8f0;">${val}</td>
      </tr>`).join('')}
    </table>

    ${p.imageCount > 0 ? `
    <div style="margin-bottom:28px;">
      <p style="margin:0 0 14px;font-size:11px;font-weight:800;color:#475569;
                text-transform:uppercase;letter-spacing:.1em;">📎 PROOF IMAGES</p>
      <div style="background:rgba(255,255,255,.02);border-radius:12px;
                  border:1px solid rgba(59,130,246,.15);padding:20px;">
        ${p.imgHtml}
      </div>
    </div>` : ''}

    <div style="text-align:center;">
      <a href="https://swiftfreightlogix.netlify.app/admin.html"
         style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);
                color:#fff;text-decoration:none;padding:15px 36px;border-radius:10px;
                font-size:14px;font-weight:800;box-shadow:0 4px 16px rgba(37,99,235,.4);">
        Open Admin Dashboard &rarr;
      </a>
    </div>
  </td></tr>

  <tr><td style="background:#070d18;padding:18px 36px;border-radius:0 0 18px 18px;
                  border:1px solid rgba(59,130,246,.12);border-top:1px solid rgba(255,255,255,.04);">
    <p style="margin:0;font-size:11px;color:#1e293b;text-align:center;">
      Swift Freight Logistics &nbsp;·&nbsp; Admin Notification &nbsp;·&nbsp; ${new Date().toUTCString()}
    </p>
  </td></tr>

</table></td></tr></table>
</body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CUSTOMER CONFIRMATION EMAIL
// ─────────────────────────────────────────────────────────────────────────────
function buildCustomerEmail(p: { trackingId: string; amount: string; customerName: string }) {
  const steps = [
    'Our finance team reviews your payment proof <strong>(1–4 hours)</strong>',
    "Your shipment status updates to <strong>Payment Confirmed</strong>",
    'Your package is released and continues its transit journey',
    'You\'ll receive a final delivery notification email',
  ];
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HERO -->
  <tr><td style="background:linear-gradient(145deg,#0a1628,#0f2550,#0a1a3a);
                  border-radius:20px 20px 0 0;padding:52px 44px 44px;text-align:center;">
    <div style="width:80px;height:80px;background:linear-gradient(135deg,#16a34a,#22c55e);
                border-radius:50%;display:inline-block;line-height:80px;font-size:38px;
                box-shadow:0 0 0 14px rgba(34,197,94,.1),0 0 48px rgba(34,197,94,.32);
                margin-bottom:22px;">✓</div>
    <h1 style="margin:0 0 10px;font-size:30px;font-weight:900;color:#fff;letter-spacing:-.025em;">
      Payment Received</h1>
    <p style="margin:0;font-size:16px;color:#94a3b8;line-height:1.5;">
      Your proof has been submitted and is now under review</p>
  </td></tr>

  <!-- BODY -->
  <tr><td style="background:#fff;padding:44px;border:1px solid #e2e8f0;border-top:none;border-bottom:none;">
    <p style="margin:0 0 10px;font-size:17px;font-weight:700;color:#0f172a;">
      Hi ${esc(p.customerName)},</p>
    <p style="margin:0 0 30px;font-size:15px;color:#475569;line-height:1.75;">
      Thank you for submitting your payment proof. Our team has been notified and will
      review your submission promptly. You don't need to take any further action right now.</p>

    <!-- Status card -->
    <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1.5px solid #86efac;
                border-radius:16px;padding:28px 32px;margin:0 0 34px;text-align:center;">
      <div style="display:inline-block;background:rgba(22,163,74,.12);color:#15803d;
                  border:1px solid rgba(22,163,74,.28);border-radius:20px;
                  padding:4px 16px;font-size:11px;font-weight:800;letter-spacing:.09em;margin-bottom:14px;">
        ✅&nbsp;&nbsp;PROOF SUBMITTED</div>
      <div style="font-size:28px;font-weight:900;color:#14532d;margin-bottom:6px;letter-spacing:-.02em;">
        ${esc(p.amount || '')}</div>
      <div style="font-size:13px;color:#166534;font-family:monospace;letter-spacing:.04em;font-weight:600;">
        ${esc(p.trackingId)}</div>
      <div style="margin-top:14px;font-size:13px;color:#4ade80;font-weight:700;">
        Status: Under Review</div>
    </div>

    <!-- Steps -->
    <p style="margin:0 0 18px;font-size:12px;font-weight:800;color:#0f172a;
               text-transform:uppercase;letter-spacing:.1em;">What Happens Next</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:34px;">
      ${steps.map((step, i) => `
      <tr>
        <td width="42" valign="top" style="padding:0 14px 16px 0;">
          <div style="width:30px;height:30px;background:linear-gradient(135deg,#2563eb,#1d4ed8);
                      border-radius:50%;text-align:center;line-height:30px;font-size:12px;
                      font-weight:800;color:#fff;">${i + 1}</div>
        </td>
        <td valign="middle" style="padding:0 0 16px;font-size:14px;color:#475569;line-height:1.6;">
          ${step}</td>
      </tr>`).join('')}
    </table>

    <!-- CTA -->
    <div style="text-align:center;margin:0 0 34px;">
      <a href="https://swiftfreightlogix.netlify.app/payment.html?id=${esc(p.trackingId)}"
         style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#3b82f6);
                color:#fff;text-decoration:none;padding:16px 42px;border-radius:12px;
                font-size:15px;font-weight:800;letter-spacing:.02em;
                box-shadow:0 6px 24px rgba(37,99,235,.3);">
        Track My Shipment &rarr;</a>
    </div>

    <div style="background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;
                padding:18px 20px;font-size:13px;color:#64748b;line-height:1.6;">
      <strong style="color:#1e293b;">Need help?</strong> Contact us at
      <a href="mailto:swiftfreightlogix@gmail.com"
         style="color:#2563eb;text-decoration:none;font-weight:600;">swiftfreightlogix@gmail.com</a>
      and include your tracking ID
      <strong style="font-family:monospace;">${esc(p.trackingId)}</strong>.
    </div>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#f8fafc;padding:24px 44px;border-radius:0 0 20px 20px;
                  border:1px solid #e2e8f0;border-top:none;text-align:center;">
    <p style="margin:0 0 4px;font-size:13px;font-weight:800;color:#1e293b;">Swift Freight Logistics</p>
    <p style="margin:0;font-size:12px;color:#94a3b8;">
      Automated confirmation — please do not reply to this email.</p>
  </td></tr>

</table></td></tr></table>
</body></html>`;
}
