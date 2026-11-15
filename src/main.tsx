import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import {
  getPrimaryGraphQLUrl,
  getSecondaryGraphQLUrl,
  getPrimaryTimeoutMs,
  getSecondaryTimeoutMs,
  getRetryTimeoutMs,
  loadConfig,
} from './config';
import { fetchWithFailover } from './services/fetchWithFailover';
import { loadAdSenseScript } from './utils/loadAdSense';

// Load Google AdSense dynamically only when on Web, non-localhost, and VITE_ADSENSE_PUB_ID is set
loadAdSenseScript();

// Eagerly trigger runtime configuration fetch if available
loadConfig().catch((err) => {
  console.warn('Failed to load runtime config, falling back to default/env GraphQL endpoint:', err);
});

const httpLink = createHttpLink({
  uri: () => getPrimaryGraphQLUrl(),
  fetch: (input, init) => {
    const primaryUrl = typeof input === 'string' ? input : input.toString();
    const secondaryUrl = getSecondaryGraphQLUrl();
    let primaryTimeoutMs = getPrimaryTimeoutMs();
    let secondaryTimeoutMs = getSecondaryTimeoutMs();
    let retryTimeoutMs = getRetryTimeoutMs();

    // Institutional chart summary queries or large batch queries (e.g. limit 5000) fetch
    // comprehensive datasets (up to 4,108 MLAs, 544 MPs) that require extended backend serialization time.
    const bodyStr = typeof init?.body === 'string' ? init.body : '';
    const isChartOrBulkQuery =
      bodyStr.includes('GetChartSummary') ||
      bodyStr.includes('"limit":5000') ||
      bodyStr.includes('"limit": 5000') ||
      bodyStr.includes('limit: 5000') ||
      bodyStr.includes('limit:5000');

    if (isChartOrBulkQuery) {
      primaryTimeoutMs = Math.max(primaryTimeoutMs, 20000);
      secondaryTimeoutMs = Math.max(secondaryTimeoutMs, 30000);
      retryTimeoutMs = Math.max(retryTimeoutMs, 30000);
    }

    return fetchWithFailover(
      primaryUrl,
      secondaryUrl,
      init,
      primaryTimeoutMs,
      secondaryTimeoutMs,
      retryTimeoutMs
    );
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
