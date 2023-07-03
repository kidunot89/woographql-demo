/**
 * @jest-environment node
 */
import type { RequestMethod } from 'node-mocks-http';

import { getClient } from '@woographql/graphql';
import { GET, POST } from './route';
import { GraphQLClient } from 'graphql-request';

jest.mock('graphql', () => ({
  print: jest.fn(() => 'print'),
}));
jest.mock('@woographql/graphql', () => ({
  getClient: jest.fn(),
}));

const mockGetClient = getClient as jest.MockedFunction<typeof getClient>;

describe( '/api/auth API Endpoint', () => {
  process.env.GRAPHQL_ENDPOINT = 'http://localhost/graphql';
  const mockRequest = (method: RequestMethod = 'GET', body?: unknown) => {
    const request = new Request('http://localhost/api/support', {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { request };
  };

  it(`should return a 500 error from a GET request when GetSessionQuery returned invalid 
    response`, async () => {
    const { request } = mockRequest();
    mockGetClient.mockImplementationOnce(() => ({
      rawRequest: jest.fn(() => ({
        data: {
          cart: null,
          customer: {},
        },
        headers: {
          get: jest.fn(() => 'sessionToken'),
        },
        status: 200,
        extensions: [],
        errors: [],
      })) as unknown,
    } as unknown as GraphQLClient));

    let response = await GET(request);
    expect(response.status).toBe(500);
    expect(response.ok).toBeFalsy();

    let json = await response.json();
    expect(json.errors.message).toBe('Failed to retrieve session credentials.');
    expect(json.sessionToken).toBeUndefined();
    expect(json.authToken).toBeUndefined();

    mockGetClient.mockImplementationOnce(() => ({
      rawRequest: jest.fn(() => ({
        data: {
          cart: {},
          customer: null,
        },
        headers: {
          get: jest.fn(() => 'sessionToken'),
        },
        status: 200,
        extensions: [],
        errors: [],
      })) as unknown,
    } as unknown as GraphQLClient));

    response = await GET(request);
    expect(response.status).toBe(500);
    expect(response.ok).toBeFalsy();

    json = await response.json();
    expect(json.errors.message).toBe('Failed to retrieve session credentials.');
    expect(json.sessionToken).toBeUndefined();
    expect(json.authToken).toBeUndefined();

    mockGetClient.mockImplementationOnce(() => ({
      rawRequest: jest.fn(() => ({
        data: {
          cart: {},
          customer: {},
        },
        headers: {
          get: jest.fn(() => null),
        },
        status: 200,
        extensions: [],
        errors: [],
      })) as unknown,
    } as unknown as GraphQLClient));

    response = await GET(request);
    expect(response.status).toBe(500);
    expect(response.ok).toBeFalsy();

    json = await response.json();
    expect(json.errors.message).toBe('Failed to retrieve session credentials.');
    expect(json.sessionToken).toBeUndefined();
    expect(json.authToken).toBeUndefined();
  });

  it(`should return a 200 response from a GET Request when proper response for
     "GetSessionQuery" is returned`, async () => {
    const { request } = mockRequest();
    mockGetClient.mockImplementationOnce(() => ({
      rawRequest: jest.fn(() => ({
        data: {
          cart: {},
          customer: {},
        },
        headers: {
          get: jest.fn(() => 'sessionToken'),
        },
      })),
    } as unknown as GraphQLClient));
   
    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(response.ok).toBeTruthy();

    let json = await response.json();
    expect(json.sessionToken).toBe('sessionToken');
    expect(json.authToken).toBeUndefined();
    expect(json.errors).toBeUndefined();
  });

  it('should return a 500 error from a POST request when no refresh or auth token provided.', async () => {
    const { request } = mockRequest('POST', {});

    const response = await POST(request);
    expect(response.status).toBe(500);
    expect(response.ok).toBeFalsy();

    const json = await response.json();
    expect(json.errors.message).toBe('No refresh token provided');
  });

  it(`should return a 500 error from a POST request when "RefreshAuthTokenMutation" 
    returns an invalid response.`, async () => {
    const { request } = mockRequest('POST', { refreshToken: 'refreshToken' });
    const mockSetHeaders = jest.fn();
    mockGetClient.mockImplementationOnce(() => ({
      setHeaders: mockSetHeaders,
      request: jest.fn(() => ({
        refreshJwtAuthToken: {
          authToken: null,
        },
      })),
    } as unknown as GraphQLClient));

    const response = await POST(request);
    expect(response.status).toBe(500);
    expect(response.ok).toBeFalsy();
    expect(mockSetHeaders).toBeCalledTimes(1);

    const json = await response.json();
    expect(json.errors.message).toBe('Failed to retrieve auth token.');
  });

  it(`should return a 500 error from a POST request when "GetSessionQuery" returns an 
    invalid response after using a new "authToken".`, async () => {
    const { request } = mockRequest('POST', { refreshToken: 'refreshToken' });
    const mockSetHeaders = jest.fn();
    mockGetClient.mockImplementationOnce(() => ({
      request: jest.fn(() => ({
        refreshJwtAuthToken: {
          authToken: 'authToken',
        },
      })),
      setHeaders: mockSetHeaders,
      rawRequest: jest.fn(() => ({
        data: {
          cart: {},
          customer: {
            sessionToken: null,
          },
        },
        headers: {},
      })),
    } as unknown as GraphQLClient));

    const response = await POST(request);
    expect(response.status).toBe(500);
    expect(response.ok).toBeFalsy();
    expect(mockSetHeaders).toBeCalledTimes(2);

    const json = await response.json();
    expect(json.errors.message).toBe('Failed to validate auth token.');
  });

  it(`should return a 200 response from a POST request when "GetSessionQuery" returns a
    valid response after using a new "authToken".`, async () => {
    const { request } = mockRequest('POST', { refreshToken: 'refreshToken' });
    const mockSetHeaders = jest.fn();
    mockGetClient.mockImplementationOnce(() => ({
      request: jest.fn(() => ({
        refreshJwtAuthToken: {
          authToken: 'authToken',
        },
      })),
      setHeaders: mockSetHeaders,
      rawRequest: jest.fn(() => ({
        data: {
          cart: {},
          customer: {
            sessionToken: 'sessionToken',
          },
        },
        headers: {
          get: jest.fn(() => 'sessionTokenFromResponseHeader'),
        },
      })),
    } as unknown as GraphQLClient));

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.ok).toBeTruthy();
    expect(mockSetHeaders).toBeCalledTimes(2);

    const json = await response.json();
    expect(json.sessionToken).toBe('sessionTokenFromResponseHeader');
    expect(json.authToken).toBe('authToken');
    expect(json.errors).toBeUndefined();
  });

  it(`should return a 500 error from a POST request when "GetSessionQuery" returns an
    invalid response after using an existing "authToken" from the request body.`, async () => {
      const { request } = mockRequest('POST', { authToken: 'authToken' });
      const mockSetHeaders = jest.fn();
      mockGetClient.mockImplementationOnce(() => ({
        setHeaders: mockSetHeaders,
        rawRequest: jest.fn(() => ({
          data: {
            cart: {},
            customer: {
              sessionToken: null,
            },
          },
          headers: {
            get: jest.fn(() => 'sessionTokenFromResponseHeader'),
          },
        })),
      } as unknown as GraphQLClient));
  
      const response = await POST(request);
      expect(response.status).toBe(500);
      expect(response.ok).toBeFalsy();
      expect(mockSetHeaders).toBeCalledTimes(1);
  
      const json = await response.json();
      expect(json.errors.message).toBe('Failed to validate auth token.');
  });

  it(`should return a 200 response from a POST request when "GetSessionQuery" returns a
    valid response after using an existing "authToken" from the request body.`, async () => {
    const { request } = mockRequest('POST', { authToken: 'authToken' });
    const mockSetHeaders = jest.fn();
    mockGetClient.mockImplementationOnce(() => ({
      setHeaders: mockSetHeaders,
      rawRequest: jest.fn(() => ({
        data: {
          cart: {},
          customer: {
            sessionToken: 'sessionToken',
          },
        },
        headers: {
          get: jest.fn(() => null),
        },
      })),
    } as unknown as GraphQLClient));

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.ok).toBeTruthy();
    expect(mockSetHeaders).toBeCalledTimes(1);

    const json = await response.json();
    expect(json.sessionToken).toBe('sessionToken');
    expect(json.authToken).toBe('authToken');
    expect(json.errors).toBeUndefined();
  });
});