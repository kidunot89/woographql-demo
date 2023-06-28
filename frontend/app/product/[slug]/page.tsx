import {
  getClient,
  Product,
  ProductIdTypeEnum
} from '@woographql/graphql';
import { ShopProduct } from '@woographql/server/ShopProduct';
import { SessionProvider } from '@woographql/client/SessionProvider';
import { Toaster } from '@woographql/ui/toaster';

async function fetchProductBySlug(slug: string) {
  try {
    const client = getClient();
    const data = await client.GetProduct({
      id: slug,
      idType: ProductIdTypeEnum.SLUG,
    });

    if (!data.product) {
      throw new Error('Product not found!!!');
    }

    return data.product as Product;
  } catch (err) {
    console.error(err || 'Failed to fetch product data!!!');
  }
}

export interface ProductPageProps { 
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;
  const product = await fetchProductBySlug(slug);

  if (!slug || !product) return (
    <main className="w-full">
      <h1>Page not found</h1>
    </main>
  );

  return (
    <>
      <SessionProvider>
        <main className="w-full">
          <ShopProduct product={product} />
        </main>
      </SessionProvider>
      <Toaster />
    </>
  );
}