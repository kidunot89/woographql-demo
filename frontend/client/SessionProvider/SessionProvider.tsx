import {
  createContext,
  PropsWithChildren,
  useContext,
  useReducer,
  useEffect,
  useState,
} from 'react';

import {
  UpdateCustomerInput,
  Customer,
  Cart,
  CartItem,
  MetaData,
} from '@woographql/graphql';
import { isSSR } from '@woographql/utils/ssr';
import {
  hasCredentials,
  deleteCredentials,
  getSession as getSessionApiCall,
  FetchSessionResponse as Session,
  updateCustomer as updateCustomerApiCall,
  fetchAuthURLs,
  login as loginApiCall,
  sendPasswordReset as sendPasswordResetApiCall,
  updateCart as updateCartApiCall,
  CartAction,
  getSessionMeta,
} from '@woographql/utils/session';
import { useToast } from '@woographql/ui/use-toast';

type SessionMeta = {
  checkout_url: string;
  add_payment_method?: string;
  change_sub_payment?: string;
  renew_sub?: string;
}
export interface SessionContext {
  isAuthenticated: boolean;
  hasCredentials: boolean;
  cart: Cart|null;
  customer: Customer|null;
  sessionMeta: SessionMeta|null;
  addPaymentMethodUrl: string;
  changeSubPaymentMethodUrl: string;
  renewSubPaymentMethodUrl: string
  fetching: boolean;
  logout: (message?: string) => void;
  updateCustomer: (input: UpdateCustomerInput, successMessage?: string) => Promise<boolean>;
  login: (username: string, password: string, successMessage?: string) => Promise<boolean>;
  sendPasswordReset: (username: string, successMessage?: string) => Promise<boolean>;
  updateCart: (action: CartAction) => Promise<boolean>;
  refetch: () => Promise<boolean>;
  findInCart: (productId: number, variationId?: number, extraData?: string) => CartItem|undefined;
}

const initialContext: SessionContext = {
  isAuthenticated: false,
  hasCredentials: false,
  cart: null,
  customer: null,
  sessionMeta: null,
  addPaymentMethodUrl: '',
  changeSubPaymentMethodUrl: '',
  renewSubPaymentMethodUrl: '',
  fetching: false,
  logout: (message?: string) => null,
  updateCustomer: (input: UpdateCustomerInput) => new Promise((resolve) => { resolve(false); }),
  login: (username: string, password: string) => new Promise((resolve) => { resolve(false); }),
  sendPasswordReset: (username: string) => new Promise((resolve) => { resolve(false); }),
  updateCart: (action: CartAction) => new Promise((resolve) => { resolve(false); }),
  refetch: () => new Promise((resolve) => { resolve(false); }),
  findInCart: (productId: number, variationId?: number, extraData?: string) => undefined,
};

export const sessionContext = createContext<SessionContext>(initialContext);

type SessionAction = {
  type: 'SET_CART';
  payload: Cart;
} | {
  type: 'SET_CUSTOMER';
  payload: Customer;
} | {
  type: 'SET_AUTH_URLS';
  payload: { addPaymentMethodUrl: string; };
} | {
  type: 'SET_SESSION_META';
  payload: SessionMeta;
} | {
  type: 'LOGOUT';
};

const reducer = (state: SessionContext, action: SessionAction): SessionContext => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        cart: action.payload,
      };
    case 'SET_CUSTOMER':
      return {
        ...state,
        customer: action.payload,
      };
    case 'SET_AUTH_URLS':
      return {
        ...state,
        ...action.payload,
      };
    case 'SET_SESSION_META':
      return {
        ...state,
        sessionMeta: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        customer: null,
        sessionMeta: null,
      };
    default:
      throw new Error('Invalid action dispatched to session data reducer');
  }
};

/**
 * Checks if product matches the provided cart/registry item.
 *
 * @param {number} productId Item product ID.
 * @param {number} variationId Item variation ID.
 * @param {string} extraData Item metadata JSON string.
 * @returns
 */
const cartItemSearch = (
  productId: number,
  variationId?: number,
  extraData?: string,
  skipMeta = false,
) => ({
  product,
  variation,
  extraData:
  existingExtraData = [],
}: CartItem) => {
  if (product?.node?.databaseId && productId !== product.node.databaseId) {
    return false;
  }

  if (
    variation?.node?.databaseId
      && variationId !== variation.node.databaseId
  ) {
    return false;
  }

  if (skipMeta) {
    return true;
  }

  if (existingExtraData?.length && !extraData) {
    return false;
  }

  if (!!extraData && typeof extraData === 'string') {
    const decodeMeta = JSON.parse(extraData);
    let found = false;
    Object.entries(decodeMeta).forEach(([targetKey]) => {
      found = !!(existingExtraData as MetaData[])?.find(
        ({ key, value }) => key === targetKey && value === `${decodeMeta[targetKey]}`,
      );
    });

    if (!found) {
      return false;
    }
  }

  return true;
};

const { Provider } = sessionContext;

export function SessionProvider({ children }: PropsWithChildren) {
  const [fetching, setFetching] = useState(false);
  const { toast } = useToast();
  const [state, dispatch] = useReducer(reducer, initialContext);

  // Delete logout state and creds store locally.
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    deleteCredentials();
  };

  // Process session fetch request response.
  const setSession = (session: Session|string) => {
    if (typeof session === 'string') {
      toast({
        title: 'Fetch Session Error',
        description: 'Failed to fetch session.',
        variant: 'destructive'
      });
      setFetching(false);
      return false;
    }

    const { customer, cart } = session;
    fetchAuthURLs()
    .then((payload) => {
      dispatch({
        type: 'SET_CART',
        payload: cart,
      });

      dispatch({
        type: 'SET_CUSTOMER',
        payload: customer,
      });

      if (typeof payload === 'string') {
        toast({
          title: 'Login Error',
          description: 'Failed to generate Auth URLs for checkout. Please refresh the page.',
          variant: 'destructive'
        });
      } else {
        dispatch({
          type: 'SET_AUTH_URLS',
          payload,
        });
      }

      setFetching(false);

      return true;
    });

    return true;
  };

  // Process login request response.
  const setCustomer = (customer: Customer|string) => {
    if (typeof customer === 'string') {
      if (customer.includes('incorrect_password') || customer.includes('invalid_username')) {
        toast({
          title: 'Login Error',
          description: 'Login Invalid',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Login Error',
          description: 'Failed to fetch customer with credentials. Logging out...',
          variant: 'destructive'
        });
      }

      hasCredentials() && logout();
      setFetching(false);
      return false;
    }

    fetchAuthURLs()
      .then((payload) => {
        dispatch({
          type: 'SET_CUSTOMER',
          payload: customer,
        });

        dispatch({
          type: 'SET_SESSION_META',
          payload: getSessionMeta() as SessionMeta,
        });

        if (typeof payload === 'string') {
          toast({
            title: 'Login Error',
            description: 'Failed to generate Auth URLs for checkout. Please refresh the page.',
            variant: 'destructive'
          });
        } else {
          dispatch({
            type: 'SET_AUTH_URLS',
            payload,
          });
        }

        setFetching(false);

        return true;
      });

    return true;
  };

  // Process cart action response.
  const setCart = (cart: Cart|string) => {
    if (typeof cart === 'string') {
      toast({
        title: 'Cart Action Error',
        description: 'Cart mutation failed.',
        variant: 'destructive'
      });

      setFetching(false);
      return false;
    }

    fetchAuthURLs()
      .then((payload) => {
        dispatch({
          type: 'SET_CART',
          payload: cart,
        });

        if (typeof payload === 'string') {
          toast({
            title: 'Cart Action Error',
            description: 'Failed to generate Auth URLs for cart. Please refresh the page.',
            variant: 'destructive'
          });
        } else {
          dispatch({
            type: 'SET_AUTH_URLS',
            payload,
          });
        }

        setFetching(false);

        return true;
      });

    return true;
  };

  // Fetch customer data.
  const fetchSession = () => {
    setFetching(true);
    return getSessionApiCall()
      .then(setSession);
  };

  // Update customer data.
  const updateCustomer = (input: UpdateCustomerInput) => {
    setFetching(true);
    return updateCustomerApiCall(input)
      .then(setCustomer);
  };

  const login = (username: string, password: string) => {
    setFetching(true);
    return loginApiCall(username, password)
      .then((success) => {
        if (typeof success === 'string') {
          toast({
            title: 'Login Error',
            description: success,
            variant: 'destructive'
          });
          return false;
        }
        
        return fetchSession();
    });
  };

  const sendPasswordReset = (username: string) => {
    setFetching(true);
    return sendPasswordResetApiCall(username)
      .then((success) => {
        setFetching(false);
        if (typeof success === 'string') {
          toast({
            title: 'Password Reset Error',
            description: success,
            variant: 'destructive'
          });

          return false;
        }
        return success;
      });
  };

  const updateCart = (action: CartAction) => {
    setFetching(true);
    return updateCartApiCall(action)
      .then(setCart);
  };

  const findInCart = (productId: number, variationId?: number, extraData?: string) => {
    const items = state?.cart?.contents?.nodes as CartItem[];
    if (!items) {
      return undefined;
    }
    return items.find(cartItemSearch(productId, variationId, extraData, true)) || undefined;
  };    

  useEffect(() => {
    if (isSSR() || fetching) {
      return;
    }

    if (!state.customer || !state.cart) {
      fetchSession();
    }
  });

  const store: SessionContext = {
    ...state,
    isAuthenticated: !!state.customer?.id,
    hasCredentials: (!isSSR() && hasCredentials()) || false,
    fetching,
    logout,
    updateCustomer,
    updateCart,
    refetch: fetchSession,
    findInCart,
    login,
    sendPasswordReset,
  };
  return (
    <Provider value={store}>{children}</Provider>
  );
}

export const useSession = () => useContext(sessionContext);