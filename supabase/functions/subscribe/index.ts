import { CORS_HEADERS, json } from '../_shared/cors.ts';
import { subscribeNotificationEmail } from '../_shared/templates.ts';

const RESEND_API  = 'https://api.resend.com/emails';
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL')  ?? 'swiftfreightlogix@gmail.com';
const FROM        = Deno.env.get('FROM_EMAIL')   ?? 'Swift Freight <onboarding@resend.dev>';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST')   return json({ error: 'Method not allowed' }, 405);

  try {
    const { email } = await req.json() as { email?: string };
    if (!email || !email.includes('@')) return json({ error: 'Invalid email' }, 400);

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ success: true });

    const now  = new Date().toUTCString();
    const { subject, html } = subscribeNotificationEmail({
      subscriberEmail: email,
      subscribedAt:    now,
    });

    await fetch(RESEND_API, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ from: FROM, to: [ADMIN_EMAIL], subject, html }),
    });

    return json({ success: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
