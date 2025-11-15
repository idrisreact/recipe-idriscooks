import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import Link from 'next/link';
import { CreditCard, Crown } from 'lucide-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <header className="flex justify-between items-center p-4 gap-4 h-16 border-b">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            Recipe Platform
          </Link>
          <SignedIn>
            <nav className="flex items-center gap-4">
              <Link
                href="/pricing"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#6c47ff] transition-colors"
              >
                <Crown className="w-4 h-4" />
                Pricing
              </Link>
              <Link
                href="/billing"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#6c47ff] transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Billing
              </Link>
            </nav>
          </SignedIn>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton />
            <SignUpButton>
              <button className="bg-[#6c47ff] text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>
      {children}
    </ClerkProvider>
  );
}
