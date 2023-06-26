import { Product } from '@woographql/graphql';

export interface CartOptionsProps {
  product: Product;
}

export function CartOptions(props: CartOptionsProps) {
  const { product } = props;

  return null;
}