import { render, act, mockedProducts } from '@woographql/testing';
import { ShopProvider, useShopContext } from '.';

const TestComponent = ({ testFn }: { testFn: (context: ReturnType<typeof useShopContext>) => void }) => {
  const context = useShopContext();
  testFn(context);
  return null;
};

describe('ShopProvider', () => {
  it('renders correctly', () => {
    const { container } = render(
      <ShopProvider allProducts={mockedProducts}>
        <TestComponent testFn={jest.fn()} />
      </ShopProvider>
    );

    expect(container).toBeInTheDocument();
  });

  it('provides the correct initial search state', async () => {
    const { findByText } = render(
      <ShopProvider allProducts={mockedProducts}>
        <TestComponent testFn={jest.fn()} />
      </ShopProvider>
    );

    await act(async () => {
      expect(await findByText('')).toBeInTheDocument();
    });
  });

  it('builds the correct URL based on provided parameters', () => {
    const testFn = jest.fn((context) => {
      const url = context.buildUrl({
        search: 'test',
        categories: ['category1', 'category2'],
        colors: ['color1', 'color2'],
        price: [10, 20],
        page: 2,
      });

      expect(url).toBe('/?search=test&categories=category1%7Ccategory2&colors=color1%7Ccolor2&price=10-20&page=2');
    });

    render(
      <ShopProvider allProducts={mockedProducts}>
        <TestComponent testFn={testFn} />
      </ShopProvider>
    );

    expect(testFn).toHaveBeenCalled();
  });

  it('filters products correctly based on the current state', () => {
    const testFn = jest.fn((context) => {
      expect(context.products).toHaveLength(3);

      act(() => {
        context.buildUrl({
          search: 'Product 1',
          categories: ['category1'],
          colors: ['red'],
          price: [0, 15],
        });
      });

      expect(context.products).toHaveLength(1);
      expect(context.products[0].name).toBe('Product 1');
    });

    render(
      <ShopProvider allProducts={mockedProducts}>
        <TestComponent testFn={testFn} />
      </ShopProvider>
    );

    expect(testFn).toHaveBeenCalled();
  });
});
