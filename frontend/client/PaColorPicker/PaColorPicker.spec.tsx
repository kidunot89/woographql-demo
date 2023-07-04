import {
  render,
  screen,
  fireEvent,
  mockedColors,
  mockedProducts,
} from '@woographql/testing';
import { useShopContext } from '@woographql/client/ShopProvider';
import { PaColorPicker } from '.';

jest.mock('@woographql/client/ShopProvider', () => ({
  useShopContext: jest.fn(() => ({
    selectedColors: [],
    addColor: jest.fn(),
    removeColor: jest.fn(),
    allProducts: mockedProducts,
  })),
}));

describe('PaColorPicker', () => {
  const mockedUseShopContext = useShopContext as jest.MockedFunction<typeof useShopContext>;
  it('renders the correct number of color swatches', () => {
    render(<PaColorPicker colors={mockedColors} />);

    const colorSwatches = screen.getAllByRole('button');
    expect(colorSwatches).toHaveLength(mockedColors.length);
  });

  it('calls addColor with the correct argument when a color swatch is clicked', () => {
    const addColor = jest.fn();
    mockedUseShopContext.mockImplementation(() => ({
      selectedColors: [],
      addColor,
      removeColor: jest.fn(),
      allProducts: mockedProducts,
    } as any));

    render(
      <PaColorPicker colors={mockedColors} />
    );

    const colorSwatch = screen.getByText('Red');
    fireEvent.click(colorSwatch);

    expect(addColor).toHaveBeenCalledWith('red');
  });
});
