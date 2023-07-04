import { render, screen, fireEvent } from '@testing-library/react';
import { PriceRange } from './PriceRange';
import { useShopContext } from '@woographql/client/ShopProvider';

jest.mock('@woographql/client/ShopProvider', () => ({
  useShopContext: jest.fn(() => ({
    globalMax: 100,
    globalMin: 0,
    setPriceRange: jest.fn(),
  })),
}));

describe('PriceRange', () => {
  const mockedUseShopContext = useShopContext as jest.MockedFunction<typeof useShopContext>;
  it('renders the correct number of input fields', () => {
    render(<PriceRange />);

    const inputFields = screen.getAllByRole('spinbutton');
    expect(inputFields).toHaveLength(2);
  });

  it('updates state correctly when input fields are changed', () => {
    render(<PriceRange />);

    const [minInput, maxInput] = screen.getAllByRole('spinbutton');

    fireEvent.change(minInput, { target: { value: '10' } });
    fireEvent.change(maxInput, { target: { value: '90' } });

    expect((minInput as HTMLInputElement).value).toBe('10');
    expect((maxInput as HTMLInputElement).value).toBe('90');
  });
});
