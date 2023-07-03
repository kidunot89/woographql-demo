// ShopProduct.test.tsx
import { SimpleProduct, VariationAttribute } from '@woographql/graphql';
import { render, screen, product } from '@woographql/testing';
import { ShopProduct } from './ShopProduct';

describe('ShopProduct component', () => {
  it('renders correctly', () => {
    render(<ShopProduct product={product} />);

    // Check that the product name, short description, and description are rendered
    expect(screen.getByText(product.name as string)).toBeInTheDocument();
    expect(screen.getByText(product.shortDescription as string)).toBeInTheDocument();
    expect(screen.getByText(product.description as string)).toBeInTheDocument();

    // Check that the attribute names and values are rendered
    (product as SimpleProduct).defaultAttributes?.nodes.forEach((attribute: VariationAttribute) => {
      expect(screen.getByText((attribute.name as string) + ':')).toBeInTheDocument();
      expect(screen.getByText(attribute.value as string)).toBeInTheDocument();
    });

    // Check that the Description, Attributes, and Reviews tabs are rendered
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Attributes')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { baseElement } = render(<ShopProduct product={product} />);
    expect(baseElement).toMatchSnapshot();
  });
});
