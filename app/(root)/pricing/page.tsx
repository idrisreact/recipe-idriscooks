import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { getEntitlements } from '@/src/lib/entitlements';
import { PRICING, getRecipeAccessPrice, getSavingsDisplay } from '@/src/config/pricing';
import { LifetimeCheckoutButton } from '@/src/components/payment/lifetime-checkout-button';

export const metadata = {
  title: 'Pricing',
  description:
    'One payment, every recipe, forever. No subscription, no recurring fees — just tested recipes.',
};

const FAQS = [
  {
    question: 'Is this a subscription?',
    answer:
      'No. Lifetime access is a single one-time payment. No recurring charges, no renewal emails, nothing to cancel.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'All major cards (Visa, Mastercard, American Express) through Stripe, our payment processor.',
  },
  {
    question: 'What happens after I purchase?',
    answer:
      'Access is granted instantly — every recipe unlocks the moment payment completes, and a receipt lands in your inbox.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'Yes — within 7 days for technical issues, duplicate purchases, or billing errors. See the refund policy for details.',
  },
];

export default async function PricingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const entitlements = session?.user?.id ? await getEntitlements(session.user.id) : null;
  const hasAccess = entitlements?.hasRecipeAccess ?? false;

  const pricing = getRecipeAccessPrice();
  const isLaunchSpecial = PRICING.recipeAccess.isLaunchSpecial;
  const { freeTier } = PRICING;

  return (
    <div className="wrapper page">
      {/* Header */}
      <header className="flex flex-col gap-6 max-w-3xl">
        <span className="eyebrow-rule">Pricing</span>
        <h1 className="display-l">
          Pay once. Cook <span className="italic text-[var(--tomato)]">forever</span>.
        </h1>
        <p className="body-lg text-[var(--ink-65)]">
          No subscription. No recurring fees. One payment unlocks every recipe in the archive — and
          every recipe still to come.
        </p>
      </header>

      {/* Plans */}
      <section className="grid grid-cols-1 md:grid-cols-5 gap-10 items-stretch">
        {/* Free */}
        <div className="md:col-span-2 flex flex-col gap-8 border-t border-[var(--ink)] pt-8">
          <div className="flex flex-col gap-2">
            <span className="eyebrow">The free shelf</span>
            <h2 className="heading">Free</h2>
            <p className="font-serif text-4xl">
              £0 <span className="text-lg text-[var(--ink-50)]">forever</span>
            </p>
          </div>
          <ul className="flex flex-col divide-y divide-[var(--ink-line)] text-sm text-[var(--ink-75)]">
            <li className="py-3">{freeTier.recipeViewsPerMonth} full recipes each month</li>
            <li className="py-3">Save up to {freeTier.favoritesLimit} favorites</li>
            <li className="py-3">Collections, meal plans and shopping lists</li>
          </ul>
          <p className="mono-label mt-auto">
            {hasAccess ? 'Included with your access' : 'Your current plan'}
          </p>
        </div>

        {/* Lifetime */}
        <div className="md:col-span-3 flex flex-col gap-8 border-t-2 border-[var(--tomato)] bg-[var(--parchment)] p-8 md:p-10 -mt-px">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <span className="eyebrow" style={{ color: 'var(--tomato)' }}>
                Lifetime access
              </span>
              {isLaunchSpecial && <span className="chip text-xs">{pricing.label}</span>}
            </div>
            <h2 className="heading">The whole cookbook</h2>
            <p className="font-serif text-5xl">
              {pricing.display} <span className="text-lg text-[var(--ink-50)]">one-time</span>
              {isLaunchSpecial && (
                <span className="ml-3 text-xl text-[var(--ink-50)] line-through">
                  {PRICING.recipeAccess.regular.display}
                </span>
              )}
            </p>
            {isLaunchSpecial && (
              <p className="text-sm text-[var(--tomato)] font-medium">
                Save {getSavingsDisplay()} at the launch price.
              </p>
            )}
          </div>
          <ul className="flex flex-col divide-y divide-[var(--ink-line)] text-sm text-[var(--ink-75)]">
            <li className="py-3">Unlimited recipe views — every recipe, in full</li>
            <li className="py-3">Unlimited favorites</li>
            <li className="py-3">Cooking mode for hands-free kitchens</li>
            <li className="py-3">Every future recipe included, no extra cost</li>
          </ul>
          <div className="mt-auto">
            {hasAccess ? (
              <p className="btn-ink w-full pointer-events-none opacity-90">
                You have lifetime access ✓
              </p>
            ) : (
              <LifetimeCheckoutButton />
            )}
          </div>
        </div>
      </section>

      {/* PDF bundles */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <span className="eyebrow-rule">Add-on</span>
          <h2 className="display-s">Recipes on paper</h2>
          <p className="body-lg text-[var(--ink-65)] max-w-2xl">
            Take your favorites off-screen. PDF bundles are typeset like the site — buy a bundle
            once and export beautifully formatted recipe PDFs from your favorites.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 border border-[var(--ink-line)] divide-x divide-[var(--ink-line)] max-lg:divide-y">
          {Object.entries(PRICING.pdfDownloads).map(([tier, bundle], index) => (
            <div key={tier} className="flex flex-col gap-3 p-6">
              <span className="mono-label">{String(index + 1).padStart(2, '0')}</span>
              <p className="font-serif text-3xl">{bundle.display}</p>
              <p className="text-sm text-[var(--ink-65)]">{bundle.recipes} recipes per export</p>
            </div>
          ))}
        </div>
        <Link href="/favorites" className="btn-link self-start">
          Choose a bundle from your favorites →
        </Link>
      </section>

      {/* FAQ */}
      <section className="flex flex-col gap-10 max-w-3xl">
        <div className="flex flex-col gap-4">
          <span className="eyebrow-rule">Questions</span>
          <h2 className="display-s">Asked and answered</h2>
        </div>
        <div className="flex flex-col">
          {FAQS.map((faq, index) => (
            <div
              key={faq.question}
              className="grid grid-cols-[auto_1fr] gap-6 border-t border-[var(--ink-line)] py-8"
            >
              <span className="mono-label pt-1">{String(index + 1).padStart(2, '0')}</span>
              <div className="flex flex-col gap-3">
                <h3 className="font-serif text-2xl text-[var(--ink)]">{faq.question}</h3>
                <p className="text-sm leading-relaxed text-[var(--ink-65)]">
                  {faq.answer}
                  {faq.question.includes('refunds') && (
                    <>
                      {' '}
                      <Link href="/refund-policy" className="btn-link text-sm">
                        Read the refund policy
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
