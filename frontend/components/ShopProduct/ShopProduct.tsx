import {
  Product, ProductAttribute, SimpleProduct, VariationAttribute,
} from '@woographql/graphql';
import { Image } from '@woographql/components/Image';
import { CartOptions } from '@woographql/components/CartOptions';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@woographql/components/ui/tabs';

export interface ShopProductProps {
  product: Product;
}

export function ShopProduct(props: ShopProductProps) {
  const {
    product,
  } = props;

  const sourceUrl = product?.image?.sourceUrl;
  const altText = product?.image?.altText || '';

  return (
    <div className="w-full flex flex-wrap gap-4 max-w-screen-lg mx-auto">
      {sourceUrl && (
        <div className="basis-full lg:basis-1/2">
          <Image
            src={sourceUrl}
            alt={altText}
            ratio={3 / 4}
          />
        </div>
      )}
      <div className="basis-full lg:basis-auto shrink px-4">
        <h1 className="font-serif text-2xl font-bold mb-2">{product.name}</h1>
        <p className="font-serif text-lg font-bold mb-2">{product.shortDescription}</p>
        <CartOptions product={product} />
      </div>
      <Tabs defaultValue="description" className="w-full px-4">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="description">
          <div dangerouslySetInnerHTML={{ __html: product.description as string }} />
        </TabsContent>
        <TabsContent value="attributes">
          <ul>
            {(product as SimpleProduct).defaultAttributes?.nodes?.map((attribute: VariationAttribute) => (
              <li key={attribute?.id}>
                <p><strong>{attribute?.name}:</strong> {attribute.value}</p>
              </li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="reviews">
          <p>Reviews</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
