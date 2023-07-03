import {
  fetchProducts,
  fetchColors,
} from '@woographql/graphql';

import { Shop } from '@woographql/server/Shop';
import { ShopProvider } from '@woographql/client/ShopProvider';
export interface CategoryPageProps { 
  params: {
    category: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params;

  if (!category) return (
    <h1>Page not found</h1>
  );

  const products = await fetchProducts(1, 0, { category: category });
  const colors = await fetchColors(1) || [];

  if (!products || products.length === 0) return (
    <h1>{`The ${category} category does not exist. Please check URL and try again.`}</h1>
  );

  return (
    <ShopProvider allProducts={products}>
      <Shop
        products={products}
        colors={colors}
      />
    </ShopProvider>
  );
}