# Implementation Examples

This document shows how to integrate the subscription system into your existing recipe pages.

## Example 1: Protecting Recipe Views with Usage Limits

Update your recipe page to check subscription limits:

```typescript
// app/(root)/recipes/category/[slug]/page.tsx
import { auth } from '@clerk/nextjs/server';
import { canPerformAction, incrementUsage, getUserUsage } from '@/src/lib/subscription';
import { UpgradePrompt } from '@/src/components/billing/UpgradePrompt';

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  const { userId } = await auth();

  // Check if user can view the recipe
  const viewCheck = await canPerformAction('viewRecipe');

  if (!viewCheck.allowed) {
    return (
      <div className="wrapper page">
        <div className="max-w-2xl mx-auto text-center py-16">
          <h1 className="text-3xl font-bold mb-4">Recipe View Limit Reached</h1>
          <p className="text-gray-600 mb-8">{viewCheck.reason}</p>
          <UpgradePrompt message={viewCheck.reason || ''} feature="Unlimited Recipe Views" />
        </div>
      </div>
    );
  }

  // Fetch recipe
  const [recipe] = await db
    .select()
    .from(recipesTable)
    .where(eq(recipesTable.title, decoded))
    .limit(1);

  if (!recipe) {
    notFound();
  }

  // Increment view count AFTER successfully loading the recipe
  if (userId) {
    await incrementUsage('recipeViews');
  }

  // Show usage info (optional)
  const usage = await getUserUsage();
  const subscription = await getUserSubscriptionInfo();

  return (
    <div className="wrapper page">
      {/* Show usage banner for free users */}
      {subscription?.planId === 'free' && usage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            You've viewed {usage.recipeViews} of {subscription.limits.monthlyRecipeViews} recipes this month.
            <Link href="/pricing" className="ml-2 underline font-medium">
              Upgrade for unlimited views
            </Link>
          </p>
        </div>
      )}

      <RecipeDetailedView recipe={recipe as unknown as Recipe} canView={true} />
    </div>
  );
}
```

## Example 2: Protecting PDF Export Feature

Add subscription check to your PDF export functionality:

```typescript
// In your PDF export handler
import { canPerformAction, incrementUsage } from '@/src/lib/subscription';

async function handlePdfExport(recipeId: string) {
  // Check if user can export PDF
  const exportCheck = await canPerformAction('exportPdf');

  if (!exportCheck.allowed) {
    // Show upgrade prompt
    return {
      success: false,
      message: exportCheck.reason,
      showUpgrade: true,
    };
  }

  // Perform PDF export
  const pdfBlob = await generatePdf(recipeId);

  // Increment usage counter
  await incrementUsage('pdfExports');

  return {
    success: true,
    blob: pdfBlob,
  };
}
```

## Example 3: Client Component with Subscription Check

```typescript
'use client';

import { useState } from 'react';
import { UpgradePrompt } from '@/src/components/billing/UpgradePrompt';

interface ProtectedButtonProps {
  canAccess: boolean;
  reason?: string;
  onAction: () => void;
}

export function ProtectedExportButton({ canAccess, reason, onAction }: ProtectedButtonProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleClick = () => {
    if (!canAccess) {
      setShowUpgrade(true);
      return;
    }
    onAction();
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="bg-[#6c47ff] text-white px-4 py-2 rounded-lg hover:bg-[#5a3dd4]"
      >
        Export as PDF
      </button>

      {showUpgrade && reason && (
        <UpgradePrompt message={reason} feature="PDF Export" />
      )}
    </>
  );
}

// Usage in server component
export default async function RecipeActions({ recipeId }: { recipeId: number }) {
  const exportCheck = await canPerformAction('exportPdf');

  return (
    <ProtectedExportButton
      canAccess={exportCheck.allowed}
      reason={exportCheck.reason}
      onAction={async () => {
        'use server';
        // Handle export
      }}
    />
  );
}
```

## Example 4: API Route with Subscription Protection

```typescript
// app/api/recipes/export/route.ts
import { auth } from '@clerk/nextjs/server';
import { canPerformAction, incrementUsage } from '@/src/lib/subscription';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check subscription access
  const exportCheck = await canPerformAction('exportPdf');

  if (!exportCheck.allowed) {
    return NextResponse.json(
      {
        error: exportCheck.reason,
        upgrade: true,
      },
      { status: 403 }
    );
  }

  // Perform the export
  const { recipeId } = await request.json();
  // ... generate PDF

  // Increment usage
  await incrementUsage('pdfExports');

  return NextResponse.json({ success: true });
}
```

## Example 5: Middleware for Route Protection

Create a reusable middleware for protecting routes:

```typescript
// src/lib/subscription-middleware.ts
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserSubscriptionInfo } from './subscription';

export async function requirePaidPlan() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const subscription = await getUserSubscriptionInfo();

  if (!subscription || subscription.planId === 'free') {
    redirect('/pricing?required=true');
  }

  return subscription;
}

// Usage in a protected page
export default async function PremiumRecipeFeature() {
  await requirePaidPlan();

  return <PremiumContent />;
}
```

## Example 6: Show Different UI Based on Plan

```typescript
import { getUserSubscriptionInfo } from '@/src/lib/subscription';

export default async function RecipeCard({ recipe }) {
  const subscription = await getUserSubscriptionInfo();

  return (
    <div className="recipe-card">
      <h3>{recipe.title}</h3>

      {/* Show premium badge for premium users */}
      {subscription?.planId === 'premium' && (
        <span className="premium-badge">Premium Member</span>
      )}

      {/* Different actions based on plan */}
      {subscription?.features.canExportPdf ? (
        <button>Export PDF</button>
      ) : (
        <button disabled title="Upgrade to export PDFs">
          Export PDF (Premium)
        </button>
      )}

      {subscription?.features.canShareRecipes ? (
        <button>Share Recipe</button>
      ) : (
        <Link href="/pricing">
          <button>Upgrade to Share</button>
        </Link>
      )}
    </div>
  );
}
```

## Best Practices

1. **Always check permissions server-side** - Never rely only on client-side checks
2. **Increment usage AFTER successful action** - Don't count failed attempts
3. **Provide clear upgrade paths** - Show users exactly what they get by upgrading
4. **Handle edge cases** - What if user downgrades mid-month?
5. **Cache subscription data** - Use React cache() for repeated checks in same request
6. **Log subscription events** - Track upgrades, downgrades, and cancellations for analytics

## Testing Checklist

- [ ] Free user sees recipe limit warnings
- [ ] Free user is blocked after reaching limits
- [ ] Pro user can export PDFs
- [ ] Premium user can share recipes
- [ ] Upgrade flow works correctly
- [ ] Downgrade restrictions work
- [ ] Usage counters increment correctly
- [ ] Webhooks update database correctly
- [ ] Billing page shows correct information
- [ ] Customer portal works
