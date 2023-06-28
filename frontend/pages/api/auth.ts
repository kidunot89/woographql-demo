import { GraphQLClient } from 'graphql-request';
import { print } from 'graphql';
import dotEnv from 'dotenv-flow';

import {
  GetSessionDocument,
  GetSessionQuery,
  RefreshAuthTokenDocument,
  RefreshAuthTokenMutation,
} from '@woographql/graphql';

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  authToken?: string;
  sessionToken: string;
} | {
  errors?: {
    message: string;
    data?: unknown;
  }
}

dotEnv.config({ silent: true });
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  try {
    const graphQLClient = new GraphQLClient(process.env.GRAPHQL_ENDPOINT as string);
    console.log(req.method);
    if (req.method !== 'POST') {
      const { data, headers } = await graphQLClient.rawRequest<GetSessionQuery>(
        print(GetSessionDocument),
      );

      const cart = data?.cart;
      const customer = data?.customer;
      const sessionToken = headers.get('woocommerce-session');

      if (!cart || !customer || !sessionToken) {
        res.status(500).json({ errors: { message: 'Failed to retrieve session credentials.' } });
        return;
      }

      res.json({ sessionToken });
    } else {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(500).json({ errors: { message: 'No refresh token provided' } });
        return;
      }

      const { data, headers } = await graphQLClient.rawRequest<RefreshAuthTokenMutation>(
        print(RefreshAuthTokenDocument),
        { refreshToken },
      );

      const authToken = data?.refreshJwtAuthToken?.authToken;
      const sessionToken = headers.get('woocommerce-session');

      if (!authToken || !sessionToken) {
        res.status(500).json({ errors: { message: 'Failed to retrieve session credentials.' } });
        return;
      }

      res.json({ authToken, sessionToken });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: { message: 'Sorry, something went wrong' } });
  }
}

export default handler;