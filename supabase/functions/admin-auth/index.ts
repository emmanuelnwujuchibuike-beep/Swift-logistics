import { CORS_HEADERS, json, err } from '../_shared/cors.ts';

const ADMIN_PW     = Deno.env.get('ADMIN_PASSWORD')   ?? '';
/* Prefer ADMIN_API_SECRET; fall back to ADMIN_SECRET so both names work */
const API_SECRET   = Deno.env.get('ADMIN_API_SECRET') ?? Deno.env.get('ADMIN_SECRET') ?? '';
const TOKEN_SECRET = Deno.env.get('TOKEN_SECRET')     ?? 'sfl-fallback-set-token-secret';
const TOKEN_TTL    = 24 * 60 * 60 * 1000; // 24 hours

async function hmac(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(TOKEN_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign'],
  );
  const buf = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function makeToken(): Promise<string> {
  const ts  = Date.now().toString();
  const sig = await hmac(ts);
  return btoa(`${ts}.${sig}`);
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    const raw = atob(token);
    const sep = raw.lastIndexOf('.');
    const ts  = raw.slice(0, sep);
    const sig = raw.slice(sep + 1);
    if (sig !== await hmac(ts)) return false;
    return (Date.now() - parseInt(ts, 10)) < TOKEN_TTL;
  } catch { return false; }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return err('Method not allowed', 405);

  let body: { action?: string; password?: string; token?: string } = {};
  try { body = await req.json(); }
  catch { return err('Invalid request body', 400); }

  if (body.action === 'login') {
    if (!ADMIN_PW)
      return err('Server not configured — run: npx supabase secrets set ADMIN_PASSWORD=yourpassword', 500);
    if (!body.password || body.password !== ADMIN_PW)
      return err('Incorrect password', 401);
    return json({ token: await makeToken(), apiSecret: API_SECRET });
  }

  if (body.action === 'verify') {
    if (!body.token || !(await verifyToken(body.token)))
      return err('Session expired. Please log in again.', 401);
    return json({ apiSecret: API_SECRET });
  }

  return err('Unknown action', 400);
});
