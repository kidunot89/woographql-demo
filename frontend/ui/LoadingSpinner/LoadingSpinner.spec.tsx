import { render, screen } from '@woographql/testing';
import { LoadingSpinner } from '.';

describe('LoadingSpinner component', () => {
  it('renders correctly with default props', () => {
    render(<LoadingSpinner />);

    // Check that the spinner is rendered
    const spinner = screen.getByRole('status', { name: 'Loading...' });
    expect(spinner).toBeInTheDocument();

    // Check that the loading text is rendered
    const loadingText = screen.getByText('Loading...');
    expect(loadingText).toBeInTheDocument();
  });

  it('renders correctly with noText prop', () => {
    render(<LoadingSpinner noText />);

    // Check that the spinner is rendered
    const spinner = screen.getByRole('status', { name: 'Loading...' });
    expect(spinner).toBeInTheDocument();

    // Check that the loading text is not rendered
    const loadingText = screen.queryByText('Loading...');
    expect(loadingText).not.toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { baseElement } = render(<LoadingSpinner />);
    expect(baseElement).toMatchSnapshot();
  });
});
