'use client';

import { useSubscription } from '@/src/hooks/use-subscription';
import { Badge } from '@/src/components/ui/badge';
import { Crown, Star, Zap } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionBadge() {
  const { plan, isLoading, isAuthenticated, isPremium, isPro } = useSubscription();

  if (!isAuthenticated || isLoading) {
    return null;
  }

  const getPlanIcon = () => {
    if (isPro) return <Crown className="w-3 h-3" />;
    if (isPremium) return <Star className="w-3 h-3" />;
    return <Zap className="w-3 h-3" />;
  };

  const getPlanColor = () => {
    if (isPro) return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
    if (isPremium) return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
  };

  return (
    <Link href="/subscription" className="transition-colors">
      <Badge className={`flex items-center gap-1 cursor-pointer ${getPlanColor()}`}>
        {getPlanIcon()}
        <span className="text-xs font-medium">
          {plan?.name || 'Free'}
        </span>
      </Badge>
    </Link>
  );
}