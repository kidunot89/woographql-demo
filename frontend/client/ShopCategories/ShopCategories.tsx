import Link from 'next/link';

import { ProductCategory } from '@woographql/graphql';

import { useShopContext } from '@woographql/client/ShopProvider';
import { Badge } from '@woographql/ui/badge';
import { Button } from '@woographql/ui/button';
import cn from 'clsx';

export interface ShopCategoriesProps {
  categories: ProductCategory[];
}

export function ShopCategories({ categories }: ShopCategoriesProps) {
  const {
    selectedCategories,
    addCategory,
    removeCategory,
  } = useShopContext();
  return (
    <>
      <div className="flex gap-2 flex-wrap mb-4">
        {selectedCategories.map((slug) => {
          const category = categories.find((c) => c.slug === slug);
          if (!category) {
            return null;
          }
          return (
            <Badge
              variant="outline"
              onClick={() => removeCategory(slug)}
              className={cn(
                'hover:bg-red-500 hover:text-white cursor-pointer',
                'transition-colors duration-250 ease-in-out'
              )}
            >
              {category.name}
            </Badge>
          )
        })}
      </div>
      <ul className="mb-4">
        {categories.map((category) => {
          if (selectedCategories.includes(category.slug as string)) {
            return null;
          }
          return (
            <li key={category.id}>
              <Button
                variant="link"
                className="px-0"
                onClick={() => addCategory(category.slug as string)}
              >
                {category.name}
              </Button>
            </li>
          );
        })}
      </ul>
    </>
  )
}