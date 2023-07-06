/**
 * @jest-environment node
 */
import { getClient } from '@woographql/graphql';
import { print } from 'graphql';
import { POST } from './route';
import { GraphQLClient } from 'graphql-request';

jest.mock('@woographql/graphql', () => ({
  getClient: jest.fn(),
}));

jest.mock('graphql', () => ({
  print: jest.fn(() => 'print'),
}));

const mockGetClient = getClient as jest.MockedFunction<typeof getClient>;

describe('/api/login API Endpoint', () => {
  process.env.FRONTEND_URL = 'http://localhost';
  const mockRequest = (body?: unknown) => {
    const request = new Request('http://localhost/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { request };
  };

  it('should return a 500 error from a POST request when no username or password provided', async () => {
    const { request } = mockRequest({});

    const response = await POST(request);
    expect(response.status).toBe(500);
    expect(response.ok).toBeFalsy();

    const json = await response.json();
    expect(json.errors.message).toBe('Proper credential must be provided for authentication');
  });

  it('should return a 500 error from a POST request when login failed', async () => {
    const { request } = mockRequest({ username: 'username', password: 'password' });
    mockGetClient.mockImplementationOnce(() => ({
      request: jest.fn(() => ({
        login: null,
      })),
      setHeader: jest.fn(),
    } as unknown as GraphQLClient));

    const response = await POST(request);
    expect(response.status).toBe(500);
    expect(response.ok).toBeFalsy();

    const json = await response.json();
    expect(json.errors.message).toBe('Login failed.');
  });

  it('should return a 500 error from a POST request when no session token retrieved', async () => {
    const { request } = mockRequest({ username: 'username', password: 'password' });
    mockGetClient.mockImplementationOnce(() => ({
      request: jest.fn(() => ({
        login: {
          authToken: 'authToken',
          refreshToken: 'refreshToken',
        },
      })),
      rawRequest: jest.fn(() => ({
        headers: {
          get: jest.fn(() => null),
        },
      })),
      setHeader: jest.fn(),
    } as unknown as GraphQLClient));

    const response = await POST(request);
    expect(response.status).toBe(500);
    expect(response.ok).toBeFalsy();

    const json = await response.json();
    expect(json.errors.message).toBe('Failed to retrieve session token.');
  });

  it('should return a 500 error from a POST request when no credentials retrieved', async () => {
    const { request } = mockRequest({ username: 'username', password: 'password' });
    mockGetClient.mockImplementationOnce(() => ({
      request: jest.fn(() => ({
        login:{
          authToken: null,
          refreshToken: null,
        },
      })),
      rawRequest: jest.fn(() => ({
        headers: {
          get: jest.fn(() => 'sessionToken'),
        },
      })),
      setHeader: jest.fn(),
    } as unknown as GraphQLClient));

    const response = await POST(request);
    expect(response.status).toBe(500);
    expect(response.ok).toBeFalsy();

    const json = await response.json();
    expect(json.errors.message).toBe('Failed to retrieve credentials.');
  });

  it('should return a 200 response from a POST request when valid username, password and session token provided', async () => {
    const { request } = mockRequest({ username: 'username', password: 'password' });
    mockGetClient.mockImplementationOnce(() => ({
      request: jest.fn(() => ({
        login: {
          authToken: 'authToken',
          refreshToken: 'refreshToken',
        },
      })),
      rawRequest: jest.fn(() => ({
        headers: {
          get: jest.fn(() => 'sessionToken'),
        },
      })),
      setHeader: jest.fn(),
    } as unknown as GraphQLClient));

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.ok).toBeTruthy();

    const json = await response.json();
    expect(json.authToken).toBe('authToken');
    expect(json.refreshToken).toBe('refreshToken');
    expect(json.sessionToken).toBe('sessionToken');
  });

  it('should return a 500 error from a POST request when an error occurs', async () => {
    const { request } = mockRequest({ username: 'username', password: 'password' });
    mockGetClient.mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    expect(response.ok).toBeFalsy();

    const json = await response.json();
    expect(json.errors.message).toBe('Login credentials invalid.');
  });
});
