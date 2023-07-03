import {
  render,
  screen,
  fireEvent,
  waitFor,
  mockedVariableProduct,
} from '@woographql/testing';
import { ProductVariation, VariableProduct } from '@woographql/graphql';
import { Toaster } from '@woographql/ui/toaster';
import { useProductContext, ProductContext } from '@woographql/client/ProductProvider';
import { VariableCartOptions } from '.';
import useCartMutations from '@woographql/hooks/useCartMutations';

// Mock hooks and components
jest.mock('@woographql/hooks/useCartMutations', () => jest.fn(() => ({
  fetching: false,
  mutate: jest.fn(),
  quantityFound: 0,
})));

const mockSelectVariation = jest.fn()
const mockedProductContext = {
  data: mockedVariableProduct,
  get: (field) => mockedVariableProduct.variations?.nodes[0][field as keyof ProductVariation]
    || mockedVariableProduct[field as keyof VariableProduct],
  selectVariation: mockSelectVariation,
  isVariableProduct: true,
  hasSelectedVariation: true,
  selectedVariation: mockedVariableProduct.variations?.nodes[0] as ProductVariation,
} as ProductContext;

jest.mock('@woographql/client/ProductProvider', () => ({
  useProductContext: jest.fn(() => (mockedProductContext))
}));

describe('VariableCartOptions component', () => {
  const mockedUseProductContext = useProductContext as jest.MockedFunction<typeof useProductContext>;
  const mockedUseCartMutations = useCartMutations as jest.MockedFunction<typeof useCartMutations>;
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <>
        <VariableCartOptions product={mockedVariableProduct as any} />
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
        <VariableCartOptions product={mockedVariableProduct as any} />
        <Toaster/>
      </>
    );

    fireEvent.click(screen.getByText('Add To Basket'));

    await waitFor(() => {
      expect(screen.getByText('Added to cart')).toBeInTheDocument();
    });
  });

  it('handles update cart', async () => {
    mockedUseCartMutations.mockImplementationOnce(() => ({
      fetching: false,
      mutate: jest.fn(),
      quantityFound: 1,
    }));

    render(
      <>
        <VariableCartOptions product={mockedVariableProduct as any} />
        <Toaster/>
      </>
    );

    fireEvent.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(screen.getByText('Updated cart')).toBeInTheDocument();
    });
  });

  it('handles remove from cart', async () => {
    mockedUseCartMutations.mockImplementationOnce(() => ({
      fetching: false,
      mutate: jest.fn(),
      quantityFound: 1,
    }));

    render(
      <>
        <VariableCartOptions product={mockedVariableProduct as any} />
        <Toaster/>
      </>
    );

    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(screen.getByText('Removed from cart')).toBeInTheDocument();
    });
  });

  it('handles changing selected variation', async () => {
    render(
      <>
        <VariableCartOptions product={mockedVariableProduct as any} />
        <Toaster/>
      </>
    );
    mockSelectVariation.mockClear();
    mockedUseProductContext.mockImplementation(() => ({
      ...mockedProductContext,
      selectedVariation: mockedVariableProduct.variations?.nodes[1] as ProductVariation,
    }));

    // Assuming the radio group items have the attribute value as their display text
    fireEvent.click(screen.getByLabelText('Blue', { selector: 'button' }));
    await waitFor(() => expect(mockSelectVariation).toHaveBeenCalledTimes(1));

    mockedUseProductContext.mockImplementation(() => ({
      ...mockedProductContext,
      hasSelectedVariation: false,
      selectedVariation: null,
    }));
    await waitFor(() => fireEvent.click(screen.getByLabelText('Green', { selector: 'button' })));
    await waitFor(() => expect(mockSelectVariation).toHaveBeenCalledTimes(2));

    await waitFor(() => expect(screen.getByText('This product is not available at this time. Sorry, for the inconvenience.')).toBeInTheDocument());
  });
});
