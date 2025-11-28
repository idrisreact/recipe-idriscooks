'use client';

import { Text } from '@/src/components/ui/Text';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RefundPolicyPage() {
  const router = useRouter();

  return (
    <div className="wrapper page">
      <div className="max-w-4xl mx-auto py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <Text as="h1" variant="heading" className="mb-2">
            Refund Policy
          </Text>
          <Text variant="small" className="text-muted-foreground">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </div>

        {/* Policy content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <div className="space-y-6">
            {/* Introduction */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                Our Commitment
              </Text>
              <Text className="mb-4">
                At IdrisCooks, we want you to be completely satisfied with your purchase. This
                Refund Policy outlines the circumstances under which refunds are available and the
                process for requesting them.
              </Text>
            </section>

            {/* Digital Products */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                Digital Products Policy
              </Text>
              <Text className="mb-4">
                All products purchased through IdrisCooks are digital goods, including:
              </Text>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <Text>
                    <strong>PDF Recipe Collections</strong> - Downloadable recipe compilations in
                    PDF format
                  </Text>
                </li>
                <li>
                  <Text>
                    <strong>Recipe Access (Lifetime)</strong> - One-time payment for unlimited
                    access to all recipes
                  </Text>
                </li>
              </ul>
              <Text>
                Due to the nature of digital products, all sales are generally final once the
                product has been delivered or access has been granted.
              </Text>
            </section>

            {/* Refund Eligibility */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                Refund Eligibility
              </Text>
              <Text className="mb-4">We offer refunds in the following circumstances:</Text>

              <div className="space-y-4">
                <div>
                  <Text as="h3" variant="large" className="font-semibold mb-2">
                    1. Technical Issues (Within 7 Days)
                  </Text>
                  <Text className="mb-2">
                    If you experience technical problems that prevent you from accessing or using
                    your purchase, you may request a refund within 7 days of purchase, provided:
                  </Text>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <Text>You have contacted our support team</Text>
                    </li>
                    <li>
                      <Text>We were unable to resolve the issue</Text>
                    </li>
                    <li>
                      <Text>The issue is on our end (not device/browser compatibility)</Text>
                    </li>
                  </ul>
                </div>

                <div>
                  <Text as="h3" variant="large" className="font-semibold mb-2">
                    2. Duplicate Purchases (Within 48 Hours)
                  </Text>
                  <Text>
                    If you accidentally purchase the same product multiple times, contact us within
                    48 hours for a refund of the duplicate purchase.
                  </Text>
                </div>

                <div>
                  <Text as="h3" variant="large" className="font-semibold mb-2">
                    3. Billing Errors (Anytime)
                  </Text>
                  <Text>
                    If you were charged incorrectly or multiple times due to a payment processing
                    error, we will issue a full refund regardless of the time elapsed.
                  </Text>
                </div>

                <div>
                  <Text as="h3" variant="large" className="font-semibold mb-2">
                    4. Non-Delivery (Within 24 Hours)
                  </Text>
                  <Text>
                    If you did not receive access to your purchased product within 24 hours and we
                    cannot provide access, you are eligible for a full refund.
                  </Text>
                </div>
              </div>
            </section>

            {/* Non-Refundable */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                Non-Refundable Circumstances
              </Text>
              <Text className="mb-4">Refunds will NOT be issued in the following cases:</Text>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <Text>You have already downloaded or accessed the purchased content</Text>
                </li>
                <li>
                  <Text>You changed your mind after accessing the content</Text>
                </li>
                <li>
                  <Text>You did not read the product description before purchasing</Text>
                </li>
                <li>
                  <Text>
                    The product does not meet your expectations (unless it significantly differs
                    from the description)
                  </Text>
                </li>
                <li>
                  <Text>
                    More than 7 days have passed since your purchase (except for billing errors)
                  </Text>
                </li>
              </ul>
            </section>

            {/* Refund Process */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                How to Request a Refund
              </Text>
              <Text className="mb-4">
                If you believe you are eligible for a refund based on the criteria above, please
                follow these steps:
              </Text>

              <div className="space-y-3">
                <div>
                  <Text as="h3" variant="large" className="font-semibold mb-2">
                    Step 1: Contact Support
                  </Text>
                  <Text className="mb-2">
                    Email us at{' '}
                    <a href="mailto:support@idriscooks.com" className="text-primary underline">
                      support@idriscooks.com
                    </a>{' '}
                    with the subject line &quot;Refund Request&quot;
                  </Text>
                </div>

                <div>
                  <Text as="h3" variant="large" className="font-semibold mb-2">
                    Step 2: Provide Information
                  </Text>
                  <Text className="mb-2">Include the following details:</Text>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <Text>Your order/payment ID</Text>
                    </li>
                    <li>
                      <Text>Email address used for purchase</Text>
                    </li>
                    <li>
                      <Text>Date of purchase</Text>
                    </li>
                    <li>
                      <Text>Reason for refund request</Text>
                    </li>
                    <li>
                      <Text>
                        Screenshots or description of any technical issues (if applicable)
                      </Text>
                    </li>
                  </ul>
                </div>

                <div>
                  <Text as="h3" variant="large" className="font-semibold mb-2">
                    Step 3: Review Process
                  </Text>
                  <Text>
                    We will review your request within 2-3 business days and respond via email with
                    our decision.
                  </Text>
                </div>

                <div>
                  <Text as="h3" variant="large" className="font-semibold mb-2">
                    Step 4: Refund Processing
                  </Text>
                  <Text>
                    If approved, refunds will be processed within 5-7 business days to your original
                    payment method. You will receive a confirmation email once the refund is issued.
                  </Text>
                </div>
              </div>
            </section>

            {/* Refund Method */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                Refund Method & Timeline
              </Text>
              <div className="space-y-3">
                <div>
                  <Text as="h3" variant="large" className="font-semibold mb-2">
                    Refund Method
                  </Text>
                  <Text>
                    All refunds will be issued to the original payment method used for the purchase
                    (credit card, debit card, etc.).
                  </Text>
                </div>

                <div>
                  <Text as="h3" variant="large" className="font-semibold mb-2">
                    Processing Time
                  </Text>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <Text>
                        <strong>IdrisCooks Processing:</strong> 2-3 business days for review
                      </Text>
                    </li>
                    <li>
                      <Text>
                        <strong>Stripe Processing:</strong> 5-7 business days to return funds
                      </Text>
                    </li>
                    <li>
                      <Text>
                        <strong>Bank Processing:</strong> Additional 2-5 business days depending on
                        your bank
                      </Text>
                    </li>
                  </ul>
                  <Text className="mt-2 text-muted-foreground">
                    Total timeline: Approximately 10-15 business days from approval to funds
                    appearing in your account.
                  </Text>
                </div>
              </div>
            </section>

            {/* Access Revocation */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                Access Revocation
              </Text>
              <Text>
                Upon issuing a refund, your access to the purchased content will be immediately
                revoked. This includes:
              </Text>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <Text>Removal of PDF download access</Text>
                </li>
                <li>
                  <Text>Revocation of recipe access privileges</Text>
                </li>
                <li>
                  <Text>Deletion of any saved preferences related to the purchase</Text>
                </li>
              </ul>
            </section>

            {/* Partial Refunds */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                Partial Refunds
              </Text>
              <Text>
                In some cases, we may offer a partial refund or account credit instead of a full
                refund. This is decided on a case-by-case basis and may apply when:
              </Text>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <Text>You have used a significant portion of the service</Text>
                </li>
                <li>
                  <Text>You experienced issues with only part of your purchase</Text>
                </li>
                <li>
                  <Text>A fair compromise can be reached</Text>
                </li>
              </ul>
            </section>

            {/* Chargebacks */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                Chargebacks & Disputes
              </Text>
              <Text className="mb-3">
                Before initiating a chargeback with your bank or credit card company, please contact
                us first. Chargebacks can result in:
              </Text>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <Text>Immediate account suspension</Text>
                </li>
                <li>
                  <Text>Additional fees charged to you by your bank</Text>
                </li>
                <li>
                  <Text>Longer resolution time</Text>
                </li>
              </ul>
              <Text className="mt-3">
                We are committed to resolving issues fairly and quickly. Most refund requests are
                resolved within 48 hours when handled directly.
              </Text>
            </section>

            {/* Contact */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                Questions or Concerns?
              </Text>
              <Text className="mb-3">
                If you have any questions about this Refund Policy or need assistance, please
                contact us:
              </Text>
              <div className="murakamicity-card p-4">
                <ul className="space-y-2">
                  <li>
                    <Text>
                      <strong>Email:</strong>{' '}
                      <a href="mailto:support@idriscooks.com" className="text-primary underline">
                        support@idriscooks.com
                      </a>
                    </Text>
                  </li>
                  <li>
                    <Text>
                      <strong>Response Time:</strong> Within 24-48 hours
                    </Text>
                  </li>
                </ul>
              </div>
            </section>

            {/* Changes to Policy */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                Changes to This Policy
              </Text>
              <Text>
                We may update this Refund Policy from time to time. Any changes will be posted on
                this page with an updated revision date. Continued use of IdrisCooks after changes
                constitutes acceptance of the updated policy.
              </Text>
            </section>

            {/* Fair Use */}
            <section className="murakamicity-card p-6 bg-muted/30">
              <Text as="h3" variant="large" className="font-semibold mb-3">
                Our Fair Use Promise
              </Text>
              <Text>
                We trust our customers and will always try to find a fair solution. If you have a
                genuine issue with your purchase, we will work with you to make it right. Our goal
                is your satisfaction, not to avoid refunds.
              </Text>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
