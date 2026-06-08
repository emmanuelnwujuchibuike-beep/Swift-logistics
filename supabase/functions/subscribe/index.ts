import { CORS_HEADERS, json } from '../_shared/cors.ts';

const RESEND_API   = 'https://api.resend.com/emails';
const ADMIN_EMAIL  = Deno.env.get('ADMIN_EMAIL') ?? 'swiftfreightlogix@gmail.com';
const FROM         = Deno.env.get('FROM_EMAIL')  ?? 'Swift Freight <onboarding@resend.dev>';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST')   return json({ error: 'Method not allowed' }, 405);

  try {
    const { email } = await req.json() as { email?: string };
    if (!email || !email.includes('@')) return json({ error: 'Invalid email' }, 400);

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ success: true }); // silent fail if not configured

    const now = new Date().toUTCString();
    const html = buildEmail(email, now);

    await fetch(RESEND_API, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        from:    FROM,
        to:      [ADMIN_EMAIL],
        subject: `New Subscriber: ${email} | Swift Freight`,
        html,
      }),
    });

    return json({ success: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function buildEmail(email: string, timestamp: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#020914;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#020914;padding:0;">
<tr><td align="center" style="padding:48px 16px 64px;">
  <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">

    <!-- eyebrow -->
    <tr><td style="padding:0 0 18px;text-align:center;">
      <p style="margin:0;font-size:9px;letter-spacing:.4em;text-transform:uppercase;color:rgba(232,240,254,.18);">Admin Notification &middot; Swift Freight Logistics</p>
    </td></tr>

    <!-- header -->
    <tr><td style="background:#030c1c;border:1px solid rgba(59,130,246,.18);border-bottom:none;border-radius:6px 6px 0 0;padding:26px 36px 22px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0;font-size:20px;font-weight:900;letter-spacing:.28em;text-transform:uppercase;color:#e8f0fe;">
              <span style="color:#3b82f6;">SWIFT</span> FREIGHT
            </p>
            <p style="margin:4px 0 0;font-size:7px;letter-spacing:.5em;text-transform:uppercase;color:rgba(59,130,246,.35);">LOGISTICS &middot; WORLDWIDE</p>
          </td>
          <td align="right">
            <span style="display:inline-block;padding:5px 12px;border:1px solid rgba(59,130,246,.22);border-radius:2px;font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:rgba(232,240,254,.38);">Admin Alert</span>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- accent line -->
    <tr><td style="height:3px;font-size:0;line-height:0;background:linear-gradient(90deg,#3b82f6 0%,#06b6d4 60%,transparent 100%);">&nbsp;</td></tr>

    <!-- body -->
    <tr><td style="background:#060f1e;border-left:1px solid rgba(59,130,246,.1);border-right:1px solid rgba(59,130,246,.1);padding:36px 36px 32px;">

      <!-- hero -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr><td style="background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.22);border-top:3px solid #3b82f6;border-radius:4px;padding:28px 24px;text-align:center;">
          <p style="margin:0 0 8px;font-size:22px;color:#3b82f6;line-height:1;">&#9993;</p>
          <p style="margin:0 0 6px;font-size:15px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:#e8f0fe;">NEW SUBSCRIBER</p>
          <p style="margin:0;font-size:11px;color:rgba(232,240,254,.4);letter-spacing:.04em;">Someone joined your mailing list</p>
        </td></tr>
      </table>

      <!-- subscriber email box -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr><td style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:3px;padding:20px 24px;text-align:center;">
          <p style="margin:0 0 8px;font-size:9px;letter-spacing:.38em;text-transform:uppercase;color:rgba(232,240,254,.28);">SUBSCRIBER EMAIL</p>
          <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:17px;font-weight:700;color:#60a5fa;letter-spacing:.06em;">${email}</p>
        </td></tr>
      </table>

      <!-- info table -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr>
          <td style="font-size:10px;color:rgba(232,240,254,.32);letter-spacing:.1em;text-transform:uppercase;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04);white-space:nowrap;padding-right:24px;">
            <span style="display:inline-block;width:4px;height:4px;background:rgba(59,130,246,.4);border-radius:50%;margin-right:8px;vertical-align:middle;"></span>Subscribed At
          </td>
          <td style="font-size:12px;color:rgba(232,240,254,.65);padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04);">${timestamp}</td>
        </tr>
        <tr>
          <td style="font-size:10px;color:rgba(232,240,254,.32);letter-spacing:.1em;text-transform:uppercase;padding:9px 0;white-space:nowrap;padding-right:24px;">
            <span style="display:inline-block;width:4px;height:4px;background:rgba(59,130,246,.4);border-radius:50%;margin-right:8px;vertical-align:middle;"></span>Source
          </td>
          <td style="font-size:12px;color:rgba(232,240,254,.65);padding:9px 0;">Swift Freight Website — Footer Newsletter Form</td>
        </tr>
      </table>

      <!-- divider -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;"><tr><td style="height:1px;background:rgba(59,130,246,.1);font-size:0;line-height:0;">&nbsp;</td></tr></table>

      <p style="font-size:11px;color:rgba(232,240,254,.28);text-align:center;margin:0;line-height:1.9;">
        You can view and manage subscriber data from your<br>
        <a href="https://swiftfreightlogix.netlify.app/admin.html" style="color:rgba(59,130,246,.55);text-decoration:none;">Admin Dashboard</a>
      </p>

    </td></tr>

    <!-- footer -->
    <tr><td style="background:#020914;border:1px solid rgba(59,130,246,.08);border-top:none;border-radius:0 0 6px 6px;padding:20px 36px;text-align:center;">
      <p style="margin:0;font-size:10px;color:rgba(232,240,254,.18);letter-spacing:.06em;">Swift Freight Logistics &nbsp;&middot;&nbsp; Automated Admin Alert</p>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}
