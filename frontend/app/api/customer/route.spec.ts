/**
 * @jest-environment node
 */
import type { RequestMethod } from 'node-mocks-http';
import { getClient } from '@woographql/graphql';
import { POST } from './route';
import { GraphQLClient } from 'graphql-request';

jest.mock('@woographql/graphql', () => ({
  getClient: jest.fn(),
}));

const mockGetClient = getClient as jest.MockedFunction<typeof getClient>;

describe('/api/customer API Endpoint', () => {
  process.env.GRAPHQL_ENDPOINT = 'http://localhost/graphql';
  const mockRequest = (method: RequestMethod = 'POST', body?: unknown) => {
    const request = new Request('http://localhost/api/customer', {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { request };
  };

  it('should return a 500 error from a POST request when no session token or auth token provided', async () => {
    const { request } = mockRequest('POST', {});

    const response = await POST(request);
    expect(response.status).toBe(500);
    expect(response.ok).toBeFalsy();

    const json = await response.json();
    expect(json.errors.message).toBe('Missing credentials');
  });

  it('should return a 500 error from a POST request when no customer data returned from WooCommerce', async () => {
    const { request } = mockRequest('POST', { sessionToken: 'sessionToken', authToken: 'authToken', input: {} });
    mockGetClient.mockImplementationOnce(() => ({
      request: jest.fn(() => ({
        updateCustomer: {
          customer: null,
        },
      })),
      setHeaders: jest.fn(),
    } as unknown as GraphQLClient));

    const response = await POST(request);
    expect(response.status).toBe(500);
    expect(response.ok).toBeFalsy();

    const json = await response.json();
    expect(json.errors.message).toBe('Failed to update customer data');
  });

  it('should return a 200 response from a POST request when valid session token, auth token and input provided', async () => {
    const { request } = mockRequest('POST', { sessionToken: 'sessionToken', authToken: 'authToken', input: {} });
    mockGetClient.mockImplementationOnce(() => ({
      request: jest.fn(() => ({
        updateCustomer: {
          customer: {},
        },
      })),
      setHeaders: jest.fn(),
    } as unknown as GraphQLClient));

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.ok).toBeTruthy();

    const json = await response.json();
    expect(json.customer).toEqual({});
    expect(json.errors).toBeUndefined();
  });

  it('should return a 500 error from a POST request when an error occurs', async () => {
    const { request } = mockRequest('POST', { sessionToken: 'sessionToken', authToken: 'authToken', input: {} });
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
