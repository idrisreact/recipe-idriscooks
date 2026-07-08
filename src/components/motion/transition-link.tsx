'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';
import { usePageTransition } from './transition-provider';

type TransitionLinkProps = ComponentProps<typeof Link>;

/**
 * next/link (keeps prefetching) that routes clicks through the page
 * transition. Modifier clicks, middle clicks and external URLs keep
 * native anchor behavior.
 */
export const TransitionLink = ({ href, onClick, ...props }: TransitionLinkProps) => {
  const { navigate } = usePageTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }

    const url = typeof href === 'string' ? href : (href.pathname ?? '');
    if (!url.startsWith('/')) return;

    event.preventDefault();
    navigate(url);
  };

  return <Link href={href} onClick={handleClick} {...props} />;
};
