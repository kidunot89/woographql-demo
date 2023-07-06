import { NextResponse } from 'next/server';
import { print } from 'graphql';

import {
  GetSessionDocument,
  GetSessionQuery,
  LoginDocument,
  LoginMutation,
  getClient,
} from '@woographql/graphql';

type RequestBody = ({
  auth: string;
  username: undefined;
  password: undefined;
} | {
  auth: undefined;
  username: string;
  password: string;
})

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json() as RequestBody;
    const graphQLClient = getClient();

    if (!username || !password) {
      return NextResponse.json({
        errors: {
          message: 'Proper credential must be provided for authentication',
        },
      }, { status: 500 });
    }

    const data = await graphQLClient.request<LoginMutation>(LoginDocument, { username, password });
    if (!data?.login) {
      return NextResponse.json({ errors: { message: 'Login failed.' } }, { status: 500 });
    }

    const { authToken, refreshToken } = data?.login;
    if (!authToken || !refreshToken) {
      return NextResponse.json({ errors: { message: 'Failed to retrieve credentials.' } }, { status: 500 });
    }

    graphQLClient.setHeader('Authorization', `Bearer ${data.login.authToken}`);
    const { data:_, headers } = await graphQLClient.rawRequest<GetSessionQuery>(print(GetSessionDocument));
    
    const sessionToken = headers.get('woocommerce-session');
    if (!sessionToken) {
      return NextResponse.json({ errors: { message: 'Failed to retrieve session token.' } }, { status: 500 });
    }


    return NextResponse.json({ authToken, refreshToken, sessionToken });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ errors: { message: 'Login credentials invalid.' } }, { status: 500 });
  }
}
