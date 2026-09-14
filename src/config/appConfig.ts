let config: any = null;

export const loadConfig = async () => {
  if (config) return config;

  if (import.meta.env.VITE_GRAPHQL_ENDPOINT) {
    config = { GRAPHQL_BACKENDURL: import.meta.env.VITE_GRAPHQL_ENDPOINT };
    return config;
  }

  try {
    const res = await fetch('/config.json');
    if (res.ok) {
      config = await res.json();
      return config;
    }
  } catch (err) {
    // fallback
  }

  config = { GRAPHQL_BACKENDURL: '/graphql/async/' };
  return config;
};

