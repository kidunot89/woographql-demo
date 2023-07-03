import HmacMD5 from 'crypto-js/hmac-md5';
import jwtDecode from 'jwt-decode';

export const MINUTE_IN_SECONDS = 60;
export const HOUR_IN_SECONDS = 60 * MINUTE_IN_SECONDS;
export const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS;

export function time() {
  return Math.floor(new Date().getTime() / 1000);
}

export function nonceTick() {
  const nonceLife = DAY_IN_SECONDS;
  return Math.ceil(time() / (nonceLife / 2));
}

export function wpNonceHash(data: string) {
  const nonceSalt = process.env.NONCE_KEY as string + process.env.NONCE_SALT as string;
  const hash = HmacMD5(data, nonceSalt).toString();

  return hash;
}

export function createNonce(action: string, uId:string|number, token:string) {
  const i = nonceTick();

  const nonce = wpNonceHash(`${i}|${action}|${uId}|${token}`).slice(-12, -2);

  return nonce;
}

export enum ActionTypes {
  Cart = 'cart',
  Checkout = 'checkout',
  Account = 'account',
}

function getAction(action: ActionTypes, uId: string|number) {
  switch (action) {
    case ActionTypes.Cart:
      return `load-cart_${uId}`;
    case ActionTypes.Checkout:
      return `load-checkout_${uId}`;
    case ActionTypes.Account:
      return `load-account_${uId}`;
    default:
      throw new Error('Invalid nonce action provided.');
  }
}

function getNonceParam(action: ActionTypes) {
  switch (action) {
    case ActionTypes.Cart:
      return '_wc_cart';
    case ActionTypes.Checkout:
      return '_wc_checkout';
    case ActionTypes.Account:
      return '_wc_account';
    default:
      throw new Error('Invalid nonce action provided.');
  }
}

type DecodedToken = {
  data: { customer_id: string };
}
export function getUidFromToken(sessionToken: string) {
  const decodedToken = jwtDecode<DecodedToken>(sessionToken);
  if (!decodedToken?.data?.customer_id) {
    throw new Error('Failed to decode session token');
  }
  return decodedToken.data.customer_id;
}

export function generateUrl(sessionToken:string, clientSessionId:string, actionType: ActionTypes) {
  const uId = getUidFromToken(sessionToken);
  const action = getAction(actionType, uId);

  // Create nonce
  const nonce = createNonce(action, uId, clientSessionId);

  // Create URL.
  const param = getNonceParam(actionType);
  let url = `${process.env.BACKEND_URL}/wp/transfer-session?session_id=${uId}&${param}=${nonce}`;

  return url;
}