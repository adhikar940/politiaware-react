import {
  getPrimaryGraphQLUrl,
  getSecondaryGraphQLUrl,
  getPrimaryTimeoutMs,
  getSecondaryTimeoutMs,
  getRetryTimeoutMs,
  loadConfig,
} from '../config';
import { fetchWithFailover } from './fetchWithFailover';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchGraphQL<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  await loadConfig();
  const primaryEndpoint = getPrimaryGraphQLUrl();
  const secondaryEndpoint = getSecondaryGraphQLUrl();
  const primaryTimeoutMs = getPrimaryTimeoutMs();
  const secondaryTimeoutMs = getSecondaryTimeoutMs();
  const retryTimeoutMs = getRetryTimeoutMs();

  if (!primaryEndpoint) throw new Error('GraphQL endpoint not defined');

  const response = await fetchWithFailover(
    primaryEndpoint,
    secondaryEndpoint,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    },
    primaryTimeoutMs,
    secondaryTimeoutMs,
    retryTimeoutMs
  );

  const json = await response.json();

  if (json.errors) {
    console.error('GraphQL errors:', json.errors);
    throw new Error('GraphQL query failed');
  }
  return json.data;
}