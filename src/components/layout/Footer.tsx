'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { href: '/recipes', label: 'Recipes' },
    { href: '/collections', label: 'Collections' },
    { href: '/meal-plans', label: 'Meal Plans' },
    { href: '/favorites', label: 'Favorites' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
  ];

  const legalLinks = [
    { href: '/refund-policy', label: 'Refund Policy' },
    { href: '/terms', label: 'Terms' },
    { href: '/privacy', label: 'Privacy' },
  ];

  return (
    <footer className="mt-auto border-t border-[var(--ink)] bg-[var(--cream)]">
      <div className="wrapper py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-baseline gap-1.5 group mb-6">
              <span className="font-serif text-[32px] leading-none text-[var(--ink)]">Idris</span>
              <span className="font-serif italic text-[32px] leading-none text-[var(--tomato)]">
                cooks
              </span>
            </Link>

            <p className="body-md max-w-sm mb-8">
              A small archive of good things to cook. Tested until they are not fussy.
            </p>

            <a href="mailto:support@idriscooks.com" className="btn-link text-sm">
              support@idriscooks.com
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <div className="lg:col-span-3 lg:col-start-7">
            <h4 className="caption mb-6">Navigation</h4>
            <ul className="space-y-4">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--ink-60)] transition-colors hover:text-[var(--tomato)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="caption mb-6">Legal</h4>
            <ul className="space-y-4">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--ink-60)] transition-colors hover:text-[var(--tomato)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--ink-line)]">
        <div className="wrapper py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[var(--ink-50)]">
              {currentYear} Idris Cooks. All rights reserved.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-1"
            >
              <span className="text-xs text-[var(--ink-50)]">Cooked with</span>
              <span className="text-sm text-[var(--tomato)]">care</span>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
}
