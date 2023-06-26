import { Shop } from '@woographql/components/Shop';
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

  const products = await fetchAllProducts();
  const categories = await fetchAllCategories() || [];
  const colors = await fetchAllColors() || [];

  if (!products) return (
    <main className="w-full">
      <h1>Page not found</h1>
    </main>
  );

  return (
    <main className="w-full">
      <h1 className="max-w-screen-lg text-2xl font-bold font-serif mx-auto mb-8">Shop</h1>
      <Shop
        products={products}
        categories={categories}
        colors={colors}
        category={category}
      />
    </main>
  )
}