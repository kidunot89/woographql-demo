import { render, screen, fireEvent, waitFor } from '@woographql/testing';
import { Login } from '.';
import { SessionContext, useSession } from '@woographql/client/SessionProvider';
import { useRouter } from 'next/navigation';

// Mock hooks and components
jest.mock('@woographql/client/SessionProvider', () => ({
  useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe('Login component', () => {
  const mockedUseSession = useSession as jest.MockedFunction<typeof useSession>;
  const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockedLogin = jest.fn();
  const mockedPush = jest.fn();

  beforeEach(() => {
    mockedUseSession.mockImplementation(() => ({
      login: mockedLogin,
      isAuthenticated: false,
      fetching: false,
    } as any));

    mockedUseRouter.mockImplementation(() => ({
      push: mockedPush,
    } as any));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<Login />);

    expect(screen.getByPlaceholderText('Enter your username or e-mail associate with your account.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password.')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const { login } = mockedUseSession();
    render(<Login />);

    fireEvent.input(screen.getByPlaceholderText('Enter your username or e-mail associate with your account.'), {
      target: {
        value: 'testuser',
      },
    });

    fireEvent.input(screen.getByPlaceholderText('Enter your password.'), {
      target: {
        value: 'testpassword',
      },
    });

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('testuser', 'testpassword');
    });
  });

  it('redirects if user is authenticated', () => {
    const { push } = mockedUseRouter();
    mockedUseSession.mockImplementationOnce(() => ({
      login: jest.fn(),
      isAuthenticated: true,
      fetching: false,
    } as any));

    render(<Login />);

    expect(push).toHaveBeenCalledWith('/');
  });
});
