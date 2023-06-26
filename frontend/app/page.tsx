import deepmerge from 'deepmerge';
import {
  Product,
  ProductCategory,
  PaColor,
  getClient
} from '@woographql/graphql';
import { Shop } from '@woographql/components/Shop';

const initialConnectionResults = {
  pageInfo: {
    hasNextPage: true,
    endCursor: null,
  },
  edges: [],
  nodes: [],
};

export async function fetchAllProducts() {
  try {
    const client = getClient();
    let data = { products: initialConnectionResults }
    let after = '';
    while(data.products.pageInfo.hasNextPage) {
      const next = await client.GetProducts({
        first: 1,
        after,
      });

      data = deepmerge(data, next);
      after = next.products?.pageInfo.endCursor || '';
    }

    return (data.products.nodes) as Product[];
  } catch (err) {
    console.error(err || 'Failed to fetch product listing!!!');
  }
}

export async function fetchAllCategories() {
  try {
    const client = getClient();
    let data = { productCategories: initialConnectionResults }
    let after = '';
    while(data.productCategories.pageInfo.hasNextPage) {
      const next = await client.GetShopCategories({
        first: 1,
        after,
      });

      data = deepmerge(data, next);
      after = next.productCategories?.pageInfo.endCursor || '';
    }

    return (data.productCategories.nodes) as ProductCategory[];

  } catch (err) {
    console.error(err || 'Failed to fetch product categories!!!');
  }
}

export async function fetchAllColors() {
  try {
    const client = getClient();
    let data = { allPaColor: initialConnectionResults }
    let after = '';
    while(data.allPaColor.pageInfo.hasNextPage) {
      const next = await client.GetShopColors({
        first: 1,
        after,
      });

      data = deepmerge(data, next);
      after = next.allPaColor?.pageInfo.endCursor || '';
    }

    return (data.allPaColor.nodes) as PaColor[];
  } catch (err) {
    console.error(err || 'Failed to fetch product color attributes!!!');
  }
}

export default async function ShopPage() {
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
      />
    </main>
  )
}
