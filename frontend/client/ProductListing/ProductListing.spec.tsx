import {
  render,
  screen,
  mockedProducts,
} from '@woographql/testing';
import { ProductListing } from '.';

jest.mock('@woographql/client/ShopProvider', () => ({
  useShopContext: () => ({
    products: null,
  }),
}));

describe('ProductListing component', () => {
  

  it('renders correctly', () => {
    render(<ProductListing products={mockedProducts} />);

    expect(screen.getByText('Showing 2 products')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('This is product 1')).toBeInTheDocument();
    expect(screen.getByText('This is product 2')).toBeInTheDocument();
    expect(screen.getByText('$10')).toBeInTheDocument();
    expect(screen.getByText('$20')).toBeInTheDocument();
  });
});
