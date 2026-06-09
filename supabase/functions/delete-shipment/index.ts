import { createClient }       from 'jsr:@supabase/supabase-js@2';
import { CORS_HEADERS, json, err } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST')   return err('Method not allowed', 405);

  const adminSecret = Deno.env.get('ADMIN_API_SECRET') || Deno.env.get('ADMIN_SECRET');
  if (adminSecret && (req.headers.get('x-admin-secret') ?? '') !== adminSecret)
    return err('Unauthorized', 401);

  try {
    const body = await req.json() as { trackingId?: string };
    if (!body.trackingId) return err('Missing trackingId');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { error: dbErr } = await supabase
      .from('shipments')
      .delete()
      .eq('tracking_id', body.trackingId);

    if (dbErr) return json({ error: dbErr.message }, 500);

    return json({ success: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
