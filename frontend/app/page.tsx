import {
  fetchProducts,
  fetchCategories,
  fetchColors,
} from '@woographql/graphql';
import { Shop } from '@woographql/server/Shop';
import { ShopProvider } from '@woographql/client/ShopProvider';

export default async function ShopPage() {
  const products = await fetchProducts(20, 0);
  const categories = await fetchCategories(20, 0, { hideEmpty: true }) || [];
  const colors = await fetchColors(20, 0, { hideEmpty: true }) || [];

  if (!products) return (
    <h1>Page not found</h1>
  );

  return (
    <ShopProvider allProducts={products}>
      <Shop
        products={products}
        categories={categories}
        colors={colors}
      />
    </ShopProvider>
  );
}
