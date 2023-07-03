import { NextResponse } from 'next/server';
import {
  GetSessionDocument,
  GetSessionQuery,
  Cart,
  Customer,
  getClient,
} from '@woographql/graphql';
import dotEnv from 'dotenv-flow';

type RequestBody = {
  sessionToken: string;
  authToken?: string;
}

type GraphQLRequestHeaders = {
  'woocommerce-session': string;
  Authorization?: string;
}

dotEnv.config({ silent: true });

export async function POST(request: Request) {
  try {
    const { sessionToken, authToken } = await request.json() as RequestBody;

    if (!sessionToken) {
      return NextResponse.json({ errors: { message: 'Session not started' } }, { status: 500 });
    }
    const headers: GraphQLRequestHeaders = { 'woocommerce-session': `Session ${sessionToken}` };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    const graphQLClient = getClient();
    graphQLClient.setHeaders(headers);

    const results = await graphQLClient.request<GetSessionQuery>(
      GetSessionDocument,
    );

    const customer = results?.customer as Customer;
    const cart = results?.cart as Cart;

    if (!customer) {
      return NextResponse.json({ errors: { message: 'Failed to retrieve customer data.' } }, { status: 500 });
    }

    if (!cart) {
      return NextResponse.json({ errors: { message: 'Failed to retrieve cart data.' } }, { status: 500 });
    }

    return NextResponse.json({ customer, cart });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ errors: { message: 'Sorry, something went wrong' } }, { status: 500 });
  }
}