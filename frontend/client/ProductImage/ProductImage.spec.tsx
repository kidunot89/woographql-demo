import { render, screen } from '@woographql/testing';
import { ProductImage } from '.';
import { useProductContext, ProductContext } from '@woographql/client/ProductProvider';

// Mock hooks and components
jest.mock('@woographql/client/ProductProvider', () => ({
  useProductContext: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

describe('ProductImage component', () => {
  const mockedUseProductContext = useProductContext as jest.MockedFunction<typeof useProductContext>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const mockProduct = {
      image: {
        sourceUrl: 'https://example.com/image.jpg',
        altText: 'Test Image',
      },
    };

    mockedUseProductContext.mockImplementationOnce(() => ({
      get: (field) => mockProduct.image[field as keyof typeof mockProduct.image],
    } as ProductContext));

    render(<ProductImage product={mockProduct as any} />);

    const img = screen.getByAltText('Test Image') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe('https://example.com/image.jpg');
  });

  it('does not render if no image source url', () => {
    const mockProduct = {
      image: {
        sourceUrl: '',
        altText: 'Test Image',
      },
    };

    mockedUseProductContext.mockImplementationOnce(() => ({
      get: (field) => mockProduct.image[field as keyof typeof mockProduct.image],
    } as ProductContext));

    render(<ProductImage product={mockProduct as any} />);

    expect(screen.queryByAltText('Test Image')).not.toBeInTheDocument();
  });
});
