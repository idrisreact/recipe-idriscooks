import SubscriptionStatus from "@/src/components/subscription/subscription-status";
import SubscriptionPlans from "@/src/components/subscription/subscription-plans";
import { Text } from "@/src/components/ui/Text";
import { Heading } from "@/src/components/common/heading/heading";
import { VerticalSpace } from "@/src/components/ui/VerticalSpace";
import { Check, X, FileText, Heart, Search, Clock } from "lucide-react";

export default function SubscriptionPage() {
  const features = [
    {
      name: "Browse all recipes",
      free: true,
      pdf: true,
      icon: Search,
    },
    {
      name: "Save favorite recipes",
      free: true,
      pdf: true,
      icon: Heart,
    },
    {
      name: "Recipe search & filters",
      free: true,
      pdf: true,
      icon: Search,
    },
    {
      name: "Mobile-friendly access",
      free: true,
      pdf: true,
      icon: Clock,
    },
    {
      name: "PDF recipe exports",
      free: false,
      pdf: true,
      icon: FileText,
      highlight: true,
    },
    {
      name: "Printable recipe cards",
      free: false,
      pdf: true,
      icon: FileText,
    },
    {
      name: "Offline recipe access",
      free: false,
      pdf: true,
      icon: FileText,
    },
  ];

  return (
    <div className="wrapper page min-h-screen">
      {/* Page Header */}
      <div className="text-center mb-16">
        <Heading
          title="Choose Your Plan"
          subTitle="Simple pricing for amazing recipes"
        />
      </div>

      {/* Current Subscription Status */}
      <div className="max-w-md mx-auto mb-16">
        <Text as="h2" variant="subheading" className="mb-6 text-center">
          Current Plan
        </Text>
        <SubscriptionStatus />
      </div>

      {/* Available Plans */}
      <div className="mb-16">
        <SubscriptionPlans />
      </div>

      {/* Features Comparison */}
      <div className="murakamicity-card p-8 max-w-4xl mx-auto">
        <Text as="h2" variant="subheading" className="text-center mb-8">
          What&apos Included
        </Text>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4">
                  <Text variant="large" className="font-medium">
                    Feature
                  </Text>
                </th>
                <th className="text-center py-4 min-w-[120px]">
                  <Text variant="large" className="font-medium">
                    Free
                  </Text>
                </th>
                <th className="text-center py-4 min-w-[120px]">
                  <div className="flex flex-col items-center gap-1">
                    <Text variant="large" className="font-medium text-primary">
                      PDF Access
                    </Text>
                    <Text className="text-muted-foreground text-sm">
                      £19.99 one-time
                    </Text>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr
                  key={index}
                  className={`border-b border-border/50 transition-colors hover:bg-muted/30 ${
                    feature.highlight ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <feature.icon className="w-5 h-5 text-muted-foreground" />
                      <Text className={feature.highlight ? "font-medium" : ""}>
                        {feature.name}
                      </Text>
                    </div>
                  </td>
                  <td className="text-center py-4">
                    {feature.free ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    )}
                  </td>
                  <td className="text-center py-4">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div>
              <Text className="font-medium mb-2">About PDF Access</Text>
              <Text className="text-muted-foreground text-sm leading-relaxed">
                Get lifetime access to download any recipe as a beautifully
                formatted PDF. Perfect for printing, sharing, or building your
                personal recipe collection. One-time payment, no subscriptions.
              </Text>
            </div>
          </div>
        </div>
      </div>

      <VerticalSpace space="24" />
    </div>
  );
}
