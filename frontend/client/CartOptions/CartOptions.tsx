import {
  PropsWithChildren,
  FormEvent,
  useState,
  useEffect,
  CSSProperties,
} from 'react';
import cn from 'clsx';

import {
  Product,
  VariableProduct,
  ProductTypesEnum,
  StockStatusEnum,
  SimpleProduct,
  GlobalProductAttribute,
  TermNode,
  VariationAttribute,
  ProductVariation,
} from '@woographql/graphql';

import type { ProductWithPrice } from '@woographql/client/ShopProvider';
import useCartMutations from '@woographql/hooks/useCartMutations';
import { useProductContext } from '@woographql/client/ProductProvider';

import { Input } from '@woographql/ui/input';
import { Button } from '@woographql/ui/button';
import { LoadingSpinner } from '@woographql/ui/LoadingSpinner';
import { useToast } from '@woographql/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@woographql/ui/radio-group';
import { Label } from '@woographql/ui/label';

function Container({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div 
      className={cn(
        className && className,
        'fixed inset-x-0 mx-auto p-4',
        'lg:relative lg:inset-auto lg:mx-0 lg:p-0',
        'bg-white bottom-0 z-30 w-screen',
        'lg:bg-inherit lg:bottom-auto lg:z-auto lg:w-auto',
      )}
    >
      {children}
    </div>
  );
}

export interface CartOptionsProps {
  product: Product;
  className?: string;
}

function SimpleCartOptions(props: CartOptionsProps) {
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
        {`× $${rawPrice} = `}
        <strong>{`$${Number(rawPrice) * quantity}`}</strong>
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

type SelectedProductAttributes = { [key: string]: string };
function VariableCartOptions({ product }: CartOptionsProps) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [executing, setExecuting] = useState<'add'|'update'|'remove'|null>(null);
  const { get, selectVariation, hasSelectedVariation } = useProductContext();
 
  const rawPrice = get('rawPrice' as keyof Product) as string;
  const soldIndividually = get('soldIndividually') as boolean;
  const stockStatus = get('stockStatus') as StockStatusEnum;
  const stockQuantity = get('stockQuantity') as number;
  const manageStock = get('manageStock') as boolean;

  const attributes = product.attributes?.nodes || [];
  const variations = ((product as VariableProduct).variations?.nodes || []) as ProductVariation[];

  const [selectedAttributes, selectAttributes] = useState<SelectedProductAttributes>(
    (attributes || []).reduce(
      (results, attribute) => {
        const { name, options, terms } = attribute as GlobalProductAttribute;
        return {
          ...results,
          [name as string]: !terms
            ? (options as string[])[0] as string
            : (terms?.nodes as TermNode[])[0].name as string,
        };
      },
      {},
    ),
  );

  useEffect(() => {
    const variation = variations && variations.find(
      ({ attributes: variationAttributes }) => (
        variationAttributes?.nodes as VariationAttribute[] || []
      )?.every(
        ({ value, label }) => selectedAttributes[label as string] === value,
      ),
    );
    selectVariation(variation);
  }, [selectedAttributes, variations]);


  const productId = product.databaseId;
  const variationId = get('databaseId') as number;
  const { fetching, mutate, quantityFound } = useCartMutations(productId, variationId);

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
    } else {
      setQuantity(1);
    }
  }, [quantityFound]);

  return (
    <form
      onSubmit={onAddOrUpdate}
      className="flex flex-wrap gap-x-2 gap-y-4 items-center"
    >
      <div className="w-full">
        {(attributes || []).map((attribute) => {
          const {
            id,
            name,
            label,
            options,
            variation: isVariationAttribute,
            terms,
          } = attribute as GlobalProductAttribute;

          if (!isVariationAttribute) {
            return null;
          }

          return (
            <div key={id} className="w-full flex gap-x-4">
              <p className="text-lg font-bold">{label || name}</p>
              <RadioGroup
                className="flex gap-2"
                name={name as string}
                onValueChange={(value) => {
                  selectAttributes({
                    ...selectedAttributes,
                    [name as string]: value,
                  });
                }}
              >
                {(terms?.nodes || options)?.map((option) => {
                  let value: string;
                  let buttonLabel: string;
                  let style: CSSProperties|undefined;
                  let id;
                  if (typeof option !== 'object') {
                    id = option as string;
                    value = option as string;
                    buttonLabel = option
                      .replace('-', ' ')
                      .replace(/^\w/, (c) => c.toUpperCase());
                  } else {
                    const { id: globalId, name: termName, slug } = option as TermNode;
                    id = globalId;
                    value = termName as string;
                    buttonLabel = termName as string;
                    if (name?.toLowerCase() === 'color') {
                      style = {
                        color: 'white',
                        backgroundColor: slug as string,
                      }
                    }
                  }

                  return (
                    <div key={id} className="flex items-center space-x-2">
                      <RadioGroupItem
                        id={id}
                        value={value}
                        checked={selectedAttributes[name as string] === value}
                        style={style}
                      />
                      <Label htmlFor={id}>{buttonLabel}</Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          );
        })}
      </div>
      {hasSelectedVariation ? (
        <>
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
            {`× $${rawPrice} = `}
            <strong>{`$${Number(rawPrice) * quantity}`}</strong>
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
        </>
      ) : (
        <p className="basis-full md:basis-auto text-center font-serif text-lg">
          This product is not available at this time. Sorry, for the inconvenience.
        </p>
      )}
    </form>
  );
}

export function CartOptions(props: CartOptionsProps) {
  const { product, className } = props;
  const { type } = product as unknown as SimpleProduct;

  let Component: (props: CartOptionsProps) => JSX.Element|null = () => null;
  if (type === ProductTypesEnum.SIMPLE) {
    Component = SimpleCartOptions;
  } else if (type === ProductTypesEnum.VARIABLE) {
    Component = VariableCartOptions;
  }

  return (
    <Container className={className}>
      <Component product={product} />
    </Container>
  );
}