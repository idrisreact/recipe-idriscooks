import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getPlanById, formatPrice } from '@/src/lib/clerk-billing';
import { db } from '@/src/db';
import { userSubscriptions, billingHistory } from '@/src/db/schemas';
import { eq, desc } from 'drizzle-orm';
import { CreditCard, Calendar, Download, Settings } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Billing - Recipe Platform',
  description: 'Manage your subscription and billing',
};

export default async function BillingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/billing');
  }

  // Get user's subscription from database
  const [subscription] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .limit(1);

  const plan = subscription ? getPlanById(subscription.planId) : getPlanById('free');

  // Get billing history
  const history = await db
    .select()
    .from(billingHistory)
    .where(eq(billingHistory.userId, userId))
    .orderBy(desc(billingHistory.createdAt))
    .limit(10);

  return (
    <div className="wrapper page">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Billing & Subscription</h1>

        {/* Current Plan */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{plan?.name || 'Free'} Plan</h2>
              <p className="text-gray-600">{plan?.description}</p>
            </div>
            <Link
              href="/pricing"
              className="bg-[#6c47ff] text-white px-4 py-2 rounded-lg hover:bg-[#5a3dd4] transition-colors"
            >
              Change Plan
            </Link>
          </div>

          {subscription && (
            <div className="grid md:grid-cols-2 gap-4 mt-6 pt-6 border-t">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold">{formatPrice(plan?.price || 0)}/month</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Next Billing Date</p>
                  <p className="font-semibold">
                    {subscription.currentPeriodEnd
                      ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold capitalize">{subscription.status}</p>
                </div>
              </div>
            </div>
          )}

          {subscription?.cancelAtPeriodEnd && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                Your subscription will be canceled at the end of the current billing period (
                {subscription.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : 'N/A'}
                ).
              </p>
            </div>
          )}
        </div>

        {/* Plan Features */}
        {plan && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Your Plan Includes</h2>
            <ul className="grid md:grid-cols-2 gap-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#6c47ff] rounded-full" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Billing History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Billing History</h2>

          {history.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No billing history yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Description</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} className="border-b last:border-b-0">
                      <td className="py-4">
                        {new Date(item.billingDate).toLocaleDateString()}
                      </td>
                      <td className="py-4">{item.description || 'Subscription payment'}</td>
                      <td className="py-4">
                        {formatPrice(parseFloat(item.amount))}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            item.status === 'succeeded'
                              ? 'bg-green-100 text-green-800'
                              : item.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
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
                            className="text-[#6c47ff] hover:underline flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Manage Subscription */}
        {subscription && subscription.stripeCustomerId && (
          <div className="mt-8 text-center">
            <form action="/api/billing/portal" method="POST">
              <button
                type="submit"
                className="text-gray-600 hover:text-gray-900 underline"
              >
                Manage subscription in Stripe
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
