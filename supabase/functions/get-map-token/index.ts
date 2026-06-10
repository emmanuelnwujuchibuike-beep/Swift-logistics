import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers });

  const token = Deno.env.get('MAPBOX_TOKEN');
  if (!token) return new Response(JSON.stringify({ error: 'token not set' }), { status: 500, headers });

  return new Response(JSON.stringify({ token }), { headers });
});
