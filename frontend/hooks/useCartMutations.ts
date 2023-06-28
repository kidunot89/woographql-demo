import { useEffect, useMemo, useState } from 'react';

import { useSession } from '@woographql/client/SessionProvider';
import { CartItem } from '@woographql/graphql';

export interface CartMutationInput {
  mutation?: 'add'|'update'|'remove';
  quantity?: number;
  all?: boolean;
}

export interface CartMutationCompositeInput extends CartMutationInput {
  configuration: {
    componentId: string;
    productId?: number;
    hidden?: boolean;
    quantity?: number;
    variation?: {
      attributeName: string;
      attributeValue: string;
    }[]
    variationId?: number;
  }[];
}

export interface CartMutationBundleInput extends CartMutationInput {
  bundleItems: {
    bundleItemId: number;
    optionalSelected?: boolean;
    quantity?: number;
    variation?: {
      attributeName: string;
      attributeValue: string;
    }[]
    variationId?: number;
  }[];
}

export interface SetShippingLocaleInput {
  zip: string;
  state?: string;
  city?: string;
}

const useCartMutations = (
  productId: number,
  variationId?: number,
  extraData?: string,
) => {
  const {
    cart,
    updateCart,
    findInCart,
    fetching,
  } = useSession();
  const [quantityFound, setQuantityInCart] = useState(
    findInCart(productId, variationId, extraData)?.quantity as number || 0,
  );
  const itemKey = useMemo(
    () => findInCart(productId, variationId, extraData)?.key,
    [findInCart, productId, variationId, extraData],
  );

  useEffect(() => {
    setQuantityInCart(
      findInCart(productId, variationId, extraData)?.quantity || 0,
    );
  }, [findInCart, productId, variationId, extraData, cart?.contents?.nodes]);

  async function mutate<T extends CartMutationInput>(values: T) {
    const {
      quantity = 1,
      all = false,
      mutation = 'update',
    } = values;

    if (!cart) {
      return;
    }

    if (!productId) {
      throw new Error('No item provided.');
      // TODO: Send error to Sentry.IO.
    }

    let item: CartItem|undefined;
    switch (mutation) {
      case 'remove': {
        if (!quantityFound) {
          throw new Error('Provided item not in cart');
        }

        item = findInCart(
          productId,
          variationId,
          extraData,
        );

        if (!item) {
          throw new Error('Failed to find item in cart.');
        }

        const { key } = item;
        updateCart({
          mutation: 'remove',
          keys: [key],
          all,
        });
        break;
      }
      case 'update':
        if (!quantityFound) {
          throw new Error('Failed to find item in cart.');
        }

        item = findInCart(productId, variationId, extraData);

        if (!item) {
          throw new Error('Failed to find item in cart.');
        }

        updateCart({
          mutation: 'update',
          items: [{ key: item.key, quantity }]
        });
        break;
      default:
        updateCart({
          mutation: 'add',
          quantity,
          productId,
          variationId,
          extraData,
        });
        break;
    }
  }

  const store = {
    fetching,
    quantityFound,
    mutate
  };

  return store;
};

export default useCartMutations;