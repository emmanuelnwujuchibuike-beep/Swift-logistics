import { createClient }                    from 'jsr:@supabase/supabase-js@2';
import { CORS_HEADERS, json, err }          from '../_shared/cors.ts';
import { sendEmail }                        from '../_shared/resend.ts';
import { shipmentRegisteredEmail }          from '../_shared/templates.ts';

function generateTrackingId(): string {
  const digits = Math.floor(100_000_000 + Math.random() * 900_000_000);
  return `SFL-${digits}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST')   return err('Method not allowed', 405);

  // Admin-only
  const adminSecret = Deno.env.get('ADMIN_SECRET');
  if (adminSecret) {
    if ((req.headers.get('x-admin-secret') ?? '') !== adminSecret)
      return err('Unauthorized', 401);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = await req.json() as any;

    const required = ['customer_email', 'name', 'destination'];
    for (const field of required) {
      if (!body[field]) return err(`Missing required field: ${field}`);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const trackingId = generateTrackingId();

    const { error: dbErr } = await supabase
      .from('shipments')
      .insert({
        tracking_id:    trackingId,
        customer_email: body.customer_email,
        name:           body.name,
        senders_name:   body.senders_name   ?? null,
        status:         body.status         ?? 'Pending',
        current_location: body.current_location ?? null,
        origin:         body.origin         ?? null,
        destination:    body.destination,
        pickup_date:    body.pickup_date     ?? null,
        eta:            body.eta            ?? null,
        package_details: body.package_details ?? null,
        service_type:   body.service_type   ?? null,
        priority:       body.priority       ?? null,
        payment_status: body.payment_status ?? 'not-required',
        amount_due:     body.amount_due     ?? null,
        btc_address:         body.btc_address         ?? null,
        usdt_address:        body.usdt_address        ?? null,
        bank_name:           body.bank_name           ?? null,
        account_name:        body.account_name        ?? null,
        bank_number:         body.bank_number         ?? null,
        paypal_email:        body.paypal_email        ?? null,
        cashapp_tag:         body.cashapp_tag         ?? null,
        zelle_id:            body.zelle_id            ?? null,
        western_union_info:  body.western_union_info  ?? null,
        step1_color:    body.step1_color    ?? 'text-blue-500',
        step2_name:     body.step2_name     ?? null,
        step2_location: body.step2_location ?? null,
        step2_color:    body.step2_color    ?? 'text-blue-500',
        step3_name:     body.step3_name     ?? null,
        step3_location: body.step3_location ?? null,
        step3_color:    body.step3_color    ?? 'text-blue-500',
        step4_name:     body.step4_name     ?? null,
        step4_location: body.step4_location ?? null,
        step4_color:    body.step4_color    ?? 'text-green-500',
        notes:          body.notes          ?? null,
      });

    if (dbErr) return json({ error: dbErr.message }, 500);

    // Send confirmation email to customer (unless admin explicitly disabled it)
    if (body.sendEmail === false) return json({ success: true, trackingId });

    const { subject, html } = shipmentRegisteredEmail({
      name:           body.name,
      trackingId,
      origin:         body.origin,
      destination:    body.destination,
      eta:            body.eta,
      senderName:     body.senders_name,
      packageDetails: body.package_details,
      serviceType:    body.service_type,
    });

    await sendEmail({ to: body.customer_email, subject, html });

    return json({ success: true, trackingId });

  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
