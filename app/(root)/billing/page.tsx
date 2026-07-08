import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/src/db';
import { userSubscriptions, billingHistory } from '@/src/db/schemas';
import { getEntitlements } from '@/src/lib/entitlements';
import { getRecipeAccessPrice } from '@/src/config/pricing';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { PageHeader } from '@/src/components/ui/page-header';
import { EmptyState } from '@/src/components/ui/empty-state';

export const metadata = {
  title: 'Billing',
  description: 'Your purchases, receipts and access.',
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(price);
}

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    redirect('/sign-in?redirect_url=/billing');
  }

  const [subscription] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .limit(1);

  const entitlements = await getEntitlements(userId);

  const plan = entitlements.hasRecipeAccess
    ? {
        name: 'Lifetime Access',
        description: 'Unlimited recipe views and favorites, forever.',
        price: getRecipeAccessPrice().amount / 100,
        priceNote: 'one-time',
        features: [
          'Unlimited recipe views',
          'Unlimited favorites',
          'All future recipes included',
          ...(entitlements.hasPdfAccess
            ? [`PDF downloads (${entitlements.pdfRecipeLimit} recipes per export)`]
            : []),
        ],
      }
    : {
        name: 'Free',
        description: 'Perfect for getting started.',
        price: 0,
        priceNote: 'forever',
        features: [
          `${entitlements.limits.recipeViewsPerMonth} recipe views per month`,
          `Save up to ${entitlements.limits.favoritesLimit} favorites`,
          'Collections and meal plans',
        ],
      };

  const history = await db
    .select()
    .from(billingHistory)
    .where(eq(billingHistory.userId, userId))
    .orderBy(desc(billingHistory.createdAt))
    .limit(10);

  return (
    <div className="wrapper page">
      <PageHeader
        eyebrow="Account"
        title="Billing"
        description="Your access, purchases and receipts — all in one place."
      />

      {/* Current access */}
      <section className="grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="md:col-span-3 flex flex-col gap-6 bg-[var(--parchment)] p-8 md:p-10">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex flex-col gap-2">
              <span className="eyebrow">Your access</span>
              <h2 className="heading">{plan.name}</h2>
              <p className="text-sm text-[var(--ink-65)]">{plan.description}</p>
            </div>
            <p className="font-serif text-4xl">
              {formatPrice(plan.price)}{' '}
              <span className="text-base text-[var(--ink-50)]">{plan.priceNote}</span>
            </p>
          </div>
          <ul className="flex flex-col divide-y divide-[var(--ink-line)] text-sm text-[var(--ink-75)]">
            {plan.features.map((feature) => (
              <li key={feature} className="py-3">
                {feature}
              </li>
            ))}
          </ul>
          {!entitlements.hasRecipeAccess && (
            <Link href="/pricing" className="btn-tomato self-start">
              Get lifetime access
            </Link>
          )}
        </div>

        <div className="md:col-span-2 flex flex-col gap-6 border-t border-[var(--ink)] pt-8">
          <span className="eyebrow">This month</span>
          <dl className="flex flex-col divide-y divide-[var(--ink-line)]">
            <div className="flex items-baseline justify-between py-3">
              <dt className="text-sm text-[var(--ink-65)]">Recipe views</dt>
              <dd className="font-serif text-2xl">
                {entitlements.hasRecipeAccess
                  ? '∞'
                  : `${entitlements.usage.recipeViews} / ${entitlements.limits.recipeViewsPerMonth}`}
              </dd>
            </div>
            <div className="flex items-baseline justify-between py-3">
              <dt className="text-sm text-[var(--ink-65)]">PDF exports</dt>
              <dd className="font-serif text-2xl">{entitlements.usage.pdfExports}</dd>
            </div>
            <div className="flex items-baseline justify-between py-3">
              <dt className="text-sm text-[var(--ink-65)]">Collections created</dt>
              <dd className="font-serif text-2xl">{entitlements.usage.collectionsCount}</dd>
            </div>
          </dl>

          {subscription && (
            <div className="flex flex-col gap-3 border-t border-[var(--ink-line)] pt-6">
              <span className="eyebrow">Legacy subscription</span>
              <p className="text-sm text-[var(--ink-65)]">
                Status: <span className="capitalize text-[var(--ink)]">{subscription.status}</span>
                {subscription.currentPeriodEnd && (
                  <>
                    {' '}
                    · renews {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB')}
                  </>
                )}
              </p>
              {subscription.cancelAtPeriodEnd && (
                <p className="text-sm text-[var(--tomato)]">
                  Cancels at the end of the current period.
                </p>
              )}
              {subscription.stripeCustomerId && (
                <form action="/api/billing/portal" method="POST">
                  <button type="submit" className="btn-outline">
                    Manage billing in Stripe
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </section>

      {/* History */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <span className="eyebrow-rule">Receipts</span>
          <h2 className="display-s">Billing history</h2>
        </div>

        {history.length === 0 ? (
          <EmptyState
            eyebrow="No receipts yet"
            title={
              <>
                A clean <span className="italic text-[var(--tomato)]">ledger</span>.
              </>
            }
            description="Purchases and payments will appear here once you make one."
            actionLabel="See pricing"
            actionHref="/pricing"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--ink)] text-left">
                  <th className="eyebrow py-4 font-medium">Date</th>
                  <th className="eyebrow py-4 font-medium">Description</th>
                  <th className="eyebrow py-4 font-medium">Amount</th>
                  <th className="eyebrow py-4 font-medium">Status</th>
                  <th className="eyebrow py-4 font-medium">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--ink-line)]">
                    <td className="py-4 text-sm text-[var(--ink-75)]">
                      {new Date(item.billingDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-4 text-sm text-[var(--ink)]">
                      {item.description || 'Payment'}
                    </td>
                    <td className="py-4 font-serif text-lg">
                      {formatPrice(parseFloat(item.amount))}
                    </td>
                    <td className="py-4">
                      <span
                        className="mono-label"
                        style={{
                          color:
                            item.status === 'succeeded'
                              ? 'var(--olive)'
                              : item.status === 'failed'
                                ? 'var(--tomato)'
                                : 'var(--ink-60)',
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4">
                      {item.invoiceUrl ? (
                        <a
                          href={item.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-link text-sm"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-sm text-[var(--ink-50)]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
