import {
  render,
  act,
  fireEvent,
  mockedSimpleProduct,
  mockedVariableProduct,
} from '@woographql/testing';
import { ProductProvider, useProductContext } from '.';

// Mock child component to test useProductContext hook
const MockChildComponent = () => {
  const { data, isVariableProduct, hasSelectedVariation, get, selectVariation } = useProductContext();
  const handleSelectVariation = () => {
    selectVariation(mockedVariableProduct.variations?.nodes[0]); // Select the first variation
  };
  return (
    <div>
      <p>{data?.name}</p>
      <p>{isVariableProduct ? 'Variable Product' : 'Simple Product'}</p>
      <p>{hasSelectedVariation ? 'Has Selected Variation' : 'No Selected Variation'}</p>
      <p>{get('price') as string}</p>
      <button onClick={handleSelectVariation}>Select Variation</button>
    </div>
  );
};

describe('ProductProvider component', () => {
  it('provides correct context values for simple product', () => {
    const { getByText } = render(
      <ProductProvider product={mockedSimpleProduct}>
        <MockChildComponent />
      </ProductProvider>
    );

    expect(getByText(mockedSimpleProduct.name as string)).toBeInTheDocument();
    expect(getByText('Simple Product')).toBeInTheDocument();
    expect(getByText('No Selected Variation')).toBeInTheDocument();
    expect(getByText(mockedSimpleProduct.name as string)).toBeInTheDocument();
  });

  it('provides correct context values for variable product', () => {
    const { getByText } = render(
      <ProductProvider product={mockedVariableProduct}>
        <MockChildComponent />
      </ProductProvider>
    );

    expect(getByText(mockedVariableProduct.name as string)).toBeInTheDocument();
    expect(getByText('Variable Product')).toBeInTheDocument();
    expect(getByText('No Selected Variation')).toBeInTheDocument();
    expect(getByText(mockedVariableProduct.name as string)).toBeInTheDocument();
  });

  it('updates context values when selectVariation is called', async () => {
    const { getByText } = render(
      <ProductProvider product={mockedVariableProduct}>
        <MockChildComponent />
      </ProductProvider>
    );

    expect(getByText('No Selected Variation')).toBeInTheDocument();

    act(() => {
      fireEvent.click(getByText('Select Variation'));
    });

    expect(getByText('Has Selected Variation')).toBeInTheDocument();
  });
});
