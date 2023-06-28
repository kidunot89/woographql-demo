import { GraphQLClient } from 'graphql-request';
import { print } from 'graphql';

import {
  LoginDocument,
  LoginMutation,
  Customer,
  Cart,
} from '@woographql/graphql';
import dotEnv from 'dotenv-flow';

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  authToken: string;
  refreshToken: string;
  sessionToken: string;
} | {
  errors: {
    message: string;
    data?: unknown;
  }
}

type RequestBody = ({
  auth: string;
  username: undefined;
  password: undefined;
} | {
  auth: undefined;
  username: string;
  password: string;
})

dotEnv.config({ silent: true });
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  try {
    const { username, password } = req.body as RequestBody;
    const graphQLClient = new GraphQLClient(process.env.GRAPHQL_ENDPOINT as string);

    if (!username || !password) {
      res.status(500).json({
        errors: {
          message: 'Proper credential must be provided for authentication',
        },
      });
      return;
    }

    const { data, headers } = await graphQLClient.rawRequest<LoginMutation>(print(LoginDocument), { username, password });
    const sessionToken = headers.get('woocommerce-session')?.split(' ')[1] || '';

    if (!data?.login) {
      res.status(500).json({ errors: { message: 'Login failed.' } });
      return;
    }

    if (!sessionToken) {
      res.status(500).json({ errors: { message: 'Failed to retrieve session token.' } });
      return;
    }

    const { authToken, refreshToken, customer } = data?.login;
    if (!authToken || !refreshToken || !customer) {
      res.status(500).json({ errors: { message: 'Failed to retrieve credentials.' } });
      return;
    }

    res.json({ authToken, refreshToken, sessionToken });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: { message: 'Sorry, something went wrong' } });
  }
}

export default handler;