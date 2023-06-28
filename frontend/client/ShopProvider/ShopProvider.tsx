import {
  useEffect,
  useContext,
  useReducer,
  createContext,
  PropsWithChildren,
} from 'react';
import {
  useRouter,
  usePathname,
  useSearchParams,
} from 'next/navigation';

import {
  Product,
  ProductCategory,
  PaColor,
  SimpleProduct,
  VariableProduct,
  ProductTypesEnum,
} from '@woographql/graphql';

export type ProductWithPrice = SimpleProduct & { rawPrice: string }
  | VariableProduct & { rawPrice: string };

export interface ShopContext {
  search: string;
  setSearch: (search: string) => void;
  selectedCategories: string[];
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  selectedColors: string[];
  addColor: (color: string) => void;
  removeColor: (color: string) => void;
  priceRange: [number, number|null];
  setPriceRange: (priceRange: [number|null, number|null]) => void;
  globalMin: number;
  globalMax: number;
  products: Product[];
}

export type ShopAction =
  | { type: 'SET_SEARCH', payload: string }
  | { type: 'SET_CATEGORIES', payload: string[] }
  | { type: 'ADD_CATEGORY', payload: string }
  | { type: 'REMOVE_CATEGORY', payload: string }
  | { type: 'SET_COLORS', payload: string[] }
  | { type: 'ADD_COLOR', payload: string }
  | { type: 'REMOVE_COLOR', payload: string }
  | { type: 'SET_PRICE_RANGE', payload: [number|null, number|null] }

const initialState: ShopContext = {
  search: '',
  setSearch: () => {},
  selectedCategories: [],
  addCategory: () => {},
  removeCategory: () => {},
  selectedColors: [],
  addColor: () => {},
  removeColor: () => {},
  priceRange: [0, null],
  setPriceRange: () => {},
  globalMin: 0,
  globalMax: 100,
  products: [],
};

const shopContext = createContext<ShopContext>(initialState);

export function useShopContext() {
  return useContext(shopContext);
}

const reducer = (state: ShopContext, action: ShopAction): ShopContext => {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, selectedCategories: action.payload };
    case 'ADD_CATEGORY':
      return { ...state, selectedCategories: [...state.selectedCategories, action.payload] };
    case 'REMOVE_CATEGORY':
      return { ...state, selectedCategories: state.selectedCategories.filter((category) => category !== action.payload) };
    case 'SET_COLORS':
      return { ...state, selectedColors: action.payload };
    case 'ADD_COLOR':
      return { ...state, selectedColors: [...state.selectedColors, action.payload] };
    case 'REMOVE_COLOR':
      return { ...state, selectedColors: state.selectedColors.filter((color) => color !== action.payload) };
    case 'SET_PRICE_RANGE':
      const [min, max] = action.payload;
      if (min === null) {
        return { ...state, priceRange: [0, max] };
      }
      if (max === null) {
        return { ...state, priceRange: [min, null] };
      }
      return { ...state, priceRange: [min, max] };
    default:
      return state;
  }
}

function filterProducts(products: Product[], state: ShopContext) {
  let filteredProducts = products;
  if (Object.is(state, initialState)) {
    return filteredProducts;
  }

  // Search by category.
  if (state.selectedCategories.length) {
    filteredProducts = filteredProducts.filter((product) => {
      return product.productCategories?.nodes?.some((category: ProductCategory) => {
        return state.selectedCategories.includes(category.slug as string);
      });
    });
  }

  // Search by color.
  if (state.selectedColors.length) {
    filteredProducts = filteredProducts.filter((product) => {
      return product.allPaColor?.nodes?.some((color: PaColor) => {
        return state.selectedColors.includes(color.slug as string);
      });
    });
  }

  // Search by name, description, and short description.
  if (state.search) {
    filteredProducts = filteredProducts.filter((product) => {
      return product.name?.toLowerCase().includes(state.search.toLowerCase())
        || product.description?.toLowerCase().includes(state.search.toLowerCase())
        || product.shortDescription?.toLowerCase().includes(state.search.toLowerCase());
    });
  }

  // Calculate global min and max prices before filtering by price range.
  const prices = filteredProducts.map((product) => {
    const stringPrice = (product as ProductWithPrice).rawPrice;
    if (stringPrice && product.type === ProductTypesEnum.VARIABLE) {
      let rawPrices = stringPrice.split(',').map((price) => Number(price));
      rawPrices.sort();
      return rawPrices;
    }
    if (stringPrice && product.type === ProductTypesEnum.SIMPLE) {
      return Number(stringPrice);
    }
    return 0;
  });

  prices.sort((priceA, priceB) => {
    if (Array.isArray(priceA) && Array.isArray(priceB)) {
      return priceA[0] - priceB[0];
    }
    if (Array.isArray(priceA)) {
      return priceA[0] - (priceB as number);
    }
    if (Array.isArray(priceB)) {
      return (priceA as number) - priceB[0];
    }
    return (priceA as number) - (priceB as number);
  });

  const firstPrice = prices.length && prices[0];
  const lastPrice = prices.length && prices.slice(-1)[0];
  const globalMin = (Array.isArray(firstPrice) ? firstPrice[0] : firstPrice) || 0;
  const globalMax = Array.isArray(lastPrice) ? lastPrice[0] : lastPrice;

  if (state.priceRange[0] || state.priceRange[1]) {
    filteredProducts = filteredProducts.filter((product) => {
      const price = (product as ProductWithPrice).rawPrice;
      if (price && product.type === ProductTypesEnum.VARIABLE) {
        const prices = price.split(',');
        const min = prices[0];
        const max = prices.slice(-1)[0];
        return (min && Number(min) >= state.priceRange[0])
          || (state.priceRange[1] && max && Number(max) <= state.priceRange[1]);
      } else if (price && product.type === ProductTypesEnum.SIMPLE) {
        return (price && Number(price) >= state.priceRange[0])
          && (state.priceRange[1] && price && Number(price) <= state.priceRange[1]);
      }
      return false;
    });
  }

  return { products: filteredProducts, globalMin, globalMax };
}


const { Provider } = shopContext;

export interface ShopProviderProps {
  allProducts: Product[];
}

export function ShopProvider({ allProducts, children }: PropsWithChildren<ShopProviderProps>) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { push } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.get('search');
  const categories = searchParams?.get('categories');
  const colors = searchParams?.get('colors');
  const price = searchParams?.get('price');

  useEffect(() => {
    if (search) {
      dispatch({ type: 'SET_SEARCH', payload: search });
    }
    if (categories) {
      dispatch({ type: 'SET_CATEGORIES', payload: categories.trim().split(',') });
    }
    if (colors) {
      dispatch({ type: 'SET_COLORS', payload: colors.trim().split(',') });
    }
    if (price) {
      dispatch({ type: 'SET_PRICE_RANGE', payload: price.trim().split(',').map((p) => Number(p) || null) as [number|null, number|null] });
    }
  }, []);

  useEffect(() => {
    const url = new URL(`${process.env.FRONTEND_URL}/${pathname}`);

    if (state.search) {
      url.searchParams.set('search', state.search);
    }
    if (state.selectedCategories.length) {
      url.searchParams.set('categories', state.selectedCategories.join(','));
    }
    if (state.selectedColors.length) {
      url.searchParams.set('colors', state.selectedColors.join(','));
    }
    if ((0 !== state.priceRange[0] || state.priceRange[1])) {
      url.searchParams.set('price', state.priceRange.filter(price => !!price).join(','));
    }

    push(url.href, { shallow: true });
  }, [state.search, state.selectedCategories, state.selectedColors, state.priceRange]);

  const store = {
    ...state,
    setSearch: (search: string) => dispatch({ type: 'SET_SEARCH', payload: search }),
    addCategory: (category: string) => dispatch({ type: 'ADD_CATEGORY', payload: category }),
    removeCategory: (category: string) => dispatch({ type: 'REMOVE_CATEGORY', payload: category }),
    addColor: (color: string) => dispatch({ type: 'ADD_COLOR', payload: color }),
    removeColor: (color: string) => dispatch({ type: 'REMOVE_COLOR', payload: color }),
    setPriceRange: (priceRange: [number|null, number|null]) => dispatch({ type: 'SET_PRICE_RANGE', payload: priceRange }),
    ...filterProducts(allProducts, state),
  };

  return (
    <Provider value={store}>
      {children}
    </Provider>
  );
}
