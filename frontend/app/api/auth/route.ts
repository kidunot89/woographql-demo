import { NextResponse } from 'next/server';
import { print } from 'graphql';

import {
  GetSessionDocument,
  GetSessionQuery,
  RefreshAuthTokenDocument,
  RefreshAuthTokenMutation,
  getClient,
} from '@woographql/graphql';

export async function GET(request: Request) {
  try {
    const client = getClient();

    const { data, headers } = await client.rawRequest<GetSessionQuery>(
      print(GetSessionDocument),
    );

    const cart = data?.cart;
    const customer = data?.customer;
    const sessionToken = headers.get('woocommerce-session');

    if (!cart || !customer || !sessionToken) {
      return NextResponse.json({ errors: { message: 'Failed to retrieve session credentials.' } }, { status: 500 });
    }

    return NextResponse.json({ sessionToken });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ errors: { message: 'Sorry, something went wrong' } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const client = getClient();

    const body = await request.json();
    let authToken = body.authToken;
    const refreshToken = body.refreshToken;
    if (!authToken && !refreshToken) {
      return NextResponse.json({ errors: { message: 'No refresh token provided' } }, { status: 500 });
    }

    if (!authToken && refreshToken) {
      client.setHeaders({});
      const results = await client.request<RefreshAuthTokenMutation>(
        RefreshAuthTokenDocument,
        { refreshToken },
      );

      authToken = results?.refreshJwtAuthToken?.authToken;

      if (!authToken) {
        return NextResponse.json({ errors: { message: 'Failed to retrieve auth token.' } }, { status: 500 });
      }
    }

    client.setHeaders({ Authorization: `Bearer ${authToken}` });
    const { data: cartData, headers } = await client.rawRequest<GetSessionQuery>(
      print(GetSessionDocument),
    );

    const newSessionToken = cartData?.customer?.sessionToken;
    if (!newSessionToken) {
      return NextResponse.json({ errors: { message: 'Failed to validate auth token.' } }, { status: 500 });
    }

    const sessionToken = headers.get('woocommerce-session') || newSessionToken;

    return NextResponse.json({ authToken, sessionToken });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ errors: { message: 'Sorry, something went wrong' } }, { status: 500 });
  }
}