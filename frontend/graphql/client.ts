import { GraphQLClient } from 'graphql-request';
import deepmerge from 'deepmerge';

import {
  RootQueryToProductConnectionWhereArgs,
  Product,
  ProductCategory,
  PaColor,
  getSdk,
  RootQueryToProductCategoryConnectionWhereArgs,
  RootQueryToPaColorConnectionWhereArgs,
  ProductIdTypeEnum,
} from './generated';

let client: GraphQLClient;
export function getClient() {
  const endpoint = process.env.GRAPHQL_ENDPOINT
  if (!endpoint) {
    throw new Error('GRAPHQL_ENDPOINT is not defined')
  }

  if (!client) {
    client = new GraphQLClient(endpoint);
  }

  return client;
}

export function getClientWithSdk() {
  return getSdk(getClient());
}

const initialConnectionResults = {
  pageInfo: {
    hasNextPage: true,
    endCursor: null,
  },
  edges: [],
  nodes: [],
};

export async function fetchProducts(
  pageSize: number, 
  pageLimit = 0,
  where?: RootQueryToProductConnectionWhereArgs) {
  try {
    const client = getClientWithSdk();
    let data = { products: initialConnectionResults }
    let after = '';
    let count = 0
    while(data.products.pageInfo.hasNextPage && (pageLimit === 0 || count < pageLimit)) {
      const next = await client.GetProducts({
        first: pageSize,
        after,
        where,
      });

      data = deepmerge(data, next);
      after = next.products?.pageInfo.endCursor || '';
      count++;
    }

    return (data.products.nodes) as Product[];
  } catch (err) {
    console.error(err || 'Failed to fetch product listing!!!');
  }
}

export async function fetchCategories(
  pageSize: number,
  pageLimit = 0,
  where?: RootQueryToProductCategoryConnectionWhereArgs
) {
  try {
    const client = getClientWithSdk();
    let data = { productCategories: initialConnectionResults }
    let after = '';
    let count = 0
    while(data.productCategories.pageInfo.hasNextPage && (pageLimit === 0 || count < pageLimit)) {
      const next = await client.GetShopCategories({
        first: pageSize,
        after,
        where,
      });

      data = deepmerge(data, next);
      after = next.productCategories?.pageInfo.endCursor || '';
      count++;
    }

    return (data.productCategories.nodes) as ProductCategory[];

  } catch (err) {
    console.error(err || 'Failed to fetch product categories!!!');
  }
}

export async function fetchColors(
  pageSize: number,
  pageLimit = 0,
  where?: RootQueryToPaColorConnectionWhereArgs
) {
  try {
    const client = getClientWithSdk();
    let data = { allPaColor: initialConnectionResults }
    let after = '';
    let count = 0
    while(data.allPaColor.pageInfo.hasNextPage && (pageLimit === 0 || count < pageLimit)) {
      const next = await client.GetShopColors({
        first: pageSize,
        after,
        where
      });

      data = deepmerge(data, next);
      after = next.allPaColor?.pageInfo.endCursor || '';
      count++;
    }

    return (data.allPaColor.nodes) as PaColor[];
  } catch (err) {
    console.error(err || 'Failed to fetch product color attributes!!!');
  }
}

export async function fetchProductBy(slug: string, idType: ProductIdTypeEnum) {
  try {
    const client = getClientWithSdk();
    const data = await client.GetProduct({
      id: slug,
      idType: idType,
    });

    if (!data.product) {
      throw new Error('Product not found!!!');
    }

    return data.product as Product;
  } catch (err) {
    console.error(err || 'Failed to fetch product data!!!');
  }
}