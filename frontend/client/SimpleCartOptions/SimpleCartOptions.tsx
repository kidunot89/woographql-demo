import {
  FormEvent,
  useState,
  useEffect,
} from 'react';

import { cn } from '@woographql/utils/ui';
import { Product, StockStatusEnum } from '@woographql/graphql';

import type { ProductWithPrice } from '@woographql/client/ShopProvider';
import useCartMutations from '@woographql/hooks/useCartMutations';

import { Input } from '@woographql/ui/input';
import { Button } from '@woographql/ui/button';
import { LoadingSpinner } from '@woographql/ui/LoadingSpinner';
import { useToast } from '@woographql/ui/use-toast';

interface CartOptionsProps {
  product: Product;
  className?: string;
}

export function SimpleCartOptions(props: CartOptionsProps) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [executing, setExecuting] = useState<'add'|'update'|'remove'|null>(null);
  const { product } = props;
  const {
    rawPrice,
    databaseId,
    soldIndividually,
    stockStatus,
    stockQuantity,
    manageStock,
  } = product as ProductWithPrice;
  const { fetching, mutate, quantityFound } = useCartMutations(databaseId);

  const outOfStock = stockStatus === StockStatusEnum.OUT_OF_STOCK;

  const mutation = quantityFound ? 'update' : 'add';
  let submitButtonText = quantityFound ? 'Update' : 'Add To Basket';
  if (outOfStock) {
    submitButtonText = 'Out of Stock';
  }

  const maxQuantity = manageStock ? stockQuantity as number : undefined;

  const onAddOrUpdate = async (event: FormEvent) => {
    event.preventDefault();

    setExecuting(mutation);
    await mutate({ mutation, quantity });

    if (mutation === 'add') {
      toast({
        title: 'Added to cart',
        description: `${quantity} × ${product.name}`,
      });
    } else {
      toast({
        title: 'Updated cart',
        description: `${quantity} × ${product.name}`,
      });
    }
  };

  const onRemove = async() => {
    setExecuting('remove');
    await mutate({ mutation: 'remove' });

    toast({
      title: 'Removed from cart',
      description: `${quantity} × ${product.name}`,
    });
  };

  useEffect(() => {
    if (!fetching) {
      setExecuting(null);
    }
  }, [fetching]);

  useEffect(() => {
    if (quantityFound) {
      setQuantity(quantityFound);
    }
  }, [quantityFound]);

  return (
    <form
      onSubmit={onAddOrUpdate}
      className="flex flex-wrap gap-x-2 gap-y-4 items-center"
    >
      {(!soldIndividually || outOfStock) && (
        <Input
          className="basis-1/2 shrink"
          type="number"
          min={1}
          max={maxQuantity}
          value={quantity}
          disabled={fetching}
          onChange={(event) => setQuantity(Number(event.target.value))}
        />
      )}
      <p className="basis-auto grow text-center font-serif text-lg">
        {outOfStock && 'Out Of Stock'}
        {(!soldIndividually || outOfStock) && `× $${rawPrice} = `}
        {!outOfStock && (<strong>{`$${Number(rawPrice) * quantity}`}</strong>)}
      </p>
      <div className="basis-full md:basis-auto flex gap-x-2">
        <Button
          type="submit"
          className={cn(
            "basis-full md:basis-auto inline-flex gap-2"
          )}
          disabled={fetching || outOfStock}
        >
          {submitButtonText}
          {fetching && executing !== 'remove' && <LoadingSpinner noText />}
          {!fetching && <i className="fa-solid fa-basket-shopping" />}
        </Button>
        {!!quantityFound && (
          <Button
            type="button"
            className="basis-full md:basis-auto inline-flex gap-2 bg-red-500"
            onClick={onRemove}
            disabled={fetching}
          >
            Remove
            {fetching && executing === 'remove' && <LoadingSpinner noText />}
            {!fetching && <i className="fa-solid fa-trash-can" />}
          </Button>
        )}
      </div>
    </form>
  );
}