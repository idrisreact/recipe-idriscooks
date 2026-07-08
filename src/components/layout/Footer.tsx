'use client';

import { ArrowUpRight } from 'lucide-react';
import { TransitionLink, SplitTextReveal } from '@/src/components/motion';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { href: '/recipes', label: 'Recipes' },
    { href: '/collections', label: 'Collections' },
    { href: '/meal-plans', label: 'Meal Plans' },
    { href: '/favorites', label: 'Favorites' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/catering', label: 'Catering' },
    { href: '/about', label: 'About' },
  ];

  const legalLinks = [
    { href: '/refund-policy', label: 'Refund Policy' },
    { href: '/terms', label: 'Terms' },
    { href: '/privacy', label: 'Privacy' },
  ];

  return (
    <footer className="mt-auto border-t border-[var(--ink)] bg-[var(--cream)]">
      {/* Sign-off */}
      <div className="wrapper border-b border-[var(--ink-line)] py-16 lg:py-24">
        <SplitTextReveal
          as="p"
          className="font-serif text-[clamp(2.5rem,8vw,6.5rem)] leading-[0.95] tracking-[-0.01em] text-[var(--ink)]"
        >
          Cook <span className="italic text-[var(--tomato)]">like</span> you mean it.
        </SplitTextReveal>
      </div>

      <div className="wrapper py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          <div className="lg:col-span-5">
            <TransitionLink href="/" className="inline-flex items-baseline gap-1.5 group mb-6">
              <span className="font-serif text-[32px] leading-none text-[var(--ink)]">Idris</span>
              <span className="font-serif italic text-[32px] leading-none text-[var(--tomato)]">
                cooks
              </span>
            </TransitionLink>

            <p className="body-md max-w-sm mb-8">
              A small archive of good things to cook. Tested until they are not fussy.
            </p>

            <a href="mailto:support@idriscooks.com" className="btn-link text-sm">
              support@idriscooks.com
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <div className="lg:col-span-3 lg:col-start-7">
            <h3 className="caption mb-6">Navigation</h3>
            <ul className="space-y-4">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <TransitionLink
                    href={link.href}
                    className="link-underline text-sm text-[var(--ink-60)] transition-colors hover:text-[var(--tomato)]"
                  >
                    {link.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="caption mb-6">Legal</h3>
            <ul className="space-y-4">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <TransitionLink
                    href={link.href}
                    className="link-underline text-sm text-[var(--ink-60)] transition-colors hover:text-[var(--tomato)]"
                  >
                    {link.label}
                  </TransitionLink>
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

            <div className="flex items-center gap-1">
              <span className="text-xs text-[var(--ink-50)]">Cooked with</span>
              <span className="text-sm text-[var(--tomato)]">care</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
