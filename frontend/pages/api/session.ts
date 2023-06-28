import { GraphQLClient } from 'graphql-request';
import {
  GetSessionDocument,
  GetSessionQuery,
  Cart,
  Customer,
} from '@woographql/graphql';
import dotEnv from 'dotenv-flow';

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  customer: Customer;
  cart: Cart;
} | {
  errors: {
    message: string;
    data?: unknown;
  }
}

type RequestBody = {
  sessionToken: string;
  authToken?: string;
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
    const { sessionToken, authToken } = req.body as RequestBody;

    if (!sessionToken) {
      res.status(500).json({ errors: { message: 'Session not started' } });
      return;
    }
    const headers: GraphQLRequestHeaders = { 'woocommerce-session': `Session ${sessionToken}` };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const graphQLClient = new GraphQLClient(process.env.GRAPHQL_ENDPOINT as string, { headers });

    const results = await graphQLClient.request<GetSessionQuery>(
      GetSessionDocument,
    );

    const customer = results?.customer as Customer;
    const cart = results?.cart as Cart;

    if (!customer) {
      res.status(500).json({ errors: { message: 'Failed to retrieve customer data.' } });
      return;
    }

    if (!cart) {
      res.status(500).json({ errors: { message: 'Failed to retrieve cart data.' } });
      return;
    }

    res.json({ customer, cart });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: { message: 'Sorry, something went wrong' } });
  }
}

export default handler;