import { CORS_HEADERS, json, err } from '../_shared/cors.ts';
import { sendEmail }               from '../_shared/resend.ts';

const ADMIN_EMAIL = 'swiftfreightlogix@gmail.com';
const SITE        = 'https://swiftfreightlogix.netlify.app';
const ADMIN_URL   = `${SITE}/src/admin.html`;

/* ── Premium email shell (matches existing shipment email style) ── */
function shell(accentHex: string, badge: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#020914;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#020914;padding:0;">
<tr><td align="center" style="padding:48px 16px 64px;">
  <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;">

    <tr><td style="padding:0 0 18px;">
      <p style="margin:0;font-size:10px;letter-spacing:.38em;text-transform:uppercase;color:rgba(232,240,254,.2);text-align:center;">Live Chat Notification &middot; Swift Freight Logistics</p>
    </td></tr>

    <tr><td style="background:#030c1c;border:1px solid rgba(59,130,246,.15);border-bottom:none;border-radius:6px 6px 0 0;padding:28px 40px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:.28em;text-transform:uppercase;color:#e8f0fe;">
              <span style="color:${accentHex};">SWIFT</span> FREIGHT
            </p>
            <p style="margin:4px 0 0;font-size:8px;letter-spacing:.54em;text-transform:uppercase;color:rgba(59,130,246,.35);">LOGISTICS &middot; SUPPORT</p>
          </td>
          <td align="right" valign="middle">
            <span style="display:inline-block;padding:6px 14px;border:1px solid rgba(59,130,246,.25);border-radius:2px;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(232,240,254,.4);">${badge}</span>
          </td>
        </tr>
      </table>
    </td></tr>

    <tr><td style="height:3px;font-size:0;line-height:0;background:linear-gradient(90deg,${accentHex} 0%,#60a5fa 50%,transparent 100%);">&nbsp;</td></tr>

    <tr><td style="background:#060f1e;border-left:1px solid rgba(59,130,246,.1);border-right:1px solid rgba(59,130,246,.1);padding:40px 40px 36px;">
      ${body}
    </td></tr>

    <tr><td style="background:#020914;border:1px solid rgba(59,130,246,.08);border-top:none;border-radius:0 0 6px 6px;padding:24px 40px;text-align:center;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:.04em;color:rgba(232,240,254,.2);line-height:1.9;">
        Swift Freight Logistics &nbsp;&middot;&nbsp; swiftfreightlogix.netlify.app<br>
        <a href="${SITE}/payment.html" style="color:rgba(59,130,246,.4);text-decoration:none;">Track a Shipment</a>
        &nbsp;&middot;&nbsp;
        <a href="mailto:swiftfreightlogix@gmail.com" style="color:rgba(59,130,246,.4);text-decoration:none;">Contact Support</a>
      </p>
      <p style="margin:0;font-size:9px;color:rgba(232,240,254,.1);letter-spacing:.06em;">This is an automated notification from Swift Freight Logistics Live Chat.</p>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}

function row(label: string, value: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
    <tr>
      <td style="padding:11px 16px;background:#030c1c;border:1px solid rgba(59,130,246,.1);border-radius:3px;">
        <p style="margin:0 0 3px;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:rgba(232,240,254,.35);">${label}</p>
        <p style="margin:0;font-size:13px;color:#e8f0fe;letter-spacing:.01em;">${value}</p>
      </td>
    </tr>
  </table>`;
}

function msgBubble(content: string, accent: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr>
      <td style="padding:18px 20px;background:rgba(59,130,246,.06);border:1px solid ${accent};border-left:3px solid ${accent};border-radius:3px;">
        <p style="margin:0;font-size:14px;line-height:1.75;color:rgba(232,240,254,.88);">${escHtml(content)}</p>
      </td>
    </tr>
  </table>`;
}

function btn(href: string, label: string): string {
  return `
  <table cellpadding="0" cellspacing="0" style="margin-top:28px;">
    <tr>
      <td style="background:linear-gradient(135deg,#1d4ed8,#3b82f6);border-radius:3px;padding:0;">
        <a href="${href}" style="display:inline-block;padding:13px 28px;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#fff;text-decoration:none;">
          ${label} &rarr;
        </a>
      </td>
    </tr>
  </table>`;
}

function escHtml(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Admin notification (visitor sent a message) ── */
function adminNotifyEmail(p: {
  visitorName: string; visitorEmail: string;
  content: string; sessionId: string; pageUrl: string; isFirst: boolean;
}): { subject: string; html: string } {
  const subject = p.isFirst
    ? `💬 New Chat — ${p.visitorName}`
    : `💬 New Message from ${p.visitorName}`;

  const body = `
    <h2 style="margin:0 0 6px;font-size:20px;font-weight:900;letter-spacing:.04em;color:#e8f0fe;">
      ${p.isFirst ? 'New Support Conversation' : 'New Message Received'}
    </h2>
    <p style="margin:0 0 28px;font-size:13px;color:rgba(232,240,254,.5);line-height:1.7;">
      ${p.isFirst ? 'A visitor has started a live chat.' : 'A visitor sent you a new message.'}
    </p>
    ${row('Visitor Name',  escHtml(p.visitorName))}
    ${row('Visitor Email', escHtml(p.visitorEmail))}
    ${row('Page',          escHtml(p.pageUrl || SITE))}
    ${row('Session ID',    escHtml(p.sessionId))}
    <p style="margin:20px 0 6px;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:rgba(232,240,254,.35);">Message</p>
    ${msgBubble(p.content, 'rgba(59,130,246,.3)')}
    ${btn(ADMIN_URL, 'Open Admin Panel to Reply')}
  `;

  return { subject, html: shell('#3b82f6', 'Admin Alert', body) };
}

/* ── Visitor notification (admin sent a reply) ── */
function visitorReplyEmail(p: {
  visitorName: string; content: string; sessionId: string;
}): { subject: string; html: string } {
  const subject = 'Reply from Swift Freight Support';

  const body = `
    <h2 style="margin:0 0 6px;font-size:20px;font-weight:900;letter-spacing:.04em;color:#e8f0fe;">You have a reply</h2>
    <p style="margin:0 0 28px;font-size:13px;color:rgba(232,240,254,.5);line-height:1.7;">
      Hi <strong style="color:#e8f0fe;">${escHtml(p.visitorName)}</strong>, our support team has replied to your message.
    </p>
    <p style="margin:0 0 6px;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:rgba(232,240,254,.35);">Support Reply</p>
    ${msgBubble(p.content, 'rgba(34,197,94,.3)')}
    <p style="margin:20px 0 0;font-size:12px;color:rgba(232,240,254,.45);line-height:1.75;">
      You can continue the conversation by visiting our website and opening the live chat widget in the bottom-right corner.
    </p>
    ${btn(`${SITE}/index.html`, 'Continue Conversation')}
  `;

  return { subject, html: shell('#22c55e', 'Support Reply', body) };
}

/* ── Handler ── */
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST')   return err('Method not allowed', 405);

  try {
    const body = await req.json() as {
      role:         'visitor' | 'agent';
      content:      string;
      visitorName:  string;
      visitorEmail: string;
      sessionId:    string;
      pageUrl?:     string;
      isFirst?:     boolean;
    };

    if (!body.role || !body.content) return err('Missing required fields');

    if (body.role === 'visitor') {
      const { subject, html } = adminNotifyEmail({
        visitorName:  body.visitorName  || 'Visitor',
        visitorEmail: body.visitorEmail || '(not provided)',
        content:      body.content,
        sessionId:    body.sessionId    || '',
        pageUrl:      body.pageUrl      || SITE,
        isFirst:      body.isFirst      ?? false,
      });
      await sendEmail({ to: ADMIN_EMAIL, subject, html });

    } else if (body.role === 'agent') {
      if (!body.visitorEmail) return json({ skipped: 'no visitor email' });
      const { subject, html } = visitorReplyEmail({
        visitorName: body.visitorName || 'Visitor',
        content:     body.content,
        sessionId:   body.sessionId  || '',
      });
      await sendEmail({ to: body.visitorEmail, subject, html });
    }

    return json({ success: true });

  } catch (e) {
    console.error('[chat-notify]', e);
    return json({ error: String(e) }, 500);
  }
});
