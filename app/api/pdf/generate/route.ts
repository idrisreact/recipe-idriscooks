import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { rateLimit } from '@/src/lib/rate-limit';
import { getEntitlements, incrementUsage } from '@/src/lib/entitlements';
import { buildRecipePDF } from '@/src/utils/pdf-builder';

const IngredientSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
});

const RecipeSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  servings: z.number(),
  prepTime: z.number(),
  cookTime: z.number(),
  ingredients: z
    .array(IngredientSchema)
    .nullable()
    .transform((v) => v ?? []),
  steps: z
    .array(z.string())
    .nullable()
    .transform((v) => v ?? []),
  tags: z
    .array(z.string())
    .nullable()
    .transform((v) => v ?? []),
  author: z
    .object({
      name: z.string(),
      image: z.string().optional(),
    })
    .optional(),
});

const PDFRequestSchema = z.object({
  recipes: z.array(RecipeSchema).min(1).max(50),
  title: z.string().max(200).optional().default('My Favorite Recipes'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const result = PDFRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { recipes, title } = result.data;

    // PDF downloads are a paid add-on: verify the feature and the purchased bundle size.
    const entitlements = await getEntitlements(session.user.id);

    if (!entitlements.hasPdfAccess) {
      return NextResponse.json(
        {
          error: 'Upgrade required',
          reason: 'PDF downloads are a paid add-on. Purchase a recipe bundle to export PDFs.',
          upgradeUrl: '/pricing',
        },
        { status: 402 }
      );
    }

    if (entitlements.pdfRecipeLimit > 0 && recipes.length > entitlements.pdfRecipeLimit) {
      return NextResponse.json(
        {
          error: 'Bundle limit exceeded',
          reason: `Your bundle covers ${entitlements.pdfRecipeLimit} recipes per export, but ${recipes.length} were requested.`,
          upgradeUrl: '/pricing',
        },
        { status: 402 }
      );
    }

    // Generate PDF
    const pdfBytes = await buildRecipePDF(recipes, title);

    await incrementUsage(session.user.id, 'pdfExports');

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="my-favorite-recipes.pdf"',
        'Content-Length': pdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
