import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/src/lib/rate-limit';
import { sendEmail, escapeHtml } from '@/src/lib/email';
import { contactSchema } from '@/src/lib/validations/contact';

export async function POST(request: NextRequest) {
  const rateLimited = await rateLimit(request, 'api');
  if (rateLimited) return rateLimited;

  try {
    const { name, email, message } = contactSchema.parse(await request.json());

    await sendEmail({
      subject: `Contact form: ${escapeHtml(name)}`,
      replyTo: email,
      html: [
        `<p><b>Name:</b> ${escapeHtml(name)}</p>`,
        `<p><b>Email:</b> ${escapeHtml(email)}</p>`,
        `<p><b>Message:</b><br/>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>`,
      ].join(''),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
