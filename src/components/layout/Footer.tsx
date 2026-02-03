'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { href: '/recipes', label: 'Recipes' },
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
    <footer className="mt-auto border-t border-white/[0.03] bg-[var(--background)]">
      {/* Main Footer Content */}
      <div className="wrapper py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-4 group mb-6">
              <div className="w-10 h-10 border border-[var(--primary)]/30 flex items-center justify-center">
                <span className="font-serif text-lg font-bold text-[var(--primary)]">IC</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-semibold text-white">Idris Cooks</span>
              </div>
            </Link>

            <p className="body-md max-w-sm mb-8">
              Discover, save, and share amazing recipes from around the world. Where culinary
              excellence meets innovation.
            </p>

            <a href="mailto:support@idriscooks.com" className="btn-link text-sm">
              support@idriscooks.com
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-3 lg:col-start-7">
            <h4 className="caption text-white mb-6">Navigation</h4>
            <ul className="space-y-4">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-[var(--primary)] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="lg:col-span-3">
            <h4 className="caption text-white mb-6">Legal</h4>
            <ul className="space-y-4">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-[var(--primary)] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/[0.03]">
        <div className="wrapper py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/30">{currentYear} Idris Cooks. All rights reserved.</p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-1"
            >
              <span className="text-xs text-white/30">Crafted with</span>
              <span className="text-[var(--primary)] text-sm">care</span>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
}
