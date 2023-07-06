import {
  render,
  screen,
  mockedColors,
  mockedProducts,
} from '@woographql/testing';
import { useShopContext } from '@woographql/client/ShopProvider';
import { PaColorPicker } from '.';

jest.mock('@woographql/client/ShopProvider', () => ({
  useShopContext: jest.fn(() => ({
    selectedColors: [],
    allProducts: mockedProducts,
    buildUrl: jest.fn(() => '/'),
  })),
}));

describe('PaColorPicker', () => {
  const mockedUseShopContext = useShopContext as jest.MockedFunction<typeof useShopContext>;
  it('renders the correct number of color swatches', () => {
    render(<PaColorPicker colors={mockedColors} />);

    const colorSwatches = screen.getAllByRole('link');
    expect(colorSwatches).toHaveLength(mockedColors.length);
  });

  it('calls addColor with the correct argument when a color swatch is clicked', () => {
    const buildUrl = jest.fn(() => '/');
    mockedUseShopContext.mockImplementation(() => ({
      selectedColors: [],
      allProducts: mockedProducts,
      buildUrl
    } as any));

    render(
      <PaColorPicker colors={mockedColors} />
    );

    expect(buildUrl).toHaveBeenCalledWith({ colors: ['red'] });
    expect(buildUrl).toHaveBeenCalledWith({ colors: ['blue'] });
    expect(buildUrl).toHaveBeenCalledWith({ colors: ['green'] });
  });
});
