import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/src/db';
import { cateringInquiries } from '@/src/db/schemas';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/src/utils/api-guards';
import { cateringInquiryUpdateSchema } from '@/src/lib/validations/catering';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    // Malformed JSON becomes null, which fails schema parsing as a 400 rather than a 500.
    const data = cateringInquiryUpdateSchema.parse(await request.json().catch(() => null));

    const [inquiry] = await db
      .update(cateringInquiries)
      .set({
        ...(data.status !== undefined && { status: data.status }),
        ...(data.internalNotes !== undefined && { internalNotes: data.internalNotes || null }),
        updatedAt: new Date(),
      })
      .where(eq(cateringInquiries.id, id))
      .returning();

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json(inquiry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating catering inquiry:', error);
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}
