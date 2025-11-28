'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { authClient } from '@/src/utils/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { ShoppingCart } from 'lucide-react';
import { Text } from '../ui/Text';
import { SignInModal } from '../auth/sign-in-modal/SignInModal';
import SubscriptionBadge from '../subscription/subscription-badge';

interface LayoutHeaderProps {
  children: React.ReactNode;
}

const primaryLinks = [
  { href: '/', label: 'Home' },
  { href: '/recipes', label: 'Recipes' },
  { href: '/favorites', label: 'Favorites', auth: true },
  { href: '/shopping-list', label: 'Shopping List', auth: true },
  { href: '/subscription', label: 'Subscription', auth: true },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function LayoutHeader({ children }: LayoutHeaderProps) {
  const { data: session } = authClient.useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const router = useRouter();

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push('/recipes') },
    });
    setShowMenu(false);
  };

  return (
    <>
      <div className="murakamicity-nav relative">
        <div className="wrapper flex items-center justify-between py-4 md:py-6">
          {}
          <Link href="/" aria-label="Idris Cooks Logo" className="flex items-center">
            <Image
              src="/images/idriscooks-logo.png"
              alt="Idris Cooks"
              width={50}
              height={50}
              className="hover:scale-105 transition-transform duration-200"
            />
          </Link>

          {}
          <nav className="hidden md:flex space-x-8" role="navigation" aria-label="Main navigation">
            {primaryLinks.map(({ href, label, auth }) =>
              auth && !session ? null : (
                <Link
                  key={href}
                  href={href}
                  className="text-foreground hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm px-3 py-2 transition-all duration-200 font-medium"
                >
                  {label}
                </Link>
              )
            )}
          </nav>

          {}
          <div className="flex items-center gap-3">
            {session && (
              <Text as="p" className="hidden sm:block font-medium text-sm">
                Welcome Back, {session.user.name}
              </Text>
            )}
            <SubscriptionBadge />
            {session && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push('/shopping-list')}
                className="relative"
                aria-label="Shopping List"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
            {}
            {session ? (
              <Button
                className="hidden md:block murakamicity-button-outline text-sm font-medium"
                variant="outline"
                size="sm"
                onClick={signOut}
              >
                Sign Out
              </Button>
            ) : (
              <>
                <Button
                  className="hidden md:block murakamicity-button-outline text-sm font-medium"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSignInModal(true)}
                >
                  Sign In
                </Button>
                <Button
                  className="hidden md:block murakamicity-button text-sm font-medium"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/sign-up')}
                >
                  Sign Up
                </Button>
              </>
            )}
            {}
            <Button
              className="md:hidden border-border hover:border-primary focus:ring-primary focus:ring-offset-background"
              variant="outline"
              size="icon"
              onClick={() => setShowMenu((v) => !v)}
              aria-label={showMenu ? 'Close menu' : 'Open menu'}
              aria-expanded={showMenu}
              aria-controls="mobile-menu"
            >
              <HamburgerMenuIcon />
            </Button>
          </div>
        </div>

        {}
        {showMenu && (
          <div
            id="mobile-menu"
            className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border shadow-2xl z-50 md:hidden"
            onClick={() => setShowMenu(false)}
          >
            <nav
              className="flex flex-col space-y-1 p-6"
              role="navigation"
              aria-label="Mobile navigation"
            >
              {}
              {primaryLinks.map(({ href, label, auth }) =>
                auth && !session ? null : (
                  <Link
                    key={href}
                    href={href}
                    className="block text-base font-medium py-3 px-2 hover:text-primary transition-colors duration-200 rounded-sm"
                    onClick={() => setShowMenu(false)}
                  >
                    {label}
                  </Link>
                )
              )}

              <hr className="my-4 border-border" />

              {}
              {!session ? (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowSignInModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left murakamicity-button-outline py-3 px-4 text-center font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      router.push('/sign-up');
                      setShowMenu(false);
                    }}
                    className="w-full text-left murakamicity-button py-3 px-4 text-center font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <button
                  onClick={signOut}
                  className="w-full text-left murakamicity-button-outline py-3 px-4 text-center font-medium"
                >
                  Sign Out
                </button>
              )}
            </nav>
          </div>
        )}
      </div>

      <main>{children}</main>

      {}
      {showSignInModal && <SignInModal onClose={() => setShowSignInModal(false)} />}
    </>
  );
}
