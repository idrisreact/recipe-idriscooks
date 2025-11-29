'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { authClient } from '@/src/utils/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Text } from '../ui/Text';
import { SignInModal } from '../auth/sign-in-modal/SignInModal';
import SubscriptionBadge from '../subscription/subscription-badge';
import { motion, AnimatePresence } from 'framer-motion';

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
              src="/images/idris-cooks-logo-v1.JPG"
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
            <button
              className="md:hidden w-12 h-12 flex flex-col items-center justify-center gap-[6px] relative z-[60] bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all"
              onClick={() => setShowMenu((v) => !v)}
              aria-label={showMenu ? 'Close menu' : 'Open menu'}
              aria-expanded={showMenu}
              aria-controls="mobile-menu"
            >
              <motion.span
                animate={{
                  rotate: showMenu ? 45 : 0,
                  y: showMenu ? 8 : 0,
                }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-6 h-[2px] bg-white block rounded-full"
              />
              <motion.span
                animate={{
                  opacity: showMenu ? 0 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="w-6 h-[2px] bg-white block rounded-full"
              />
              <motion.span
                animate={{
                  rotate: showMenu ? -45 : 0,
                  y: showMenu ? -8 : 0,
                }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-6 h-[2px] bg-white block rounded-full"
              />
            </button>
          </div>
        </div>

        {}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 md:hidden overflow-hidden"
              onClick={() => setShowMenu(false)}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20% 50%, rgba(242, 0, 148, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
                }}
              />

              <nav
                className="relative h-full flex flex-col items-center justify-center px-8"
                role="navigation"
                aria-label="Mobile navigation"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center space-y-2 mb-16">
                  {primaryLinks
                    .filter(({ auth }) => !auth || session)
                    .map(({ href, label }, index) => (
                      <motion.div
                        key={href}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          delay: index * 0.1,
                          duration: 0.5,
                          ease: [0.25, 0.1, 0.25, 1],
                        }}
                      >
                        <Link
                          href={href}
                          className="block text-5xl sm:text-6xl font-black text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[var(--primary)] hover:to-purple-400 transition-all duration-300 uppercase tracking-tight"
                          onClick={() => setShowMenu(false)}
                        >
                          {label}
                        </Link>
                      </motion.div>
                    ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    delay: primaryLinks.length * 0.1,
                    duration: 0.5,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className="flex flex-col gap-4 w-full max-w-sm"
                >
                  {!session ? (
                    <>
                      <button
                        onClick={() => {
                          setShowSignInModal(true);
                          setShowMenu(false);
                        }}
                        className="w-full bg-white text-black font-bold py-4 px-8 text-lg uppercase tracking-wide hover:bg-[var(--primary)] hover:text-white transition-all duration-300"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          router.push('/sign-up');
                          setShowMenu(false);
                        }}
                        className="w-full bg-[var(--primary)] text-white font-bold py-4 px-8 text-lg uppercase tracking-wide hover:bg-[var(--primary-dark)] transition-all duration-300"
                      >
                        Sign Up
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={signOut}
                      className="w-full bg-white/10 border-2 border-white text-white font-bold py-4 px-8 text-lg uppercase tracking-wide hover:bg-white hover:text-black transition-all duration-300"
                    >
                      Sign Out
                    </button>
                  )}
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <main>{children}</main>

      {}
      {showSignInModal && <SignInModal onClose={() => setShowSignInModal(false)} />}
    </>
  );
}
