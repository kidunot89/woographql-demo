import { useState } from 'react';
import Link from 'next/link';

import { Product, SimpleProduct } from '@woographql/graphql';
import { Image } from "@woographql/ui/Image";
import { useShopContext } from "@woographql/client/ShopProvider";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@woographql/ui/card";
import { Button } from '@woographql/ui/button';

export interface ProductListingProps {
  products: Product[];
}

const pageSize = 12;

export function ProductListing({ products }: ProductListingProps) {
  const { products: filteredProducts } = useShopContext();
  const [page, setPage] = useState(1);
  const pageCount = Math.floor((filteredProducts || products).length / pageSize);
  const nextPage = () => setPage((prevPage) => Math.min(prevPage + 1, pageCount));
  const prevPage = () => setPage((prevPage) => Math.max(prevPage - 1, 1));
  const hasNext = page < pageCount;
  const hasPrev = page > 1;

  
  const displayProducts = filteredProducts?.slice((page - 1) * pageSize, page * pageSize)
  || products.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <p className="font-semibold mb-4">Showing {displayProducts.length} of {(filteredProducts || products).length} items</p>
      <div className="flex flex-wrap justify-center md:justify-start gap-4">
        {displayProducts.map((product) => {
          const sourceUrl = product.image?.sourceUrl;
          const altText = product.image?.altText || '';
          return (
            <Link href={`/product/${product.slug}`} key={product.id}>
              <Card className="w-44 md:w-36">
                <CardHeader className="p-4">
                  <CardTitle className="font-serif whitespace-nowrap">{product.name}</CardTitle>
                  {sourceUrl && (
                    <Image
                      width={176}
                      height={176}
                      className="w-full"
                      src={sourceUrl}
                      alt={altText}
                      ratio={1 / 1}
                      fill={false}
                    />
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm truncate">{product.shortDescription}</p>
                </CardContent>
                <CardFooter className="p-4">
                  <p className="font-serif font-bold">{(product as SimpleProduct).price}</p>
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>
      <div className="flex justify-center my-4 gap-x-2 text-sms">
        <Button
          type="button"
          onClick={prevPage}
          disabled={!hasPrev}
          aria-label="Previous page"
          >
            <i className="fa-solid fa-chevron-left" aria-hidden />
          </Button>
          {Array.from({ length: pageCount }).map((_, index) => (
            <Button
              key={index}
              type="button"
              onClick={() => setPage(index + 1)}
              disabled={page === index + 1}
              aria-label={`Page ${index + 1}`}
              >
                {index + 1}
            </Button>
          ))}
          <Button
            type="button"
            onClick={nextPage}
            disabled={!hasNext}
            aria-label="Next page"
          >
            <i className="fa-solid fa-chevron-right" aria-hidden />
          </Button>
      </div>
    </>
  );
}