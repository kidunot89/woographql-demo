import { GraphQLError } from 'graphql/error';
import { GraphQLClient } from 'graphql-request';
import jwtDecode from 'jwt-decode';

import {
  UpdateCustomerInput,
  Customer,
  Cart,
} from '@woographql/graphql';
import { isSSR } from '@woographql/utils/ssr';
import {
  wpNonceHash,
  time,
  HOUR_IN_SECONDS,
  MINUTE_IN_SECONDS,
} from '@woographql/utils/nonce';

export const isDev = () => !!process.env.WEBPACK_DEV_SERVER;

// Fetch
type ResponseErrors = {
  errors?: {
    message: string;
    data?: unknown;
  }
}
async function apiCall<T>(url: string, input: globalThis.RequestInit) {
  const response = await fetch(
    url,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      ...input,
    },
  );

  const json: T&ResponseErrors = await response.json();

  // Capture errors.
  if (json?.errors || response.status !== 200) {
    if (isDev()) {
      // eslint-disable-next-line no-console
      console.error(json?.errors || response.statusText);
    }
    throw new Error(json.errors?.message || `Failed to fetch: ${url}`);
  }

  return json;
}

// Auth management.
function saveCredentials(authToken: string, sessionToken: string, refreshToken?: string) {
  if (isSSR()) {
    return;
  }

  sessionStorage.setItem(process.env.AUTH_TOKEN_SS_KEY as string, authToken);
  sessionStorage.setItem(process.env.SESSION_TOKEN_LS_KEY as string, sessionToken);
  if (refreshToken) {
    localStorage.setItem(process.env.REFRESH_TOKEN_LS_KEY as string, refreshToken);
  }
}

function saveSessionToken(sessionToken: string) {
  localStorage.setItem(process.env.SESSION_TOKEN_LS_KEY as string, sessionToken);
}

export function hasCredentials() {
  const authToken = sessionStorage.getItem(process.env.AUTH_TOKEN_SS_KEY as string);
  const refreshToken = localStorage.getItem(process.env.REFRESH_TOKEN_LS_KEY as string);

  if (!!authToken && !!refreshToken) {
    return true;
  }

  return false;
}

type FetchAuthTokenResponse = {
  authToken: string;
  sessionToken: string;
}

async function fetchAuthToken() {
  const refreshToken = localStorage.getItem(process.env.REFRESH_TOKEN_LS_KEY as string);
  if (!refreshToken) {
    // eslint-disable-next-line no-console
    isDev() && console.error('Unauthorized');
    return null;
  }

  const json = await apiCall<FetchAuthTokenResponse>(
    '/api/auth',
    {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    },
  );

  const { authToken, sessionToken } = json;
  saveCredentials(authToken, sessionToken);

  return authToken;
}

let tokenSetter: ReturnType<typeof setInterval>;
function setAutoFetcher() {
  if (tokenSetter) {
    clearInterval(tokenSetter);
  }
  tokenSetter = setInterval(
    async () => {
      if (!hasCredentials()) {
        clearInterval(tokenSetter);
        return;
      }
      fetchAuthToken();
    },
    Number(process.env.AUTH_KEY_TIMEOUT || 30000),
  );
}

type LoginResponse = {
  authToken: string
  refreshToken: string;
  sessionToken: string;
}
export async function login(username: string, password: string): Promise<boolean|string> {
  let json: LoginResponse;
  try {
    json = await apiCall<LoginResponse>(
      '/api/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      },
    );
  } catch (error) {
    return (error as GraphQLError)?.message || error as string;
  }

  const { authToken, refreshToken, sessionToken } = json;
  saveCredentials(authToken, sessionToken, refreshToken);
  setAutoFetcher();

  return true;
}

type SendPasswordResetResponse = {
  success: boolean
}
export async function sendPasswordReset(username: string): Promise<boolean|string> {
  let json: SendPasswordResetResponse;
  try {
    json = await apiCall<SendPasswordResetResponse>(
      '/api/send-reset',
      {
        method: 'POST',
        body: JSON.stringify({ username }),
      },
    );
  } catch (error) {
    return (error as GraphQLError)?.message || error as string;
  }

  const { success } = json;

  return success;
}

export async function getAuthToken() {
  let authToken = sessionStorage.getItem(process.env.AUTH_TOKEN_SS_KEY as string);
  if (!authToken || !tokenSetter) {
    authToken = await fetchAuthToken();
    authToken && setAutoFetcher();
  }
  return authToken;
}

type FetchSessionTokenResponse = {
  sessionToken: string;
}

async function fetchSessionToken() {
  const json = await apiCall<FetchSessionTokenResponse>(
    '/api/auth',
    { method: 'GET' },
  );

  const { sessionToken } = json;
  saveSessionToken(sessionToken);

  return sessionToken;
}

async function getSessionToken() {
  let sessionToken = localStorage.getItem(process.env.SESSION_TOKEN_LS_KEY as string);
  if (!sessionToken) {
    sessionToken = await fetchSessionToken();
  }
  return sessionToken;
}

export function hasRefreshToken() {
  const refreshToken = localStorage.getItem(process.env.REFRESH_TOKEN_LS_KEY as string);

  return !!refreshToken;
}

export type FetchSessionResponse = {
  customer: Customer;
  cart: Cart;
}
export async function getSession(): Promise<FetchSessionResponse|string> {
  const sessionToken = await getSessionToken();
  const authToken = await getAuthToken();
  let json: FetchSessionResponse;
  try {
    json = await apiCall<FetchSessionResponse>(
      '/api/session',
      {
        method: 'POST',
        body: JSON.stringify({
          sessionToken,
          authToken,
        }),
      },
    );
  } catch (error) {
    return (error as GraphQLError)?.message || error as string;
  }

  const { customer } = json;
  saveSessionToken(customer.sessionToken as string);

  return json;
}

type FetchCustomerResponse = {
  customer: Customer;
}
export async function updateCustomer(input: UpdateCustomerInput): Promise<Customer|string> {
  const sessionToken = await getSessionToken();
  const authToken = await getAuthToken();
  let json: FetchCustomerResponse;
  try {
    json = await apiCall<FetchCustomerResponse>(
      '/api/customer',
      {
        method: 'POST',
        body: JSON.stringify({
          sessionToken,
          authToken,
          input,
        }),
      },
    );
  } catch (error) {
    return (error as GraphQLError)?.message || error as string;
  }

  const { customer } = json;

  return customer;
}

type FetchCartResponse = {
  cart: Cart;
  sessionToken: string;
}
export type CartAction = {
  mutation: 'add';
  productId: number;
  quantity: number;
  variationId?: number;
  variation?: { [key: string]: string };
  extraData?: string;
} | {
  mutation: 'update';
  items: { key: string, quantity: number }[];
} | {
  mutation: 'remove';
  keys: string[];
  all?: boolean;
}

export async function updateCart(input: CartAction): Promise<Cart|string> {
  const sessionToken = await getSessionToken();
  const authToken = await getAuthToken();
  let json: FetchCartResponse;
  try {
    json = await apiCall<FetchCartResponse>(
      '/api/cart',
      {
        method: 'POST',
        body: JSON.stringify({
          sessionToken,
          authToken,
          input,
        }),
      },
    );
  } catch (error) {
    return (error as GraphQLError)?.message || error as string;
  }

  const { cart } = json;
  saveSessionToken(json.sessionToken);

  return cart;
}

type Creds = {
  userAgent: string;
  ip: string;
  issued: number;
}
async function createClientSessionId() {
  // Create credentials object with UserAgent.
  const credentials: Creds = {
    userAgent: window?.navigator?.userAgent || '',
    ip: '',
    issued: 0,
  };

  // Fetch IP.
  const response = await fetch('https://api.ipify.org/?format=json');
  const { data } = await response.json();
  credentials.ip = data?.ip || '';

  // Mark time of creation.
  credentials.issued = time();

  // Generate Client Session ID.
  const clientSessionId = wpNonceHash(JSON.stringify(credentials));
  const timeout = `${credentials.issued + HOUR_IN_SECONDS}`;

  sessionStorage.setItem(process.env.CLIENT_SESSION_SS_KEY as string, clientSessionId);
  sessionStorage.setItem(process.env.CLIENT_SESSION_EXP_SS_KEY as string, timeout);

  return { clientSessionId, timeout };
}

let clientSetter: ReturnType<typeof setInterval>;
function setClientFetcher() {
  if (clientSetter) {
    clearInterval(clientSetter);
  }
  clientSetter = setInterval(
    async () => {
      if (!hasCredentials()) {
        clearInterval(clientSetter);
        return;
      }
      createClientSessionId();
    },
    Number(45 * MINUTE_IN_SECONDS),
  );
}

async function getClientSessionId() {
  let clientSessionId = sessionStorage.getItem(process.env.CLIENT_SESSION_SS_KEY as string);
  let timeout = sessionStorage.getItem(process.env.CLIENT_SESSION_EXP_SS_KEY as string);
  if (!clientSessionId || !timeout || time() > Number(timeout)) {
    ({ clientSessionId, timeout } = await createClientSessionId());
    setClientFetcher();
  }

  return { clientSessionId, timeout };
}

type FetchAuthURLResponse = {
  addPaymentMethodUrl: string;
}
export async function fetchAuthURLs(): Promise<FetchAuthURLResponse|string> {
  const sessionToken = await getSessionToken();
  const authToken = await getAuthToken();
  const { clientSessionId, timeout } = await getClientSessionId();
  let json: FetchAuthURLResponse;
  try {
    json = await apiCall<FetchAuthURLResponse>(
      '/api/nonce',
      {
        method: 'POST',
        body: JSON.stringify({
          sessionToken,
          authToken,
          clientSessionId,
          timeout,
        }),
      },
    );
  } catch (error) {
    return (error as GraphQLError)?.message || error as string;
  }

  return json;
}

export function deleteCredentials() {
  if (isSSR()) {
    return;
  }

  if (tokenSetter) {
    clearInterval(tokenSetter);
  }
  sessionStorage.removeItem(process.env.SESSION_TOKEN_LS_KEY as string);
  sessionStorage.removeItem(process.env.AUTH_TOKEN_SS_KEY as string);
  localStorage.removeItem(process.env.REFRESH_TOKEN_LS_KEY as string);
}

type DecodedToken = {
  data: { [key: string]: string };
}
export function getSessionMeta(): DecodedToken['data'] {
  const sessionToken = sessionStorage.getItem(process.env.SESSION_TOKEN_LS_KEY as string);
  if (!sessionToken) {
    return {};
  }

  const token = jwtDecode<DecodedToken>(sessionToken);

  return token?.data || {};
}