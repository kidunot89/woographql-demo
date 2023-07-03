import { Product, SimpleProduct, VariationAttribute } from '@woographql/graphql';
import { CartOptions } from '@woographql/server/CartOptions';
import { ProductProvider } from '@woographql/client/ProductProvider';
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

  return (
    <ProductProvider product={product}>
      <div className="w-full flex flex-wrap gap-4 max-w-screen-lg mx-auto mb-36 lg:mb-0">
        <ProductImage product={product} />
        <div className="basis-full md:basis-1/2 pt-4 px-4 flex flex-col">
          <h1 className="font-serif text-2xl font-bold mb-2">{product.name}</h1>
          <p className="font-serif text-lg font-bold mb-2">{product.shortDescription}</p>
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
    </ProductProvider>
  );
}
