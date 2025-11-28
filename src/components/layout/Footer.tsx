'use client';

import Link from 'next/link';
import { Text } from '@/src/components/ui/Text';
import { ChefHat, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/5 bg-gradient-to-b from-transparent to-black/20">
      <div className="wrapper py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-3 group mb-4">
              <ChefHat className="w-6 h-6 text-[var(--primary)]" />
              <span className="font-bold text-lg bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Idris Cooks
              </span>
            </Link>
            <Text variant="small" className="text-muted-foreground">
              Discover, save, and share amazing recipes from around the world.
            </Text>
          </div>

          {/* Product */}
          <div>
            <Text as="h4" variant="large" className="font-semibold mb-4">
              Product
            </Text>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/recipes"
                  className="text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  Recipes
                </Link>
              </li>
              <li>
                <Link
                  href="/favorites"
                  className="text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  Favorites
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <Text as="h4" variant="large" className="font-semibold mb-4">
              Legal
            </Text>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/refund-policy"
                  className="text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <Text as="h4" variant="large" className="font-semibold mb-4">
              Contact
            </Text>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:support@idriscooks.com"
                  className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Support
                </a>
              </li>
              {/* Add your social links here */}
              {/* <li>
                <a
                  href="https://twitter.com/idriscooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-2"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
              </li> */}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Text variant="small" className="text-muted-foreground text-center sm:text-left">
            © {currentYear} Idris Cooks. All rights reserved.
          </Text>

          <div className="flex items-center gap-6">
            <Link
              href="/refund-policy"
              className="text-xs text-muted-foreground hover:text-white transition-colors"
            >
              Refunds
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-white transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
