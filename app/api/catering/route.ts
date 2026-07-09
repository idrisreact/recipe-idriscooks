import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/src/db';
import { cateringInquiries } from '@/src/db/schemas';
import { desc } from 'drizzle-orm';
import { auth } from '@/src/utils/auth';
import { rateLimit } from '@/src/lib/rate-limit';
import { requireAdmin } from '@/src/utils/api-guards';
import { sendEmail, escapeHtml } from '@/src/lib/email';
import { cateringInquirySchema } from '@/src/lib/validations/catering';

export async function POST(request: NextRequest) {
  const rateLimited = await rateLimit(request, 'api');
  if (rateLimited) return rateLimited;

  try {
    const data = cateringInquirySchema.parse(await request.json());

    // Attach the user when signed in, but inquiries don't require an account.
    const session = await auth.api.getSession({ headers: request.headers });

    const [inquiry] = await db
      .insert(cateringInquiries)
      .values({
        userId: session?.user?.id ?? null,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        eventType: data.eventType,
        eventDate: data.eventDate,
        guestCount: data.guestCount,
        location: data.location || null,
        budgetRange: data.budgetRange || null,
        dietaryRequirements: data.dietaryRequirements || null,
        message: data.message || null,
        metadata: { source: 'catering-page' },
      })
      .returning();

    // Notify the kitchen; a failed email must not fail the inquiry.
    try {
      await sendEmail({
        subject: `Catering inquiry: ${escapeHtml(data.name)} — ${data.eventType}, ${data.guestCount} guests`,
        replyTo: data.email,
        html: [
          `<p><b>Name:</b> ${escapeHtml(data.name)}</p>`,
          `<p><b>Email:</b> ${escapeHtml(data.email)}</p>`,
          data.phone ? `<p><b>Phone:</b> ${escapeHtml(data.phone)}</p>` : '',
          `<p><b>Event:</b> ${escapeHtml(data.eventType)}</p>`,
          `<p><b>Date:</b> ${data.eventDate.toDateString()}</p>`,
          `<p><b>Guests:</b> ${data.guestCount}</p>`,
          data.location ? `<p><b>Location:</b> ${escapeHtml(data.location)}</p>` : '',
          data.budgetRange ? `<p><b>Budget:</b> ${escapeHtml(data.budgetRange)}</p>` : '',
          data.dietaryRequirements
            ? `<p><b>Dietary:</b> ${escapeHtml(data.dietaryRequirements)}</p>`
            : '',
          data.message
            ? `<p><b>Message:</b><br/>${escapeHtml(data.message).replace(/\n/g, '<br/>')}</p>`
            : '',
          `<p><i>Inquiry ID: ${inquiry.id}</i></p>`,
        ].join(''),
      });
    } catch (emailError) {
      console.error('Catering inquiry email failed (inquiry saved):', emailError);
    }

    return NextResponse.json({ success: true, id: inquiry.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Catering inquiry error:', error);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}

export async function GET() {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const inquiries = await db
      .select()
      .from(cateringInquiries)
      .orderBy(desc(cateringInquiries.createdAt))
      .limit(100);

    return NextResponse.json(inquiries);
  } catch (error) {
    console.error('Error fetching catering inquiries:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}
