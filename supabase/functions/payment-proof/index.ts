import { createClient }           from 'jsr:@supabase/supabase-js@2';
import { CORS_HEADERS, json, err } from '../_shared/cors.ts';

const RESEND_API  = 'https://api.resend.com/emails';
const ADMIN_EMAIL = 'swiftfreightlogix@gmail.com';

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

function esc(s: string) {
  return String(s ?? '').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c]!);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST')   return err('Method not allowed', 405);

  try {
    const body = await req.json() as {
      trackingId:   string;
      method:       string;
      amount?:      string;
      images?:      Array<{ filename: string; content: string; mimeType: string; label: string }>;
    };

    if (!body.trackingId) return err('Missing trackingId');

    // Fetch customer details using service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { data: rows } = await supabase
      .from('shipments')
      .select('customer_email, name, amount_due')
      .eq('tracking_id', body.trackingId)
      .limit(1);

    const shipment      = rows?.[0] ?? {};
    const customerEmail = String(shipment.customer_email ?? '');
    const customerName  = String(shipment.name           ?? 'Valued Customer');
    const amount        = String(body.amount || shipment.amount_due || '');

    const apiKey = Deno.env.get('RESEND_API_KEY');
    const from   = Deno.env.get('FROM_EMAIL') ?? 'Swift Freight Logistics <onboarding@resend.dev>';
    if (!apiKey) return err('RESEND_API_KEY not set', 500);

    const images      = body.images ?? [];
    const methodLabel = METHOD_LABELS[body.method] ?? body.method;

    // Attachments for admin email
    const attachments = images.map(img => ({
      filename: img.filename,
      content:  img.content,
    }));

    // Inline image HTML for admin (data URIs — shown in email body)
    const imgHtml = images.length
      ? images.map((img, i) => `
          <div style="margin:16px 0;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;">${esc(img.label || `Image ${i + 1}`)}</p>
            <img src="data:${esc(img.mimeType)};base64,${img.content}"
                 style="max-width:520px;width:100%;border-radius:10px;border:1px solid rgba(59,130,246,.2);"
                 alt="Payment proof">
          </div>`).join('')
      : `<p style="color:#64748b;font-style:italic;font-size:13px;">No images uploaded — payment details submitted via text only.</p>`;

    // ── Send admin email ────────────────────────────────────────
    const adminRes = fetch(RESEND_API, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to:          [ADMIN_EMAIL],
        subject:     `💳 Payment Proof — ${body.trackingId}`,
        html:        buildAdminEmail({ trackingId: body.trackingId, methodLabel, amount, customerName, customerEmail, imgHtml, imageCount: images.length }),
        attachments,
      }),
    });

    // ── Send customer confirmation email ────────────────────────
    const customerRes = customerEmail
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

    await Promise.all([adminRes, customerRes]);
    return json({ success: true });

  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN EMAIL TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────
function buildAdminEmail(p: {
  trackingId: string; methodLabel: string; amount: string;
  customerName: string; customerEmail: string; imgHtml: string; imageCount: number;
}) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Payment Proof — ${esc(p.trackingId)}</title></head>
<body style="margin:0;padding:0;background:#070d18;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#070d18;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HEADER BAR -->
  <tr><td style="background:linear-gradient(135deg,#0f2340 0%,#172d50 100%);
                  border-radius:18px 18px 0 0;padding:30px 36px 26px;
                  border:1px solid rgba(59,130,246,.22);border-bottom:none;">
    <table width="100%"><tr>
      <td valign="middle">
        <span style="font-size:18px;font-weight:900;color:#fff;letter-spacing:-.01em;">Swift Freight</span>
        <span style="font-size:11px;color:#475569;margin-left:8px;font-weight:500;">LOGISTICS</span>
      </td>
      <td align="right" valign="middle">
        <span style="background:rgba(245,158,11,.14);color:#f59e0b;border:1px solid rgba(245,158,11,.38);
                     border-radius:20px;padding:5px 14px;font-size:11px;font-weight:800;
                     letter-spacing:.08em;">💳&nbsp;PAYMENT PROOF</span>
      </td>
    </tr></table>
    <h1 style="margin:18px 0 5px;font-size:24px;font-weight:800;color:#f8fafc;letter-spacing:-.02em;">
      New Payment Submission
    </h1>
    <p style="margin:0;font-size:14px;color:#64748b;">A customer has uploaded payment proof — review and confirm below</p>
  </td></tr>

  <!-- BODY -->
  <tr><td style="background:#0d1a2d;padding:32px 36px;
                  border:1px solid rgba(59,130,246,.12);border-top:none;border-bottom:none;">

    <!-- Info table -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:rgba(255,255,255,.03);border-radius:12px;
                  border:1px solid rgba(255,255,255,.07);overflow:hidden;margin-bottom:28px;">
      ${[
        ['TRACKING ID',    `<span style="font-family:monospace;font-size:14px;font-weight:700;color:#60a5fa;">${esc(p.trackingId)}</span>`],
        ['CUSTOMER',       esc(p.customerName)],
        ['EMAIL',          `<a href="mailto:${esc(p.customerEmail)}" style="color:#60a5fa;text-decoration:none;">${esc(p.customerEmail || 'Not on file')}</a>`],
        ['PAYMENT METHOD', esc(p.methodLabel)],
        ['AMOUNT',         `<span style="font-size:18px;font-weight:800;color:#22c55e;">${esc(p.amount || '—')}</span>`],
        ['ATTACHMENTS',    p.imageCount > 0 ? `<span style="color:#a78bfa;">${p.imageCount} image${p.imageCount > 1 ? 's' : ''} attached</span>` : '<span style="color:#64748b;">None uploaded</span>'],
      ].map(([label, val], i, arr) => `
        <tr style="${i < arr.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,.05);' : ''}">
          <td style="padding:13px 18px;font-size:11px;font-weight:700;color:#475569;
                     text-transform:uppercase;letter-spacing:.07em;width:42%;">${label}</td>
          <td style="padding:13px 18px;font-size:13px;color:#e2e8f0;">${val}</td>
        </tr>`).join('')}
    </table>

    <!-- Images section -->
    ${p.imageCount > 0 ? `
    <div style="margin-bottom:28px;">
      <p style="margin:0 0 14px;font-size:11px;font-weight:800;color:#475569;
                text-transform:uppercase;letter-spacing:.1em;">📎 PAYMENT PROOF IMAGES</p>
      <div style="background:rgba(255,255,255,.02);border-radius:12px;
                  border:1px solid rgba(59,130,246,.15);padding:20px;">
        ${p.imgHtml}
      </div>
    </div>` : ''}

    <!-- CTA -->
    <div style="text-align:center;margin-top:8px;">
      <a href="https://swiftfreightlogix.netlify.app/admin.html"
         style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);
                color:#fff;text-decoration:none;padding:15px 36px;border-radius:10px;
                font-size:14px;font-weight:800;letter-spacing:.03em;
                box-shadow:0 4px 16px rgba(37,99,235,.4);">
        Open Admin Dashboard &rarr;
      </a>
    </div>

  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#070d18;padding:20px 36px;border-radius:0 0 18px 18px;
                  border:1px solid rgba(59,130,246,.12);border-top:1px solid rgba(255,255,255,.04);">
    <p style="margin:0;font-size:11px;color:#1e293b;text-align:center;">
      Swift Freight Logistics &nbsp;·&nbsp; Admin Notification &nbsp;·&nbsp; ${new Date().toUTCString()}
    </p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CUSTOMER CONFIRMATION EMAIL TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────
function buildCustomerEmail(p: { trackingId: string; amount: string; customerName: string }) {
  const steps = [
    'Our finance team reviews your payment proof (1–4 hours)',
    "Your shipment status updates to <strong>'Payment Confirmed'</strong>",
    'Your package is released and continues its journey',
    'You\'ll receive a final delivery notification',
  ];
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Payment Received — ${esc(p.trackingId)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HERO -->
  <tr><td style="background:linear-gradient(145deg,#0a1628 0%,#0f2550 40%,#0a1a3a 100%);
                  border-radius:20px 20px 0 0;padding:52px 44px 44px;text-align:center;">
    <!-- Glow ring around checkmark -->
    <div style="display:inline-block;position:relative;margin-bottom:22px;">
      <div style="width:80px;height:80px;background:linear-gradient(135deg,#16a34a,#22c55e);
                  border-radius:50%;display:inline-flex;align-items:center;justify-content:center;
                  box-shadow:0 0 0 12px rgba(34,197,94,.12),0 0 40px rgba(34,197,94,.35);
                  font-size:36px;line-height:80px;text-align:center;">✓</div>
    </div>
    <h1 style="margin:0 0 10px;font-size:30px;font-weight:900;color:#ffffff;letter-spacing:-.025em;">
      Payment Received
    </h1>
    <p style="margin:0;font-size:16px;color:#94a3b8;font-weight:400;line-height:1.5;">
      Your proof has been submitted and is now under review
    </p>
  </td></tr>

  <!-- BODY -->
  <tr><td style="background:#ffffff;padding:44px;border:1px solid #e2e8f0;border-top:none;border-bottom:none;">

    <p style="margin:0 0 10px;font-size:17px;font-weight:700;color:#0f172a;">
      Hi ${esc(p.customerName)},
    </p>
    <p style="margin:0 0 30px;font-size:15px;color:#475569;line-height:1.75;">
      Thank you for submitting your payment proof. Our team has been notified and will review
      your submission promptly. You don't need to take any further action at this time.
    </p>

    <!-- Status pill card -->
    <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);
                border:1.5px solid #86efac;border-radius:16px;
                padding:28px 32px;margin:0 0 34px;text-align:center;">
      <div style="display:inline-block;background:rgba(22,163,74,.1);color:#15803d;
                  border:1px solid rgba(22,163,74,.25);border-radius:20px;
                  padding:4px 16px;font-size:11px;font-weight:800;
                  letter-spacing:.09em;margin-bottom:14px;">
        ✅&nbsp;&nbsp;PROOF SUBMITTED
      </div>
      <div style="font-size:28px;font-weight:900;color:#14532d;margin-bottom:6px;letter-spacing:-.02em;">
        ${esc(p.amount || '')}
      </div>
      <div style="font-size:13px;color:#166534;font-family:monospace;letter-spacing:.04em;font-weight:600;">
        ${esc(p.trackingId)}
      </div>
      <div style="margin-top:14px;font-size:13px;color:#4ade80;font-weight:600;">
        Status: Under Review
      </div>
    </div>

    <!-- What happens next -->
    <p style="margin:0 0 18px;font-size:12px;font-weight:800;color:#0f172a;
               text-transform:uppercase;letter-spacing:.1em;">
      What Happens Next
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:34px;">
      ${steps.map((step, i) => `
      <tr>
        <td width="42" valign="top" style="padding:0 14px 14px 0;">
          <div style="width:30px;height:30px;
                      background:linear-gradient(135deg,#2563eb,#1d4ed8);
                      border-radius:50%;text-align:center;line-height:30px;
                      font-size:12px;font-weight:800;color:#fff;">
            ${i + 1}
          </div>
        </td>
        <td valign="middle" style="padding:0 0 14px;font-size:14px;color:#475569;line-height:1.6;">
          ${step}
        </td>
      </tr>`).join('')}
    </table>

    <!-- Track button -->
    <div style="text-align:center;margin:0 0 34px;">
      <a href="https://swiftfreightlogix.netlify.app/payment.html?id=${esc(p.trackingId)}"
         style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#2563eb,#3b82f6);
                color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;
                font-size:15px;font-weight:800;letter-spacing:.02em;
                box-shadow:0 6px 24px rgba(37,99,235,.32);">
        Track My Shipment &rarr;
      </a>
    </div>

    <!-- Info note -->
    <div style="background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;
                padding:18px 20px;font-size:13px;color:#64748b;line-height:1.6;">
      <strong style="color:#1e293b;">Need help?</strong> Contact our support team at
      <a href="mailto:swiftfreightlogix@gmail.com" style="color:#2563eb;text-decoration:none;font-weight:600;">
        swiftfreightlogix@gmail.com
      </a> — include your tracking ID <strong style="font-family:monospace;">${esc(p.trackingId)}</strong> in your message.
    </div>

  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#f8fafc;padding:24px 44px;border-radius:0 0 20px 20px;
                  border:1px solid #e2e8f0;border-top:none;text-align:center;">
    <p style="margin:0 0 4px;font-size:13px;font-weight:800;color:#1e293b;">Swift Freight Logistics</p>
    <p style="margin:0;font-size:12px;color:#94a3b8;">
      This is an automated confirmation. Please do not reply directly to this email.
    </p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
}
