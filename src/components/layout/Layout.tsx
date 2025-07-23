"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { authClient } from "@/src/utils/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Text } from "../ui/Text";
import { SignInModal } from "../sign-in-modal/SignInModal";

interface LayoutHeaderProps {
  children: React.ReactNode;
}

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/recipes", label: "Recipes" },
  { href: "/favorites", label: "Favorites", auth: true },
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
        <Image
          src="/images/idriscooks-logo.png"
          alt="Idris Cooks"
          width={50}
          height={50}
        />

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-6">
          {primaryLinks.map(({ href, label, auth }) =>
            auth && !session ? null : (
              <Link key={href} href={href}>
                {label}
              </Link>
            )
          )}
        </nav>

        {/* Greeting + Hamburger */}
        <div className="flex items-center gap-2">
          {session && (
            <Text as="p" className="hidden sm:block">
              Welcome Back, {session.user.name}
            </Text>
          )}
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
            aria-label="Toggle menu"
          >
            <HamburgerMenuIcon />
          </Button>
        </div>

        {/* Mobile dropdown */}
        {showMenu && (
          <div
            className="absolute top-full inset-x-0 bg-white shadow-lg z-50 md:hidden"
            onClick={() => setShowMenu(false)}
          >
            <nav className="flex flex-col space-y-3 p-4">
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
