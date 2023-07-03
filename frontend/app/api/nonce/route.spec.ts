/**
 * @jest-environment node
 */
import type { RequestMethod } from 'node-mocks-http';
import { getClient } from '@woographql/graphql';
import { POST } from './route';
import { GraphQLClient } from 'graphql-request';
import jwtDecode from 'jwt-decode';

jest.mock('@woographql/graphql', () => ({
  getClient: jest.fn(),
}));

jest.mock('jwt-decode', () => jest.fn(() => ({ data: { customer_id: 1 } })));

const mockGetClient = getClient as jest.MockedFunction<typeof getClient>;
const mockJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

describe('/api/session API Endpoint', () => {
  process.env.GRAPHQL_ENDPOINT = 'http://localhost/graphql';
  process.env.NONCE_KEY = 'nonceKey';
  process.env.NONCE_SALT = 'nonceSalt';
  const mockRequest = (method: RequestMethod = 'POST', body?: unknown) => {
    const request = new Request('http://localhost/api/session', {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { request };
  };

  it('should return a 500 error from a POST request when no session token provided', async () => {
    const { request } = mockRequest('POST', {});

    const response = await POST(request);
    expect(response.status).toBe(500);
    expect(response.ok).toBeFalsy();

    const json = await response.json();
    expect(json.errors.message).toBe('No session started.');
  });

  it('should return a 500 error from a POST request when no clientSessionId or timeout provided', async () => {
    const { request } = mockRequest('POST', { sessionToken: 'sessionToken' });

    const response = await POST(request);
    expect(response.status).toBe(500);
    expect(response.ok).toBeFalsy();

    const json = await response.json();
    expect(json.errors.message).toBe('Client Session ID and expiration must be provided.');
  });

  it('should return a 500 error from a POST request when update session failed', async () => {
    const { request } = mockRequest('POST', { sessionToken: 'sessionToken', clientSessionId: 'clientSessionId', timeout: 1000 });
    mockGetClient.mockImplementationOnce(() => ({
      request: jest.fn(() => ({
        updateSession: null,
      })),
      setHeaders: jest.fn(),
    } as unknown as GraphQLClient));

    const response = await POST(request);
    expect(response.status).toBe(500);
    expect(response.ok).toBeFalsy();

    const json = await response.json();
    expect(json.errors.message).toBe('Failed to update session');
  });

  it('should return a 200 response from a POST request when valid session token, clientSessionId, and timeout provided', async () => {
    const { request } = mockRequest('POST', { sessionToken: 'sessionToken', clientSessionId: 'clientSessionId', timeout: 1000 });
    mockGetClient.mockImplementationOnce(() => ({
      request: jest.fn(() => ({
        updateSession: {},
      })),
      setHeaders: jest.fn(),
    } as unknown as GraphQLClient));

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.ok).toBeTruthy();
    expect(mockJwtDecode).toBeCalledTimes(3);

    const json = await response.json();
    expect(json.cartUrl).toBeDefined();
    expect(json.checkoutUrl).toBeDefined();
    expect(json.accountUrl).toBeDefined();
    expect(json.errors).toBeUndefined();
  });

  it('should return a 500 error from a POST request when an error occurs', async () => {
    const { request } = mockRequest('POST', { sessionToken: 'sessionToken', clientSessionId: 'clientSessionId', timeout: 1000 });
    mockGetClient.mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    expect(response.ok).toBeFalsy();

    const json = await response.json();
    expect(json.errors.message).toBe('Sorry, something went wrong');
  });
});
