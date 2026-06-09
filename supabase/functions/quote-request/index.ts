import { createClient }                              from 'jsr:@supabase/supabase-js@2';
import { CORS_HEADERS, json, err }                   from '../_shared/cors.ts';
import { sendEmail }                                 from '../_shared/resend.ts';
import { quoteReceivedEmail, contactNotificationEmail } from '../_shared/templates.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST')   return err('Method not allowed', 405);

  try {
    const body = await req.json() as {
      name:         string;
      email:        string;
      phone?:       string;
      origin?:      string;
      destination?: string;
      cargo_type?:  string;
      weight?:      string;
      message?:     string;
    };

    if (!body.name || !body.email) return err('Missing required fields: name, email');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Generate a short reference code
    const refCode = `QR-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    // Save to database
    const { error: dbErr } = await supabase
      .from('quote_requests')
      .insert({
        name:        body.name,
        email:       body.email,
        phone:       body.phone       ?? null,
        origin:      body.origin      ?? null,
        destination: body.destination ?? null,
        cargo_type:  body.cargo_type  ?? null,
        weight:      body.weight      ?? null,
        message:     body.message     ?? null,
      });

    if (dbErr) console.error('DB insert error:', dbErr.message);

    // Send confirmation to customer
    const { subject, html } = quoteReceivedEmail({
      name:        body.name,
      origin:      body.origin,
      destination: body.destination,
      cargoType:   body.cargo_type,
      refCode,
    });

    await sendEmail({ to: body.email, subject, html });

    // Notify admin if ADMIN_EMAIL is set
    const adminEmailAddr = Deno.env.get('ADMIN_EMAIL');
    if (adminEmailAddr) {
      const { subject: aSubj, html: aHtml } = contactNotificationEmail({
        name:          body.name,
        email:         body.email,
        phone:         body.phone,
        inquiryType:   'Quote Request',
        message:       [
          `Origin: ${body.origin ?? '—'}`,
          `Destination: ${body.destination ?? '—'}`,
          `Cargo Type: ${body.cargo_type ?? '—'}`,
          `Weight: ${body.weight ?? '—'}`,
          body.message ? `Notes: ${body.message}` : '',
          `Ref Code: ${refCode}`,
        ].filter(Boolean).join('\n'),
        submittedAt:   new Date().toUTCString(),
      });
      await sendEmail({ to: adminEmailAddr, subject: aSubj, html: aHtml });
    }

    return json({ success: true, refCode });

  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
