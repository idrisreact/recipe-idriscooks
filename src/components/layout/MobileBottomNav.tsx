'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, Folder, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();

  const links = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
    },
    {
      href: '/recipes',
      label: 'Recipes',
      icon: Search,
    },
    {
      href: '/favorites',
      label: 'Favorites',
      icon: Heart,
    },
    {
      href: '/collections',
      label: 'Collections',
      icon: Folder,
    },
    {
      href: '/meal-plans',
      label: 'Plans',
      icon: CalendarDays,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--cream)] border-t border-[var(--ink-line)] pb-[env(safe-area-inset-bottom)] z-50">
      <nav className="flex justify-around items-center h-16">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                isActive ? 'text-[var(--tomato)]' : 'text-[var(--ink-50)] hover:text-[var(--ink)]'
              )}
            >
              <Icon className={cn('w-6 h-6', isActive && 'fill-current')} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
