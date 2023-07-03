import { NextResponse } from 'next/server';
import { print } from 'graphql';

import {
  AddToCartMutation,
  AddToCartDocument,
  UpdateCartItemQuantitiesMutation,
  UpdateCartItemQuantitiesDocument,
  RemoveItemsFromCartMutation,
  RemoveItemsFromCartDocument,
  Cart,
  getClient,
} from '@woographql/graphql';
import { CartAction } from '@woographql/utils/session';

type RequestBody = {
  sessionToken: string;
  authToken?: string;
  input: CartAction;
}

type GraphQLRequestHeaders = {
  Authorization?: string;
  'woocommerce-session': string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as RequestBody;

    if (!body.sessionToken) {
      return NextResponse.json({ errors: { message: 'Session not started' } }, { status: 500});
    }

    const headers: GraphQLRequestHeaders = { 'woocommerce-session': `Session ${body.sessionToken}` };
    if (body.authToken) {
      headers.Authorization = `Bearer ${body.authToken}`;
    }

    const graphQLClient = getClient();
    graphQLClient.setHeaders(headers);

    if (!body.input) {
      return NextResponse.json({ errors: { message: 'No input provided' } }, { status: 500 });
    }

    const { mutation, ...input } = body.input;
    if (!mutation) {
      return NextResponse.json({ errors: { message: 'No mutation provided' } }, { status: 500 });
    }

    let cart: Cart;
    let sessionToken: string|null = null;
    let results;
    switch (mutation) {
      case 'add':
        results = await graphQLClient.rawRequest<AddToCartMutation>(
          print(AddToCartDocument),
          { ...input },
        );

        cart = results.data?.addToCart?.cart as Cart;
        sessionToken = results.headers.get('woocommerce-session');
        break;
      case 'update':
        results = await graphQLClient.rawRequest<UpdateCartItemQuantitiesMutation>(
          print(UpdateCartItemQuantitiesDocument),
          { ...input },
        );

        cart = results.data?.updateItemQuantities?.cart as Cart;
        sessionToken = results.headers.get('woocommerce-session') || body.sessionToken;
        break;
      case 'remove':
        results = await graphQLClient.rawRequest<RemoveItemsFromCartMutation>(
          print(RemoveItemsFromCartDocument),
          { ...input },
        );

        cart = results.data?.removeItemsFromCart?.cart as Cart;
        sessionToken = results.headers.get('woocommerce-session') || body.sessionToken;
        break;
      default:
        return NextResponse.json({ errors: { message: 'Invalid mutation provided' } }, { status: 500 });
    }

    if (!cart || !sessionToken) {
      const message = 'No cart or session token returned from WooCommerce';
      return NextResponse.json({ errors: { message } }, { status: 500 });
    }

    return NextResponse.json({ cart, sessionToken });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ errors: { message: 'Sorry, something went wrong' } }, { status: 500 });
  }
}