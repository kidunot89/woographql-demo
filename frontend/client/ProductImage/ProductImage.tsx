import { Product } from '@woographql/graphql';

import { Image } from '@woographql/ui/Image';
import { useProductContext } from '@woographql/client/ProductProvider';

export interface ProductImageProps {
  product: Product;
}

export function ProductImage({ product }: ProductImageProps) {
  const { get } = useProductContext();
  const sourceUrl = get('image.sourceUrl' as keyof Product) as string || product?.image?.sourceUrl;
  const altText = get('image.altText' as keyof Product) as string || product?.image?.altText || '';

  if (!sourceUrl) {
    return null;
  }

  return (
    <div className="basis-full md:basis-auto grow">
      <Image
        className="md:rounded-br"
        src={sourceUrl}
        alt={altText}
        ratio={3 / 4}
      />
    </div>
  );
}
