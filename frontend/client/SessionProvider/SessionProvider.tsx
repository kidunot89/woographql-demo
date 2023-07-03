import {
  createContext,
  PropsWithChildren,
  useContext,
  useReducer,
  useEffect,
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
  FetchAuthURLResponse as AuthUrls,
  updateCustomer as updateCustomerApiCall,
  fetchAuthURLs as fetchAuthURLsApiCall,
  login as loginApiCall,
  sendPasswordReset as sendPasswordResetApiCall,
  updateCart as updateCartApiCall,
  CartAction,
  hasRefreshToken,
} from '@woographql/utils/session';
import {
  deleteClientSessionId,
  deleteClientCredentials,
} from '@woographql/utils/client';
import { useToast } from '@woographql/ui/use-toast';


export interface SessionContext {
  isAuthenticated: boolean;
  hasCredentials: boolean;
  cart: Cart|null;
  customer: Customer|null;
  cartUrl: string;
  checkoutUrl: string;
  accountUrl: string
  urlsExpired: boolean;
  refetchUrls: () => void;
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
  cartUrl: '',
  checkoutUrl: '',
  accountUrl: '',
  urlsExpired: true,
  refetchUrls: () => null,
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
  type: 'UPDATE_STATE';
  payload: SessionContext;
} | {
  type: 'SET_CART';
  payload: Cart;
} | {
  type: 'SET_CUSTOMER';
  payload: Customer;
} | {
  type: 'SET_AUTH_URLS';
  payload: {
    cartUrl: string;
    checkoutUrl: string;
    accountUrl: string;
  };
} | {
  type: 'LOGOUT';
} | {
  type: 'URLS_EXPIRED';
};

const reducer = (state: SessionContext, action: SessionAction): SessionContext => {
  switch (action.type) {
    case 'UPDATE_STATE':
      return {
        ...state,
        ...action.payload,
      };
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
        urlsExpired: false,
      };
    case 'URLS_EXPIRED':
      return {
        ...state,
        urlsExpired: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        customer: null,
        cart: null,
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
  const { toast } = useToast();
  const [state, dispatch] = useReducer(reducer, initialContext);

  const fetchAuthURLs = () => {
    return fetchAuthURLsApiCall()
      .then((payload) => {
        if (typeof payload === 'string') {
          toast({
            title: 'Session Error',
            description: 'Failed to generate session URLs. Please refresh the page.',
            variant: 'destructive'
          });

          return false;
        }
        
        dispatch({
          type: 'UPDATE_STATE',
          payload: { ...payload, fetching: false } as SessionContext,
        });
        return true;
      });
  };

  // Process session fetch request response.
  const setSession = (session: Session|string, authUrls: AuthUrls|string) => {
    if (typeof session === 'string') {
      toast({
        title: 'Fetch Session Error',
        description: 'Failed to fetch session.',
        variant: 'destructive'
      });
    }
    if (typeof authUrls === 'string') {
      toast({
        title: 'Session Error',
        description: 'Failed to generate session URLs. Please refresh the page.',
        variant: 'destructive'
      });
    }

    if (typeof session === 'string' || typeof authUrls === 'string') {
      dispatch({
        type: 'UPDATE_STATE',
        payload: { fetching: false } as SessionContext,
      });
      return false;
    }

    dispatch({
      type: 'UPDATE_STATE',
      payload: { ...session, ...authUrls, fetching: false } as SessionContext,
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
      dispatch({
        type: 'UPDATE_STATE',
        payload: { fetching: false } as SessionContext,
      });
      return false;
    }

    dispatch({
      type: 'UPDATE_STATE',
      payload: { customer, fetching: false } as SessionContext,
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

      dispatch({
        type: 'UPDATE_STATE',
        payload: { fetching: false } as SessionContext,
      });
      return false;
    }

    dispatch({
      type: 'UPDATE_STATE',
      payload: { cart, fetching: false } as SessionContext,
    });

    return true;
  };

  // Fetch customer data.
  const fetchSession = () => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: { fetching: true } as SessionContext,
    });

    return getSessionApiCall()
      .then(async (sessionPayload) => {
        const authUrlPayload = await fetchAuthURLsApiCall();
        return setSession(sessionPayload, authUrlPayload);
      });
  };

  // Update customer data.
  const updateCustomer = (input: UpdateCustomerInput) => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: { fetching: true } as SessionContext,
    });
    return updateCustomerApiCall(input)
      .then(setCustomer);
  };

  const login = (username: string, password: string) => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: { fetching: true } as SessionContext,
    });
    return loginApiCall(username, password)
      .then((success) => {
        if (typeof success === 'string') {
          toast({
            title: 'Login Error',
            description: success,
            variant: 'destructive'
          });
          dispatch({
            type: 'UPDATE_STATE',
            payload: { fetching: false } as SessionContext,
          });
          return false;
        }
        
        return fetchSession();
    });
  };

  // Delete logout state and creds store locally.
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    deleteCredentials();
    deleteClientCredentials();
    fetchSession();
  };

  const sendPasswordReset = (username: string) => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: { fetching: true } as SessionContext,
    });
    return sendPasswordResetApiCall(username)
      .then((success) => {
        dispatch({
          type: 'UPDATE_STATE',
          payload: { fetching: false } as SessionContext,
        });
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
    dispatch({
      type: 'UPDATE_STATE',
      payload: { fetching: true } as SessionContext,
    });
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

  const refetchUrls = () => {
    deleteClientSessionId();
    dispatch({
      type: 'UPDATE_STATE',
      payload: { urlsExpired: true, fetching: true } as SessionContext,
    });
    fetchAuthURLs();
  };

  useEffect(() => {
    if (isSSR() || state.fetching) {
      return;
    }

    if (hasRefreshToken() && !hasCredentials()) {
      return;
    }

    if (!state.customer || !state.cart) {
      fetchSession();
    }
  
  }, []);
      

  const store: SessionContext = {
    ...state,
    isAuthenticated: !!state.customer?.id && 'guest' !== state.customer.id,
    hasCredentials: (!isSSR() && hasCredentials()) || false,
    logout,
    updateCustomer,
    updateCart,
    refetch: fetchSession,
    findInCart,
    login,
    sendPasswordReset,
    refetchUrls,
  };
  return (
    <Provider value={store}>{children}</Provider>
  );
}

export const useSession = () => useContext(sessionContext);