import { GraphQLClient } from 'graphql-request';
import {
  UpdateCustomerInput,
  UpdateCustomerDocument,
  UpdateCustomerMutation,
  Customer,
} from '@woographql/graphql';
import dotEnv from 'dotenv-flow';

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  customer?: Customer;
  errors?: {
    message: string;
    data?: unknown;
  }
}

type RequestBody = {
  sessionToken: string;
  authToken: string;
  input: UpdateCustomerInput;
}

dotEnv.config({ silent: true });
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  try {
    const { sessionToken, authToken, input } = req.body as RequestBody;

    if (!authToken || !sessionToken) {
      res.status(500).json({ errors: { message: 'Missing credentials' } });
      return;
    }
    const graphQLClient = new GraphQLClient(
      process.env.GRAPHQL_ENDPOINT as string,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'woocommerce-session': `Session ${sessionToken}`,
        },
      },
    );

    const results = await graphQLClient.request<UpdateCustomerMutation>(
      UpdateCustomerDocument,
      { input },
    );

    const customer = results?.updateCustomer?.customer as Customer;
    if (!customer) {
      const message = 'Failed to update customer data';
      res.status(500).json({ errors: { message } });
      return;
    }

    res.json({ customer });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: { message: 'Sorry, something went wrong' } });
  }
}

export default handler;