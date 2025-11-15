'use client';

import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { useState } from 'react';

interface UpgradePromptProps {
  message: string;
  feature?: string;
}

export function UpgradePrompt({ message, feature }: UpgradePromptProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white rounded-lg shadow-2xl border-2 border-[#6c47ff] p-6 z-50 animate-slide-up">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="pr-8">
        <h3 className="text-lg font-bold mb-2">
          {feature ? `Unlock ${feature}` : 'Upgrade Your Plan'}
        </h3>
        <p className="text-gray-600 mb-4">{message}</p>

        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 bg-[#6c47ff] text-white px-4 py-2 rounded-lg hover:bg-[#5a3dd4] transition-colors"
        >
          View Plans
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
