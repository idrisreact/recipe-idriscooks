import { useQuery } from '@tanstack/react-query';
import { authClient } from '../utils/auth-client';
import type { SubscriptionPlan, UserSubscription } from '../types/subscription.types';

export interface UseSubscriptionResult {
  subscription: UserSubscription | null;
  plan: SubscriptionPlan | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  isPro: boolean;
  isFree: boolean;
}

export const useSubscription = (): UseSubscriptionResult => {
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  const {
    data: subscriptionData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['subscription', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        return { subscription: null, plan: null };
      }

      const response = await fetch(`/api/subscription/${session.user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  console.log(subscriptionData);

  const subscription = subscriptionData?.subscription || null;
  const plan = subscriptionData?.plan || null;

  const isPremium = plan?.planType === 'premium';
  const isPro = plan?.planType === 'pro';
  const isFree = !plan || plan?.planType === 'free';

  return {
    subscription,
    plan,
    isLoading,
    error: error as Error | null,
    isAuthenticated,
    isPremium,
    isPro,
    isFree,
  };
};

export const useFeatureAccess = (feature: string) => {
  const { plan, isLoading } = useSubscription();

  return {
    hasAccess: plan?.features?.[feature as keyof typeof plan.features] || false,
    isLoading,
    plan,
  };
};
