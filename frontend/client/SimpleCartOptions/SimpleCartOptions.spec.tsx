import {
  render,
  screen,
  fireEvent,
  waitFor,
  mockedSimpleProduct,
} from '@woographql/testing';
import { Toaster } from '@woographql/ui/toaster';
import useCartMutations from '@woographql/hooks/useCartMutations';
import { SimpleCartOptions } from '.';

// Mock hooks and components
jest.mock('@woographql/hooks/useCartMutations', () => jest.fn(() => ({
  fetching: false,
  mutate: jest.fn(),
  quantityFound: 0,
})));

describe('SimpleCartOptions component', () => {
  const mockUseCartMutations = useCartMutations as jest.MockedFunction<typeof useCartMutations>;
  it('renders correctly', () => {
    render(
      <>
        <SimpleCartOptions product={mockedSimpleProduct} />
        <Toaster/>
      </>
    );

    expect(screen.getByText('Add To Basket')).toBeInTheDocument();
    expect(screen.getByText('× $10 =')).toBeInTheDocument();
    expect(screen.getByText('$10')).toBeInTheDocument();
  });

  it('handles add to cart', async () => {
    render(
      <>
        <SimpleCartOptions product={mockedSimpleProduct} />
        <Toaster/>
      </>
    );

    fireEvent.click(screen.getByText('Add To Basket'));

    await waitFor(() => {
      expect(screen.getByText('Added to cart')).toBeInTheDocument();
    });
  });

  it('handles update cart', async () => {
    mockUseCartMutations.mockImplementationOnce(() => ({
      fetching: false,
      mutate: jest.fn(),
      quantityFound: 1,
    }));

    render(
      <>
        <SimpleCartOptions product={mockedSimpleProduct} />
        <Toaster/>
      </>
    );

    fireEvent.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(screen.getByText('Updated cart')).toBeInTheDocument();
    });
  });

  it('handles remove from cart', async () => {
    mockUseCartMutations.mockImplementationOnce(() => ({
      fetching: false,
      mutate: jest.fn(),
      quantityFound: 1,
    }));

    render(
      <>
        <SimpleCartOptions product={mockedSimpleProduct} />
        <Toaster/>
      </>
    );

    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(screen.getByText('Removed from cart')).toBeInTheDocument();
    });
  });
});
