import { CORS_HEADERS, json, err } from '../_shared/cors.ts';
import { sendEmail }                from '../_shared/resend.ts';
import { buildEmailFromType, type EmailType } from '../_shared/templates.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST')   return err('Method not allowed', 405);

  const adminSecret = Deno.env.get('ADMIN_API_SECRET') || Deno.env.get('ADMIN_SECRET');
  if (adminSecret) {
    const auth = req.headers.get('x-admin-secret') ?? '';
    if (auth !== adminSecret) return err('Unauthorized', 401);
  }

  try {
    const body = await req.json() as {
      type:       EmailType;
      to:         string;
      data:       Record<string, unknown>;
    };

    const { type, to, data } = body;
    if (!type || !to) return err('Missing required fields: type, to');

    const { subject, html } = buildEmailFromType(type, data);
    const result = await sendEmail({ to, subject, html });

    if ('error' in result && result.error) {
      return json({ error: result.error }, 500);
    }

    return json({ success: true, id: result.id });

  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
