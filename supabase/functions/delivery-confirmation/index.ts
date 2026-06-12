import { CORS_HEADERS, json, err } from '../_shared/cors.ts';
import { sendEmail }               from '../_shared/resend.ts';
import { deliveryConfirmedEmail }  from '../_shared/templates.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST')   return err('Method not allowed', 405);

  try {
    const body = await req.json() as {
      email:            string;
      trackingId:       string;
      name?:            string;
      destination?:     string;
      origin?:          string;
      senderName?:      string;
      packageDetails?:  string;
      serviceType?:     string;
    };

    const { email, trackingId, name, destination, origin, senderName, packageDetails, serviceType } = body;
    if (!email || !trackingId) return err('Missing required fields: email, trackingId');

    const deliveredAt = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    const { subject, html } = deliveryConfirmedEmail({
      name:           name           || 'Valued Customer',
      trackingId,
      destination,
      origin,
      senderName,
      packageDetails,
      serviceType,
      deliveredAt,
    });

    const result = await sendEmail({ to: email, subject, html });

    if ('error' in result && result.error) {
      return json({ error: result.error }, 500);
    }

    return json({ success: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
