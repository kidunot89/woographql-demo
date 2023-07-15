import { useEffect, useMemo, useState } from 'react';

import { useSession } from '@woographql/client/SessionProvider';

export interface CartMutationInput {
  mutation?: 'add'|'update'|'remove';
  quantity?: number;
  all?: boolean;
  variation?: {
    attributeName: string;
    attributeValue: string;
  }[]
}

const useCartMutations = (
  productId: number,
  variationId?: number,
  variation?: {
    attributeName: string;
    attributeValue: string;
  }[],
  extraData?: string,
) => {
  const {
    cart,
    updateCart,
    findInCart,
    fetching,
  } = useSession();
  const [quantityFound, setQuantityInCart] = useState(
    findInCart(productId, variationId, variation, extraData)?.quantity as number || 0,
  );
  const itemKey = useMemo(
    () => findInCart(productId, variationId, variation, extraData)?.key,
    [findInCart, productId, variationId, variation, extraData],
  );

  useEffect(() => {
    setQuantityInCart(
      findInCart(productId, variationId, variation, extraData)?.quantity || 0,
    );
  }, [findInCart, productId, variationId, variation, extraData, cart?.contents?.nodes]);

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

    switch (mutation) {
      case 'remove': {
        if (!quantityFound) {
          throw new Error('Provided item not in cart');
        }

        if (!itemKey) {
          throw new Error('Failed to find item in cart.');
        }

        updateCart({
          mutation: 'remove',
          keys: [itemKey],
          all,
        });
        break;
      }
      case 'update':
        if (!quantityFound) {
          throw new Error('Failed to find item in cart.');
        }

        if (!itemKey) {
          throw new Error('Failed to find item in cart.');
        }

        updateCart({
          mutation: 'update',
          items: [{ key: itemKey, quantity }]
        });
        break;
      default:
        updateCart({
          mutation: 'add',
          quantity,
          productId,
          variationId,
          variation,
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