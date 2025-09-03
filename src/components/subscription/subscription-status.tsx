"use client";

import { Text } from "@/src/components/ui/Text";
import { FileText, Heart, CheckCircle } from "lucide-react";
import { authClient } from "@/src/utils/auth-client";
import { useState, useEffect } from "react";

export default function SubscriptionStatus() {
  const { data: session, isPending } = authClient.useSession();
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pdf'>('free');

  // In a real app, you'd fetch this from your database
  useEffect(() => {
    if (session?.user?.id) {
      // Simulate checking user's PDF access from database
      // For demo purposes, everyone starts as free
      setCurrentPlan('free');
    }
  }, [session]);

  if (isPending) {
    return (
      <div className="murakamicity-card p-6 animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="murakamicity-card p-6 border-dashed border-2">
        <div className="text-center">
          <Text className="text-muted-foreground">
            Sign in to view your plan
          </Text>
        </div>
      </div>
    );
  }

  const isPdfPlan = currentPlan === 'pdf';

  return (
    <div className="murakamicity-card p-6">
      <div className="flex items-center gap-4 mb-4">
        {isPdfPlan ? (
          <FileText className="w-8 h-8 text-primary" />
        ) : (
          <Heart className="w-8 h-8 text-muted-foreground" />
        )}
        <div>
          <Text as="h3" variant="large" className="font-semibold">
            {isPdfPlan ? 'PDF Access' : 'Free Plan'}
          </Text>
          <Text className="text-muted-foreground text-sm">
            {isPdfPlan ? 'Lifetime access to PDF exports' : 'Perfect for exploring recipes'}
          </Text>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <Text className="text-green-600 font-medium">Active</Text>
      </div>

      {isPdfPlan && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <Text className="font-medium">PDF Access Enabled</Text>
          </div>
          <Text className="text-muted-foreground text-sm">
            You have lifetime access to download any recipe as a PDF. 
            No expiry date, no recurring fees.
          </Text>
        </div>
      )}

      {!isPdfPlan && (
        <div className="bg-muted/50 rounded-lg p-4 mt-4">
          <Text className="text-muted-foreground text-sm">
            You're currently on the free plan. Upgrade to get PDF exports 
            and offline access to all recipes.
          </Text>
        </div>
      )}
    </div>
  );
}
