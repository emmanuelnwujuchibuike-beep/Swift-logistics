import { CORS_HEADERS, json, err } from '../_shared/cors.ts';
import { sendEmail }               from '../_shared/resend.ts';

const ADMIN_EMAIL = 'swiftfreightlogix@gmail.com';
const SITE        = 'https://swiftfreightlogix.netlify.app';
const ADMIN_PANEL = `${SITE}/src/admin.html`;
const TRACK_URL   = `${SITE}/payment.html`;

/* ══════════════════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════════════════ */

function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function firstName(name: string): string {
  return esc(name.split(' ')[0] || name);
}

/* ── Ultra-premium shell: white · blue · purple ─────────────────────────
   Stripe: e0e7ff → 93c5fd → 3b82f6 → 7c3aed → c084fc
   Header: deep indigo-navy gradient
   Body:   rich dark navy
   ──────────────────────────────────────────────────────────────────────── */
function shell(opts: {
  preheader : string;
  badge     : string;
  body      : string;
}): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="color-scheme" content="dark light">
  <meta name="supported-color-schemes" content="dark light">
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

<!-- Preheader (hidden preview text) -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;visibility:hidden;opacity:0;
            color:transparent;height:0;width:0;font-size:1px;">
  ${esc(opts.preheader)}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>

<!-- Outer wrapper -->
<table role="presentation" class="em-bg" width="100%" border="0" cellpadding="0" cellspacing="0"
       style="background:#03060f;min-height:100vh;">
<tr><td align="center" valign="top" style="padding:52px 16px 80px;">

<table role="presentation" class="em-card" width="600" border="0" cellpadding="0" cellspacing="0"
       style="max-width:600px;width:100%;">

  <!-- ── Eyebrow ── -->
  <tr><td align="center" style="padding:0 0 22px;">
    <p style="margin:0;font-size:9px;letter-spacing:.56em;text-transform:uppercase;
       font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.28);">
      Swift Freight Logistics &nbsp;&bull;&nbsp; Support Centre
    </p>
  </td></tr>

  <!-- ── Header ── -->
  <tr><td style="background:linear-gradient(145deg,#130e2e 0%,#0d1048 55%,#090b28 100%);
                 border:1px solid rgba(124,58,237,.3);border-bottom:none;
                 border-radius:14px 14px 0 0;padding:36px 52px 30px;">
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td valign="middle">
          <!-- Micro-label -->
          <p style="margin:0 0 5px;font-size:8px;letter-spacing:.62em;text-transform:uppercase;
             font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.38);">
            OFFICIAL NOTIFICATION
          </p>
          <!-- Wordmark -->
          <p style="margin:0;line-height:1;font-size:0;">
            <span style="font-size:25px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;
                  font-family:Arial,Helvetica,sans-serif;color:#a78bfa;">SFL</span><span
                  style="font-size:25px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;
                  font-family:Arial,Helvetica,sans-serif;color:#dde5ff;">&thinsp;LOGISTICS</span>
          </p>
        </td>
        <td align="right" valign="middle">
          <!-- Badge pill -->
          <span style="display:inline-block;padding:8px 18px;
                background:rgba(124,58,237,.13);
                border:1px solid rgba(167,139,250,.3);
                border-radius:4px;font-size:8px;letter-spacing:.3em;text-transform:uppercase;
                font-family:Arial,Helvetica,sans-serif;color:rgba(199,210,254,.72);
                white-space:nowrap;">
            ${esc(opts.badge)}
          </span>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- ── Gradient accent stripe: white → blue → purple ── -->
  <tr><td height="5" style="height:5px;line-height:5px;font-size:0;
      background:linear-gradient(90deg,#e0e7ff 0%,#93c5fd 14%,#3b82f6 38%,#6d28d9 68%,#c084fc 100%);">
    &zwnj;
  </td></tr>

  <!-- ── Body ── -->
  <tr><td class="em-pad"
          style="background:linear-gradient(180deg,#090d26 0%,#06091c 100%);
                 border-left:1px solid rgba(124,58,237,.15);
                 border-right:1px solid rgba(124,58,237,.15);
                 padding:52px 52px 46px;">
    ${opts.body}
  </td></tr>

  <!-- ── Footer ── -->
  <tr><td style="background:#040712;border:1px solid rgba(124,58,237,.14);border-top:none;
                 border-radius:0 0 14px 14px;padding:26px 52px 32px;" align="center">
    <!-- Thin divider line in footer -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
           style="margin-bottom:18px;">
      <tr><td height="1" style="height:1px;line-height:1px;font-size:0;
          background:linear-gradient(90deg,transparent,rgba(124,58,237,.25),transparent);">
        &zwnj;
      </td></tr>
    </table>
    <p style="margin:0 0 12px;font-size:11px;color:rgba(199,210,254,.22);line-height:2.5;
       letter-spacing:.03em;font-family:Arial,Helvetica,sans-serif;">
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

/* ── Shared components ───────────────────────────────────────────────────── */

function contextPill(text: string): string {
  return `
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td style="padding:8px 20px;background:rgba(124,58,237,.1);
                 border:1px solid rgba(167,139,250,.24);border-radius:99px;">
        <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:.18em;
           color:rgba(167,139,250,.9);font-family:Arial,Helvetica,sans-serif;
           text-transform:uppercase;">${esc(text)}</p>
      </td>
    </tr>
  </table>`;
}

function heading(title: string, subtitle: string): string {
  return `
  <h1 style="margin:0 0 12px;font-size:28px;font-weight:900;letter-spacing:.02em;
     color:#eef2ff;font-family:Arial,Helvetica,sans-serif;line-height:1.2;">
    ${title}
  </h1>
  <p style="margin:0 0 38px;font-size:14px;color:rgba(199,210,254,.52);line-height:1.95;
     font-family:Arial,Helvetica,sans-serif;">${subtitle}</p>`;
}

function fieldRow(label: string, value: string): string {
  return `
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
         style="margin-bottom:8px;">
    <tr>
      <td style="padding:15px 22px 17px;background:#050818;
                 border:1px solid rgba(124,58,237,.18);border-radius:7px;">
        <p style="margin:0 0 5px;font-size:8px;letter-spacing:.28em;text-transform:uppercase;
           font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.5);">${esc(label)}</p>
        <p style="margin:0;font-size:14px;color:#dde5ff;letter-spacing:.01em;
           font-family:Arial,Helvetica,sans-serif;line-height:1.5;word-break:break-word;">${esc(value)}</p>
      </td>
    </tr>
  </table>`;
}

function fieldPair(a: [string, string], b: [string, string]): string {
  return `
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
         style="margin-bottom:8px;">
    <tr>
      <td width="49%" valign="top"
          style="padding:15px 22px 17px;background:#050818;
                 border:1px solid rgba(124,58,237,.18);border-radius:7px;">
        <p style="margin:0 0 5px;font-size:8px;letter-spacing:.28em;text-transform:uppercase;
           font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.5);">${esc(a[0])}</p>
        <p style="margin:0;font-size:14px;color:#dde5ff;letter-spacing:.01em;
           font-family:Arial,Helvetica,sans-serif;line-height:1.5;word-break:break-word;">${esc(a[1])}</p>
      </td>
      <td width="2%">&nbsp;</td>
      <td width="49%" valign="top"
          style="padding:15px 22px 17px;background:#050818;
                 border:1px solid rgba(124,58,237,.18);border-radius:7px;">
        <p style="margin:0 0 5px;font-size:8px;letter-spacing:.28em;text-transform:uppercase;
           font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.5);">${esc(b[0])}</p>
        <p style="margin:0;font-size:14px;color:#dde5ff;letter-spacing:.01em;
           font-family:Arial,Helvetica,sans-serif;line-height:1.5;word-break:break-word;">${esc(b[1])}</p>
      </td>
    </tr>
  </table>`;
}

function messageBubble(content: string, label: string): string {
  return `
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
         style="margin:32px 0 0;">
    <tr><td style="padding-bottom:9px;">
      <p style="margin:0;font-size:8px;letter-spacing:.28em;text-transform:uppercase;
         font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.45);">${esc(label)}</p>
    </td></tr>
    <tr>
      <td style="padding:26px 30px 28px;
                 background:rgba(109,40,217,.06);
                 border:1px solid rgba(124,58,237,.18);
                 border-left:3px solid #7c3aed;
                 border-radius:0 8px 8px 0;">
        <p style="margin:0;font-size:15px;line-height:1.95;color:rgba(224,231,255,.9);
           font-family:Arial,Helvetica,sans-serif;word-break:break-word;">${esc(content)}</p>
      </td>
    </tr>
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

function statusSteps(steps: Array<{ emoji: string; label: string; active: boolean }>): string {
  const cols = steps.map(s => `
    <td width="${Math.floor(96 / steps.length)}%" align="center" valign="middle"
        style="padding:20px 8px;
               background:${s.active ? 'rgba(124,58,237,.12)' : 'rgba(255,255,255,.02)'};
               border:1px solid ${s.active ? 'rgba(167,139,250,.32)' : 'rgba(255,255,255,.05)'};
               border-radius:8px;">
      <p style="margin:0 0 9px;font-size:22px;line-height:1;">${s.emoji}</p>
      <p style="margin:0;font-size:8px;letter-spacing:.22em;text-transform:uppercase;
         font-family:Arial,Helvetica,sans-serif;
         color:${s.active ? 'rgba(167,139,250,.88)' : 'rgba(199,210,254,.22)'};">
        ${esc(s.label)}
      </p>
    </td>
  `).join('<td width="2%" style="font-size:0;">&nbsp;</td>');

  return `
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
         style="margin-bottom:32px;">
    <tr>${cols}</tr>
  </table>`;
}

/* ══════════════════════════════════════════════════════════════════════════
   EMAIL BUILDERS
   ══════════════════════════════════════════════════════════════════════════ */

/* 1 ── Admin: new conversation ─────────────────────────────────────────── */
function adminNewConversationEmail(p: {
  visitorName: string; visitorEmail: string;
  content: string; sessionId: string; pageUrl: string;
}): { subject: string; html: string } {
  const subject   = `✦ New Chat — ${p.visitorName} · Swift Freight`;
  const preheader = `${p.visitorName} just started a live chat. Open the admin panel to respond now.`;

  const body = `
    ${contextPill('✦ New Conversation')}

    ${heading(
      'A visitor started a live chat.',
      `<strong style="color:rgba(224,231,255,.78);">${esc(p.visitorName)}</strong> opened a new support conversation on your site. Fast responses drive trust — reply now from the admin panel.`
    )}

    <!-- Info grid -->
    ${fieldPair(['Visitor Name', p.visitorName], ['Email Address', p.visitorEmail])}
    ${fieldRow('Landing Page', p.pageUrl || SITE)}
    ${fieldRow('Session ID', p.sessionId)}

    ${messageBubble(p.content, "Visitor's Opening Message")}

    ${ctaButton(ADMIN_PANEL, 'Open Admin Panel &amp; Reply')}
  `;

  return {
    subject,
    html: shell({ preheader, badge: 'New Conversation', body }),
  };
}

/* 2 ── Admin: follow-up message ────────────────────────────────────────── */
function adminFollowUpEmail(p: {
  visitorName: string; visitorEmail: string;
  content: string; sessionId: string; pageUrl: string;
}): { subject: string; html: string } {
  const subject   = `💬 New Message · ${p.visitorName} — Swift Freight`;
  const preheader = `${p.visitorName}: "${p.content.slice(0, 90)}"`;

  const body = `
    ${contextPill('💬 Follow-up Message')}

    ${heading(
      'New message in active conversation.',
      `<strong style="color:rgba(224,231,255,.78);">${esc(p.visitorName)}</strong> sent a follow-up in an ongoing conversation. They are still engaged — reply while the conversation is warm.`
    )}

    ${fieldPair(['Visitor Name', p.visitorName], ['Email Address', p.visitorEmail])}
    ${fieldRow('Session ID', p.sessionId)}

    ${messageBubble(p.content, 'Message')}

    ${ctaButton(ADMIN_PANEL, 'Reply in Admin Panel')}
  `;

  return {
    subject,
    html: shell({ preheader, badge: 'New Message', body }),
  };
}

/* 3 ── Visitor: conversation confirmation (first message) ───────────────── */
function visitorConfirmationEmail(p: {
  visitorName: string; content: string; sessionId: string; pageUrl: string;
}): { subject: string; html: string } {
  const fn        = firstName(p.visitorName);
  const subject   = `✓ Message received · Swift Freight Logistics`;
  const preheader = `Hi ${fn}, your message has been received. Our team will reply shortly — typically within minutes.`;
  const initial   = esc((p.visitorName.charAt(0) || 'V').toUpperCase());

  const body = `
    <!-- Avatar -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td>
          <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
            style="height:56px;width:56px;v-text-anchor:middle;" arcsize="50%"
            fillcolor="#3730a3" strokecolor="none"><w:anchorlock/><center><![endif]-->
          <div style="width:56px;height:56px;
                      background:linear-gradient(135deg,#1d4ed8 0%,#4f46e5 50%,#7c3aed 100%);
                      border-radius:50%;text-align:center;line-height:56px;
                      font-size:24px;font-weight:900;font-family:Arial,Helvetica,sans-serif;
                      color:#fff;box-shadow:0 6px 28px rgba(124,58,237,.45);">
            ${initial}
          </div>
          <!--[if mso]></center></v:roundrect><![endif]-->
        </td>
      </tr>
    </table>

    ${contextPill('✓ Message Received')}

    ${heading(
      `We got your message, ${fn}.`,
      `Thank you for reaching out to Swift Freight Logistics support. Your conversation has been logged and our team has been notified. We typically reply within minutes.`
    )}

    <!-- Status journey -->
    ${statusSteps([
      { emoji: '✦', label: 'Received',     active: true  },
      { emoji: '⚡', label: 'In Queue',     active: false },
      { emoji: '💬', label: 'Reply Coming', active: false },
    ])}

    <!-- Message recap -->
    ${messageBubble(p.content, 'Your Message')}

    ${divider()}

    <!-- Meta info -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:14px 22px;background:#050818;border:1px solid rgba(124,58,237,.16);
                   border-radius:7px 7px 0 0;border-bottom:none;">
          <p style="margin:0;font-size:13px;color:rgba(199,210,254,.5);line-height:1.8;
             font-family:Arial,Helvetica,sans-serif;">
            &#9679;&ensp;
            <strong style="color:rgba(224,231,255,.72);">Typical reply time:</strong>
            &nbsp;Under 10 minutes during business hours
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 22px;background:#050818;border:1px solid rgba(124,58,237,.16);
                   border-radius:0 0 7px 7px;">
          <p style="margin:0;font-size:13px;color:rgba(199,210,254,.5);line-height:1.8;
             font-family:Arial,Helvetica,sans-serif;">
            &#9679;&ensp;
            <strong style="color:rgba(224,231,255,.72);">Next step:</strong>
            &nbsp;We will email you the moment our team responds
          </p>
        </td>
      </tr>
    </table>

    ${ctaButton(p.pageUrl || SITE, 'Return to Live Chat')}
  `;

  return {
    subject,
    html: shell({ preheader, badge: 'Message Received', body }),
  };
}

/* 4 ── Visitor: unread message waiting notification ────────────────────── */
function visitorReplyEmail(p: {
  visitorName: string; content: string; sessionId: string; pageUrl: string; sentAt?: string;
}): { subject: string; html: string } {
  const fn        = firstName(p.visitorName);
  const subject   = `💜 1 unread message · Swift Freight Support`;
  const preheader = `Hi ${fn}, our support team just replied. Your chat is still open — open it to continue.`;

  /* Format sent time */
  let sentLabel = 'Just now';
  if (p.sentAt) {
    try {
      const diff = Date.now() - new Date(p.sentAt).getTime();
      if      (diff < 90_000)     sentLabel = 'Just now';
      else if (diff < 3_600_000)  sentLabel = `${Math.round(diff / 60_000)} min ago`;
      else if (diff < 86_400_000) sentLabel = `${Math.round(diff / 3_600_000)} hr ago`;
      else                         sentLabel = new Date(p.sentAt).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
    } catch { /* keep default */ }
  }

  const body = `
    <!-- Notification badge circle -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto 30px;">
      <tr>
        <td align="center">
          <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
            style="height:68px;width:68px;v-text-anchor:middle;" arcsize="50%"
            fillcolor="#2e1065" strokecolor="#7c3aed"><w:anchorlock/><center><![endif]-->
          <div style="width:68px;height:68px;
                      background:linear-gradient(135deg,#1e1b4b,#2e1065);
                      border:2px solid rgba(167,139,250,.4);border-radius:50%;
                      text-align:center;line-height:68px;font-size:28px;margin:0 auto;
                      box-shadow:0 0 32px rgba(124,58,237,.3);">
            💜
          </div>
          <!--[if mso]></center></v:roundrect><![endif]-->
        </td>
      </tr>
    </table>

    <!-- Heading -->
    <h1 style="margin:0 0 8px;font-size:27px;font-weight:900;letter-spacing:.02em;
       color:#eef2ff;font-family:Arial,Helvetica,sans-serif;line-height:1.2;text-align:center;">
      You have 1 unread message, ${fn}.
    </h1>
    <p style="margin:0 0 38px;font-size:14px;color:rgba(199,210,254,.5);line-height:1.95;
       font-family:Arial,Helvetica,sans-serif;text-align:center;">
      The Swift Freight Logistics support team replied to your conversation.<br>
      Your chat is <strong style="color:rgba(167,139,250,.85);">still open</strong> and waiting for you.
    </p>

    <!-- Message card -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
           style="margin-bottom:24px;">
      <tr>
        <td style="background:rgba(109,40,217,.07);
                   border:1px solid rgba(124,58,237,.24);
                   border-top:3px solid #7c3aed;
                   border-radius:0 10px 10px 10px;">

          <!-- Card header -->
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:16px 22px 14px;
                         border-bottom:1px solid rgba(124,58,237,.12);">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <!-- Agent avatar -->
                    <td style="padding-right:12px;">
                      <!--[if mso]><v:roundrect style="height:38px;width:38px;v-text-anchor:middle;"
                        arcsize="50%" fillcolor="#3730a3" strokecolor="none">
                        <w:anchorlock/><center><![endif]-->
                      <div style="width:38px;height:38px;
                                  background:linear-gradient(135deg,#1d4ed8,#6d28d9);
                                  border-radius:50%;text-align:center;line-height:38px;
                                  font-size:11px;font-weight:900;color:#fff;
                                  font-family:Arial,Helvetica,sans-serif;letter-spacing:.06em;">
                        SFL
                      </div>
                      <!--[if mso]></center></v:roundrect><![endif]-->
                    </td>
                    <!-- Agent name + status -->
                    <td valign="middle">
                      <p style="margin:0 0 3px;font-size:12px;font-weight:700;
                         color:rgba(167,139,250,.9);font-family:Arial,Helvetica,sans-serif;
                         letter-spacing:.04em;">Swift Freight Support</p>
                      <p style="margin:0;font-size:10px;color:rgba(199,210,254,.35);
                         font-family:Arial,Helvetica,sans-serif;letter-spacing:.05em;">
                        &#9679;&ensp;Online &nbsp;&bull;&nbsp; ${esc(sentLabel)}
                      </p>
                    </td>
                    <!-- UNREAD badge -->
                    <td align="right" valign="middle">
                      <span style="display:inline-block;padding:4px 12px;
                                   background:rgba(124,58,237,.18);
                                   border:1px solid rgba(167,139,250,.32);
                                   border-radius:99px;font-size:8px;letter-spacing:.2em;
                                   text-transform:uppercase;color:rgba(167,139,250,.95);
                                   font-family:Arial,Helvetica,sans-serif;font-weight:700;">
                        UNREAD
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Message content -->
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:20px 24px 24px;">
                <p style="margin:0;font-size:16px;line-height:1.95;color:rgba(224,231,255,.92);
                   font-family:Arial,Helvetica,sans-serif;word-break:break-word;">
                  ${esc(p.content)}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Status meta row -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
           style="margin-bottom:10px;">
      <tr>
        <td width="50%" style="padding:14px 18px;background:#050818;
                               border:1px solid rgba(124,58,237,.16);
                               border-radius:7px 0 0 7px;border-right:none;">
          <p style="margin:0 0 4px;font-size:8px;letter-spacing:.26em;text-transform:uppercase;
             font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.45);">
            Conversation
          </p>
          <p style="margin:0;font-size:13px;color:rgba(167,139,250,.9);font-weight:600;
             font-family:Arial,Helvetica,sans-serif;">&#9679; Still Open</p>
        </td>
        <td width="50%" style="padding:14px 18px;background:#050818;
                               border:1px solid rgba(124,58,237,.16);border-radius:0 7px 7px 0;">
          <p style="margin:0 0 4px;font-size:8px;letter-spacing:.26em;text-transform:uppercase;
             font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.45);">
            Message Sent
          </p>
          <p style="margin:0;font-size:13px;color:#dde5ff;font-weight:600;
             font-family:Arial,Helvetica,sans-serif;">${esc(sentLabel)}</p>
        </td>
      </tr>
    </table>

    ${ctaButton(p.pageUrl || SITE, 'Open Chat &amp; Reply Now')}

    ${divider()}

    <!-- Reassurance -->
    <p style="margin:0 0 8px;font-size:12px;color:rgba(199,210,254,.3);line-height:2;
       font-family:Arial,Helvetica,sans-serif;text-align:center;">
      This conversation will remain open until you return or it is marked resolved.
    </p>
    <p style="margin:0;font-size:12px;color:rgba(199,210,254,.28);line-height:2;
       font-family:Arial,Helvetica,sans-serif;text-align:center;">
      Can't open the chat? Reply directly to
      <a href="mailto:${ADMIN_EMAIL}" style="color:rgba(167,139,250,.6);text-decoration:none;
         font-family:Arial,Helvetica,sans-serif;">${ADMIN_EMAIL}</a>
    </p>
  `;

  return {
    subject,
    html: shell({ preheader, badge: 'Unread · 1', body }),
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
      role         : 'visitor' | 'agent';
      content      : string;
      visitorName  : string;
      visitorEmail : string;
      sessionId    : string;
      pageUrl?     : string;
      isFirst?     : boolean;
      sentAt?      : string;
    };

    if (!body.role || !body.content) return err('Missing required fields');

    const p = {
      visitorName  : body.visitorName  || 'Visitor',
      visitorEmail : body.visitorEmail || '',
      content      : body.content,
      sessionId    : body.sessionId    || '',
      pageUrl      : body.pageUrl      || SITE,
      sentAt       : body.sentAt,
    };

    if (body.role === 'visitor') {
      const adminEmail = body.isFirst
        ? adminNewConversationEmail(p)
        : adminFollowUpEmail(p);

      const tasks: Promise<unknown>[] = [
        sendEmail({ to: ADMIN_EMAIL, subject: adminEmail.subject, html: adminEmail.html }),
      ];

      if (body.isFirst && p.visitorEmail) {
        const vEmail = visitorConfirmationEmail(p);
        tasks.push(sendEmail({ to: p.visitorEmail, subject: vEmail.subject, html: vEmail.html }));
      }

      await Promise.all(tasks);

    } else if (body.role === 'agent') {
      if (!p.visitorEmail) return json({ skipped: 'no visitor email' });

      const vEmail = visitorReplyEmail(p);
      await sendEmail({ to: p.visitorEmail, subject: vEmail.subject, html: vEmail.html });
    }

    return json({ success: true });

  } catch (e) {
    console.error('[chat-notify]', e);
    return json({ error: String(e) }, 500);
  }
});
