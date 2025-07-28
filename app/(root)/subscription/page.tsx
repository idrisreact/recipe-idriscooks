import SubscriptionStatus from "@/src/components/subscription/subscription-status";
import SubscriptionPlans from "@/src/components/subscription/subscription-plans";
import DevLogin from "@/src/components/dev/dev-login";

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Development Helper */}
      <DevLogin />

      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Subscription Management
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage your subscription and explore our premium features to enhance
          your cooking experience.
        </p>
      </div>

      {/* Current Subscription Status */}
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Current Subscription
        </h2>
        <SubscriptionStatus />
      </div>

      {/* Available Plans */}
      <div>
        <SubscriptionPlans />
      </div>

      {/* Features Comparison */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          Feature Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Feature</th>
                <th className="text-center py-2">Free</th>
                <th className="text-center py-2">Premium</th>
                <th className="text-center py-2">Pro</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              <tr className="border-b">
                <td className="py-2">Recipe Views</td>
                <td className="text-center py-2">10/month</td>
                <td className="text-center py-2">Unlimited</td>
                <td className="text-center py-2">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Recipe Creation</td>
                <td className="text-center py-2">❌</td>
                <td className="text-center py-2">✅</td>
                <td className="text-center py-2">✅</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">PDF Export</td>
                <td className="text-center py-2">❌</td>
                <td className="text-center py-2">50/month</td>
                <td className="text-center py-2">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Recipe Collections</td>
                <td className="text-center py-2">❌</td>
                <td className="text-center py-2">10 max</td>
                <td className="text-center py-2">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Meal Planning</td>
                <td className="text-center py-2">❌</td>
                <td className="text-center py-2">5 plans</td>
                <td className="text-center py-2">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Nutrition Information</td>
                <td className="text-center py-2">❌</td>
                <td className="text-center py-2">✅</td>
                <td className="text-center py-2">✅</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Recipe Sharing</td>
                <td className="text-center py-2">❌</td>
                <td className="text-center py-2">❌</td>
                <td className="text-center py-2">✅</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Offline Access</td>
                <td className="text-center py-2">❌</td>
                <td className="text-center py-2">❌</td>
                <td className="text-center py-2">✅</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Priority Support</td>
                <td className="text-center py-2">❌</td>
                <td className="text-center py-2">❌</td>
                <td className="text-center py-2">✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
