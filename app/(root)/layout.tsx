'use client';

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@/src/components/auth/auth-components';
import { Footer } from '@/src/components/layout/Footer';
import { CookieConsent } from '@/src/components/layout/CookieConsent';
import Link from 'next/link';
import { CreditCard, Crown, ChefHat } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  const navBackground = useTransform(
    scrollY,
    [0, 100],
    ['rgba(10, 10, 10, 0.6)', 'rgba(10, 10, 10, 0.95)']
  );

  const navBlur = useTransform(scrollY, [0, 100], ['blur(8px)', 'blur(20px)']);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        style={{
          backgroundColor: navBackground,
          backdropFilter: navBlur,
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'border-b border-white/10 shadow-2xl' : 'border-b border-white/5'
        }`}
      >
        <div className="wrapper">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center gap-3 group">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <ChefHat className="w-7 h-7 text-[var(--primary)]" />
                </motion.div>
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Idris Cooks
                </span>
              </Link>

              <SignedIn>
                <nav className="hidden md:flex items-center gap-1">
                  <NavLink href="/pricing" icon={<Crown className="w-4 h-4" />}>
                    Pricing
                  </NavLink>
                  <NavLink href="/billing" icon={<CreditCard className="w-4 h-4" />}>
                    Billing
                  </NavLink>
                </nav>
              </SignedIn>
            </div>

            {/* Auth Actions */}
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="hidden sm:block px-6 py-2.5 rounded-full text-sm font-medium text-white/90 hover:text-white transition-colors"
                  >
                    Sign In
                  </motion.button>
                </SignInButton>
                <SignUpButton>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(242, 0, 148, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white rounded-full font-medium text-sm px-6 py-2.5 shadow-lg shadow-[var(--primary)]/20 transition-all"
                  >
                    Get Started
                  </motion.button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-20" />

      <div className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </>
  );
}

// NavLink component for navigation items
function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white transition-all cursor-pointer"
      >
        {icon}
        {children}
      </motion.div>
    </Link>
  );
}
