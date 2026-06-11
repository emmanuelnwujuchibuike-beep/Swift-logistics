import { CORS_HEADERS, json, err } from '../_shared/cors.ts';
import { sendEmail }               from '../_shared/resend.ts';
import { paymentConfirmedEmail }   from '../_shared/templates.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST')   return err('Method not allowed', 405);

  try {
    const body = await req.json() as {
      email:           string;
      trackingId:      string;
      name?:           string;
      amountPaid?:     string;
      destination?:    string;
      eta?:            string;
      packageDetails?: string;
    };

    const { email, trackingId, name, amountPaid, destination, eta, packageDetails } = body;
    if (!email || !trackingId) return err('Missing required fields: email, trackingId');

    const receiptNumber = `RCP-${trackingId.replace('SFL-','')}`;
    const paidAt = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

    const { subject, html } = paymentConfirmedEmail({
      name:           name || 'Valued Customer',
      trackingId,
      amountPaid,
      destination,
      eta,
      packageDetails,
      receiptNumber,
      paidAt,
    });

    const result = await sendEmail({ to: email, subject, html });

    if ('error' in result && result.error) {
      return json({ error: result.error }, 500);
    }

    return json({ success: true, receiptNumber });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
