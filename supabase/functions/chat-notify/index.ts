import { CORS_HEADERS, json, err } from '../_shared/cors.ts';
import { sendEmail }               from '../_shared/resend.ts';

const ADMIN_EMAIL  = 'swiftfreightlogix@gmail.com';
const SITE         = 'https://swiftfreightlogix.netlify.app';
const ADMIN_PANEL  = `${SITE}/src/admin.html`;
const TRACK_URL    = `${SITE}/payment.html`;

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

/* ── Ultra-premium email shell ──────────────────────────────────────────── */
function shell(opts: {
  preheader : string;
  badge     : string;
  c1        : string;   /* gradient start colour  */
  c2        : string;   /* gradient end / accent  */
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
    @media (prefers-color-scheme:dark){.em-bg{background:#010810!important}}
    @media only screen and (max-width:620px){
      .em-card{width:100%!important;border-radius:0!important}
      .em-pad{padding:28px 24px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#010810;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<!-- Preheader (hidden) -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;visibility:hidden;opacity:0;color:transparent;height:0;width:0;font-size:1px;">
  ${esc(opts.preheader)}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>

<!-- Wrapper -->
<table role="presentation" class="em-bg" width="100%" border="0" cellpadding="0" cellspacing="0"
  style="background:#010810;min-height:100vh;">
<tr><td align="center" valign="top" style="padding:48px 16px 72px;">
<table role="presentation" class="em-card" width="600" border="0" cellpadding="0" cellspacing="0"
  style="max-width:600px;width:100%;">

  <!-- ── Eyebrow ── -->
  <tr><td align="center" style="padding:0 0 18px;">
    <p style="margin:0;font-size:9px;letter-spacing:.46em;text-transform:uppercase;
       font-family:Arial,Helvetica,sans-serif;color:rgba(99,141,255,.32);">
      Swift Freight Logistics &nbsp;&bull;&nbsp; Live Support
    </p>
  </td></tr>

  <!-- ── Header card ── -->
  <tr><td style="background:#040e22;border:1px solid rgba(37,99,235,.2);border-bottom:none;
                 border-radius:10px 10px 0 0;padding:30px 44px 26px;">
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td valign="bottom">
          <p style="margin:0 0 3px;font-size:8px;letter-spacing:.56em;text-transform:uppercase;
             font-family:Arial,Helvetica,sans-serif;color:rgba(99,141,255,.38);">SWIFT FREIGHT</p>
          <p style="margin:0;font-size:0;line-height:0;">
            <span style="font-size:26px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;
                  font-family:Arial,Helvetica,sans-serif;color:#e8f0fe;line-height:1;">
              <span style="color:${opts.c2};">SFL</span>&thinsp;LOGISTICS
            </span>
          </p>
        </td>
        <td align="right" valign="middle">
          <span style="display:inline-block;padding:6px 15px;border:1px solid rgba(99,141,255,.22);
                border-radius:3px;font-size:8px;letter-spacing:.26em;text-transform:uppercase;
                font-family:Arial,Helvetica,sans-serif;color:rgba(232,240,254,.38);">
            ${esc(opts.badge)}
          </span>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Accent stripe -->
  <tr><td height="3" style="height:3px;line-height:3px;font-size:0;
      background:linear-gradient(90deg,${opts.c1} 0%,${opts.c2} 55%,transparent 100%);">
    &zwnj;
  </td></tr>

  <!-- ── Body ── -->
  <tr><td class="em-pad" style="background:#06111f;border-left:1px solid rgba(37,99,235,.12);
                                border-right:1px solid rgba(37,99,235,.12);padding:44px 44px 40px;">
    ${opts.body}
  </td></tr>

  <!-- ── Footer ── -->
  <tr><td style="background:#020914;border:1px solid rgba(37,99,235,.1);border-top:none;
                 border-radius:0 0 10px 10px;padding:22px 44px 28px;" align="center">
    <p style="margin:0 0 10px;font-size:11px;color:rgba(232,240,254,.2);line-height:2.2;
       letter-spacing:.03em;font-family:Arial,Helvetica,sans-serif;">
      <a href="${SITE}"      style="color:rgba(99,141,255,.4);text-decoration:none;font-family:Arial,Helvetica,sans-serif;">swiftfreightlogix.netlify.app</a>
      &nbsp;&bull;&nbsp;
      <a href="${TRACK_URL}" style="color:rgba(99,141,255,.4);text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Track Shipment</a>
      &nbsp;&bull;&nbsp;
      <a href="mailto:${ADMIN_EMAIL}" style="color:rgba(99,141,255,.4);text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Contact Support</a>
    </p>
    <p style="margin:0;font-size:8px;color:rgba(232,240,254,.1);letter-spacing:.14em;
       text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">
      Automated message &nbsp;&bull;&nbsp; Do not reply to this email
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ── Components ─────────────────────────────────────────────────────────── */

function heading(title: string, subtitle: string): string {
  return `
  <h1 style="margin:0 0 10px;font-size:26px;font-weight:900;letter-spacing:.03em;
     color:#e8f0fe;font-family:Arial,Helvetica,sans-serif;line-height:1.2;">
    ${title}
  </h1>
  <p style="margin:0 0 36px;font-size:14px;color:rgba(232,240,254,.4);line-height:1.85;
     font-family:Arial,Helvetica,sans-serif;">${subtitle}</p>`;
}

function fieldRow(label: string, value: string): string {
  return `
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
         style="margin-bottom:8px;">
    <tr>
      <td style="padding:13px 18px 15px;background:rgba(3,11,28,.9);
                 border:1px solid rgba(37,99,235,.14);border-radius:5px;">
        <p style="margin:0 0 5px;font-size:8px;letter-spacing:.24em;text-transform:uppercase;
           font-family:Arial,Helvetica,sans-serif;color:rgba(232,240,254,.28);">${esc(label)}</p>
        <p style="margin:0;font-size:14px;color:#dde9ff;letter-spacing:.01em;
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
          style="padding:13px 18px 15px;background:rgba(3,11,28,.9);
                 border:1px solid rgba(37,99,235,.14);border-radius:5px;">
        <p style="margin:0 0 5px;font-size:8px;letter-spacing:.24em;text-transform:uppercase;
           font-family:Arial,Helvetica,sans-serif;color:rgba(232,240,254,.28);">${esc(a[0])}</p>
        <p style="margin:0;font-size:14px;color:#dde9ff;letter-spacing:.01em;
           font-family:Arial,Helvetica,sans-serif;line-height:1.5;word-break:break-word;">${esc(a[1])}</p>
      </td>
      <td width="2%">&nbsp;</td>
      <td width="49%" valign="top"
          style="padding:13px 18px 15px;background:rgba(3,11,28,.9);
                 border:1px solid rgba(37,99,235,.14);border-radius:5px;">
        <p style="margin:0 0 5px;font-size:8px;letter-spacing:.24em;text-transform:uppercase;
           font-family:Arial,Helvetica,sans-serif;color:rgba(232,240,254,.28);">${esc(b[0])}</p>
        <p style="margin:0;font-size:14px;color:#dde9ff;letter-spacing:.01em;
           font-family:Arial,Helvetica,sans-serif;line-height:1.5;word-break:break-word;">${esc(b[1])}</p>
      </td>
    </tr>
  </table>`;
}

function messageBubble(content: string, borderColor: string, label: string): string {
  return `
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
         style="margin:30px 0 0;">
    <tr><td style="padding-bottom:8px;">
      <p style="margin:0;font-size:8px;letter-spacing:.24em;text-transform:uppercase;
         font-family:Arial,Helvetica,sans-serif;color:rgba(232,240,254,.28);">${esc(label)}</p>
    </td></tr>
    <tr><td style="padding:22px 26px 24px;background:rgba(37,99,235,.05);
                   border:1px solid rgba(37,99,235,.2);border-left:3px solid ${borderColor};
                   border-radius:0 6px 6px 0;">
      <p style="margin:0;font-size:15px;line-height:1.9;color:rgba(232,240,254,.88);
         font-family:Arial,Helvetica,sans-serif;word-break:break-word;">${esc(content)}</p>
    </td></tr>
  </table>`;
}

function ctaButton(href: string, label: string, bg1: string, bg2: string): string {
  return `
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-top:38px;">
    <tr>
      <td style="border-radius:5px;background:linear-gradient(135deg,${bg1},${bg2});
                 box-shadow:0 8px 32px rgba(37,99,235,.3);">
        <a href="${href}"
           style="display:inline-block;padding:16px 40px;font-size:11px;font-weight:700;
                  letter-spacing:.24em;text-transform:uppercase;color:#ffffff;text-decoration:none;
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
         style="margin:34px 0;">
    <tr><td height="1" style="height:1px;line-height:1px;font-size:0;
        background:rgba(37,99,235,.1);">&zwnj;</td></tr>
  </table>`;
}

function statusSteps(steps: Array<{ emoji: string; label: string; active: boolean }>): string {
  const cols = steps.map(s => `
    <td width="${Math.floor(96 / steps.length)}%" align="center" valign="middle"
        style="padding:16px 8px;
               background:${s.active ? 'rgba(34,197,94,.07)' : 'rgba(255,255,255,.025)'};
               border:1px solid ${s.active ? 'rgba(34,197,94,.22)' : 'rgba(255,255,255,.06)'};
               border-radius:6px;">
      <p style="margin:0 0 7px;font-size:20px;line-height:1;">${s.emoji}</p>
      <p style="margin:0;font-size:8px;letter-spacing:.2em;text-transform:uppercase;
         font-family:Arial,Helvetica,sans-serif;
         color:${s.active ? 'rgba(34,197,94,.82)' : 'rgba(232,240,254,.25)'};">${esc(s.label)}</p>
    </td>
  `).join('<td width="2%" style="font-size:0;">&nbsp;</td>');

  return `
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
         style="margin-bottom:30px;">
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
  const subject   = `💬 New Chat Started — ${p.visitorName}`;
  const preheader = `${p.visitorName} (${p.visitorEmail}) just started a live chat on your site.`;

  const body = `
    ${heading(
      'New Support Conversation',
      `A visitor has started a live chat. Reply promptly — fast responses drive trust and conversions.`
    )}
    ${fieldPair(['Visitor Name', p.visitorName], ['Email Address', p.visitorEmail])}
    ${fieldRow('Page', p.pageUrl || SITE)}
    ${fieldRow('Session ID', p.sessionId)}
    ${messageBubble(p.content, '#3b82f6', "Visitor's Opening Message")}
    ${ctaButton(ADMIN_PANEL, 'Open Admin Panel to Reply', '#1e3a8a', '#3b82f6')}
  `;

  return {
    subject,
    html: shell({ preheader, badge: 'New Conversation', c1: '#1d4ed8', c2: '#60a5fa', body }),
  };
}

/* 2 ── Admin: follow-up message ────────────────────────────────────────── */
function adminFollowUpEmail(p: {
  visitorName: string; visitorEmail: string;
  content: string; sessionId: string; pageUrl: string;
}): { subject: string; html: string } {
  const subject   = `💬 Message from ${p.visitorName}`;
  const preheader = `${p.visitorName}: "${p.content.slice(0, 88)}"`;

  const body = `
    ${heading(
      'New Message Received',
      `${esc(p.visitorName)} sent a follow-up message in an active conversation.`
    )}
    ${fieldPair(['Visitor Name', p.visitorName], ['Email Address', p.visitorEmail])}
    ${fieldRow('Session ID', p.sessionId)}
    ${messageBubble(p.content, '#3b82f6', 'Message')}
    ${ctaButton(ADMIN_PANEL, 'Reply in Admin Panel', '#1e3a8a', '#3b82f6')}
  `;

  return {
    subject,
    html: shell({ preheader, badge: 'New Message', c1: '#1d4ed8', c2: '#60a5fa', body }),
  };
}

/* 3 ── Visitor: conversation confirmation (sent on first message) ───────── */
function visitorConfirmationEmail(p: {
  visitorName: string; content: string; sessionId: string; pageUrl: string;
}): { subject: string; html: string } {
  const fn        = firstName(p.visitorName);
  const subject   = `We received your message — Swift Freight Logistics`;
  const preheader = `Hi ${fn}, our support team has been notified and will reply shortly.`;
  const initial   = esc((p.visitorName.charAt(0) || 'V').toUpperCase());

  const body = `
    <!-- Visitor avatar -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom:26px;">
      <tr>
        <td>
          <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
            style="height:52px;width:52px;v-text-anchor:middle;" arcsize="50%"
            fillcolor="#1d4ed8" strokecolor="none"><w:anchorlock/><center><![endif]-->
          <div style="width:52px;height:52px;background:linear-gradient(135deg,#1e3a8a,#3b82f6);
                      border-radius:50%;text-align:center;line-height:52px;font-size:22px;
                      font-weight:900;font-family:Arial,Helvetica,sans-serif;color:#fff;">
            ${initial}
          </div>
          <!--[if mso]></center></v:roundrect><![endif]-->
        </td>
      </tr>
    </table>

    ${heading(
      `Message received, ${fn}.`,
      `Thank you for contacting Swift Freight Logistics support. Our team has been notified and will respond to you as soon as possible — typically within minutes.`
    )}

    ${statusSteps([
      { emoji: '✅', label: 'Received',     active: true  },
      { emoji: '⚡', label: 'In Queue',     active: false },
      { emoji: '💬', label: 'Reply Coming', active: false },
    ])}

    ${messageBubble(p.content, '#3b82f6', 'Your Message')}

    ${divider()}

    <p style="margin:0 0 10px;font-size:13px;color:rgba(232,240,254,.38);line-height:2;
       font-family:Arial,Helvetica,sans-serif;">
      ⏱&nbsp; <strong style="color:rgba(232,240,254,.62);">Typical reply time:</strong> under 10 minutes
    </p>
    <p style="margin:0;font-size:13px;color:rgba(232,240,254,.38);line-height:2;
       font-family:Arial,Helvetica,sans-serif;">
      📬&nbsp; We will email you the moment we reply. You can also return to the chat widget on our site to continue the conversation in real time.
    </p>

    ${ctaButton(p.pageUrl || SITE, 'Return to Live Chat', '#065f46', '#22c55e')}
  `;

  return {
    subject,
    html: shell({ preheader, badge: 'Message Received', c1: '#059669', c2: '#34d399', body }),
  };
}

/* 4 ── Visitor: agent reply notification ───────────────────────────────── */
function visitorReplyEmail(p: {
  visitorName: string; content: string; sessionId: string; pageUrl: string;
}): { subject: string; html: string } {
  const fn        = firstName(p.visitorName);
  const subject   = `Reply from Swift Freight Support`;
  const preheader = `Hi ${fn}, the Swift Freight support team just replied to your message.`;

  const body = `
    ${heading(
      `You have a reply, ${fn}.`,
      `The Swift Freight Logistics support team has responded to your message. Open the chat to continue your conversation.`
    )}

    ${messageBubble(p.content, '#22c55e', 'Support Agent Reply')}

    ${divider()}

    <p style="margin:0;font-size:13px;color:rgba(232,240,254,.38);line-height:2;
       font-family:Arial,Helvetica,sans-serif;">
      Click the button below to return to our site and continue the conversation in the live chat widget.
    </p>

    ${ctaButton(p.pageUrl || SITE, 'Continue Conversation', '#065f46', '#22c55e')}
  `;

  return {
    subject,
    html: shell({ preheader, badge: 'Support Reply', c1: '#065f46', c2: '#34d399', body }),
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
    };

    if (!body.role || !body.content) return err('Missing required fields');

    const p = {
      visitorName  : body.visitorName  || 'Visitor',
      visitorEmail : body.visitorEmail || '',
      content      : body.content,
      sessionId    : body.sessionId    || '',
      pageUrl      : body.pageUrl      || SITE,
    };

    if (body.role === 'visitor') {
      const adminEmail = body.isFirst
        ? adminNewConversationEmail(p)
        : adminFollowUpEmail(p);

      const tasks: Promise<unknown>[] = [
        sendEmail({ to: ADMIN_EMAIL, subject: adminEmail.subject, html: adminEmail.html }),
      ];

      /* Also send visitor a confirmation on their very first message */
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
