import { GraphQLClient } from 'graphql-request';
import { print } from 'graphql';
import dotEnv from 'dotenv-flow';

import {
  AddToCartMutation,
  AddToCartDocument,
  UpdateCartItemQuantitiesMutation,
  UpdateCartItemQuantitiesDocument,
  RemoveItemsFromCartMutation,
  RemoveItemsFromCartDocument,
  Cart,
} from '@woographql/graphql';
import { CartAction } from '@woographql/utils/session';

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  cart: Cart;
  sessionToken: string;
} | {
  errors: {
    message: string;
    data?: unknown;
  }
}

type RequestBody = {
  sessionToken: string;
  authToken?: string;
  input: CartAction;
}

type GraphQLRequestHeaders = {
  Authorization?: string;
  'woocommerce-session': string;
}

dotEnv.config({ silent: true });
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  try {
    const body = req.body as RequestBody;

    if (!body.sessionToken) {
      res.status(500).json({ errors: { message: 'Session not started' } });
      return;
    }

    const headers: GraphQLRequestHeaders = { 'woocommerce-session': `Session ${body.sessionToken}` };
    if (body.authToken) {
      headers.Authorization = `Bearer ${body.authToken}`;
    }

    console.log('request session token', body.sessionToken);
    const graphQLClient = new GraphQLClient(process.env.GRAPHQL_ENDPOINT as string, { headers });

    if (!body.input) {
      res.status(500).json({ errors: { message: 'No input provided' } });
      return;
    }

    const { mutation, ...input } = body.input;
    if (!mutation) {
      res.status(500).json({ errors: { message: 'No mutation provided' } });
      return;
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
        res.status(500).json({ errors: { message: 'Invalid mutation provided' } });
        return;
    }

    console.log('response session token', sessionToken);
    if (!cart || !sessionToken) {
      const message = 'No cart or session token returned from WooCommerce';
      res.status(500).json({ errors: { message } });
      return;
    }

    res.json({ cart, sessionToken });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: { message: 'Sorry, something went wrong' } });
  }
}

export default handler;