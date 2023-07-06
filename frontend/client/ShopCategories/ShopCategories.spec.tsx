import {
  render,
  screen,
  fireEvent,
  mockedCategories,
} from '@woographql/testing';
import { ShopCategories } from './ShopCategories';
import { useShopContext } from '@woographql/client/ShopProvider';

jest.mock('@woographql/client/ShopProvider', () => ({
  useShopContext: jest.fn(() => ({
    selectedCategories: [],
    buildUrl: jest.fn(() => '/'),
  })),
}));

describe('ShopCategories', () => {
  const mockedUseShopContext = useShopContext as jest.MockedFunction<typeof useShopContext>;
  it('renders the correct number of categories', () => {
    render(
        <ShopCategories categories={mockedCategories} />
    );

    const categoryButtons = screen.getAllByRole('link');
    expect(categoryButtons).toHaveLength(mockedCategories.length);
  });

  it('calls addCategory with correct argument when category button is clicked', () => {
    const buildUrl = jest.fn(() => '/');
    mockedUseShopContext.mockImplementation(() => ({
      selectedCategories: [],
      buildUrl,
    } as any));

    render(
      <ShopCategories categories={mockedCategories} />
    );

    expect(buildUrl).toHaveBeenCalledWith({ categories: ['cat-1'], page: 1});
    expect(buildUrl).toHaveBeenCalledWith({ categories: ['cat-2'], page: 1});
  });
});
