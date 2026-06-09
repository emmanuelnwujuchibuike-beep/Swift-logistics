import { CORS_HEADERS, json, err } from '../_shared/cors.ts';
import { sendEmail }               from '../_shared/resend.ts';

const ADMIN_EMAIL = 'swiftfreightlogix@gmail.com';
const SITE        = 'https://swiftfreightlogix.netlify.app';
const TRACK_URL   = `${SITE}/payment.html`;

/* ══════════════════════════════════════════════════════════════════════════
   HELPERS  (same ultra-premium white · blue · purple system)
   ══════════════════════════════════════════════════════════════════════════ */

function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function firstName(name: string): string {
  return esc(name.split(' ')[0] || name);
}

function shell(opts: { preheader: string; badge: string; body: string }): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="color-scheme" content="dark light">
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @media (prefers-color-scheme:dark){.em-bg{background:#03060f!important}}
    @media only screen and (max-width:620px){
      .em-card{width:100%!important;border-radius:0!important}
      .em-pad{padding:30px 22px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#03060f;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;visibility:hidden;opacity:0;
            color:transparent;height:0;width:0;font-size:1px;">
  ${esc(opts.preheader)}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>
<table role="presentation" class="em-bg" width="100%" border="0" cellpadding="0" cellspacing="0"
       style="background:#03060f;min-height:100vh;">
<tr><td align="center" valign="top" style="padding:52px 16px 80px;">
<table role="presentation" class="em-card" width="600" border="0" cellpadding="0" cellspacing="0"
       style="max-width:600px;width:100%;">

  <!-- Eyebrow -->
  <tr><td align="center" style="padding:0 0 22px;">
    <p style="margin:0;font-size:9px;letter-spacing:.56em;text-transform:uppercase;
       font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.28);">
      Swift Freight Logistics &nbsp;&bull;&nbsp; Shipment Confirmation
    </p>
  </td></tr>

  <!-- Header -->
  <tr><td style="background:linear-gradient(145deg,#130e2e 0%,#0d1048 55%,#090b28 100%);
                 border:1px solid rgba(124,58,237,.3);border-bottom:none;
                 border-radius:14px 14px 0 0;padding:36px 52px 30px;">
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td valign="middle">
          <p style="margin:0 0 5px;font-size:8px;letter-spacing:.62em;text-transform:uppercase;
             font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.38);">OFFICIAL CONFIRMATION</p>
          <p style="margin:0;line-height:1;font-size:0;">
            <span style="font-size:25px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;
                  font-family:Arial,Helvetica,sans-serif;color:#a78bfa;">SFL</span><span
                  style="font-size:25px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;
                  font-family:Arial,Helvetica,sans-serif;color:#dde5ff;">&thinsp;LOGISTICS</span>
          </p>
        </td>
        <td align="right" valign="middle">
          <span style="display:inline-block;padding:8px 18px;
                background:rgba(124,58,237,.13);border:1px solid rgba(167,139,250,.3);
                border-radius:4px;font-size:8px;letter-spacing:.3em;text-transform:uppercase;
                font-family:Arial,Helvetica,sans-serif;color:rgba(199,210,254,.72);white-space:nowrap;">
            ${esc(opts.badge)}
          </span>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Gradient stripe: white → blue → purple -->
  <tr><td height="5" style="height:5px;line-height:5px;font-size:0;
      background:linear-gradient(90deg,#e0e7ff 0%,#93c5fd 14%,#3b82f6 38%,#6d28d9 68%,#c084fc 100%);">
    &zwnj;
  </td></tr>

  <!-- Body -->
  <tr><td class="em-pad"
          style="background:linear-gradient(180deg,#090d26 0%,#06091c 100%);
                 border-left:1px solid rgba(124,58,237,.15);
                 border-right:1px solid rgba(124,58,237,.15);
                 padding:52px 52px 46px;">
    ${opts.body}
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#040712;border:1px solid rgba(124,58,237,.14);border-top:none;
                 border-radius:0 0 14px 14px;padding:26px 52px 32px;" align="center">
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
           style="margin-bottom:18px;">
      <tr><td height="1" style="height:1px;line-height:1px;font-size:0;
          background:linear-gradient(90deg,transparent,rgba(124,58,237,.25),transparent);">
        &zwnj;
      </td></tr>
    </table>
    <p style="margin:0 0 12px;font-size:11px;color:rgba(199,210,254,.22);line-height:2.5;
       font-family:Arial,Helvetica,sans-serif;">
      <a href="${SITE}" style="color:rgba(167,139,250,.5);text-decoration:none;
         font-family:Arial,Helvetica,sans-serif;">swiftfreightlogix.netlify.app</a>
      &nbsp;&bull;&nbsp;
      <a href="${TRACK_URL}" style="color:rgba(167,139,250,.5);text-decoration:none;
         font-family:Arial,Helvetica,sans-serif;">Track Shipment</a>
      &nbsp;&bull;&nbsp;
      <a href="mailto:${ADMIN_EMAIL}" style="color:rgba(167,139,250,.5);text-decoration:none;
         font-family:Arial,Helvetica,sans-serif;">Contact Support</a>
    </p>
    <p style="margin:0;font-size:8px;color:rgba(199,210,254,.1);letter-spacing:.18em;
       text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">
      Automated notification &nbsp;&bull;&nbsp; Please do not reply to this email
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function divider(): string {
  return `
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
         style="margin:38px 0;">
    <tr><td height="1" style="height:1px;line-height:1px;font-size:0;
        background:linear-gradient(90deg,transparent,rgba(124,58,237,.18),transparent);">
      &zwnj;
    </td></tr>
  </table>`;
}

function ctaButton(href: string, label: string): string {
  return `
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-top:40px;">
    <tr>
      <td style="border-radius:7px;
                 background:linear-gradient(135deg,#1d4ed8 0%,#4f46e5 48%,#7c3aed 100%);
                 box-shadow:0 10px 40px rgba(124,58,237,.5);">
        <a href="${href}"
           style="display:inline-block;padding:18px 50px;font-size:11px;font-weight:700;
                  letter-spacing:.28em;text-transform:uppercase;color:#ffffff;text-decoration:none;
                  font-family:Arial,Helvetica,sans-serif;mso-padding-alt:0;">
          ${label} &nbsp;&rarr;
        </a>
      </td>
    </tr>
  </table>`;
}

function journeySteps(): string {
  const steps = [
    { icon: '&#10003;', label: 'Confirmed',  active: true  },
    { icon: '&#9881;',  label: 'Processing', active: true  },
    { icon: '&#128666;',label: 'In Transit', active: false },
    { icon: '&#128230;',label: 'Delivery',   active: false },
  ];

  const cols = steps.map(s => `
    <td width="23%" align="center" valign="middle"
        style="padding:18px 6px;
               background:${s.active ? 'rgba(124,58,237,.12)' : 'rgba(255,255,255,.02)'};
               border:1px solid ${s.active ? 'rgba(167,139,250,.32)' : 'rgba(255,255,255,.05)'};
               border-radius:8px;">
      <p style="margin:0 0 8px;font-size:20px;line-height:1;">${s.icon}</p>
      <p style="margin:0;font-size:8px;letter-spacing:.2em;text-transform:uppercase;
         font-family:Arial,Helvetica,sans-serif;
         color:${s.active ? 'rgba(167,139,250,.88)' : 'rgba(199,210,254,.2)'};">
        ${s.label}
      </p>
    </td>
  `).join('<td width="2%">&nbsp;</td>');

  return `
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
         style="margin-bottom:32px;">
    <tr>${cols}</tr>
  </table>`;
}

/* ══════════════════════════════════════════════════════════════════════════
   PACKAGE CONFIRMED EMAIL
   ══════════════════════════════════════════════════════════════════════════ */

function packageConfirmedEmail(p: {
  visitorName: string; trackingId: string; pageUrl: string;
}): { subject: string; html: string } {
  const fn        = firstName(p.visitorName);
  const trackUrl  = `${TRACK_URL}?id=${encodeURIComponent(p.trackingId)}`;
  const subject   = `&#10003; Package Confirmed — It's On Its Way · Swift Freight`;
  const preheader = `Your package ${p.trackingId} has been confirmed and is being dispatched. Track it now.`;

  const body = `
    <!-- Success checkmark icon -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0"
           style="margin:0 auto 30px;">
      <tr>
        <td align="center">
          <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
            style="height:72px;width:72px;v-text-anchor:middle;" arcsize="50%"
            fillcolor="#120b2e" strokecolor="#7c3aed"><w:anchorlock/><center><![endif]-->
          <div style="width:72px;height:72px;
                      background:linear-gradient(135deg,#130e2e,#1e1b4b);
                      border:2px solid rgba(167,139,250,.4);border-radius:50%;
                      text-align:center;line-height:72px;font-size:30px;margin:0 auto;
                      box-shadow:0 0 36px rgba(124,58,237,.35);">
            &#10003;
          </div>
          <!--[if mso]></center></v:roundrect><![endif]-->
        </td>
      </tr>
    </table>

    <!-- Heading (centred) -->
    <h1 style="margin:0 0 10px;font-size:28px;font-weight:900;letter-spacing:.02em;
       color:#eef2ff;font-family:Arial,Helvetica,sans-serif;line-height:1.2;text-align:center;">
      Package confirmed, ${fn}!
    </h1>
    <p style="margin:0 0 36px;font-size:14px;color:rgba(199,210,254,.5);line-height:1.95;
       font-family:Arial,Helvetica,sans-serif;text-align:center;">
      Your shipment has been successfully registered and dispatched.<br>
      Swift Freight Logistics is now actively processing your delivery.
    </p>

    <!-- Tracking ID (hero box) -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
           style="margin-bottom:8px;">
      <tr>
        <td style="padding:22px 28px 24px;
                   background:linear-gradient(135deg,rgba(109,40,217,.14),rgba(37,99,235,.14));
                   border:1px solid rgba(124,58,237,.3);border-radius:8px;text-align:center;">
          <p style="margin:0 0 7px;font-size:8px;letter-spacing:.34em;text-transform:uppercase;
             font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.5);">
            Your Tracking ID
          </p>
          <p style="margin:0;font-size:28px;font-weight:900;letter-spacing:.18em;
             font-family:'Courier New',monospace;color:#a78bfa;line-height:1.1;word-break:break-all;">
            ${esc(p.trackingId)}
          </p>
        </td>
      </tr>
    </table>

    <!-- Field pair: Status + Carrier -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
           style="margin-bottom:28px;">
      <tr>
        <td width="49%" valign="top"
            style="padding:15px 22px 17px;background:#050818;
                   border:1px solid rgba(124,58,237,.18);border-radius:7px;">
          <p style="margin:0 0 5px;font-size:8px;letter-spacing:.28em;text-transform:uppercase;
             font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.5);">Status</p>
          <p style="margin:0;font-size:14px;color:rgba(167,139,250,.88);font-weight:600;
             font-family:Arial,Helvetica,sans-serif;">&#9679; Confirmed &amp; Processing</p>
        </td>
        <td width="2%">&nbsp;</td>
        <td width="49%" valign="top"
            style="padding:15px 22px 17px;background:#050818;
                   border:1px solid rgba(124,58,237,.18);border-radius:7px;">
          <p style="margin:0 0 5px;font-size:8px;letter-spacing:.28em;text-transform:uppercase;
             font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.5);">Recipient</p>
          <p style="margin:0;font-size:14px;color:#dde5ff;
             font-family:Arial,Helvetica,sans-serif;word-break:break-word;">${esc(p.visitorName)}</p>
        </td>
      </tr>
    </table>

    <!-- Delivery journey -->
    <p style="margin:0 0 12px;font-size:8px;letter-spacing:.28em;text-transform:uppercase;
       font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.45);">
      Delivery Journey
    </p>
    ${journeySteps()}

    <!-- What happens next -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
           style="margin-bottom:10px;">
      <tr>
        <td style="padding:18px 24px;
                   background:rgba(124,58,237,.07);
                   border:1px solid rgba(167,139,250,.18);
                   border-left:3px solid #7c3aed;
                   border-radius:0 8px 8px 0;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:rgba(167,139,250,.85);
             font-family:Arial,Helvetica,sans-serif;letter-spacing:.04em;">
            What Happens Next
          </p>
          <p style="margin:0;font-size:13px;line-height:1.95;color:rgba(199,210,254,.58);
             font-family:Arial,Helvetica,sans-serif;">
            Our team will process and dispatch your package within 24 hours. You will receive real-time status updates as your shipment moves through each stage. Use your tracking ID at any time to check the latest status.
          </p>
        </td>
      </tr>
    </table>

    ${ctaButton(trackUrl, 'Track My Package Now')}

    ${divider()}

    <p style="margin:0;font-size:12px;color:rgba(199,210,254,.28);line-height:2;
       font-family:Arial,Helvetica,sans-serif;text-align:center;">
      Need help? Contact our support team at
      <a href="mailto:${ADMIN_EMAIL}" style="color:rgba(167,139,250,.55);text-decoration:none;
         font-family:Arial,Helvetica,sans-serif;">${ADMIN_EMAIL}</a>
    </p>
  `;

  return {
    subject,
    html: shell({ preheader, badge: 'Delivery Confirmed', body }),
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   HANDLER
   ══════════════════════════════════════════════════════════════════════════ */
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST')   return err('Method not allowed', 405);

  try {
    const body = await req.json() as {
      trackingId   : string;
      visitorName  : string;
      visitorEmail : string;
      pageUrl?     : string;
    };

    if (!body.trackingId || !body.visitorEmail) {
      return err('Missing trackingId or visitorEmail');
    }

    const p = {
      trackingId  : body.trackingId,
      visitorName : body.visitorName || 'Valued Customer',
      visitorEmail: body.visitorEmail,
      pageUrl     : body.pageUrl || SITE,
    };

    const email = packageConfirmedEmail(p);
    await sendEmail({ to: p.visitorEmail, subject: email.subject, html: email.html });

    return json({ success: true });

  } catch (e) {
    console.error('[package-confirm]', e);
    return json({ error: String(e) }, 500);
  }
});
