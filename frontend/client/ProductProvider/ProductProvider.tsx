import {
  useContext,
  useReducer,
  useEffect,
  createContext,
  PropsWithChildren
} from 'react';
import get from 'lodash/get';

import {
  Product,
  ProductTypesEnum,
  ProductVariation,
  SimpleProduct,
  VariableProduct,
} from '@woographql/graphql';

export interface ProductContext {
  data: Product|null;
  isVariableProduct: boolean;
  hasSelectedVariation: boolean;
  selectedVariation: ProductVariation | null;
  get: (field: keyof ProductVariation | keyof SimpleProduct | keyof VariableProduct) => unknown;
  selectVariation: (variation?: ProductVariation) => void;
}

const initialState: ProductContext = {
  data: null,
  isVariableProduct: false,
  hasSelectedVariation: false,
  selectedVariation: null,
  get: () => null,
  selectVariation: () => null,
};

const productContext = createContext<ProductContext>(initialState);

export function useProductContext() {
  return useContext(productContext);
}

type ProductAction = {
  type: 'SET_PRODUCT';
  payload: Product;
} | {
  type: 'SET_VARIATION';
  payload: ProductVariation|null;
} | {
  type: 'SET_IS_VARIABLE_PRODUCT';
  payload: boolean;
} | {
  type: 'SET_HAS_SELECTED_VARIATION';
  payload: boolean;
};

const null_variation = {
  id: '',
  databaseId: 0,
} as ProductVariation;

function reducer(state: ProductContext, action: ProductAction) {
  switch(action.type) {
    case 'SET_PRODUCT':
      return {
        ...state,
        data: action.payload,
      };
    case 'SET_VARIATION':
      return {
        ...state,
        selectedVariation: action.payload,
      };
    case 'SET_IS_VARIABLE_PRODUCT':
      return {
        ...state,
        isVariableProduct: action.payload,
      };
    case 'SET_HAS_SELECTED_VARIATION':
      return {
        ...state,
        hasSelectedVariation: action.payload,
      };
    default:
      return state;
  }
}
const { Provider } = productContext;
export interface ProductProviderProps {
  product: Product;
}
export function ProductProvider({ product, children}: PropsWithChildren<ProductProviderProps>) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({
      type: 'SET_PRODUCT',
      payload: product,
    });

    if (product.type === ProductTypesEnum.VARIABLE) {
      dispatch({
        type: 'SET_IS_VARIABLE_PRODUCT',
        payload: true,
      });

      dispatch({
        type: 'SET_HAS_SELECTED_VARIATION',
        payload: false,
      });

      dispatch({
        type: 'SET_VARIATION',
        payload: null_variation,
      });
    }
  }, [product]);

  const store = {
    ...state,
    get: (field: keyof ProductVariation | keyof SimpleProduct | keyof VariableProduct) => {
      if (!state.data) {
        return null;
      }
      
      if (state.selectedVariation) {
        return get(state.selectedVariation, field as keyof ProductVariation)
          || get(state.data as VariableProduct, field as keyof VariableProduct);
      }

      return get(state.data as SimpleProduct, field as keyof SimpleProduct);
    },
    selectVariation: (variation?: ProductVariation) => {
      if (!variation) {
        dispatch({
          type: 'SET_VARIATION',
          payload: null_variation,
        });

        dispatch({
          type: 'SET_HAS_SELECTED_VARIATION',
          payload: false,
        });
        return;
      }

      dispatch({
        type: 'SET_VARIATION',
        payload: variation,
      });
      dispatch({
        type: 'SET_HAS_SELECTED_VARIATION',
        payload: true,
      });
    },
  };

  return (
    <Provider value={store}>
      {children}
    </Provider>
  )
}
