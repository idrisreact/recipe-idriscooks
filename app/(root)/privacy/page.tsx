'use client';

import { Text } from '@/src/components/ui/Text';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
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
            Privacy Policy
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
                Introduction
              </Text>
              <Text className="mb-4">
                Welcome to IdrisCooks (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We are
                committed to protecting your personal information and your right to privacy. This
                Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when you use our website and services.
              </Text>
            </section>

            {/* Information We Collect */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                Information We Collect
              </Text>

              <div className="space-y-4">
                <div>
                  <Text as="h3" variant="large" className="font-semibold mb-2">
                    1. Personal Information
                  </Text>
                  <Text className="mb-2">
                    When you create an account or make a purchase, we may collect:
                  </Text>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <Text>Name and email address</Text>
                    </li>
                    <li>
                      <Text>Payment information (processed securely through Stripe)</Text>
                    </li>
                    <li>
                      <Text>Account preferences and settings</Text>
                    </li>
                  </ul>
                </div>

                <div>
                  <Text as="h3" variant="large" className="font-semibold mb-2">
                    2. Usage Information
                  </Text>
                  <Text className="mb-2">
                    We automatically collect certain information when you use our services:
                  </Text>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <Text>IP address and device information</Text>
                    </li>
                    <li>
                      <Text>Browser type and version</Text>
                    </li>
                    <li>
                      <Text>Pages visited and features used</Text>
                    </li>
                    <li>
                      <Text>Time and date of visits</Text>
                    </li>
                  </ul>
                </div>

                <div>
                  <Text as="h3" variant="large" className="font-semibold mb-2">
                    3. Cookies and Tracking
                  </Text>
                  <Text>
                    We use cookies and similar tracking technologies to enhance your experience. You
                    can control cookie preferences through our cookie consent banner and your
                    browser settings.
                  </Text>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                How We Use Your Information
              </Text>
              <Text className="mb-4">We use your information to:</Text>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <Text>Provide and maintain our services</Text>
                </li>
                <li>
                  <Text>Process your purchases and send receipts</Text>
                </li>
                <li>
                  <Text>Send you important updates and notifications</Text>
                </li>
                <li>
                  <Text>Improve our website and user experience</Text>
                </li>
                <li>
                  <Text>Respond to your questions and support requests</Text>
                </li>
                <li>
                  <Text>Detect and prevent fraud or abuse</Text>
                </li>
                <li>
                  <Text>Comply with legal obligations</Text>
                </li>
              </ul>
            </section>

            {/* Third-Party Services */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                Third-Party Services
              </Text>
              <Text className="mb-4">We use the following third-party services:</Text>

              <div className="space-y-3">
                <div>
                  <Text as="h3" variant="large" className="font-semibold mb-2">
                    Stripe (Payment Processing)
                  </Text>
                  <Text>
                    We use Stripe to process payments securely. Stripe may collect and process your
                    payment information according to their own privacy policy. We never store
                    complete credit card details on our servers.
                  </Text>
                </div>

                <div>
                  <Text as="h3" variant="large" className="font-semibold mb-2">
                    Analytics Services
                  </Text>
                  <Text>
                    We may use analytics services to understand how users interact with our website.
                    These services may use cookies and collect anonymous usage data.
                  </Text>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                Data Security
              </Text>
              <Text className="mb-4">
                We implement appropriate technical and organizational security measures to protect
                your personal information, including:
              </Text>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <Text>Encryption of data in transit and at rest</Text>
                </li>
                <li>
                  <Text>Secure authentication systems</Text>
                </li>
                <li>
                  <Text>Regular security assessments</Text>
                </li>
                <li>
                  <Text>Limited access to personal data</Text>
                </li>
              </ul>
              <Text className="mt-4">
                However, no method of transmission over the internet is 100% secure. While we strive
                to protect your data, we cannot guarantee absolute security.
              </Text>
            </section>

            {/* Your Rights */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                Your Rights (GDPR)
              </Text>
              <Text className="mb-4">
                If you are located in the European Economic Area (EEA), you have the following
                rights:
              </Text>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <Text>
                    <strong>Right to Access:</strong> Request a copy of your personal data
                  </Text>
                </li>
                <li>
                  <Text>
                    <strong>Right to Rectification:</strong> Request correction of inaccurate data
                  </Text>
                </li>
                <li>
                  <Text>
                    <strong>Right to Erasure:</strong> Request deletion of your data
                  </Text>
                </li>
                <li>
                  <Text>
                    <strong>Right to Restrict Processing:</strong> Request limitation of data
                    processing
                  </Text>
                </li>
                <li>
                  <Text>
                    <strong>Right to Data Portability:</strong> Request transfer of your data
                  </Text>
                </li>
                <li>
                  <Text>
                    <strong>Right to Object:</strong> Object to processing of your data
                  </Text>
                </li>
                <li>
                  <Text>
                    <strong>Right to Withdraw Consent:</strong> Withdraw consent at any time
                  </Text>
                </li>
              </ul>
              <Text className="mt-4">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:support@idriscooks.com" className="text-primary underline">
                  support@idriscooks.com
                </a>
              </Text>
            </section>

            {/* Data Retention */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                Data Retention
              </Text>
              <Text>
                We retain your personal information only for as long as necessary to provide our
                services and fulfill the purposes outlined in this Privacy Policy. When you delete
                your account, we will delete or anonymize your personal data, except where we are
                required by law to retain certain information.
              </Text>
            </section>

            {/* Children&apos;s Privacy */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                Children&apos;s Privacy
              </Text>
              <Text>
                Our services are not directed to children under 13 years of age. We do not knowingly
                collect personal information from children under 13. If you believe we have
                collected information from a child under 13, please contact us immediately.
              </Text>
            </section>

            {/* International Data Transfers */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                International Data Transfers
              </Text>
              <Text>
                Your information may be transferred to and processed in countries other than your
                country of residence. These countries may have data protection laws different from
                your country. We ensure appropriate safeguards are in place to protect your
                information in accordance with this Privacy Policy.
              </Text>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                Changes to This Privacy Policy
              </Text>
              <Text>
                We may update this Privacy Policy from time to time. We will notify you of any
                changes by posting the new Privacy Policy on this page and updating the &quot;Last
                updated&quot; date. We encourage you to review this Privacy Policy periodically for
                any changes.
              </Text>
            </section>

            {/* Contact Us */}
            <section>
              <Text as="h2" variant="subheading" className="mb-3">
                Contact Us
              </Text>
              <Text className="mb-3">
                If you have any questions about this Privacy Policy or our data practices, please
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

            {/* Consent */}
            <section className="murakamicity-card p-6 bg-muted/30">
              <Text as="h3" variant="large" className="font-semibold mb-3">
                Your Consent
              </Text>
              <Text>
                By using our website and services, you consent to this Privacy Policy and agree to
                its terms. If you do not agree with this policy, please do not use our services.
              </Text>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
