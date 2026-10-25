import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import {
  getPrimaryGraphQLUrl,
  getSecondaryGraphQLUrl,
  getPrimaryTimeoutMs,
  getSecondaryTimeoutMs,
  loadConfig,
} from './config';
import { fetchWithFailover } from './services/fetchWithFailover';

// Eagerly trigger runtime configuration fetch if available
loadConfig().catch((err) => {
  console.warn('Failed to load runtime config, falling back to default/env GraphQL endpoint:', err);
});

const httpLink = createHttpLink({
  uri: () => getPrimaryGraphQLUrl(),
  fetch: (input, init) => {
    const primaryUrl = typeof input === 'string' ? input : input.toString();
    const secondaryUrl = getSecondaryGraphQLUrl();
    const primaryTimeoutMs = getPrimaryTimeoutMs();
    const secondaryTimeoutMs = getSecondaryTimeoutMs();
    return fetchWithFailover(primaryUrl, secondaryUrl, init, primaryTimeoutMs, secondaryTimeoutMs);
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
