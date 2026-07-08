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
import { MusicPlayer } from '@/src/components/music-player/MusicPlayer';
import { WelcomeToast } from '@/src/components/welcome-toast/welcome-toast';
import { TransitionLink, Magnetic } from '@/src/components/motion';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/recipes', label: 'Recipes' },
    { href: '/collections', label: 'Collections' },
    { href: '/meal-plans', label: 'Meal Plans' },
    { href: '/about', label: 'About' },
  ];

  const authNavItems = [
    { href: '/favorites', label: 'Favorites' },
    { href: '/shopping-list', label: 'Shopping List' },
    { href: '/pricing', label: 'Pricing' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b border-[var(--ink-line)] bg-[var(--cream)]/95 backdrop-blur transition-all duration-300 ${
          isScrolled ? 'py-3' : 'py-5'
        }`}
      >
        <div className="wrapper">
          <div className="flex justify-between items-center">
            <TransitionLink href="/" className="flex items-baseline gap-1.5 group">
              <span className="font-serif text-[28px] leading-none text-[var(--ink)]">Idris</span>
              <span className="font-serif italic text-[28px] leading-none text-[var(--tomato)]">
                cooks
              </span>
            </TransitionLink>

            <div className="hidden lg:flex items-center gap-8">
              <nav className="flex items-center gap-7">
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

              <Magnetic strength={0.25}>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--ink)] px-3 py-2 text-xs font-medium text-[var(--ink)] transition-colors hover:bg-[var(--parchment)]"
                  aria-label="Open search"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Search</span>
                  <span className="text-[var(--ink-50)]">⌘K</span>
                </button>
              </Magnetic>
            </div>

            <div className="flex items-center gap-3">
              <SignedOut>
                <SignInButton>
                  <button className="hidden sm:inline-flex text-sm font-medium text-[var(--ink-75)] underline-offset-4 transition-colors hover:text-[var(--tomato)] hover:underline">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton>
                  <Magnetic strength={0.25}>
                    <button className="btn-ink !px-5 !py-3 text-xs">Join</button>
                  </Magnetic>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>

            <nav className="hidden md:flex lg:hidden items-center gap-5">
              {navItems.slice(0, 3).map((item) => (
                <NavLink key={item.href} href={item.href} active={pathname === item.href}>
                  {item.label}
                </NavLink>
              ))}
              <SignedIn>
                <NavLink href="/favorites" active={pathname === '/favorites'}>
                  Favorites
                </NavLink>
              </SignedIn>
            </nav>
          </div>

          <div className="mt-4 flex md:hidden items-center justify-between border-t border-[var(--ink-line)] pt-3">
            <nav className="flex items-center gap-5 overflow-x-auto text-sm">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href} active={pathname === item.href}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <SignedOut>
              <SignInButton>
                <button className="shrink-0 text-sm font-medium text-[var(--tomato)]">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </header>

      <div className="min-h-screen flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>

      <CookieConsent />
      <WelcomeToast />
      <MobileBottomNav />
      <MusicPlayer />
    </>
  );
}

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
    <TransitionLink
      href={href}
      className={`nav-link link-underline whitespace-nowrap ${active ? 'active' : ''}`}
    >
      {children}
    </TransitionLink>
  );
}
