/* eslint-disable react/display-name */
// CartOptions.test.tsx
import { render, screen } from '@woographql/testing';
import { ProductTypesEnum } from '@woographql/graphql';
import { CartOptions } from './CartOptions';

// Mock child components
jest.mock('@woographql/client/SimpleCartOptions', () => ({
  __esModule: true,
  SimpleCartOptions: () => <div>SimpleCartOptions</div>,
} as any));
jest.mock('@woographql/client/VariableCartOptions', () => ({
  __esModule: true,
  VariableCartOptions: () => <div>VariableCartOptions</div>
} as any));

describe('CartOptions component', () => {
  it('renders SimpleCartOptions for simple product type', () => {
    const product = {
      type: ProductTypesEnum.SIMPLE,
    };

    render(<CartOptions product={product as any} />);

    expect(screen.getByText('SimpleCartOptions')).toBeInTheDocument();
  });

  it('renders VariableCartOptions for variable product type', () => {
    const product = {
      type: ProductTypesEnum.VARIABLE,
    };

    render(<CartOptions product={product as any} />);

    expect(screen.getByText('VariableCartOptions')).toBeInTheDocument();
  });

  it('renders nothing for unsupported product type', () => {
    const product = {
      type: 'UNSUPPORTED_TYPE',
    };

    const { container } = render(<CartOptions product={product as any} />);

    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
