"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { authClient } from "@/src/utils/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Text } from "../ui/Text";
import { SignInModal } from "../auth/sign-in-modal/SignInModal";
import SubscriptionBadge from "../subscription/subscription-badge";

interface LayoutHeaderProps {
  children: React.ReactNode;
}

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/recipes", label: "Recipes" },
  { href: "/favorites", label: "Favorites", auth: true },
  { href: "/subscription", label: "Subscription", auth: true },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function LayoutHeader({ children }: LayoutHeaderProps) {
  const { data: session } = authClient.useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const router = useRouter();

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/recipes") },
    });
    setShowMenu(false);
  };

  return (
    <>
      <header className="wrapper flex items-center justify-between py-4 md:py-8 relative">
        {/* Logo */}
        <Link href="/" aria-label="Go to homepage">
          <Image
            src="/images/idriscooks-logo.png"
            alt="Idris Cooks"
            width={50}
            height={50}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-6" role="navigation" aria-label="Main navigation">
          {primaryLinks.map(({ href, label, auth }) =>
            auth && !session ? null : (
              <Link 
                key={href} 
                href={href}
                className="text-gray-700 hover:text-blue-600 focus:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1 transition-colors"
              >
                {label}
              </Link>
            )
          )}
        </nav>

        {/* Greeting + Subscription + Hamburger */}
        <div className="flex items-center gap-3">
          {session && (
            <Text as="p" className="hidden sm:block">
              Welcome Back, {session.user.name}
            </Text>
          )}
          <SubscriptionBadge />
          {/* Desktop Auth Controls */}
          {session ? (
            <Button
              className="hidden md:block"
              variant="outline"
              size="sm"
              onClick={signOut}
            >
              Sign Out
            </Button>
          ) : (
            <>
              <Button
                className="hidden md:block"
                variant="outline"
                size="sm"
                onClick={() => setShowSignInModal(true)}
              >
                Sign In
              </Button>
              <Button
                className="hidden md:block"
                variant="outline"
                size="sm"
                onClick={() => router.push("/sign-up")}
              >
                Sign Up
              </Button>
            </>
          )}
          {/* Hamburger for mobile */}
          <Button
            className="md:hidden"
            variant="outline"
            size="icon"
            onClick={() => setShowMenu((v) => !v)}
            aria-label={showMenu ? "Close menu" : "Open menu"}
            aria-expanded={showMenu}
            aria-controls="mobile-menu"
          >
            <HamburgerMenuIcon />
          </Button>
        </div>

        {/* Mobile dropdown */}
        {showMenu && (
          <div
            id="mobile-menu"
            className="absolute top-full inset-x-0 bg-white shadow-lg z-50 md:hidden"
            onClick={() => setShowMenu(false)}
          >
            <nav className="flex flex-col space-y-3 p-4" role="navigation" aria-label="Mobile navigation">
              {/* Primary links */}
              {primaryLinks.map(({ href, label, auth }) =>
                auth && !session ? null : (
                  <Link
                    key={href}
                    href={href}
                    className="block text-lg"
                    onClick={() => setShowMenu(false)}
                  >
                    {label}
                  </Link>
                )
              )}

              <hr className="my-2" />

              {/* Auth controls */}
              {!session ? (
                <>
                  <button
                    onClick={() => {
                      setShowSignInModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left text-lg"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      router.push("/sign-up");
                      setShowMenu(false);
                    }}
                    className="w-full text-left text-lg"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <button onClick={signOut} className="w-full text-left text-lg">
                  Sign Out
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>

      {/* Keep your SignInModal for Google OAuth */}
      {showSignInModal && (
        <SignInModal onClose={() => setShowSignInModal(false)} />
      )}
    </>
  );
}
