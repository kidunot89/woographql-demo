// SessionProvider.test.tsx
import {
  render,
  fireEvent,
  waitFor,
  act,
  screen,
} from '@woographql/testing';
import { time } from '@woographql/utils/nonce';
import { SessionProvider, useSession } from '.';

// Mock child component to test useSession hook
const MockChildComponent = () => {
  const session = useSession();
  return (
    <div>
      <p>{session.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
      <p>{session.hasCredentials ? 'Has Credentials' : 'No Credentials'}</p>
      <button onClick={() => session.login('test', 'test')}>Login</button>
    </div>
  );
};

// Mock fetch calls for when unauthenticated user mounts SessionProvider.
global.fetch = jest.fn((url, options) => {
  switch (true) {
    case url === '/api/auth' && options?.method === 'GET':
      return Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ sessionToken: 'sessionToken' }),
        } as Response);
    case url === '/api/session':
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ customer: {
          id: 'guest',
          firstName: 'test',
          lastName: 'test',
          sessionToken: 'sessionTokenFromCustomer',
        } }),
      } as Response)
    case url === '/api/nonce':
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve({
          cartUrl: 'cartUrl',
          checkoutUrl: 'checkoutUrl',
          accountUrl: 'accountUrl',
        }),
      } as Response)
    default:
      return Promise.resolve({
        status: 500,
        json: () => Promise.resolve({ errors: 'Invalid request made'}),
      } as Response)
  }
});

describe('SessionProvider component', () => {
  const mockFetch = global.fetch as jest.Mock<Promise<Response>>;
  beforeEach(() => {
    // Mock environment variables
    process.env.CLIENT_CREDENTIALS_LS_KEY = 'testClientCredentials';
    process.env.NONCE_KEY = 'testNonce';
    process.env.NONCE_SALT = 'testNonceSalt';
    process.env.AUTH_TOKEN_SS_KEY = 'testAuthToken';
    process.env.SESSION_TOKEN_LS_KEY = 'testSessionToken';
    process.env.REFRESH_TOKEN_LS_KEY = 'testRefreshToken';
    process.env.AUTH_KEY_TIMEOUT = '30000';

    localStorage.setItem(
      process.env.CLIENT_CREDENTIALS_LS_KEY as string,
      JSON.stringify({
        userAgent: 'testAgent',
        ip: '1.1.1.1',
        issued: time(),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders correctly', async () => {
    await act(async () => {
      render(
        <SessionProvider>
          <MockChildComponent />
        </SessionProvider>
      );
    });

    // Check that the child component is rendered with the correct text
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(screen.getByText('Not Authenticated')).toBeInTheDocument();
    expect(screen.getByText('No Credentials')).toBeInTheDocument();
  });

  it('should match snapshot', async () => {
    let { baseElement } = render(
      <SessionProvider>
        <MockChildComponent />
      </SessionProvider>
    )
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(baseElement).toMatchSnapshot();
    });
  });

  it('updates session state on successful login', async () => {
    await act(async () => {
      render(
        <SessionProvider>
          <MockChildComponent />
        </SessionProvider>
      );
    });

    expect(mockFetch).toHaveBeenCalledTimes(3);

    mockFetch.mockImplementationOnce(() => {
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve({
          authToken: 'authToken',
          refreshToken: 'refreshToken',
          sessionToken: 'sessionToken',
        }),
      } as Response)
    });
    mockFetch.mockImplementationOnce(() => {
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ customer: {
          id: 1,
          firstName: 'test',
          lastName: 'test',
          sessionToken: 'sessionTokenFromCustomer',
        } }),
      } as Response)
    });
    mockFetch.mockImplementationOnce(() => {
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve({
          cartUrl: 'cartUrl',
          checkoutUrl: 'checkoutUrl',
          accountUrl: 'accountUrl',
        }),
      } as Response)
    });

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    // Wait for updates
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(6);
      expect(screen.getByText('Authenticated')).toBeInTheDocument();
      expect(screen.getByText('Has Credentials')).toBeInTheDocument();
    });
  });

  it('fetches session for returning user with refreshToken', async () => {
    // Mock localStorage to return refreshToken
    localStorage.setItem(process.env.REFRESH_TOKEN_LS_KEY as string, 'testRefreshToken');
    mockFetch.mockImplementationOnce((...params) => {
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve({
          authToken: 'authToken',
          refreshToken: 'refreshToken',
          sessionToken: 'sessionToken',
        }),
      } as Response)
    });
    mockFetch.mockImplementationOnce((...params) => {
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ customer: {
          id: 1,
          firstName: 'test',
          lastName: 'test',
          sessionToken: 'sessionTokenFromCustomer',
        } }),
      } as Response)
    });
    mockFetch.mockImplementationOnce((...params) => {
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve({
          cartUrl: 'cartUrl',
          checkoutUrl: 'checkoutUrl',
          accountUrl: 'accountUrl',
        }),
      } as Response)
    });

    render(
      <SessionProvider>
        <MockChildComponent />
      </SessionProvider>
    );

    // Wait for updates
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3));
    expect(screen.getByText('Authenticated')).toBeInTheDocument();
    expect(screen.getByText('Has Credentials')).toBeInTheDocument();
  });
});
