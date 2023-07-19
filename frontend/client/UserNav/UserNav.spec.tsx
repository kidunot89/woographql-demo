import {
  render,
  fireEvent,
  screen,
  waitFor,
} from '@woographql/testing';
import { useSession, SessionContext } from '@woographql/client/SessionProvider';
import { useRouter } from 'next/navigation';
import { UserNav } from '.';

// Mock hooks and components
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@woographql/client/SessionProvider', () => ({
  useSession: jest.fn(() => ({
    cart: { contents: { itemCount: 5, nodes: [], edges: [] } },
    customer: { firstName: 'John' },
    goToCartPage: jest.fn(),
    goToCheckoutPage: jest.fn(),
    goToAccountPage: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: false,
    fetching: false,
  } as unknown as SessionContext))
}));



describe('UserNav component', () => {
  const mockedUseSession = useSession as jest.MockedFunction<typeof useSession>;
  const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockPush = jest.fn();
  beforeEach(() => {   
    mockedUseRouter.mockImplementation(() => ({
      push: mockPush,
    } as any));
    mockedUseSession.mockImplementation(() => ({
      cart: { contents: { itemCount: 5, nodes: [], edges: [] } },
      customer: { firstName: 'John' },
      goToCartPage: jest.fn(() => mockPush('/cart')),
      goToCheckoutPage: jest.fn(() => mockPush('/checkout')),
      goToAccountPage: jest.fn(() => mockPush('/account')),
      logout: jest.fn(),
      isAuthenticated: false,
      fetching: false,
    } as any));
  });

  it('renders correctly', () => {
    render(<ul><UserNav /></ul>);

    expect(screen.getByText('5', { selector: 'button' })).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('handles cart button click', async () => {
    render(<ul><UserNav /></ul>);

    fireEvent.click(screen.getByTestId('cart-button'));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/cart'));
  });

  it('handles checkout button click', async () => {
    render(<ul><UserNav /></ul>);

    fireEvent.click(screen.getByTestId('checkout-button'));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/checkout') );
  });

  it('handles account button click', async () => {
    mockedUseSession.mockImplementation(() => ({
      cart: { contents: { itemCount: 5, nodes: [], edges: [] } },
      customer: { firstName: 'John' },
      goToAccountPage: jest.fn(() => mockPush('/account')),
      logout: jest.fn(),
      isAuthenticated: true,
      fetching: false,
    } as unknown as SessionContext));

    render(<ul><UserNav /></ul>);

    fireEvent.click(screen.getByTestId('account-button'));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/account'));
  });

  it('handles logout button click', async () => {
    const mockLogout = jest.fn();
    mockedUseSession.mockImplementation(() => ({
      cart: { contents: { itemCount: 5, nodes: [], edges: [] } },
      customer: { firstName: 'John' },
      goToCartPage: jest.fn(() => mockPush('/cart')),
      goToCheckoutPage: jest.fn(() => mockPush('/checkout')),
      goToAccountPage: jest.fn(() => mockPush('/account')),
      logout: mockLogout,
      isAuthenticated: true,
      refetchUrls: jest.fn(),
      fetching: false,
    } as unknown as SessionContext));

    render(<ul><UserNav /></ul>);

    fireEvent.click(screen.getByTestId('logout-button'));
    await waitFor(() => expect(mockLogout).toHaveBeenCalledWith('Goodbye, John'));
  });
});
