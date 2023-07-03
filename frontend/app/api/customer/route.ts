import { NextResponse } from 'next/server';

import {
  UpdateCustomerInput,
  UpdateCustomerDocument,
  UpdateCustomerMutation,
  Customer,
  getClient,
} from '@woographql/graphql';

type RequestBody = {
  sessionToken: string;
  authToken: string;
  input: UpdateCustomerInput;
}

export async function POST(request: Request) {
  try {
    const { sessionToken, authToken, input } = await request.json() as RequestBody;

    if (!authToken || !sessionToken) {
      return NextResponse.json({ errors: { message: 'Missing credentials' } }, { status: 500 });
    }

    const headers = {
      Authorization: `Bearer ${authToken}`,
      'woocommerce-session': `Session ${sessionToken}`,
    };
    const client = getClient();
    client.setHeaders(headers);

    const results = await client.request<UpdateCustomerMutation>(
      UpdateCustomerDocument,
      { input },
    );

    const customer = results?.updateCustomer?.customer as Customer;
    if (!customer) {
      const message = 'Failed to update customer data';
      return NextResponse.json({ errors: { message } }, { status: 500 });
    }

    return NextResponse.json({ customer });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ errors: { message: 'Sorry, something went wrong' } }, { status: 500 });
  }
}