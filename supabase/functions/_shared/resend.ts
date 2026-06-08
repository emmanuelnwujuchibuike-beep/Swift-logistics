const RESEND_API = 'https://api.resend.com/emails';

export interface EmailPayload {
  to:      string;
  subject: string;
  html:    string;
}

export async function sendEmail(payload: EmailPayload): Promise<{ id?: string; error?: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from   = Deno.env.get('FROM_EMAIL') ?? 'Swift Freight Logistics <onboarding@resend.dev>';
  // ↑ Once your domain is verified in Resend, update FROM_EMAIL secret to:
  //   "Swift Freight Logistics <noreply@yourdomain.com>"

  if (!apiKey) throw new Error('RESEND_API_KEY secret not set');

  const res = await fetch(RESEND_API, {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ from, to: [payload.to], subject: payload.subject, html: payload.html }),
  });

  return res.json();
}
