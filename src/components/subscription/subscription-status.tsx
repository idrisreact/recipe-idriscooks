"use client";

import { useSubscription } from "@/src/hooks/use-subscription";
import { Badge } from "@/src/components/ui/badge";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Crown, Star, Zap } from "lucide-react";

export default function SubscriptionStatus() {
  const {
    subscription,
    plan,
    isLoading,
    error,
    isAuthenticated,
    isPremium,
    isPro,
    isFree,
  } = useSubscription();

  console.log(subscription);

  if (!isAuthenticated) {
    return (
      <Card 
        variant="basic"
        content={
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Sign in to view subscription status
            </p>
          </div>
        }
        className="p-4 border-dashed"
      />
    );
  }

  if (isLoading) {
    return (
      <Card 
        variant="basic"
        content={
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        }
        className="p-4"
      />
    );
  }

  if (error) {
    return (
      <Card 
        variant="basic"
        content={
          <div className="text-center">
            <p className="text-sm text-red-600">Failed to load subscription</p>
            <Button variant="outline" size="sm" className="mt-2">
              Retry
            </Button>
          </div>
        }
        className="p-4 border-red-200 bg-red-50"
      />
    );
  }

  const getPlanIcon = () => {
    if (isPro) return <Crown className="w-4 h-4 text-purple-600" />;
    if (isPremium) return <Star className="w-4 h-4 text-blue-600" />;
    return <Zap className="w-4 h-4 text-gray-600" />;
  };

  const getPlanColor = () => {
    if (isPro) return "bg-purple-100 text-purple-800 border-purple-200";
    if (isPremium) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusColor = () => {
    if (subscription?.status === "active") return "bg-green-100 text-green-800";
    if (subscription?.status === "trialing")
      return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card 
      variant="basic"
      content={
        <div className="space-y-3">
          {/* Plan Information */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getPlanIcon()}
              <span className="font-medium">{plan?.name || "Free"}</span>
            </div>
            <Badge className={getPlanColor()}>{plan?.planType || "free"}</Badge>
          </div>

          {/* Subscription Status */}
          {subscription && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <Badge className={getStatusColor()}>{subscription.status}</Badge>
            </div>
          )}

          {/* Price */}
          {plan && plan.price !== "0.00" && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Price:</span>
              <span className="font-medium">
                ${plan.price}/{plan.billingCycle}
              </span>
            </div>
          )}

          {/* Period */}
          {subscription && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Period:</span>
              <span className="text-xs">
                {new Date(subscription.currentPeriodStart).toLocaleDateString()} -{" "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Trial Status */}
          {subscription?.status === "trialing" && subscription.trialEnd && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
              <p className="text-xs text-yellow-800">
                Trial ends: {new Date(subscription.trialEnd).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {isFree && (
              <Button size="sm" className="flex-1">
                Upgrade to Premium
              </Button>
            )}
            {isPremium && (
              <Button size="sm" variant="outline" className="flex-1">
                Upgrade to Pro
              </Button>
            )}
            {(isPremium || isPro) && (
              <Button size="sm" variant="outline" className="flex-1">
                Manage Subscription
              </Button>
            )}
          </div>
        </div>
      }
      className="p-4"
    />
  );
}
