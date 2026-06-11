/* ═══════════════════════════════════════════════════════════════════════
   Ultra-premium email template system — White · Blue · Purple
   Used by: send-email, contact, quote-request, register-shipment,
            update-shipment
   ═══════════════════════════════════════════════════════════════════════ */

const SITE = 'https://swiftfreightlogix.netlify.app';

// ── Utilities ─────────────────────────────────────────────────────────────

function esc(s: string | number | undefined | null): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function trackingUrl(id: string): string {
  return `${SITE}/payment.html?id=${encodeURIComponent(id)}`;
}

// ── Premium shell ──────────────────────────────────────────────────────────
// accent    = per-email highlight colour (status hero, tracking ID text, CTA)
// accentLt  = lighter variant for gradients
// badge     = top-right header badge text
// body      = inner HTML content
// preheader = optional hidden preview text

function base(
  accent: string,
  accentLt: string,
  badge: string,
  body: string,
  preheader = '',
): string {
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
<body style="margin:0;padding:0;background:#03060f;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;visibility:hidden;
  opacity:0;color:transparent;height:0;width:0;font-size:1px;">
  ${esc(preheader)}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>` : ''}

<table role="presentation" class="em-bg" width="100%" border="0" cellpadding="0" cellspacing="0"
       style="background:#03060f;min-height:100vh;">
<tr><td align="center" valign="top" style="padding:52px 16px 80px;">
<table role="presentation" class="em-card" width="600" border="0" cellpadding="0" cellspacing="0"
       style="max-width:600px;width:100%;">

  <!-- Eyebrow -->
  <tr><td align="center" style="padding:0 0 22px;">
    <p style="margin:0;font-size:9px;letter-spacing:.56em;text-transform:uppercase;
       font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.28);">
      Swift Freight Logistics &nbsp;&bull;&nbsp; Secure Notification
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
             font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.38);">OFFICIAL NOTIFICATION</p>
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
            ${esc(badge)}
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
    ${body}
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
      <a href="${SITE}/payment.html" style="color:rgba(167,139,250,.5);text-decoration:none;
         font-family:Arial,Helvetica,sans-serif;">Track Shipment</a>
      &nbsp;&bull;&nbsp;
      <a href="mailto:swiftfreightlogix@gmail.com" style="color:rgba(167,139,250,.5);text-decoration:none;
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

// ── Shared components ──────────────────────────────────────────────────────

function contextPill(text: string): string {
  return `
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom:22px;">
    <tr>
      <td style="padding:8px 20px;background:rgba(124,58,237,.1);
                 border:1px solid rgba(167,139,250,.24);border-radius:99px;">
        <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:.18em;
           color:rgba(167,139,250,.9);font-family:Arial,Helvetica,sans-serif;
           text-transform:uppercase;">${text}</p>
      </td>
    </tr>
  </table>`;
}

function statusHero(symbol: string, title: string, subtitle: string, accent: string): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
    <tr>
      <td align="center" style="padding:30px 28px;
                                 background:rgba(124,58,237,.07);
                                 border:1px solid rgba(124,58,237,.2);
                                 border-top:3px solid ${accent};
                                 border-radius:0 10px 10px 10px;">
        <p style="margin:0 0 10px;font-size:30px;color:${accent};line-height:1;">${symbol}</p>
        <p style="margin:0 0 8px;font-size:15px;font-weight:900;letter-spacing:.22em;
           text-transform:uppercase;color:#eef2ff;font-family:Arial,Helvetica,sans-serif;">${title}</p>
        <p style="margin:0;font-size:12px;color:rgba(199,210,254,.45);letter-spacing:.04em;
           font-family:Arial,Helvetica,sans-serif;">${subtitle}</p>
      </td>
    </tr>
  </table>`;
}

function trackingBox(trackingId: string, accent = '#a78bfa'): string {
  const url = trackingUrl(trackingId);
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 20px;">
    <tr>
      <td style="padding:22px 28px 24px;
                 background:linear-gradient(135deg,rgba(109,40,217,.12),rgba(37,99,235,.12));
                 border:1px solid rgba(124,58,237,.28);border-radius:8px;text-align:center;">
        <p style="margin:0 0 8px;font-size:8px;letter-spacing:.38em;text-transform:uppercase;
           color:rgba(167,139,250,.5);font-family:Arial,Helvetica,sans-serif;">TRACKING NUMBER</p>
        <p style="margin:0 0 10px;font-family:'Courier New',Courier,monospace;font-size:26px;
           font-weight:900;color:${accent};letter-spacing:.18em;">${esc(trackingId)}</p>
        <a href="${url}" style="font-size:10px;color:rgba(167,139,250,.55);text-decoration:none;
           letter-spacing:.1em;font-family:Arial,Helvetica,sans-serif;">
          Tap to track live &nbsp;&#8594;
        </a>
      </td>
    </tr>
  </table>`;
}

function infoRow(label: string, value: string): string {
  if (!value) return '';
  return `
  <tr>
    <td style="font-size:9px;color:rgba(167,139,250,.5);letter-spacing:.22em;text-transform:uppercase;
       padding:11px 0 11px 0;border-bottom:1px solid rgba(124,58,237,.1);white-space:nowrap;
       padding-right:28px;font-family:Arial,Helvetica,sans-serif;vertical-align:top;">
      ${esc(label)}
    </td>
    <td style="font-size:13px;color:rgba(224,231,255,.82);padding:11px 0;
       border-bottom:1px solid rgba(124,58,237,.1);font-family:Arial,Helvetica,sans-serif;
       word-break:break-word;">${esc(value)}</td>
  </tr>`;
}

function infoTable(rows: string): string {
  if (!rows.trim()) return '';
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="margin:20px 0;background:#050818;border:1px solid rgba(124,58,237,.16);
                border-radius:8px;overflow:hidden;">
    <tr>
      <td colspan="2" style="padding:0 22px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${rows}
        </table>
      </td>
    </tr>
  </table>`;
}

function ctaButton(url: string, label: string, accent = '#7c3aed'): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:36px auto 28px;">
    <tr>
      <td style="background:linear-gradient(135deg,#1d4ed8 0%,#4f46e5 48%,${accent} 100%);
                 border-radius:7px;box-shadow:0 10px 40px rgba(124,58,237,.45);" align="center">
        <a href="${url}" target="_blank"
           style="display:inline-block;padding:17px 48px;color:#fff;font-size:11px;font-weight:700;
                  letter-spacing:.28em;text-transform:uppercase;text-decoration:none;
                  font-family:Arial,Helvetica,sans-serif;">
          ${label} &nbsp;&#8594;
        </a>
      </td>
    </tr>
  </table>`;
}

function divider(): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:36px 0;">
    <tr><td height="1" style="height:1px;line-height:1px;font-size:0;
        background:linear-gradient(90deg,transparent,rgba(124,58,237,.18),transparent);">
      &zwnj;
    </td></tr>
  </table>`;
}

function greeting(name: string): string {
  return `
  <p style="font-size:15px;color:rgba(199,210,254,.6);margin:0 0 22px;line-height:1.85;
     font-family:Arial,Helvetica,sans-serif;">
    Dear <strong style="color:#eef2ff;">${esc(name)}</strong>,
  </p>`;
}

function bodyText(text: string): string {
  return `<p style="font-size:14px;color:rgba(199,210,254,.52);margin:0 0 6px;line-height:1.9;
     font-family:Arial,Helvetica,sans-serif;">${text}</p>`;
}

function alertBox(text: string, accent = '#f59e0b'): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;">
    <tr>
      <td style="padding:16px 22px;
                 background:rgba(${hexToRgb(accent)},.06);
                 border:1px solid rgba(${hexToRgb(accent)},.2);
                 border-left:3px solid ${accent};
                 border-radius:0 8px 8px 0;">
        <p style="font-size:13px;color:rgba(224,231,255,.72);margin:0;line-height:1.8;
           font-family:Arial,Helvetica,sans-serif;">
          <span style="color:${accent};font-weight:700;margin-right:6px;">&#9888;</span>${text}
        </p>
      </td>
    </tr>
  </table>`;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

function paymentMethod(icon: string, label: string, value: string): string {
  if (!value) return '';
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0;">
    <tr>
      <td style="padding:16px 20px;background:#050818;
                 border:1px solid rgba(124,58,237,.18);border-radius:7px;">
        <p style="margin:0 0 6px;font-size:9px;letter-spacing:.2em;text-transform:uppercase;
           color:rgba(167,139,250,.5);font-family:Arial,Helvetica,sans-serif;">
          ${icon} &nbsp;${esc(label)}
        </p>
        <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:13px;
           color:rgba(224,231,255,.8);word-break:break-all;line-height:1.6;
           font-family:Arial,Helvetica,sans-serif;">${esc(value)}</p>
      </td>
    </tr>
  </table>`;
}

function nextSteps(steps: string[]): string {
  const rows = steps.map((s, i) => `
    <tr>
      <td valign="top" style="padding:8px 14px 8px 0;white-space:nowrap;">
        <span style="display:inline-block;width:22px;height:22px;border-radius:50%;
               background:rgba(124,58,237,.12);border:1px solid rgba(167,139,250,.28);
               font-size:10px;font-weight:700;color:rgba(167,139,250,.85);
               text-align:center;line-height:22px;font-family:Arial,Helvetica,sans-serif;">
          ${i + 1}
        </span>
      </td>
      <td style="font-size:13px;color:rgba(199,210,254,.52);padding:8px 0;line-height:1.75;
         font-family:Arial,Helvetica,sans-serif;">${s}</td>
    </tr>`).join('');

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;">
    ${rows}
  </table>`;
}

// Visual horizontal journey / progress tracker
function journeySteps(steps: Array<{ icon: string; label: string; active: boolean }>): string {
  const cells = steps.map((step, i) => {
    const isLast = i === steps.length - 1;
    const bg  = step.active
      ? 'linear-gradient(135deg,rgba(109,40,217,.2) 0%,rgba(37,99,235,.2) 100%)'
      : 'rgba(124,58,237,.05)';
    const bd  = step.active ? 'rgba(124,58,237,.42)' : 'rgba(124,58,237,.12)';
    const col = step.active ? '#a78bfa' : 'rgba(199,210,254,.18)';
    const cell = `<td align="center" style="padding:0 3px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="background:${bg};border:1px solid ${bd};
              border-radius:9px;padding:12px 6px 10px;">
            <p style="margin:0 0 7px;font-size:18px;line-height:1;">${step.icon}</p>
            <p style="margin:0;font-size:7px;font-weight:700;letter-spacing:.15em;
               text-transform:uppercase;color:${col};
               font-family:Arial,Helvetica,sans-serif;">${esc(step.label)}</p>
          </td>
        </tr>
      </table>
    </td>`;
    const connector = !isLast
      ? `<td align="center" valign="middle" width="10" style="padding:0 1px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr><td height="1" width="10" style="height:1px;width:10px;line-height:1px;
                font-size:0;background:rgba(124,58,237,.18);">&zwnj;</td></tr>
          </table>
        </td>`
      : '';
    return cell + connector;
  }).join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
    style="margin:20px 0 28px;"><tr>${cells}</tr></table>`;
}

// Origin → Destination route card
function routeCard(origin: string, destination: string): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr>
      <td style="padding:20px 24px;background:#050818;
                 border:1px solid rgba(124,58,237,.18);border-radius:8px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="44%" align="center" style="padding:4px 0;">
              <p style="margin:0 0 5px;font-size:8px;letter-spacing:.28em;text-transform:uppercase;
                 color:rgba(167,139,250,.4);font-family:Arial,Helvetica,sans-serif;">ORIGIN</p>
              <p style="margin:0;font-size:14px;font-weight:700;color:#eef2ff;
                 font-family:Arial,Helvetica,sans-serif;">${esc(origin)}</p>
            </td>
            <td align="center" style="padding:0 6px;">
              <table role="presentation" cellpadding="0" cellspacing="0"
                     style="margin:0 auto;width:50px;">
                <tr><td height="1" style="height:1px;line-height:1px;font-size:0;
                    background:linear-gradient(90deg,rgba(124,58,237,.12),rgba(124,58,237,.5),rgba(124,58,237,.12));">
                  &zwnj;</td></tr>
              </table>
              <p style="margin:4px 0 0;font-size:14px;color:#7c3aed;text-align:center;
                 font-family:Arial,Helvetica,sans-serif;">&#8594;</p>
            </td>
            <td width="44%" align="center" style="padding:4px 0;">
              <p style="margin:0 0 5px;font-size:8px;letter-spacing:.28em;text-transform:uppercase;
                 color:rgba(167,139,250,.4);font-family:Arial,Helvetica,sans-serif;">DESTINATION</p>
              <p style="margin:0;font-size:14px;font-weight:700;color:#a78bfa;
                 font-family:Arial,Helvetica,sans-serif;">${esc(destination)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

// ── Template 1: Shipment Registered ───────────────────────────────────────

export interface ShipmentRegisteredData {
  name: string;
  trackingId: string;
  origin?:         string;
  destination?:    string;
  eta?:            string;
  senderName?:     string;
  packageDetails?: string;
  serviceType?:    string;
}

export function shipmentRegisteredEmail(d: ShipmentRegisteredData): { subject: string; html: string } {
  const url  = trackingUrl(d.trackingId);
  const body = `
    ${contextPill('&#9670; Shipment Registered')}
    ${statusHero('&#10022;', 'Shipment Registered', 'Your package is now active in the Swift Freight system', '#3b82f6')}
    ${greeting(d.name)}
    ${bodyText('Your shipment has been registered with Swift Freight Logistics and is now active in our system. Use the tracking number below to monitor your package in real time.')}
    ${trackingBox(d.trackingId, '#a78bfa')}

    <!-- Shipment journey progress -->
    <p style="font-size:9px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;
       color:rgba(167,139,250,.5);margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;">
      Shipment Journey
    </p>
    ${journeySteps([
      { icon: '&#10003;', label: 'Registered',  active: true  },
      { icon: '&#9675;',  label: 'Pickup',      active: false },
      { icon: '&#9658;',  label: 'In Transit',  active: false },
      { icon: '&#9679;',  label: 'Delivered',   active: false },
    ])}

    ${(d.origin && d.destination) ? routeCard(d.origin, d.destination) : ''}

    ${infoTable([
      infoRow('Recipient',     d.name),
      infoRow('Sender',        d.senderName     ?? ''),
      infoRow('Est. Delivery', d.eta            ?? ''),
      infoRow('Package',       d.packageDetails ?? ''),
      infoRow('Service',       d.serviceType    ?? ''),
    ].join(''))}
    ${divider()}
    ${contextPill('&#9670; What Happens Next')}
    ${nextSteps([
      'Our team arranges pickup from the origin address.',
      'Your package enters the transit network and is tracked at every checkpoint.',
      'Final delivery is made to your destination — you\'ll be notified each step of the way.',
    ])}
    ${ctaButton(url, 'Track My Shipment Live')}
    <p style="font-size:11px;color:rgba(199,210,254,.25);margin:0;text-align:center;line-height:1.8;
       font-family:Arial,Helvetica,sans-serif;">
      Or copy: <a href="${url}" style="color:rgba(167,139,250,.45);word-break:break-all;
      text-decoration:none;font-family:Arial,Helvetica,sans-serif;">${url}</a>
    </p>`;

  return {
    subject: `Your Shipment is Registered — ${d.trackingId} | Swift Freight`,
    html:    base('#3b82f6', '#60a5fa', 'Shipment Notification', body,
                  `Your package ${d.trackingId} is registered. Track it live now.`),
  };
}

// ── Template 2: Quote Received ────────────────────────────────────────────

export interface QuoteReceivedData {
  name:         string;
  origin?:      string;
  destination?: string;
  cargoType?:   string;
  refCode?:     string;
}

export function quoteReceivedEmail(d: QuoteReceivedData): { subject: string; html: string } {
  const body = `
    ${contextPill('&#9670; Quote Request Received')}

    <!-- 24-hour guarantee banner -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;">
      <tr>
        <td align="center" style="padding:22px 28px;
             background:linear-gradient(135deg,rgba(37,99,235,.14) 0%,rgba(109,40,217,.14) 100%);
             border:1px solid rgba(124,58,237,.28);border-radius:10px;">
          <p style="margin:0 0 10px;font-size:26px;line-height:1;">&#9889;</p>
          <p style="margin:0 0 5px;font-size:12px;font-weight:900;letter-spacing:.38em;
             text-transform:uppercase;color:#93c5fd;font-family:Arial,Helvetica,sans-serif;">
            24-HOUR RESPONSE GUARANTEE
          </p>
          <p style="margin:0;font-size:12px;color:rgba(199,210,254,.42);
             font-family:Arial,Helvetica,sans-serif;">
            Our freight specialists will contact you within 24 hours
          </p>
        </td>
      </tr>
    </table>

    ${greeting(d.name)}
    ${bodyText('We have received your freight quote request. A dedicated logistics specialist will review your route and cargo details and send a personalised, competitive proposal within <strong style="color:#eef2ff;">24 hours</strong>.')}

    ${d.refCode ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;">
      <tr>
        <td style="padding:20px 28px;
                   background:linear-gradient(135deg,rgba(109,40,217,.12),rgba(37,99,235,.12));
                   border:1px solid rgba(124,58,237,.28);border-radius:8px;text-align:center;">
          <p style="margin:0 0 8px;font-size:8px;letter-spacing:.38em;text-transform:uppercase;
             color:rgba(167,139,250,.5);font-family:Arial,Helvetica,sans-serif;">REFERENCE CODE</p>
          <p style="margin:0 0 5px;font-family:'Courier New',Courier,monospace;font-size:24px;
             font-weight:900;color:#a78bfa;letter-spacing:.18em;">${esc(d.refCode)}</p>
          <p style="margin:0;font-size:10px;color:rgba(199,210,254,.28);
             font-family:Arial,Helvetica,sans-serif;">Quote this reference in all correspondence</p>
        </td>
      </tr>
    </table>` : ''}

    ${(d.origin && d.destination) ? routeCard(d.origin, d.destination) : ''}

    ${infoTable([
      infoRow('Cargo Type', d.cargoType ?? ''),
    ].filter(Boolean).join(''))}

    ${divider()}

    <!-- Quote process journey -->
    <p style="font-size:9px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;
       color:rgba(167,139,250,.5);margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;">
      Quote Journey
    </p>
    ${journeySteps([
      { icon: '&#10003;', label: 'Submitted',    active: true  },
      { icon: '&#9679;',  label: 'Under Review', active: false },
      { icon: '&#9993;',  label: 'Proposal',     active: false },
      { icon: '&#9658;',  label: 'Booked',       active: false },
    ])}

    ${divider()}
    ${contextPill('&#9670; What Happens Next')}
    ${nextSteps([
      'Our logistics team reviews your shipment requirements and route.',
      'You receive a detailed, competitive quote by email within 24 hours.',
      'Once approved, we register your shipment and issue a live tracking ID.',
    ])}`;

  return {
    subject: `Quote Request Received — We'll Be in Touch | Swift Freight`,
    html:    base('#3b82f6', '#60a5fa', 'Quote Request', body,
                  `Hi ${d.name}, your freight quote has been received. We'll respond within 24 hours.`),
  };
}

// ── Template 3: Location Update ───────────────────────────────────────────

export interface LocationUpdateData {
  name:         string;
  trackingId:   string;
  newLocation:  string;
  status?:      string;
  eta?:         string;
}

export function locationUpdateEmail(d: LocationUpdateData): { subject: string; html: string } {
  const url = trackingUrl(d.trackingId);
  const body = `
    ${contextPill('&#9670; Shipment Update')}
    ${statusHero('&#9658;', 'New Checkpoint Reached', 'Your shipment has moved to a new location', '#06b6d4')}
    ${greeting(d.name)}
    ${bodyText('Your shipment has reached a new checkpoint in the Swift Freight network. Here are the latest details.')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;">
      <tr>
        <td style="padding:22px 26px;
                   background:rgba(6,182,212,.07);
                   border:1px solid rgba(6,182,212,.22);
                   border-top:3px solid #06b6d4;
                   border-radius:0 10px 10px 10px;">
          <p style="margin:0 0 6px;font-size:9px;letter-spacing:.32em;text-transform:uppercase;
             color:rgba(6,182,212,.6);font-family:Arial,Helvetica,sans-serif;">CURRENT LOCATION</p>
          <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#22d3ee;letter-spacing:.04em;
             font-family:Arial,Helvetica,sans-serif;">${esc(d.newLocation)}</p>
          ${d.status ? `<p style="margin:0;font-size:12px;color:rgba(199,210,254,.42);
             font-family:Arial,Helvetica,sans-serif;">${esc(d.status)}</p>` : ''}
        </td>
      </tr>
    </table>
    ${infoTable([
      infoRow('Tracking ID',   d.trackingId),
      infoRow('Est. Delivery', d.eta ?? ''),
    ].join(''))}
    ${ctaButton(url, 'View Full Timeline', '#06b6d4')}`;

  return {
    subject: `Update: Your Shipment Has Reached ${d.newLocation}`,
    html:    base('#06b6d4', '#22d3ee', 'Location Update', body,
                  `Your shipment ${d.trackingId} has reached ${d.newLocation}. Track the full journey.`),
  };
}

// ── Template 4: Payment Required ──────────────────────────────────────────

export interface PaymentRequiredData {
  name:          string;
  trackingId:    string;
  amountDue:     string;
  destination?:  string;
  btcAddress?:   string;
  usdtAddress?:  string;
  bankName?:     string;
  accountName?:  string;
  bankNumber?:   string;
}

export function paymentRequiredEmail(d: PaymentRequiredData): { subject: string; html: string } {
  const url     = trackingUrl(d.trackingId);
  const hasBank = d.bankName || d.accountName || d.bankNumber;

  const body = `
    ${contextPill('&#9888; Action Required')}
    ${statusHero('&#9888;', 'Payment Required', 'Your shipment is currently on hold pending payment', '#f59e0b')}
    ${greeting(d.name)}
    ${bodyText('Your shipment is on hold pending payment clearance. Please complete the payment below to release your package and resume transit to the destination.')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="padding:26px 28px;
                   background:rgba(245,158,11,.08);
                   border:1px solid rgba(245,158,11,.3);
                   border-top:3px solid #f59e0b;
                   border-radius:0 10px 10px 10px;text-align:center;">
          <p style="margin:0 0 8px;font-size:9px;letter-spacing:.32em;text-transform:uppercase;
             color:rgba(245,158,11,.65);font-family:Arial,Helvetica,sans-serif;">AMOUNT DUE</p>
          <p style="margin:0 0 8px;font-size:36px;font-weight:900;color:#fbbf24;letter-spacing:.02em;
             font-family:Arial,Helvetica,sans-serif;">${esc(d.amountDue)}</p>
          ${d.destination ? `<p style="margin:0;font-size:12px;color:rgba(199,210,254,.38);
             font-family:Arial,Helvetica,sans-serif;">For delivery to ${esc(d.destination)}</p>` : ''}
        </td>
      </tr>
    </table>
    ${alertBox('Your shipment cannot proceed until payment is confirmed. Please act promptly to avoid further delays.', '#f59e0b')}
    <p style="font-size:10px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;
       color:rgba(167,139,250,.5);margin:22px 0 12px;font-family:Arial,Helvetica,sans-serif;">
      Payment Methods
    </p>
    ${paymentMethod('&#8383;', 'Bitcoin (BTC)', d.btcAddress ?? '')}
    ${paymentMethod('&#9675;', 'USDT (TRC20 / ERC20)', d.usdtAddress ?? '')}
    ${hasBank ? paymentMethod('&#9780;', 'Wire Transfer', [d.bankName, d.accountName, d.bankNumber].filter(Boolean).join(' · ')) : ''}
    ${ctaButton(url, 'View Payment Details', '#f59e0b')}
    <p style="font-size:11px;color:rgba(199,210,254,.28);margin:0;text-align:center;line-height:1.9;
       font-family:Arial,Helvetica,sans-serif;">
      After completing payment, contact our support team with your transaction reference.<br>
      <a href="mailto:swiftfreightlogix@gmail.com"
         style="color:rgba(245,158,11,.55);text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
        swiftfreightlogix@gmail.com
      </a>
    </p>`;

  return {
    subject: `[URGENT] Payment Required — Shipment ${d.trackingId} On Hold`,
    html:    base('#f59e0b', '#fcd34d', 'Payment Notice', body,
                  `Your shipment ${d.trackingId} requires payment of ${d.amountDue} to proceed.`),
  };
}

// ── Template 5: Delayed ───────────────────────────────────────────────────

export interface DelayedData {
  name:             string;
  trackingId:       string;
  reason?:          string;
  newEta?:          string;
  currentLocation?: string;
}

export function delayedEmail(d: DelayedData): { subject: string; html: string } {
  const url = trackingUrl(d.trackingId);
  const body = `
    ${contextPill('&#9670; Delay Notice')}
    ${statusHero('&#10023;', 'Delivery Delayed', 'We sincerely apologise for the inconvenience', '#f59e0b')}
    ${greeting(d.name)}
    ${bodyText('We sincerely apologise — your shipment has encountered an unexpected delay. Our team is actively working to resolve this and get your package moving as quickly as possible.')}
    ${d.reason ? alertBox(`<strong style="color:rgba(232,240,254,.75);">Reason:</strong> ${esc(d.reason)}`, '#f59e0b') : ''}
    ${infoTable([
      infoRow('Tracking ID',       d.trackingId),
      infoRow('Last Location',     d.currentLocation ?? ''),
      infoRow('New Est. Delivery', d.newEta ?? 'To be confirmed'),
    ].join(''))}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr>
        <td style="padding:18px 22px;
                   background:rgba(124,58,237,.06);border:1px solid rgba(124,58,237,.15);
                   border-radius:7px;">
          <p style="margin:0;font-size:13px;color:rgba(199,210,254,.5);line-height:1.85;
             font-family:Arial,Helvetica,sans-serif;">
            We are actively monitoring your shipment and will send another update as soon as it
            resumes transit. For urgent enquiries, contact
            <a href="mailto:swiftfreightlogix@gmail.com"
               style="color:rgba(245,158,11,.65);text-decoration:none;
               font-family:Arial,Helvetica,sans-serif;">swiftfreightlogix@gmail.com</a>
          </p>
        </td>
      </tr>
    </table>
    ${ctaButton(url, 'Track Shipment', '#f59e0b')}`;

  return {
    subject: `Delay Notice — Shipment ${d.trackingId} | Swift Freight`,
    html:    base('#f59e0b', '#fcd34d', 'Delay Notice', body,
                  `Update: your shipment ${d.trackingId} has been delayed. Full details inside.`),
  };
}

// ── Template 6: Customs Hold ──────────────────────────────────────────────

export interface CustomsHoldData {
  name:              string;
  trackingId:        string;
  customsLocation?:  string;
  estimatedDelay?:   string;
}

export function customsHoldEmail(d: CustomsHoldData): { subject: string; html: string } {
  const url = trackingUrl(d.trackingId);
  const body = `
    ${contextPill('&#9670; Customs Notice')}
    ${statusHero('&#8853;', 'Customs Clearance', 'Standard international procedure — no action required', '#f97316')}
    ${greeting(d.name)}
    ${bodyText('Your shipment is currently being held for customs inspection. This is a standard procedure for international freight and is typically resolved within a short timeframe.')}
    ${infoTable([
      infoRow('Tracking ID',      d.trackingId),
      infoRow('Customs Location', d.customsLocation ?? ''),
      infoRow('Est. Delay',       d.estimatedDelay  ?? 'To be confirmed'),
    ].join(''))}
    ${alertBox('Your shipment is undergoing customs clearance. No action is required from you at this time unless you are directly contacted by our team.', '#f97316')}
    ${ctaButton(url, 'Track Shipment', '#f97316')}
    <p style="font-size:12px;color:rgba(199,210,254,.32);margin:0;text-align:center;line-height:1.9;
       font-family:Arial,Helvetica,sans-serif;">
      We will notify you immediately once your shipment clears customs.
    </p>`;

  return {
    subject: `Customs Inspection Notice — ${d.trackingId} | Swift Freight`,
    html:    base('#f97316', '#fb923c', 'Customs Notice', body,
                  `Your shipment ${d.trackingId} is at customs. No action required — we'll notify you.`),
  };
}

// ── Template 7: Out for Delivery ──────────────────────────────────────────

export interface OutForDeliveryData {
  name:              string;
  trackingId:        string;
  deliveryAddress?:  string;
  estimatedTime?:    string;
}

export function outForDeliveryEmail(d: OutForDeliveryData): { subject: string; html: string } {
  const url = trackingUrl(d.trackingId);
  const body = `
    ${contextPill('&#9670; Out for Delivery')}
    ${statusHero('&#9658;', 'Out for Delivery', 'Arriving today — please be available to receive', '#14b8a6')}
    ${greeting(d.name)}
    ${bodyText('Great news — your shipment is out for delivery and will arrive today. Please ensure someone is available to receive it.')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;">
      <tr>
        <td style="padding:26px 28px;
                   background:rgba(20,184,166,.08);
                   border:1px solid rgba(20,184,166,.28);
                   border-top:3px solid #14b8a6;
                   border-radius:0 10px 10px 10px;text-align:center;">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:.28em;text-transform:uppercase;
             color:rgba(20,184,166,.65);font-family:Arial,Helvetica,sans-serif;">DELIVERY DATE</p>
          <p style="margin:0 0 6px;font-size:32px;font-weight:900;color:#2dd4bf;
             font-family:Arial,Helvetica,sans-serif;">Today</p>
          ${d.estimatedTime ? `<p style="margin:0;font-size:13px;color:rgba(199,210,254,.42);
             font-family:Arial,Helvetica,sans-serif;">Expected: ${esc(d.estimatedTime)}</p>` : ''}
        </td>
      </tr>
    </table>
    <!-- Shipment journey — out for delivery active -->
    <p style="font-size:9px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;
       color:rgba(167,139,250,.5);margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;">
      Shipment Journey
    </p>
    ${journeySteps([
      { icon: '&#10003;', label: 'Registered', active: true },
      { icon: '&#10003;', label: 'Pickup',     active: true },
      { icon: '&#10003;', label: 'In Transit', active: true },
      { icon: '&#9658;',  label: 'Out Today',  active: true },
    ])}
    ${infoTable([
      infoRow('Tracking ID',      d.trackingId),
      infoRow('Delivery Address', d.deliveryAddress ?? ''),
    ].join(''))}
    ${ctaButton(url, 'Track Delivery', '#14b8a6')}`;

  return {
    subject: `Out for Delivery Today — ${d.trackingId} | Swift Freight`,
    html:    base('#14b8a6', '#2dd4bf', 'Out for Delivery', body,
                  `Your package ${d.trackingId} is out for delivery today. Be ready to receive it!`),
  };
}

// ── Template 8: Delivered ─────────────────────────────────────────────────

export interface DeliveredData {
  name:              string;
  trackingId:        string;
  deliveryDate?:     string;
  deliveryLocation?: string;
}

export function deliveredEmail(d: DeliveredData): { subject: string; html: string } {
  const url = trackingUrl(d.trackingId);
  const body = `
    ${contextPill('&#10003; Delivered Successfully')}
    ${statusHero('&#10003;', 'Delivered', 'Your shipment has been successfully delivered', '#22c55e')}
    ${greeting(d.name)}
    ${bodyText('Your shipment has been successfully delivered. Thank you for trusting Swift Freight Logistics for your delivery needs.')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;">
      <tr>
        <td style="padding:28px;
                   background:rgba(34,197,94,.07);
                   border:1px solid rgba(34,197,94,.25);
                   border-top:3px solid #22c55e;
                   border-radius:0 10px 10px 10px;text-align:center;">
          <p style="margin:0 0 8px;font-size:32px;color:#22c55e;line-height:1;">&#10003;</p>
          <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#4ade80;letter-spacing:.06em;
             font-family:Arial,Helvetica,sans-serif;">Delivered Successfully</p>
          ${d.deliveryDate ? `<p style="margin:0;font-size:12px;color:rgba(199,210,254,.42);
             font-family:Arial,Helvetica,sans-serif;">${esc(d.deliveryDate)}</p>` : ''}
        </td>
      </tr>
    </table>
    <!-- All journey steps complete -->
    <p style="font-size:9px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;
       color:rgba(167,139,250,.5);margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;">
      Shipment Journey — Complete
    </p>
    ${journeySteps([
      { icon: '&#10003;', label: 'Registered', active: true },
      { icon: '&#10003;', label: 'Pickup',     active: true },
      { icon: '&#10003;', label: 'In Transit', active: true },
      { icon: '&#10003;', label: 'Delivered',  active: true },
    ])}
    ${infoTable([
      infoRow('Tracking ID',  d.trackingId),
      infoRow('Delivered To', d.deliveryLocation ?? ''),
    ].join(''))}
    ${divider()}
    <p style="font-size:14px;color:rgba(199,210,254,.45);margin:0 0 18px;text-align:center;
       line-height:1.95;font-family:Arial,Helvetica,sans-serif;">
      We hope your experience with Swift Freight Logistics has been outstanding.<br>
      For your next shipment, we are always ready to serve you.
    </p>
    ${ctaButton(url, 'View Delivery Confirmation', '#22c55e')}
    <p style="text-align:center;margin:14px 0 0;">
      <a href="${SITE}/quote.html"
         style="font-size:11px;color:rgba(34,197,94,.55);text-decoration:none;
         letter-spacing:.1em;font-family:Arial,Helvetica,sans-serif;">
        Ship Again &nbsp;&#8594;
      </a>
    </p>`;

  return {
    subject: `[DELIVERED] Shipment ${d.trackingId} Successfully Delivered`,
    html:    base('#22c55e', '#4ade80', 'Delivery Confirmed', body,
                  `Your shipment ${d.trackingId} has been delivered. Thank you for choosing Swift Freight.`),
  };
}

// ── Template 9: Payment Confirmed / Receipt ────────────────────────────────

export interface PaymentConfirmedData {
  name:            string;
  trackingId:      string;
  amountPaid?:     string;
  destination?:    string;
  eta?:            string;
  packageDetails?: string;
  receiptNumber?:  string;
  paidAt?:         string;
}

export function paymentConfirmedEmail(d: PaymentConfirmedData): { subject: string; html: string } {
  const url     = trackingUrl(d.trackingId);
  const receipt = d.receiptNumber || `RCP-${d.trackingId.replace('SFL-','')}`;
  const paidAt  = d.paidAt || new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

  const body = `
    ${contextPill('&#10003; Payment Confirmed')}
    ${statusHero('&#10003;', 'Payment Confirmed', 'Your shipment is fully cleared and proceeding on schedule', '#22c55e')}
    ${greeting(d.name)}
    ${bodyText('Your payment has been verified and recorded. Your shipment is now fully cleared and will proceed without interruption to its destination.')}

    <!-- Receipt card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="padding:26px 28px;background:rgba(34,197,94,.07);
                   border:1px solid rgba(34,197,94,.28);border-top:4px solid #22c55e;
                   border-radius:0 10px 10px 10px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:8px;letter-spacing:.38em;text-transform:uppercase;
                   color:rgba(34,197,94,.6);font-family:Arial,Helvetica,sans-serif;">RECEIPT NUMBER</p>
                <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:16px;
                   font-weight:700;color:#22c55e;letter-spacing:.1em;">${esc(receipt)}</p>
              </td>
              <td align="right" valign="top">
                <span style="display:inline-block;padding:6px 14px;
                       background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);
                       border-radius:99px;font-size:9px;letter-spacing:.18em;font-weight:700;
                       color:#22c55e;font-family:Arial,Helvetica,sans-serif;">&#10003; CLEARED</span>
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                 style="margin-top:14px;border-top:1px solid rgba(34,197,94,.15);">
            <tr>
              <td style="padding-top:10px;font-size:9px;letter-spacing:.2em;text-transform:uppercase;
                         color:rgba(167,139,250,.4);font-family:Arial,Helvetica,sans-serif;">Date Issued</td>
              <td align="right" style="padding-top:10px;font-size:12px;color:rgba(224,231,255,.7);
                         font-family:Arial,Helvetica,sans-serif;">${esc(paidAt)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${d.amountPaid ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr>
        <td align="center" style="padding:26px;background:rgba(34,197,94,.05);
                           border:1px solid rgba(34,197,94,.18);border-radius:8px;">
          <p style="margin:0 0 7px;font-size:8px;letter-spacing:.38em;text-transform:uppercase;
             color:rgba(34,197,94,.5);font-family:Arial,Helvetica,sans-serif;">AMOUNT PAID</p>
          <p style="margin:0;font-size:38px;font-weight:900;color:#22c55e;letter-spacing:.02em;
             font-family:Arial,Helvetica,sans-serif;">${esc(d.amountPaid)}</p>
        </td>
      </tr>
    </table>` : ''}

    ${trackingBox(d.trackingId, '#22c55e')}

    ${infoTable([
      infoRow('Recipient',     d.name),
      infoRow('Tracking ID',   d.trackingId),
      infoRow('Destination',   d.destination   ?? ''),
      infoRow('Package',       d.packageDetails ?? ''),
      infoRow('Est. Delivery', d.eta            ?? ''),
    ].join(''))}

    ${divider()}
    ${contextPill('&#9670; What Happens Next')}
    ${nextSteps([
      'Your payment has been verified and logged in the Swift Freight system.',
      'Your shipment is fully cleared and will resume transit immediately on the scheduled route.',
      'Live checkpoint updates will be sent at every stage of the journey.',
      `Expect delivery by <strong style="color:#eef2ff;">${esc(d.eta || 'your scheduled date')}</strong> — track anytime via your tracking ID.`,
    ])}

    ${journeySteps([
      { icon: '&#10003;', label: 'Registered', active: true  },
      { icon: '&#10003;', label: 'Cleared',    active: true  },
      { icon: '&#8594;',  label: 'In Transit', active: true  },
      { icon: '&#11044;', label: 'Delivered',  active: false },
    ])}

    ${ctaButton(url, 'Track My Shipment Live', '#22c55e')}
    <p style="font-size:11px;color:rgba(199,210,254,.28);margin:0;text-align:center;line-height:1.9;
       font-family:Arial,Helvetica,sans-serif;">
      This email is your official receipt — please keep it for your records.<br>
      Support: <a href="mailto:swiftfreightlogix@gmail.com"
        style="color:rgba(34,197,94,.5);text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
        swiftfreightlogix@gmail.com
      </a>
    </p>`;

  return {
    subject: `[CLEARED] Payment Confirmed — ${d.trackingId} | Swift Freight`,
    html:    base('#22c55e', '#4ade80', 'Payment Receipt', body,
                  `Payment confirmed for ${d.trackingId}. Your shipment is cleared and proceeding on schedule.`),
  };
}

// ── Template 10: Subscribe Notification (admin alert) ─────────────────────

export interface SubscribeNotificationData {
  subscriberEmail: string;
  subscribedAt?:   string;
}

export function subscribeNotificationEmail(d: SubscribeNotificationData): { subject: string; html: string } {
  const now = d.subscribedAt || new Date().toUTCString();
  const body = `
    ${contextPill('&#9993; New Subscriber')}
    ${statusHero('&#9993;', 'New Subscriber', 'Someone joined your Swift Freight mailing list', '#3b82f6')}
    ${bodyText('A new visitor has subscribed to your logistics newsletter. Here are the details:')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;">
      <tr>
        <td style="padding:20px 28px;
                   background:linear-gradient(135deg,rgba(109,40,217,.1),rgba(37,99,235,.1));
                   border:1px solid rgba(124,58,237,.24);border-radius:8px;text-align:center;">
          <p style="margin:0 0 7px;font-size:8px;letter-spacing:.34em;text-transform:uppercase;
             color:rgba(167,139,250,.5);font-family:Arial,Helvetica,sans-serif;">SUBSCRIBER EMAIL</p>
          <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:18px;font-weight:700;
             color:#a78bfa;letter-spacing:.08em;">${esc(d.subscriberEmail)}</p>
        </td>
      </tr>
    </table>
    ${infoTable([
      infoRow('Subscribed At', now),
      infoRow('Source',        'Swift Freight Website — Newsletter Form'),
    ].join(''))}
    ${divider()}
    <p style="font-size:12px;color:rgba(199,210,254,.28);text-align:center;margin:0;line-height:1.9;
       font-family:Arial,Helvetica,sans-serif;">
      Manage subscribers from your admin dashboard.
    </p>`;

  return {
    subject: `New Subscriber: ${d.subscriberEmail} | Swift Freight`,
    html:    base('#3b82f6', '#60a5fa', 'Admin Alert', body,
                  `New subscriber: ${d.subscriberEmail} just joined your mailing list.`),
  };
}

// ── Templates 10 & 11: Contact Form ───────────────────────────────────────

export interface ContactNotificationData {
  name:            string;
  email:           string;
  phone?:          string;
  trackingNumber?: string;
  inquiryType?:    string;
  message:         string;
  submittedAt?:    string;
}

export interface ContactAutoReplyData {
  name:    string;
  email:   string;
  message: string;
}

export function contactNotificationEmail(d: ContactNotificationData): { subject: string; html: string } {
  const at   = d.submittedAt || new Date().toUTCString();
  const type = d.inquiryType
    ? d.inquiryType.replace(/-/g,' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : 'General';
  const rows = [
    infoRow('From',          d.name),
    infoRow('Email',         d.email),
    ...(d.phone          ? [infoRow('Phone',        d.phone)]          : []),
    ...(d.trackingNumber ? [infoRow('Tracking No.', d.trackingNumber)] : []),
    ...(d.inquiryType    ? [infoRow('Inquiry Type', type)]             : []),
    infoRow('Submitted At',  at),
  ].join('');

  const body = `
    ${contextPill('&#9993; Contact Form')}
    ${statusHero('&#9993;', 'Contact Form Submission', 'A visitor sent a message via your website', '#8b5cf6')}
    ${infoTable(rows)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr>
        <td style="padding:20px 24px;
                   background:rgba(124,58,237,.06);
                   border:1px solid rgba(124,58,237,.18);
                   border-left:3px solid #8b5cf6;
                   border-radius:0 8px 8px 0;">
          <p style="margin:0 0 8px;font-size:9px;letter-spacing:.32em;text-transform:uppercase;
             color:rgba(167,139,250,.5);font-family:Arial,Helvetica,sans-serif;">MESSAGE</p>
          <p style="margin:0;font-size:13px;color:rgba(224,231,255,.78);line-height:1.85;
             white-space:pre-wrap;font-family:Arial,Helvetica,sans-serif;">
            ${d.message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}
          </p>
        </td>
      </tr>
    </table>
    ${divider()}
    <p style="font-size:12px;color:rgba(199,210,254,.3);text-align:center;margin:0;line-height:1.9;
       font-family:Arial,Helvetica,sans-serif;">
      Source: Swift Freight Logistics — Contact Page Form<br>
      Reply directly to this email to respond to ${esc(d.name)}.
    </p>`;

  return {
    subject: `Contact: ${d.name} — ${type} | Swift Freight`,
    html:    base('#8b5cf6', '#a78bfa', 'Contact Form', body,
                  `${d.name} sent a message: "${d.message.slice(0,80)}..."`),
  };
}

export function contactAutoReplyEmail(d: ContactAutoReplyData): { subject: string; html: string } {
  const body = `
    ${contextPill('&#10003; Message Received')}
    ${statusHero('&#10003;', 'Message Received', `Thank you, ${esc(d.name.split(' ')[0])}. We have your inquiry.`, '#10b981')}
    ${greeting(d.name)}
    ${bodyText('Our logistics team has received your message and will respond within <strong style="color:#eef2ff;">24–48 hours</strong>. We appreciate you reaching out to Swift Freight Logistics.')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;">
      <tr>
        <td style="padding:18px 24px;
                   background:#050818;
                   border:1px solid rgba(124,58,237,.18);
                   border-top:3px solid #10b981;
                   border-radius:0 8px 8px 0;">
          <p style="margin:0 0 8px;font-size:9px;letter-spacing:.32em;text-transform:uppercase;
             color:rgba(167,139,250,.5);font-family:Arial,Helvetica,sans-serif;">Your Message</p>
          <p style="margin:0;font-size:13px;color:rgba(199,210,254,.6);line-height:1.85;
             white-space:pre-wrap;max-height:140px;overflow:hidden;
             font-family:Arial,Helvetica,sans-serif;">
            ${d.message.replace(/</g,'&lt;').replace(/>/g,'&gt;').substring(0, 420)}${d.message.length > 420 ? '…' : ''}
          </p>
        </td>
      </tr>
    </table>
    ${divider()}
    ${contextPill('&#9670; What Happens Next')}
    ${nextSteps([
      'Our team is reviewing your inquiry.',
      'A specialist will contact you within 24–48 hours.',
      'Check your inbox — a follow-up will arrive shortly.',
    ])}
    ${ctaButton(`${SITE}/payment.html`, 'Track a Shipment', '#10b981')}
    <p style="font-size:12px;color:rgba(199,210,254,.28);text-align:center;margin:0;line-height:1.9;
       font-family:Arial,Helvetica,sans-serif;">
      If you have a tracking number, use the link above for real-time updates.
    </p>`;

  return {
    subject: `We received your message — Swift Freight Logistics`,
    html:    base('#10b981', '#34d399', 'Inquiry Confirmed', body,
                  `Hi ${d.name}, your message has been received. We'll reply within 24–48 hours.`),
  };
}

// ── Export map ─────────────────────────────────────────────────────────────

export type EmailType =
  | 'shipment-registered'
  | 'quote-received'
  | 'location-update'
  | 'payment-required'
  | 'payment-confirmed'
  | 'delayed'
  | 'customs-hold'
  | 'out-for-delivery'
  | 'delivered'
  | 'subscribe-notification'
  | 'contact-notification'
  | 'contact-auto-reply';

export function buildEmailFromType(
  type: EmailType,
  data: Record<string, unknown>,
): { subject: string; html: string } {
  switch (type) {
    case 'shipment-registered':    return shipmentRegisteredEmail(data as ShipmentRegisteredData);
    case 'quote-received':         return quoteReceivedEmail(data as QuoteReceivedData);
    case 'location-update':        return locationUpdateEmail(data as LocationUpdateData);
    case 'payment-required':       return paymentRequiredEmail(data as PaymentRequiredData);
    case 'payment-confirmed':      return paymentConfirmedEmail(data as PaymentConfirmedData);
    case 'delayed':                return delayedEmail(data as DelayedData);
    case 'customs-hold':           return customsHoldEmail(data as CustomsHoldData);
    case 'out-for-delivery':       return outForDeliveryEmail(data as OutForDeliveryData);
    case 'delivered':              return deliveredEmail(data as DeliveredData);
    case 'subscribe-notification': return subscribeNotificationEmail(data as SubscribeNotificationData);
    case 'contact-notification':   return contactNotificationEmail(data as ContactNotificationData);
    case 'contact-auto-reply':     return contactAutoReplyEmail(data as ContactAutoReplyData);
    default: throw new Error(`Unknown email type: ${type}`);
  }
}
