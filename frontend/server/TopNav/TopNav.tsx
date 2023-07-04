import { Logo } from '@woographql/server/Logo';
import { NavLink } from '@woographql/ui/NavLink';
import { UserNav } from '@woographql/client/UserNav';

export interface NavItem {
  label: string;
  href: string;
  cta?: boolean;
}

export interface TopNavProps {
  menu: NavItem[];
}

export function TopNav({ menu }: TopNavProps) {
  return (
    <nav className="w-full bg-white min-h-24 py-4 px-4">
      <ul className="max-w-screen-lg m-auto w-full flex flex-row gap-x-4 justify-end items-center">
        <Logo className="mr-auto" />
        {menu.map((item, i) => (
          <li key={i} className="group">
            <NavLink href={item.href}>
              {item.label}
            </NavLink>
          </li>
        ))}
        <UserNav />
      </ul>
    </nav>
  )
}