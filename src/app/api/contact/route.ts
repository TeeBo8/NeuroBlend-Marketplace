import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getResend } from '@/lib/email';
import { createRateLimiter, getClientIp, tooManyRequests } from '@/lib/rate-limit';

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'onboarding@resend.dev';
const FROM_EMAIL = 'NeuroBlend <onboarding@resend.dev>';

const checkRateLimit = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(200),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
});

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(getClientIp(request));
  if (!rateLimit.allowed) {
    return tooManyRequests(rateLimit.retryAfterSeconds);
  }

  try {
    const parsed = contactSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis, avec une adresse email valide.' },
        { status: 400 }
      );
    }
    const { name, email, subject, message } = parsed.data;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `[Contact NeuroBlend] ${subject}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="margin:0;font-size:28px;font-weight:bold;">
        <span style="color:#6B46C1;">Neuro</span><span style="color:#38B2AC;">Blend</span>
      </h1>
      <p style="margin:8px 0 0;color:#6b7280;font-size:14px;">Nouveau message de contact</p>
    </div>
    <div style="background-color:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Nom</td>
          <td style="padding:8px 0;color:#111827;font-weight:500;">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:14px;vertical-align:top;">Email</td>
          <td style="padding:8px 0;color:#111827;"><a href="mailto:${escapeHtml(email)}" style="color:#6B46C1;">${escapeHtml(email)}</a></td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:14px;vertical-align:top;">Sujet</td>
          <td style="padding:8px 0;color:#111827;font-weight:500;">${escapeHtml(subject)}</td>
        </tr>
      </table>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
      <p style="margin:0;color:#374151;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</p>
    </div>
    <div style="text-align:center;margin-top:24px;color:#9ca3af;font-size:12px;">
      <p style="margin:0;">Vous pouvez répondre directement à cet email pour contacter ${escapeHtml(name)}.</p>
    </div>
  </div>
</body>
</html>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\u2019envoi du message.' },
      { status: 500 }
    );
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
