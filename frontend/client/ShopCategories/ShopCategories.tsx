import Link from 'next/link';

import { cn } from '@woographql/utils/ui';
import { ProductCategory } from '@woographql/graphql';
import { useShopContext } from '@woographql/client/ShopProvider';

import { Badge } from '@woographql/ui/badge';
import { NavLink } from '@woographql/ui/NavLink';

export interface ShopCategoriesProps {
  categories: ProductCategory[];
}

export function ShopCategories({ categories }: ShopCategoriesProps) {
  const {
    selectedCategories,
    buildUrl,
  } = useShopContext();
  return (
    <>
      <div className="flex gap-2 flex-wrap mb-4">
        {selectedCategories.map((slug) => {
          const category = categories.find((c) => c.slug === slug);
          if (!category) {
            return null;
          }

          const href = buildUrl({
            categories: selectedCategories.filter((s) => s !== slug),
            page: 1,
          });
          return (
            <Link
              key={category.id}
              href={href}
              shallow
              prefetch={false}
            >
              <Badge
                variant="outline"
                className={cn(
                  'hover:bg-red-500 hover:text-white cursor-pointer',
                  'transition-colors duration-250 ease-in-out'
                )}
              >
                {category.name}
              </Badge>
            </Link>
          )
        })}
      </div>
      <ul className="mb-4 max-h-[40vh] lg:max-h-[25vh] overflow-y-scroll scrollbar-thin scrollbar-corner-rounded scrollbar-thumb-ring">
        {categories.map((category) => {
          if (selectedCategories.includes(category.slug as string)) {
            return null;
          }
          const href = buildUrl({
            categories: [...selectedCategories, category.slug as string],
            page: 1,
          });
          return (
            <li className="group py-2" key={category.id}>
              <NavLink
                href={href}
                prefetch={false}
                shallow
              >
                {category.name}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </>
  );
}