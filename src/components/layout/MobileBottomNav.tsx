'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart } from 'lucide-react';
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
      href: '/search',
      label: 'Search',
      icon: Search,
    },
    {
      href: '/favorites',
      label: 'Favorites',
      icon: Heart,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] z-50">
      <nav className="flex justify-around items-center h-16">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                isActive ? 'text-[var(--primary)]' : 'text-gray-500 hover:text-gray-900'
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
