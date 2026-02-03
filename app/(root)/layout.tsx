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
import { MobileBottomNav } from '@/src/components/layout/MobileBottomNav';
import { WelcomeToast } from '@/src/components/welcome-toast/welcome-toast';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  const navBackground = useTransform(
    scrollY,
    [0, 100],
    ['rgba(5, 5, 5, 0)', 'rgba(5, 5, 5, 0.95)']
  );

  const navBorder = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.04)']
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/recipes', label: 'Recipes' },
    { href: '/about', label: 'About' },
  ];

  const authNavItems = [
    { href: '/favorites', label: 'Favorites' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/billing', label: 'Billing' },
  ];

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
          NAVIGATION - Editorial Minimal
      ═══════════════════════════════════════════════════════════════ */}
      <motion.header
        style={{
          backgroundColor: navBackground,
          borderBottomColor: navBorder,
        }}
        className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-all duration-500 ${
          isScrolled ? 'py-4' : 'py-6'
        }`}
      >
        <div className="wrapper">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="relative w-10 h-10 overflow-hidden border border-white/10"
              >
                <Image
                  src="/images/idris-cooks-logo-v1.JPG"
                  alt="Idris Cooks"
                  fill
                  className="object-cover"
                />
              </motion.div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-semibold tracking-tight text-white">
                  Idris Cooks
                </span>
                <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Culinary Excellence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href} active={pathname === item.href}>
                  {item.label}
                </NavLink>
              ))}
              <SignedIn>
                {authNavItems.map((item) => (
                  <NavLink key={item.href} href={item.href} active={pathname === item.href}>
                    {item.label}
                  </NavLink>
                ))}
              </SignedIn>
            </nav>

            {/* Auth Actions */}
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton>
                  <motion.button
                    whileHover={{ color: '#d4a853' }}
                    className="hidden sm:block text-sm font-medium uppercase tracking-[0.08em] text-white/60 transition-colors"
                  >
                    Sign In
                  </motion.button>
                </SignInButton>
                <SignUpButton>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary !py-3 !px-6 text-xs"
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

      {/* Main Content */}
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>

      {/* Cookie Consent */}
      <CookieConsent />

      {/* Welcome Toast */}
      <WelcomeToast />

      {/* Mobile Navigation */}
      <MobileBottomNav />
    </>
  );
}

// NavLink Component
function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <motion.span
        whileHover={{ color: '#ffffff' }}
        className={`nav-link ${active ? 'active' : ''}`}
      >
        {children}
      </motion.span>
    </Link>
  );
}
