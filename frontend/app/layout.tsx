import {
  OrderEnum,
  TermObjectsConnectionOrderbyEnum,
  fetchCategories,
} from '@woographql/graphql';

import { TopNav, NavItem } from '@woographql/server/TopNav';
import { Footer } from '@woographql/server/Footer';
import { SessionProvider } from '@woographql/client/SessionProvider';
import { Toaster } from '@woographql/ui/toaster';

/* Font Awesome */
import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/brands.css';
import '@fortawesome/fontawesome-free/css/solid.css';

/* Google Fonts */
import '@fontsource/sansita/900.css';
import '@fontsource/sansita/700.css';
import '@fontsource/sansita/400.css';
import '@fontsource/sansita/400-italic.css';
import '@fontsource/padauk/400.css';
import '@fontsource/padauk/700.css';

import './globals.css';

export const metadata = {
  title: process.env.SITE_TITLE,
  description: process.env.SITE_DESCRIPTION,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categories = await fetchCategories(
    5,
    1,
    {
      orderby: TermObjectsConnectionOrderbyEnum.COUNT,
      order: OrderEnum.DESC
    }
  ) || [];
  const menu: NavItem[] = [
    ...categories.map((category) => ({
      label: category.name as string,
      href: `/${category.slug}`,
    })),
  ];

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <TopNav menu={menu} />
          <main className="w-full">
            {children}
          </main>
          <Footer />
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  )
}
