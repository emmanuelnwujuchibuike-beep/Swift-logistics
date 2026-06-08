const SITE = 'https://swiftfreightlogix.netlify.app';

// ── Helpers ───────────────────────────────────────────────────────

function trackingUrl(id: string) {
  return `${SITE}/payment.html?id=${encodeURIComponent(id)}`;
}

function base(accentHex: string, accentLight: string, badgeLabel: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#020914;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#020914;padding:0;">
<tr><td align="center" style="padding:48px 16px 64px;">

  <table width="620" cellpadding="0" cellspacing="0" role="presentation" style="max-width:620px;width:100%;">

    <!-- TOP EYEBROW BAR -->
    <tr><td style="padding:0 0 20px;">
      <p style="margin:0;font-size:10px;letter-spacing:.38em;text-transform:uppercase;color:rgba(232,240,254,.2);text-align:center;">Secure Shipment Notification &middot; Swift Freight Logistics</p>
    </td></tr>

    <!-- HEADER: logo + badge -->
    <tr><td style="background:#030c1c;border:1px solid rgba(59,130,246,.15);border-bottom:none;border-radius:6px 6px 0 0;padding:28px 40px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td>
            <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:.28em;text-transform:uppercase;color:#e8f0fe;">
              <span style="color:${accentHex};">SWIFT</span> FREIGHT
            </p>
            <p style="margin:4px 0 0;font-size:8px;letter-spacing:.54em;text-transform:uppercase;color:rgba(59,130,246,.35);">LOGISTICS &middot; WORLDWIDE</p>
          </td>
          <td align="right" valign="middle">
            <span style="display:inline-block;padding:6px 14px;border:1px solid rgba(59,130,246,.25);border-radius:2px;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(232,240,254,.4);">${badgeLabel}</span>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- GRADIENT ACCENT LINE (3px) -->
    <tr><td style="height:3px;font-size:0;line-height:0;background:linear-gradient(90deg,${accentHex} 0%,${accentLight} 50%,transparent 100%);">&nbsp;</td></tr>

    <!-- BODY -->
    <tr><td style="background:#060f1e;border-left:1px solid rgba(59,130,246,.1);border-right:1px solid rgba(59,130,246,.1);padding:40px 40px 36px;">
      ${bodyHtml}
    </td></tr>

    <!-- FOOTER -->
    <tr><td style="background:#020914;border:1px solid rgba(59,130,246,.08);border-top:none;border-radius:0 0 6px 6px;padding:24px 40px;text-align:center;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:.04em;color:rgba(232,240,254,.2);line-height:1.9;">
        Swift Freight Logistics &nbsp;&middot;&nbsp; swiftfreightlogix.netlify.app<br>
        <a href="${SITE}/payment.html" style="color:rgba(59,130,246,.4);text-decoration:none;">Track a Shipment</a> &nbsp;&middot;&nbsp;
        <a href="mailto:support@swiftfreightlogix.com" style="color:rgba(59,130,246,.4);text-decoration:none;">Contact Support</a>
      </p>
      <p style="margin:0;font-size:9px;color:rgba(232,240,254,.1);letter-spacing:.06em;">If you did not request this email, please disregard it.</p>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}

function trackingBox(trackingId: string, accent = '#3b82f6'): string {
  const url = trackingUrl(trackingId);
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 20px;">
  <tr><td style="background:rgba(59,130,246,.06);border:1px solid ${accent}55;border-radius:4px;padding:24px 28px;text-align:center;">
    <p style="margin:0 0 10px;font-size:9px;letter-spacing:.42em;text-transform:uppercase;color:rgba(232,240,254,.3);">TRACKING NUMBER</p>
    <p style="margin:0 0 12px;font-family:'Courier New',Courier,monospace;font-size:24px;font-weight:700;color:${accent};letter-spacing:.22em;">${trackingId}</p>
    <a href="${url}" style="font-size:10px;color:rgba(232,240,254,.35);text-decoration:none;letter-spacing:.08em;">Tap to track live &#8594;</a>
  </td></tr>
</table>`;
}

function statusHero(symbol: string, title: string, subtitle: string, accentHex: string): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
  <tr><td style="background:${accentHex}0d;border:1px solid ${accentHex}33;border-top:3px solid ${accentHex};border-radius:4px;padding:32px 28px 26px;text-align:center;">
    <p style="margin:0 0 10px;font-size:28px;color:${accentHex};line-height:1;">${symbol}</p>
    <p style="margin:0 0 8px;font-size:17px;font-weight:900;letter-spacing:.22em;text-transform:uppercase;color:#e8f0fe;">${title}</p>
    <p style="margin:0;font-size:12px;color:rgba(232,240,254,.45);letter-spacing:.04em;">${subtitle}</p>
  </td></tr>
</table>`;
}

function infoRow(label: string, value: string): string {
  if (!value) return '';
  return `
<tr>
  <td style="font-size:10px;color:rgba(232,240,254,.32);letter-spacing:.1em;text-transform:uppercase;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04);white-space:nowrap;padding-right:28px;">
    <span style="display:inline-block;width:4px;height:4px;background:rgba(59,130,246,.4);border-radius:50%;margin-right:8px;vertical-align:middle;"></span>${label}
  </td>
  <td style="font-size:13px;color:rgba(232,240,254,.75);padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04);">${value}</td>
</tr>`;
}

function infoTable(rows: string): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
  ${rows}
</table>`;
}

function ctaButton(url: string, label: string, accent = '#3b82f6'): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px auto 28px;">
  <tr><td style="background:${accent};border-radius:3px;" align="center">
    <a href="${url}" target="_blank" style="display:inline-block;padding:15px 44px;color:#fff;font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;text-decoration:none;">
      ${label} &#8594;
    </a>
  </td></tr>
</table>`;
}

function divider(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;"><tr><td style="height:1px;background:rgba(59,130,246,.1);font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
}

function greeting(name: string): string {
  return `<p style="font-size:15px;color:rgba(232,240,254,.72);margin:0 0 22px;line-height:1.8;">
    Dear <strong style="color:#e8f0fe;">${name}</strong>,
  </p>`;
}

function alertBox(text: string, accent = '#f59e0b'): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
  <tr><td style="background:${accent}0f;border-left:4px solid ${accent};border-radius:0 3px 3px 0;padding:14px 18px;">
    <p style="font-size:13px;color:rgba(232,240,254,.72);margin:0;line-height:1.75;">
      <span style="color:${accent};font-weight:700;margin-right:6px;">&#9888;</span>${text}
    </p>
  </td></tr>
</table>`;
}

function paymentMethod(icon: string, label: string, value: string): string {
  if (!value) return '';
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0;">
  <tr><td style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:3px;padding:14px 18px;">
    <p style="margin:0 0 6px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:rgba(232,240,254,.32);">${icon} ${label}</p>
    <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:13px;color:rgba(232,240,254,.72);word-break:break-all;">${value}</p>
  </td></tr>
</table>`;
}

function nextSteps(steps: string[]): string {
  const rows = steps.map((s, i) => `
    <tr>
      <td valign="top" style="padding:7px 14px 7px 0;white-space:nowrap;">
        <span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:rgba(59,130,246,.15);border:1px solid rgba(59,130,246,.3);font-size:10px;font-weight:700;color:#60a5fa;text-align:center;line-height:20px;">${i + 1}</span>
      </td>
      <td style="font-size:12px;color:rgba(232,240,254,.55);padding:7px 0;line-height:1.7;">${s}</td>
    </tr>`).join('');
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
  ${rows}
</table>`;
}

// ── Template 1: Shipment Registered ──────────────────────────────

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
  const url = trackingUrl(d.trackingId);
  const body = `
    ${statusHero('&#10022;', 'SHIPMENT REGISTERED', 'Your package is now active in our system', '#3b82f6')}
    ${greeting(d.name)}
    <p style="font-size:14px;color:rgba(232,240,254,.55);margin:0 0 6px;line-height:1.8;">
      Your shipment has been registered with Swift Freight Logistics and is now active in our system.
      Use the tracking number below to monitor your package in real time.
    </p>
    ${trackingBox(d.trackingId, '#3b82f6')}
    ${infoTable([
      infoRow('Recipient',     d.name),
      infoRow('Sender',        d.senderName     ?? ''),
      infoRow('From',          d.origin         ?? ''),
      infoRow('To',            d.destination    ?? ''),
      infoRow('Est. Delivery', d.eta            ?? ''),
      infoRow('Package',       d.packageDetails ?? ''),
      infoRow('Service',       d.serviceType    ?? ''),
    ].join(''))}
    ${divider()}
    <p style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(232,240,254,.35);margin:0 0 10px;">What to expect next</p>
    ${nextSteps([
      'Our team arranges pickup from the origin address.',
      'Your package enters the transit network and is tracked at every checkpoint.',
      'Final delivery is made to your destination — you\'ll be notified each step of the way.',
    ])}
    ${ctaButton(url, 'Track My Shipment Live')}
    <p style="font-size:11px;color:rgba(232,240,254,.25);margin:0;text-align:center;line-height:1.7;">
      Or copy: <a href="${url}" style="color:rgba(59,130,246,.45);word-break:break-all;text-decoration:none;">${url}</a>
    </p>`;

  return {
    subject: `Your Shipment is Registered — ${d.trackingId} | Swift Freight`,
    html:    base('#3b82f6', '#60a5fa', 'Shipment Notification', body),
  };
}

// ── Template 2: Quote Received ────────────────────────────────────

export interface QuoteReceivedData {
  name:         string;
  origin?:      string;
  destination?: string;
  cargoType?:   string;
  refCode?:     string;
}

export function quoteReceivedEmail(d: QuoteReceivedData): { subject: string; html: string } {
  const body = `
    ${statusHero('&#10198;', 'QUOTE RECEIVED', 'Our team will respond within 24 hours', '#3b82f6')}
    ${greeting(d.name)}
    <p style="font-size:14px;color:rgba(232,240,254,.55);margin:0 0 24px;line-height:1.8;">
      We have received your freight quote request and a member of our team will review the details
      and reach out to you within <strong style="color:#e8f0fe;">24 hours</strong> with a tailored proposal.
    </p>
    ${d.refCode ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.2);border-radius:4px;padding:18px 24px;text-align:center;">
        <p style="margin:0 0 8px;font-size:9px;letter-spacing:.38em;text-transform:uppercase;color:rgba(232,240,254,.3);">Reference Code</p>
        <p style="margin:0;font-size:16px;font-weight:700;color:#60a5fa;letter-spacing:.14em;">${d.refCode}</p>
      </td></tr>
    </table>` : ''}
    ${infoTable([
      infoRow('Origin',      d.origin      ?? ''),
      infoRow('Destination', d.destination ?? ''),
      infoRow('Cargo Type',  d.cargoType   ?? ''),
    ].join(''))}
    ${divider()}
    <p style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(232,240,254,.35);margin:0 0 10px;">Next Steps</p>
    ${nextSteps([
      'Our logistics team reviews your shipment requirements and route.',
      'You receive a detailed, competitive quote by email within 24 hours.',
      'Once approved, we register your shipment and issue a live tracking ID.',
    ])}`;

  return {
    subject: `Quote Request Received — We'll Be in Touch | Swift Freight`,
    html:    base('#3b82f6', '#60a5fa', 'Quote Request', body),
  };
}

// ── Template 3: Location Update ───────────────────────────────────

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
    ${statusHero('&#9658;', 'NEW CHECKPOINT', 'Your shipment has reached a new location', '#06b6d4')}
    ${greeting(d.name)}
    <p style="font-size:14px;color:rgba(232,240,254,.55);margin:0 0 20px;line-height:1.8;">
      Your shipment has reached a new checkpoint. Below are the latest details.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:rgba(6,182,212,.08);border:1px solid rgba(6,182,212,.28);border-top:3px solid #06b6d4;border-radius:4px;padding:22px 24px;">
        <p style="margin:0 0 6px;font-size:9px;letter-spacing:.34em;text-transform:uppercase;color:rgba(6,182,212,.55);">CURRENT LOCATION</p>
        <p style="margin:0 0 6px;font-size:20px;font-weight:700;color:#22d3ee;letter-spacing:.04em;">${d.newLocation}</p>
        ${d.status ? `<p style="margin:0;font-size:11px;color:rgba(232,240,254,.4);">${d.status}</p>` : ''}
      </td></tr>
    </table>
    ${infoTable([
      infoRow('Tracking ID',   d.trackingId),
      infoRow('Est. Delivery', d.eta ?? ''),
    ].join(''))}
    ${ctaButton(url, 'View Full Timeline', '#06b6d4')}`;

  return {
    subject: `Update: Your Shipment Has Reached ${d.newLocation}`,
    html:    base('#06b6d4', '#22d3ee', 'Location Update', body),
  };
}

// ── Template 4: Payment Required ──────────────────────────────────

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
  const url = trackingUrl(d.trackingId);
  const hasBank = d.bankName || d.accountName || d.bankNumber;

  const body = `
    ${statusHero('&#9888;', 'PAYMENT REQUIRED', 'Your shipment is currently on hold', '#f59e0b')}
    ${greeting(d.name)}
    <p style="font-size:14px;color:rgba(232,240,254,.55);margin:0 0 6px;line-height:1.8;">
      Your shipment is currently on hold pending payment clearance. Please complete the payment
      below to release your package and resume transit to the destination.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.35);border-top:3px solid #f59e0b;border-radius:4px;padding:24px 28px;text-align:center;">
        <p style="margin:0 0 8px;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:rgba(245,158,11,.6);">AMOUNT DUE</p>
        <p style="margin:0 0 8px;font-size:34px;font-weight:900;color:#fbbf24;letter-spacing:.02em;">${d.amountDue}</p>
        ${d.destination ? `<p style="margin:0;font-size:11px;color:rgba(232,240,254,.38);">For delivery to ${d.destination}</p>` : ''}
      </td></tr>
    </table>
    ${alertBox('Your shipment cannot proceed until payment is confirmed. Please act promptly to avoid further delays.', '#f59e0b')}
    <p style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(232,240,254,.35);margin:20px 0 12px;">Payment Methods</p>
    ${paymentMethod('&#8383;', 'Bitcoin (BTC)', d.btcAddress ?? '')}
    ${paymentMethod('&#9675;', 'USDT (TRC20 / ERC20)', d.usdtAddress ?? '')}
    ${hasBank ? paymentMethod('&#9780;', 'Wire Transfer', [d.bankName, d.accountName, d.bankNumber].filter(Boolean).join(' &middot; ')) : ''}
    ${ctaButton(url, 'View Payment Details', '#f59e0b')}
    <p style="font-size:11px;color:rgba(232,240,254,.28);margin:0;text-align:center;line-height:1.8;">
      After completing payment, please contact our support team with your transaction reference.<br>
      <a href="mailto:support@swiftfreightlogix.com" style="color:rgba(245,158,11,.5);text-decoration:none;">support@swiftfreightlogix.com</a>
    </p>`;

  return {
    subject: `[URGENT] Payment Required — Shipment ${d.trackingId} On Hold`,
    html:    base('#f59e0b', '#fcd34d', 'Payment Notice', body),
  };
}

// ── Template 5: Delayed ───────────────────────────────────────────

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
    ${statusHero('&#10023;', 'DELIVERY DELAYED', 'We sincerely apologise for the inconvenience', '#f59e0b')}
    ${greeting(d.name)}
    <p style="font-size:14px;color:rgba(232,240,254,.55);margin:0 0 20px;line-height:1.8;">
      We sincerely apologise — your shipment has encountered an unexpected delay.
      Our team is actively working to resolve this and get your package moving as quickly as possible.
    </p>
    ${d.reason ? alertBox(`<strong style="color:rgba(232,240,254,.7);">Reason:</strong> ${d.reason}`, '#f59e0b') : ''}
    ${infoTable([
      infoRow('Tracking ID',       d.trackingId),
      infoRow('Last Location',     d.currentLocation ?? ''),
      infoRow('New Est. Delivery', d.newEta ?? 'To be confirmed'),
    ].join(''))}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr><td style="background:rgba(59,130,246,.05);border:1px solid rgba(59,130,246,.1);border-radius:3px;padding:16px 18px;">
        <p style="margin:0;font-size:12px;color:rgba(232,240,254,.5);line-height:1.8;">
          We are actively monitoring your shipment and will send another update as soon as it resumes transit.
          For urgent enquiries, contact <a href="mailto:support@swiftfreightlogix.com" style="color:rgba(245,158,11,.6);text-decoration:none;">support@swiftfreightlogix.com</a>
        </p>
      </td></tr>
    </table>
    ${ctaButton(url, 'Track Shipment', '#f59e0b')}`;

  return {
    subject: `Delay Notice — Shipment ${d.trackingId} | Swift Freight`,
    html:    base('#f59e0b', '#fcd34d', 'Delay Notice', body),
  };
}

// ── Template 6: Customs Hold ──────────────────────────────────────

export interface CustomsHoldData {
  name:              string;
  trackingId:        string;
  customsLocation?:  string;
  estimatedDelay?:   string;
}

export function customsHoldEmail(d: CustomsHoldData): { subject: string; html: string } {
  const url = trackingUrl(d.trackingId);
  const body = `
    ${statusHero('&#8853;', 'CUSTOMS CLEARANCE', 'Standard international procedure — no action required', '#f97316')}
    ${greeting(d.name)}
    <p style="font-size:14px;color:rgba(232,240,254,.55);margin:0 0 20px;line-height:1.8;">
      Your shipment is currently being held for customs inspection. This is a standard procedure
      for international freight and is typically resolved within a short timeframe.
    </p>
    ${infoTable([
      infoRow('Tracking ID',      d.trackingId),
      infoRow('Customs Location', d.customsLocation ?? ''),
      infoRow('Est. Delay',       d.estimatedDelay  ?? 'To be confirmed'),
    ].join(''))}
    ${alertBox('Your shipment is undergoing customs clearance. No action is required from you at this time unless you are directly contacted by our team.', '#f97316')}
    ${ctaButton(url, 'Track Shipment', '#f97316')}
    <p style="font-size:12px;color:rgba(232,240,254,.32);margin:0;text-align:center;line-height:1.8;">
      We will notify you immediately once your shipment clears customs.
    </p>`;

  return {
    subject: `Customs Inspection Notice — ${d.trackingId} | Swift Freight`,
    html:    base('#f97316', '#fb923c', 'Customs Notice', body),
  };
}

// ── Template 7: Out for Delivery ──────────────────────────────────

export interface OutForDeliveryData {
  name:              string;
  trackingId:        string;
  deliveryAddress?:  string;
  estimatedTime?:    string;
}

export function outForDeliveryEmail(d: OutForDeliveryData): { subject: string; html: string } {
  const url = trackingUrl(d.trackingId);
  const body = `
    ${statusHero('&#9658;', 'OUT FOR DELIVERY', 'Arriving today &mdash; please be available to receive', '#14b8a6')}
    ${greeting(d.name)}
    <p style="font-size:14px;color:rgba(232,240,254,.55);margin:0 0 20px;line-height:1.8;">
      Great news &#8212; your shipment is out for delivery and will arrive today.
      Please ensure someone is available to receive it.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:rgba(20,184,166,.08);border:1px solid rgba(20,184,166,.3);border-top:3px solid #14b8a6;border-radius:4px;padding:24px;text-align:center;">
        <p style="margin:0 0 8px;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:rgba(20,184,166,.6);">DELIVERY DATE</p>
        <p style="margin:0 0 6px;font-size:28px;font-weight:900;color:#2dd4bf;">Today</p>
        ${d.estimatedTime ? `<p style="margin:0;font-size:12px;color:rgba(232,240,254,.4);">Expected: ${d.estimatedTime}</p>` : ''}
      </td></tr>
    </table>
    ${infoTable([
      infoRow('Tracking ID',      d.trackingId),
      infoRow('Delivery Address', d.deliveryAddress ?? ''),
    ].join(''))}
    ${ctaButton(url, 'Track Delivery', '#14b8a6')}`;

  return {
    subject: `Out for Delivery Today — ${d.trackingId} | Swift Freight`,
    html:    base('#14b8a6', '#2dd4bf', 'Out for Delivery', body),
  };
}

// ── Template 8: Delivered ─────────────────────────────────────────

export interface DeliveredData {
  name:              string;
  trackingId:        string;
  deliveryDate?:     string;
  deliveryLocation?: string;
}

export function deliveredEmail(d: DeliveredData): { subject: string; html: string } {
  const url = trackingUrl(d.trackingId);
  const body = `
    ${statusHero('&#10003;', 'DELIVERED', 'Your shipment has been successfully delivered', '#22c55e')}
    ${greeting(d.name)}
    <p style="font-size:14px;color:rgba(232,240,254,.55);margin:0 0 20px;line-height:1.8;">
      Your shipment has been successfully delivered. Thank you for trusting Swift Freight Logistics.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.28);border-top:3px solid #22c55e;border-radius:4px;padding:28px;text-align:center;">
        <p style="margin:0 0 8px;font-size:32px;color:#22c55e;line-height:1;">&#10003;</p>
        <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#4ade80;letter-spacing:.06em;">Delivered Successfully</p>
        ${d.deliveryDate ? `<p style="margin:0;font-size:12px;color:rgba(232,240,254,.4);">${d.deliveryDate}</p>` : ''}
      </td></tr>
    </table>
    ${infoTable([
      infoRow('Tracking ID',  d.trackingId),
      infoRow('Delivered To', d.deliveryLocation ?? ''),
    ].join(''))}
    ${divider()}
    <p style="font-size:13px;color:rgba(232,240,254,.42);margin:0 0 18px;text-align:center;line-height:1.9;">
      We hope your experience with Swift Freight Logistics has been outstanding.<br>
      For your next shipment, we are always ready to serve you.
    </p>
    <p style="text-align:center;margin:0 0 24px;">
      <a href="${SITE}/quote.html" style="font-size:11px;color:rgba(34,197,94,.6);text-decoration:none;letter-spacing:.08em;">Ship Again &#8594;</a>
    </p>
    ${ctaButton(url, 'View Delivery Confirmation', '#22c55e')}`;

  return {
    subject: `[DELIVERED] Shipment ${d.trackingId} Successfully Delivered`,
    html:    base('#22c55e', '#4ade80', 'Delivery Confirmed', body),
  };
}

// ── Template 9: Subscribe Notification (admin alert) ─────────

export interface SubscribeNotificationData {
  subscriberEmail: string;
  subscribedAt?:   string;
}

export function subscribeNotificationEmail(d: SubscribeNotificationData): { subject: string; html: string } {
  const now = d.subscribedAt || new Date().toUTCString();
  const body = `
    ${statusHero('&#9993;', 'NEW SUBSCRIBER', 'Someone joined your Swift Freight mailing list', '#3b82f6')}
    <p style="font-size:14px;color:rgba(232,240,254,.55);margin:0 0 24px;line-height:1.8;">
      A new visitor has subscribed to your logistics newsletter. Here are the details:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td style="background:rgba(59,130,246,.07);border:1px solid rgba(59,130,246,.28);border-top:3px solid #3b82f6;border-radius:4px;padding:24px 28px;text-align:center;">
        <p style="margin:0 0 8px;font-size:10px;letter-spacing:.38em;text-transform:uppercase;color:rgba(232,240,254,.3);">SUBSCRIBER EMAIL</p>
        <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:18px;font-weight:700;color:#60a5fa;letter-spacing:.06em;">${d.subscriberEmail}</p>
      </td></tr>
    </table>
    ${infoTable(infoRow('Subscribed At', now))}
    ${divider()}
    <p style="font-size:12px;color:rgba(232,240,254,.3);text-align:center;margin:0;line-height:1.8;">
      This is an automated alert from your Swift Freight website.<br>
      You can manage subscribers from your admin dashboard.
    </p>`;

  return {
    subject: `New Subscriber: ${d.subscriberEmail} | Swift Freight`,
    html:    base('#3b82f6', '#60a5fa', 'Admin Alert', body),
  };
}

// ── Template 10 & 11: Contact Form ───────────────────────────────

export interface ContactNotificationData {
  name:         string;
  email:        string;
  phone?:       string;
  trackingNumber?: string;
  inquiryType?: string;
  message:      string;
  submittedAt?: string;
}

export interface ContactAutoReplyData {
  name:    string;
  email:   string;
  message: string;
}

export function contactNotificationEmail(d: ContactNotificationData): { subject: string; html: string } {
  const at  = d.submittedAt || new Date().toUTCString();
  const rows = [
    infoRow('From',           d.name),
    infoRow('Email',          d.email),
    ...(d.phone          ? [infoRow('Phone',          d.phone)]          : []),
    ...(d.trackingNumber ? [infoRow('Tracking No.',   d.trackingNumber)] : []),
    ...(d.inquiryType    ? [infoRow('Inquiry Type',   d.inquiryType.replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase()))] : []),
    infoRow('Submitted At',   at),
  ].join('');

  const body = `
    ${statusHero('&#9993;', 'CONTACT FORM', 'A visitor sent a message via your website', '#8b5cf6')}
    ${infoTable(rows)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td style="background:rgba(139,92,246,.06);border:1px solid rgba(139,92,246,.22);border-left:3px solid #8b5cf6;border-radius:0 4px 4px 0;padding:20px 24px;">
        <p style="margin:0 0 8px;font-size:9px;letter-spacing:.38em;text-transform:uppercase;color:rgba(232,240,254,.3);">MESSAGE</p>
        <p style="margin:0;font-size:13px;color:rgba(232,240,254,.78);line-height:1.8;white-space:pre-wrap;">${d.message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
      </td></tr>
    </table>
    ${divider()}
    <p style="font-size:12px;color:rgba(232,240,254,.3);text-align:center;margin:0;line-height:1.8;">
      Source: Swift Freight Logistics — Contact Page Form<br>
      Reply directly to this email to respond to ${d.name}.
    </p>`;

  return {
    subject: `Contact: ${d.name} — ${d.inquiryType || 'General'} | Swift Freight`,
    html:    base('#8b5cf6', '#a78bfa', 'Contact Form', body),
  };
}

export function contactAutoReplyEmail(d: ContactAutoReplyData): { subject: string; html: string } {
  const body = `
    ${statusHero('&#10003;', 'MESSAGE RECEIVED', `Thank you, ${d.name}. We have your inquiry.`, '#10b981')}
    <p style="font-size:14px;color:rgba(232,240,254,.55);margin:0 0 24px;line-height:1.8;">
      Our logistics team has received your message and will respond within <strong style="color:rgba(232,240,254,.8);">24–48 hours</strong>.
      We appreciate you reaching out to Swift Freight Logistics.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-top:3px solid #10b981;border-radius:4px;padding:20px 24px;">
        <p style="margin:0 0 8px;font-size:9px;letter-spacing:.38em;text-transform:uppercase;color:rgba(232,240,254,.28);">YOUR MESSAGE</p>
        <p style="margin:0;font-size:13px;color:rgba(232,240,254,.6);line-height:1.8;white-space:pre-wrap;max-height:120px;overflow:hidden;">${d.message.replace(/</g,'&lt;').replace(/>/g,'&gt;').substring(0,400)}${d.message.length > 400 ? '…' : ''}</p>
      </td></tr>
    </table>
    ${nextSteps(['Our team is reviewing your inquiry', 'A specialist will contact you within 24–48 hours', 'Check your inbox — a follow-up will arrive soon'])}
    ${ctaButton('https://swiftfreightlogix.netlify.app/payment.html', 'Track a Shipment', '#10b981')}
    ${divider()}
    <p style="font-size:12px;color:rgba(232,240,254,.3);text-align:center;margin:0;line-height:1.8;">
      If you have a tracking number, use the link above for real-time updates.
    </p>`;

  return {
    subject: `We received your message — Swift Freight Logistics`,
    html:    base('#10b981', '#34d399', 'Inquiry Confirmed', body),
  };
}

// ── Export map ────────────────────────────────────────────────────

export type EmailType =
  | 'shipment-registered'
  | 'quote-received'
  | 'location-update'
  | 'payment-required'
  | 'delayed'
  | 'customs-hold'
  | 'out-for-delivery'
  | 'delivered'
  | 'subscribe-notification'
  | 'contact-notification'
  | 'contact-auto-reply';

export function buildEmailFromType(
  type: EmailType,
  data: Record<string, unknown>
): { subject: string; html: string } {
  switch (type) {
    case 'shipment-registered': return shipmentRegisteredEmail(data as ShipmentRegisteredData);
    case 'quote-received':      return quoteReceivedEmail(data as QuoteReceivedData);
    case 'location-update':     return locationUpdateEmail(data as LocationUpdateData);
    case 'payment-required':    return paymentRequiredEmail(data as PaymentRequiredData);
    case 'delayed':             return delayedEmail(data as DelayedData);
    case 'customs-hold':        return customsHoldEmail(data as CustomsHoldData);
    case 'out-for-delivery':    return outForDeliveryEmail(data as OutForDeliveryData);
    case 'delivered':                return deliveredEmail(data as DeliveredData);
    case 'subscribe-notification':   return subscribeNotificationEmail(data as SubscribeNotificationData);
    case 'contact-notification': return contactNotificationEmail(data as ContactNotificationData);
    case 'contact-auto-reply':   return contactAutoReplyEmail(data as ContactAutoReplyData);
    default: throw new Error(`Unknown email type: ${type}`);
  }
}
