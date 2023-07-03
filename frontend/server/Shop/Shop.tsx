import {
  Product,
  ProductCategory,
  PaColor,
} from '@woographql/graphql';
import { ShopCategories } from "@woographql/client/ShopCategories";
import { PaColorPicker } from '@woographql/client/PaColorPicker';
import { SearchBar } from '@woographql/client/SearchBar';
import { ProductListing } from '@woographql/client/ProductListing';
import { PriceRange } from '@woographql/client/PriceRange';
import { ShopSidebar } from '@woographql/server/ShopSidebar';

export interface ShopProps {
  products: Product[];
  categories?: ProductCategory[];
  colors: PaColor[];
}

export function Shop(props: ShopProps) {
  const {
    products,
    categories,
    colors,
  } = props;

  return (
    <div className="w-full flex max-w-screen-lg mx-auto">
      <ShopSidebar>
        {categories && (
          <>
            <p className="font-serif text-lg font-bold mb-2">Categories</p>
            <ShopCategories categories={categories} />
          </>
        )}
        <p className="font-serif text-lg font-bold mb-2">Colors</p>
        <PaColorPicker colors={colors} />
        <p className="font-serif text-lg font-bold mb-2">Price</p>
        <PriceRange />
      </ShopSidebar>
      <div className="w-full px-4 lg:w-3/4">
        <p className="font-serif text-lg font-bold mb-2">Search</p>
        <SearchBar />
        <p className="font-serif text-lg font-bold mb-2">Results</p>
        <ProductListing products={products} />
      </div>
    </div>
  );
}
