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
    addCategory: jest.fn(),
    removeCategory: jest.fn(),
  })),
}));

describe('ShopCategories', () => {
  const mockedUseShopContext = useShopContext as jest.MockedFunction<typeof useShopContext>;
  it('renders the correct number of categories', () => {
    render(
        <ShopCategories categories={mockedCategories} />
    );

    const categoryButtons = screen.getAllByRole('button');
    expect(categoryButtons).toHaveLength(mockedCategories.length);
  });

  it('calls addCategory with correct argument when category button is clicked', () => {
    const addCategory = jest.fn();
    mockedUseShopContext.mockImplementation(() => ({
      selectedCategories: [],
      addCategory,
      removeCategory: jest.fn(),
    } as any));

    render(
      <ShopCategories categories={mockedCategories} />
    );

    const categoryButton = screen.getByText('Category 1');
    fireEvent.click(categoryButton);

    expect(addCategory).toHaveBeenCalledWith('cat-1');
  });
});
