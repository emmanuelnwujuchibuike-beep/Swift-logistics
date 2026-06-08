import { CORS_HEADERS, json } from '../_shared/cors.ts';
import { sendEmail }          from '../_shared/resend.ts';
import { contactNotificationEmail, contactAutoReplyEmail } from '../_shared/templates.ts';

const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') ?? 'swiftfreightlogix@gmail.com';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST')   return json({ error: 'Method not allowed' }, 405);

  try {
    const body = await req.json() as {
      name?:          string;
      email?:         string;
      phone?:         string;
      trackingNumber?: string;
      inquiryType?:   string;
      message?:       string;
    };

    if (!body.name || !body.email || !body.message)
      return json({ error: 'Missing required fields: name, email, message' }, 400);

    const now = new Date().toUTCString();

    // 1. Notify admin
    const adminEmail = contactNotificationEmail({
      name:          body.name,
      email:         body.email,
      phone:         body.phone,
      trackingNumber: body.trackingNumber,
      inquiryType:   body.inquiryType,
      message:       body.message,
      submittedAt:   now,
    });
    await sendEmail({ to: ADMIN_EMAIL, subject: adminEmail.subject, html: adminEmail.html });

    // 2. Auto-reply to user
    try {
      const userEmail = contactAutoReplyEmail({ name: body.name, email: body.email, message: body.message });
      await sendEmail({ to: body.email, subject: userEmail.subject, html: userEmail.html });
    } catch (_) {
      // Don't fail the request if auto-reply fails
    }

    return json({ success: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
