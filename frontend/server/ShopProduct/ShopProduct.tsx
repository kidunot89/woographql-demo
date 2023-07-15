import { Product, SimpleProduct, VariationAttribute } from '@woographql/graphql';
import { CartOptions } from '@woographql/server/CartOptions';
import { ProductImage } from '@woographql/client/ProductImage';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@woographql/ui/tabs';

export interface ShopProductProps {
  product: Product;
}

export function ShopProduct(props: ShopProductProps) {
  const {
    product,
  } = props;

  const attributes: Record<string, string[]> = (product as SimpleProduct).defaultAttributes?.nodes?.reduce(
    (attributesList, attribute) => {
      const {
        value,
        label
      } = attribute as VariationAttribute;

      const currentAttributes = attributesList[label as string] || [];
      return {
        ...attributesList,
        [label as string]: [...currentAttributes, value as string],
      };
    },
    {} as Record<string, string[]>
  ) || {};

  return (
    <div className="w-full flex flex-wrap gap-4 max-w-screen-lg mx-auto mb-36 lg:mb-0">
      <ProductImage product={product} />
      <div className="basis-full md:basis-1/2 pt-4 px-4 flex flex-col">
        <h1 className="font-serif text-2xl font-bold mb-2">{product.name}</h1>
        <p className="text-lg font-bold mb-2">{product.shortDescription}</p>
        <CartOptions product={product} />
      </div>
      <Tabs defaultValue="description" className="w-full px-4">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="description">
          <div dangerouslySetInnerHTML={{ __html: product.description as string }} />
        </TabsContent>
        <TabsContent value="attributes">
          <ul>
            {Object.entries(attributes).map(([label, values]) => (
              <li key={label}>
                <p><span className="font-serif font-medium">{label}:</span> {values.join(', ')}</p>
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
