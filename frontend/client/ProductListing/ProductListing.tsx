import Link from 'next/link';

import { Product, SimpleProduct } from '@woographql/graphql';
import { Image } from "@woographql/client/Image";
import { useShopContext } from "@woographql/client/ShopProvider";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@woographql/ui/card";

export interface ProductListingProps {
  products: Product[];
}

export function ProductListing({ products }: ProductListingProps) {
  const { products: filteredProducts } = useShopContext();
  const displayProducts = filteredProducts || products;

  return (
    <>
      <p className="font-semibold mb-4">Showing {displayProducts.length} products</p>
      <div className="flex flex-wrap justify-center md:justify-start gap-4">
        {displayProducts.map((product) => {
          const sourceUrl = product.image?.sourceUrl;
          const altText = product.image?.altText || '';
          return (
            <Link href={`/product/${product.slug}`} key={product.id}>
              <Card className="w-56 md:w-44">
                <CardHeader>
                  <CardTitle className="font-serif">{product.name}</CardTitle>
                  {sourceUrl && (
                    <Image 
                      className="w-full"
                      src={sourceUrl}
                      alt={altText}
                      ratio={1 / 1}
                    />
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{product.shortDescription}</p>
                </CardContent>
                <CardFooter>
                  <p className="font-serif font-bold">{(product as SimpleProduct).price}</p>
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}