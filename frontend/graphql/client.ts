import { GraphQLClient } from 'graphql-request';
import { getSdk } from './generated';

let client: GraphQLClient;
export function getClient() {
  const endpoint = process.env.GRAPHQL_ENDPOINT
  if (!endpoint) {
    throw new Error('GRAPHQL_ENDPOINT is not defined')
  }

  if (!client) {
    client = new GraphQLClient(endpoint);
  }

  return getSdk(client);
}