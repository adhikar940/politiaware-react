import { loadConfig } from '../config';
export async function fetchGraphQL<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    const config = await loadConfig();
    const endpoint = config.GRAPHQL_BACKENDURL;
  
    if (!endpoint) throw new Error("GraphQL endpoint not defined in env variables");
  
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });
  
    const json = await response.json();
  
    if (json.errors) {
      console.error('GraphQL errors:', json.errors);
      throw new Error('GraphQL query failed');
    }
    return json.data;
  }
  