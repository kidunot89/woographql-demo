import { NextResponse } from 'next/server';

import { UpdateSessionDocument, UpdateSessionMutation, getClient } from '@woographql/graphql';
import { ActionTypes, generateUrl } from '@woographql/utils/nonce';

type RequestBody = {
  sessionToken: string;
  authToken?: string;
  clientSessionId: string;
  timeout: number;
}

type GraphQLRequestHeaders = {
  'woocommerce-session': string;
  Authorization?: string;
}

export async function POST(request: Request) {
  try {
    const {
      sessionToken,
      authToken,
      clientSessionId,
      timeout,
    } = await request.json() as RequestBody;

    if (!sessionToken) {
      return NextResponse.json({ errors: { message: 'No session started.' } }, { status: 500 });
    }

    if (!clientSessionId || !timeout) {
      return NextResponse.json({ errors: { message: 'Client Session ID and expiration must be provided.' } }, { status: 500 });
    }

    const headers: GraphQLRequestHeaders = { 'woocommerce-session': `Session ${sessionToken}` };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    const client = getClient();
    client.setHeaders(headers);

    const input = {
      sessionData: [
        {
          key: 'client_session_id',
          value: clientSessionId,
        },
        {
          key: 'client_session_id_expiration',
          value: timeout,
        },
      ],
    };
    const results = await client.request<UpdateSessionMutation>(
      UpdateSessionDocument,
      { input },
    );

    if (!results.updateSession || !results.updateSession.customer) {
      const message = 'Failed to update session';
      return NextResponse.json({ errors: { message } }, { status: 500 });
    }

    const {
      cartUrl,
      checkoutUrl,
      accountUrl,
    } = results.updateSession.customer;

    // const cartUrl = generateUrl(sessionToken, clientSessionId, ActionTypes.Cart);
    // const checkoutUrl = generateUrl(sessionToken, clientSessionId, ActionTypes.Checkout);
    // const accountUrl = generateUrl(sessionToken, clientSessionId, ActionTypes.Account);

    return NextResponse.json({ cartUrl, checkoutUrl, accountUrl });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ errors: { message: 'Sorry, something went wrong' } }, { status: 500 });
  }
}
