"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Check, Crown, Star, Zap } from "lucide-react";
import type { SubscriptionPlan } from "@/src/types/subscription.types";

export default function SubscriptionPlans() {
  const {
    data: plans,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const response = await fetch("/api/subscription/plans");
      if (!response.ok) {
        throw new Error("Failed to fetch plans");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card 
            key={i} 
            variant="basic"
            content={
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            }
            className="p-6"
          />
        ))}
      </div>
    );
  }

  if (error || !plans) {
    return (
      <Card 
        variant="basic"
        content={
          <>
            <p className="text-red-600">Failed to load subscription plans</p>
            <Button variant="outline" className="mt-4">
              Retry
            </Button>
          </>
        }
        className="p-6 text-center"
      />
    );
  }

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case "pro":
        return <Crown className="w-5 h-5 text-purple-600" />;
      case "premium":
        return <Star className="w-5 h-5 text-blue-600" />;
      default:
        return <Zap className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case "pro":
        return "border-purple-200 bg-purple-50";
      case "premium":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200";
    }
  };

  const getFeatureList = (plan: SubscriptionPlan) => {
    const features = plan.features || {};
    const limits = plan.limits || {};

    const featureList = [];

    if (features.canCreateRecipes) featureList.push("Create recipes");
    if (features.canExportPdf) featureList.push("PDF export");
    if (features.canShareRecipes) featureList.push("Share recipes");
    if (features.hasNutritionInfo) featureList.push("Nutrition information");
    if (features.hasCustomThemes) featureList.push("Custom themes");
    if (features.hasPrioritySupport) featureList.push("Priority support");
    if (features.hasAdvancedSearch) featureList.push("Advanced search");
    if (features.hasOfflineAccess) featureList.push("Offline access");

    if (limits.totalCollections)
      featureList.push(`${limits.totalCollections} recipe collections`);
    if (limits.activeMealPlans)
      featureList.push(`${limits.activeMealPlans} meal plans`);
    if (limits.pdfExportsPerMonth)
      featureList.push(`${limits.pdfExportsPerMonth} PDF exports/month`);

    return featureList;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
        <p className="text-gray-600 mt-2">
          Unlock premium features to enhance your cooking experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan: SubscriptionPlan) => (
          <Card
            key={plan.id}
            variant="basic"
            content={
              <>
                {plan.planType === "premium" && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                    Most Popular
                  </Badge>
                )}

                <div className="space-y-4">
                  {/* Plan Header */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {getPlanIcon(plan.planType)}
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                    </div>
                    <div className="mb-2">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-gray-600">/{plan.billingCycle}</span>
                    </div>
                    {plan.description && (
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-2">
                    {getFeatureList(plan).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full ${
                      plan.planType === "free"
                        ? "bg-gray-600 hover:bg-gray-700"
                        : plan.planType === "premium"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    {plan.planType === "free"
                      ? "Current Plan"
                      : `Choose ${plan.name}`}
                  </Button>

                  {/* Trial Info */}
                  {plan.trialDays > 0 && plan.planType !== "free" && (
                    <p className="text-xs text-center text-gray-600">
                      {plan.trialDays}-day free trial
                    </p>
                  )}
                </div>
              </>
            }
            className={`p-6 relative ${getPlanColor(plan.planType)} ${
              plan.planType === "premium" ? "ring-2 ring-blue-500" : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
