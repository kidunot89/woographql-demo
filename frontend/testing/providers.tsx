import { PropsWithChildren } from 'react';

import { UpdateCustomerInput } from '@woographql/graphql';
import { CartAction } from '@woographql/utils/session';
import { sessionContext, SessionContext } from '@woographql/client/SessionProvider';

export const MockSessionProvider = ({ children }: PropsWithChildren) => {
  const mockSessionContext: SessionContext = {
    // Add mock values for all properties of SessionContext here
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
    findInCart: (
      productId: number,
      variationId?: number,
      variation?: {
        attributeName: string;
        attributeValue: string;
      }[],
      extraData?: string
    ) => undefined,
  };

  return (
    <sessionContext.Provider value={mockSessionContext}>
      {children}
    </sessionContext.Provider>
  );
};
