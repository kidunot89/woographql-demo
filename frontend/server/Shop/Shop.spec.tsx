import '@testing-library/react/dont-cleanup-after-each';
import {
  products,
  categories,
  colors,
  render,
  screen,
} from '@woographql/testing';
import { Shop } from './Shop';

describe('Shop component', () => {
  const { baseElement } = render(
    <Shop products={products} categories={categories} colors={colors} />
  );

  it('renders correctly', async () => {
    // Check that the Categories, Colors, Price, Search, and Results headings are rendered
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Colors')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Results')).toBeInTheDocument();

    // Check that the category names are rendered
    categories.forEach((category) => {
      expect(screen.getByText(category.name as string)).toBeInTheDocument();
    });

    // Check that the color names are rendered
    colors.forEach((color) => {
      expect(screen.getByText(color.name as string)).toBeInTheDocument();
    });

  // Check that the product names are rendered
    products.forEach((product) => {
      expect(screen.getByText(product.name as string)).toBeInTheDocument();
    });
  });

  it('should match snapshot', () => {
    expect(baseElement).toMatchSnapshot();
  });
});
