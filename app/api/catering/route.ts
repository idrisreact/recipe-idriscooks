import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/src/db';
import { cateringInquiries } from '@/src/db/schemas';
import { count, desc, eq } from 'drizzle-orm';
import { auth } from '@/src/utils/auth';
import { rateLimit } from '@/src/lib/rate-limit';
import { requireAdmin } from '@/src/utils/api-guards';
import { sendEmail, escapeHtml } from '@/src/lib/email';
import {
  cateringInquirySchema,
  INQUIRY_STATUSES,
  type InquiryStatus,
} from '@/src/lib/validations/catering';

const PAGE_SIZE = 20;

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

export async function GET(request: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const status = INQUIRY_STATUSES.some((s) => s.value === statusParam)
      ? (statusParam as InquiryStatus)
      : null;
    const page = Math.max(1, Number(searchParams.get('page')) || 1);

    let query = db.select().from(cateringInquiries).$dynamic();
    if (status) {
      query = query.where(eq(cateringInquiries.status, status));
    }

    const [inquiries, countRows] = await Promise.all([
      query
        .orderBy(desc(cateringInquiries.createdAt))
        .limit(PAGE_SIZE)
        .offset((page - 1) * PAGE_SIZE),
      db
        .select({ status: cateringInquiries.status, count: count() })
        .from(cateringInquiries)
        .groupBy(cateringInquiries.status),
    ]);

    const counts = Object.fromEntries(countRows.map((row) => [row.status, row.count]));
    const total = status
      ? (counts[status] ?? 0)
      : countRows.reduce((sum, row) => sum + row.count, 0);

    return NextResponse.json({ inquiries, counts, total, page, pageSize: PAGE_SIZE });
  } catch (error) {
    console.error('Error fetching catering inquiries:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}
