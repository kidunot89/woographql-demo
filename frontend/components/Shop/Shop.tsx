'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  Product,
  ProductCategory,
  PaColor,
  SimpleProduct,
} from '@woographql/graphql';
import { Image } from "@woographql/components/Image";
import { Label } from "@woographql/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@woographql/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@woographql/components/ui/card";
import { Input } from "@woographql/components/ui/input"

export interface ShopProps {
  products: Product[];
  categories: ProductCategory[];
  colors: PaColor[];
  category?: string;
}

export function Shop(props: ShopProps) {
  const searchParams = useSearchParams();
  const { push } = useRouter();
  const {
    products,
    categories,
    colors,
    category,
  } = props;

  const color = searchParams?.get('color');

  let displayProducts = category
    ? products.filter((product) => product.productCategories?.nodes?.some(
      (cat: ProductCategory) => cat?.slug === category)
    )
    : products;

  displayProducts = color
    ? displayProducts.filter((product) => product.allPaColor?.nodes?.some(
      (colr: PaColor) => colr?.slug === color)
    )
    : displayProducts;

  return (
    <div className="w-full flex max-w-screen-lg mx-auto">
      <div className="w-1/4">
        <p className="font-serif text-lg font-bold mb-2">Categories</p>
        <ul className="mb-4">
          {categories.map((category) => (
            <li key={category.id}>
              <Link href={`/${category.slug}`}>{category.name}</Link>
            </li>
          ))}
        </ul>
        <p className="font-serif text-lg font-bold mb-2">Colors</p>
        <RadioGroup>
          {colors.map((color) => (
            <div key={color.id} className="flex items-center space-x-2">
              <RadioGroupItem
                className="text-white"
                value={color.slug as string}
                id={color.id as string}
                style={{ backgroundColor: color.slug as string }}
                onClick={() => push(`?color=${color.slug}`)}
              />
              <Label htmlFor={color.id}>{color.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="w-3/4">
        <p className="font-serif text-lg font-bold mb-2">Search</p>
        <Input className="mb-4" />
        <p className="font-serif text-lg font-bold mb-2">Results</p>
        <div className="flex flex-wrap gap-4">
          {displayProducts.map((product) => {
            const sourceUrl = product.image?.sourceUrl;
            const altText = product.image?.altText || '';
            return (
              <Link href={`/product/${product.slug}`} key={product.id}>
                <Card className="w-44">
                  <CardHeader>
                    <CardTitle className="font-serif">{product.name}</CardTitle>
                    {sourceUrl && (
                      <Image 
                        className="w-full"
                        src={sourceUrl}
                        alt={altText}
                        ratio={3 / 4}
                      />
                    )}
                  </CardHeader>
                  <CardContent>
                    <p>{product.shortDescription}</p>
                  </CardContent>
                  <CardFooter>
                    <p className="font-serif font-bold">{(product as SimpleProduct).price}</p>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}