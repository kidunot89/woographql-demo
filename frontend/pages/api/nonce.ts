import { GraphQLClient } from 'graphql-request';
import dotEnv from 'dotenv-flow';

import { UpdateSessionDocument, UpdateSessionMutation } from '@woographql/graphql';
import { ActionTypes, generateUrl, time } from '@woographql/utils/nonce';

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  cartUrl: string;
  checkoutUrl: string;
  accountUrl: string
} | {
  errors: {
    message: string;
    data?: unknown;
  }
}

type RequestBody = {
  sessionToken: string;
  authToken?: string;
  clientSessionId: string;
  timeout?: number;
}

type GraphQLRequestHeaders = {
  'woocommerce-session': string;
  Authorization?: string;
}

dotEnv.config({ silent: true });
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  try {
    const {
      sessionToken,
      authToken,
      clientSessionId,
      timeout,
    } = req.body as RequestBody;

    if (!sessionToken) {
      res.status(500).json({ errors: { message: 'No session started.' } });
      return;
    }

    if (!clientSessionId) {
      res.status(500).json({ errors: { message: 'Client Session ID not provided' } });
      return;
    }

    const headers: GraphQLRequestHeaders = { 'woocommerce-session': `Session ${sessionToken}` };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    const graphQLClient = new GraphQLClient(process.env.GRAPHQL_ENDPOINT as string, { headers });

    const input = {
      sessionData: [
        {
          key: 'client_session_id',
          value: clientSessionId,
        },
        {
          key: 'client_session_id_expiration',
          value: `${timeout || time() + 3600}`,
        },
      ],
    };
    const results = await graphQLClient.request<UpdateSessionMutation>(
      UpdateSessionDocument,
      { input },
    );

    if (!results.updateSession) {
      const message = 'Failed to update session';
      res.status(500).json({ errors: { message } });
      return;
    }

    const cartUrl = generateUrl(sessionToken, clientSessionId, ActionTypes.Cart);
    const checkoutUrl = generateUrl(sessionToken, clientSessionId, ActionTypes.Checkout);
    const accountUrl = generateUrl(sessionToken, clientSessionId, ActionTypes.Account);
    
    res.json({ cartUrl, checkoutUrl, accountUrl });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: { message: 'Sorry, something went wrong' } });
  }
}

export default handler;