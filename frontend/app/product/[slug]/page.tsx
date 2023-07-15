import { ProductProvider } from '@woographql/client/ProductProvider';
import {
  fetchProductBy,
  ProductIdTypeEnum,
} from '@woographql/graphql';
import { ShopProduct } from '@woographql/server/ShopProduct';

export interface ProductPageProps { 
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;
  const product = await fetchProductBy(slug, ProductIdTypeEnum.SLUG);

  if (!slug || !product) return (
    <h1>Page not found</h1>
  );

  return (
    <ProductProvider product={product}>
      <ShopProduct product={product} />
    </ProductProvider>
  );
}