import { PropsWithChildren } from 'react';
import Link from 'next/link';
import { cn } from '@woographql/utils/ui';

export const linkClassName = 'transition-colors group-hover:text-blue-400';

export interface NavLinkProps {
  href: string;
  className?: string;
  shallow?: boolean;
  prefetch?: boolean;
}

export function NavLink(props: PropsWithChildren<NavLinkProps>) {
  const {
    children,
    href,
    className,
    shallow,
    prefetch,
  } = props;
  return (
    <Link
      className={cn(
        className,
        linkClassName,
      )}
      href={href}
      shallow={shallow}
      prefetch={prefetch}
    >
      {children}
    </Link>
  )
}
