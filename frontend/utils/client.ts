import {
  wpNonceHash,
  time,
  HOUR_IN_SECONDS,
  MINUTE_IN_SECONDS,
  DAY_IN_SECONDS,
} from '@woographql/utils/nonce';

type Creds = {
  userAgent: string;
  ip: string;
  issued: number;
}

/**
 * Creates a Client Session ID and saves it to sessionStorage.
 * 
 * @returns {string} Client Session ID  
 * @returns {string} Client Session ID expiration timestamp
 */
async function createClientSessionId() {
  const encodedCredentials = localStorage.getItem(process.env.CLIENT_CREDENTIALS_LS_KEY as string);
  let credentials: null|Creds = encodedCredentials ? JSON.parse(encodedCredentials) : null;
  if (!credentials || time() > credentials.issued + (14 * DAY_IN_SECONDS)) {
    // Create credentials object with UserAgent.
    credentials = {
      userAgent: window?.navigator?.userAgent || '',
      ip: '',
      issued: 0,
    };

    // Fetch IP.
    const response = await fetch('https://api.ipify.org/?format=json');
    const { data } = await response.json();
    credentials.ip = data?.ip || '';
  }

  // Update timestamp to ensure new nonces are generated everytime
  // the end-user starts that application.
  credentials.issued = time();
  localStorage.setItem(process.env.CLIENT_CREDENTIALS_LS_KEY as string, JSON.stringify(credentials));

  // Generate Client Session ID.
  const clientSessionId = wpNonceHash(JSON.stringify(credentials));
  const timeout = `${credentials.issued + HOUR_IN_SECONDS}`;

  // Save Client Session ID.
  sessionStorage.setItem(process.env.CLIENT_SESSION_SS_KEY as string, clientSessionId);
  sessionStorage.setItem(process.env.CLIENT_SESSION_EXP_SS_KEY as string, timeout);

  // Return Client Session ID.
  return { clientSessionId, timeout };
}

/**
 * Checks if a session token exists in localStorage.
 * 
 * @returns {string} Session Token
 */
function hasSessionToken() {
  const sessionToken = localStorage.getItem(process.env.SESSION_TOKEN_LS_KEY as string);

  return !!sessionToken;
}

let clientSetter: ReturnType<typeof setInterval>;

/**
 * Creates timed fetcher for renewing client credentials and client session id.
 * 
 * @returns {void}
 */
function setClientFetcher() {
  if (clientSetter) {
    clearInterval(clientSetter);
  }
  clientSetter = setInterval(
    async () => {
      if (!hasSessionToken()) {
        clearInterval(clientSetter);
        return;
      }
      createClientSessionId();
    },
    Number(45 * MINUTE_IN_SECONDS),
  );
}

/**
 * Returns Client Session ID and expiration timestamp.
 * 
 * @returns {string} Client Session ID
 * @returns {string} Client Session ID expiration timestamp
 */
export async function getClientSessionId() {
  let clientSessionId = sessionStorage.getItem(process.env.CLIENT_SESSION_SS_KEY as string);
  let timeout = sessionStorage.getItem(process.env.CLIENT_SESSION_EXP_SS_KEY as string);
  if (!clientSessionId || !timeout || time() > Number(timeout)) {
    ({ clientSessionId, timeout } = await createClientSessionId());
    setClientFetcher();
  }

  return { clientSessionId, timeout };
}

export function deleteClientSessionId() {
  if (clientSetter) {
    clearInterval(clientSetter);
  }
  sessionStorage.removeItem(process.env.CLIENT_SESSION_SS_KEY as string);
  sessionStorage.removeItem(process.env.CLIENT_SESSION_EXP_SS_KEY as string);
}

export function deleteClientCredentials() {
  deleteClientSessionId();
  localStorage.removeItem(process.env.CLIENT_CREDENTIALS_LS_KEY as string);
}