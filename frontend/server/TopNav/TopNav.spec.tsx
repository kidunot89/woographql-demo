// TopNav.test.tsx
import { render, screen, mockedMenu } from '@woographql/testing';
import { TopNav } from './TopNav';

describe('TopNav component', () => {
  process.env.FRONTEND_URL = 'http://localhost';
  it('renders correctly', () => {
    render(<TopNav menu={mockedMenu} />);

    // Check that the logo is rendered
    expect(screen.getByRole('img')).toBeInTheDocument();

    // Check that the menu items are rendered
    mockedMenu.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });

    // Check that the user navigation is rendered
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { baseElement } = render(<TopNav menu={mockedMenu} />);
    expect(baseElement).toMatchSnapshot();
  });
});
