import { PropsWithChildren } from 'react';

import {
  Product,
  ProductTypesEnum,
  SimpleProduct,
} from '@woographql/graphql';
import { cn } from '@woographql/utils/ui';

import { SimpleCartOptions } from '@woographql/client/SimpleCartOptions';
import { VariableCartOptions } from '@woographql/client/VariableCartOptions';

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