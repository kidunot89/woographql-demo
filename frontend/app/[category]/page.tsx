import { Shop } from '@woographql/server/Shop';
import { ShopProvider } from '@woographql/client/ShopProvider';
import { SessionProvider } from '@woographql/client/SessionProvider';

import {
  fetchAllProducts,
  fetchAllCategories,
  fetchAllColors,
} from '../page';

export interface CategoryPageProps { 
  params: {
    category: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params;

  if (!category) return (
    <main className="w-full">
      <h1>Page not found</h1>
    </main>
  );

  const products = await fetchAllProducts({ category: category });
  const categories = await fetchAllCategories() || [];
  const colors = await fetchAllColors() || [];

  if (!products) return (
    <main className="w-full">
      <h1>Page not found</h1>
    </main>
  );

  return (
    <SessionProvider>
      <main className="w-full">
        <h1 className="max-w-screen-lg text-2xl font-bold font-serif mx-auto mb-8">Shop</h1>
        <ShopProvider allProducts={products}>
          <Shop
            products={products}
            categories={categories}
            colors={colors}
          />
        </ShopProvider>
      </main>
    </SessionProvider>
  )
}