import { PropsWithChildren } from 'react';
import Link from 'next/link';
import cn from 'clsx';

export const linkClassName = 'transition-colors group-hover:text-blue-400';

export interface NavLinkProps {
  href: string;
  className?: string;
}

export function NavLink({ children, href, className }: PropsWithChildren<NavLinkProps>) {
  return (
    <Link
      className={cn(
        className,
        linkClassName,
      )}
      href={href}
    >
      {children}
    </Link>
  )
}
