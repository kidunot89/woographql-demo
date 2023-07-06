import { render, fireEvent, act } from '@woographql/testing';
import { useShopContext } from '@woographql/client/ShopProvider';
import { SearchBar } from '.';

jest.mock('@woographql/client/ShopProvider', () => ({
  useShopContext: () => ({
    buildUrl: jest.fn(() => '/'),
    search: '',
  }),
}));

describe('SearchBar', () => {
  it('renders correctly', () => {
    const { getByRole } = render(
      <SearchBar />
    );

    const input = getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('updates search state correctly', async () => {
    const { getByRole } = render(
      <SearchBar />
    );

    const input = getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    await act(() => new Promise((resolve) => setTimeout(resolve, 500)));

    expect((input as HTMLInputElement).value).toBe('test');
  });
});
