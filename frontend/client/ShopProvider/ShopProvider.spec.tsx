import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import {
  render,
  mockedProducts
} from '@woographql/testing';
import { ShopProvider, useShopContext } from '.';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

const TestComponent = () => {
  const { search, setSearch } = useShopContext();
  useEffect(() => {
    setSearch('test');
  }, []);
  return <div>{search}</div>;
};

describe('ShopProvider', () => {
  it('renders correctly', () => {
    const { container } = render(
      <ShopProvider allProducts={mockedProducts}>
        <TestComponent />
      </ShopProvider>
    );

    expect(container).toBeInTheDocument();
  });

  it('updates search state correctly', async () => {
    const { findByText } = render(
      <ShopProvider allProducts={mockedProducts}>
        <TestComponent />
      </ShopProvider>
    );

    const searchElement = await findByText('test');
    expect(searchElement).toBeInTheDocument();
  });
});
