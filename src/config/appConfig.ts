import { Capacitor } from '@capacitor/core';

export const PRIMARY_GRAPHQL_ENDPOINT = 'https://politiaware-api-render.samadhikar.com/graphql/async/';
export const SECONDARY_GRAPHQL_ENDPOINT = 'https://politiaware-api-gcp.samadhikar.com/graphql/async/';
export const DEFAULT_PRIMARY_TIMEOUT_MS = 2000;
export const DEFAULT_SECONDARY_TIMEOUT_MS = 3000;

// Backward-compatible alias
export const DEFAULT_GRAPHQL_ENDPOINT = PRIMARY_GRAPHQL_ENDPOINT;

export interface AppConfig {
  GRAPHQL_BACKENDURL: string;
  SECONDARY_GRAPHQL_BACKENDURL?: string;
  PRIMARY_TIMEOUT_MS?: number;
  SECONDARY_TIMEOUT_MS?: number;
  MIN_APP_VERSION?: string;
  LATEST_APP_VERSION?: string;
  MIN_ANDROID_VERSION?: string;
  LATEST_ANDROID_VERSION?: string;
  FORCE_UPDATE?: boolean;
  ANDROID_UPDATE_URL?: string;
  UPDATE_RELEASE_NOTES?: string;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  GRAPHQL_BACKENDURL: PRIMARY_GRAPHQL_ENDPOINT,
  SECONDARY_GRAPHQL_BACKENDURL: SECONDARY_GRAPHQL_ENDPOINT,
  PRIMARY_TIMEOUT_MS: DEFAULT_PRIMARY_TIMEOUT_MS,
  SECONDARY_TIMEOUT_MS: DEFAULT_SECONDARY_TIMEOUT_MS,
  MIN_APP_VERSION: '0.0.1',
  LATEST_APP_VERSION: '0.0.1',
  FORCE_UPDATE: false,
  ANDROID_UPDATE_URL: 'https://play.google.com/store/apps/details?id=io.ionic.starter',
  UPDATE_RELEASE_NOTES: 'Latest civic updates and stability improvements.',
};

let config: AppConfig | null = null;

export const getPrimaryGraphQLUrl = (): string => {
  if (config?.GRAPHQL_BACKENDURL) {
    return config.GRAPHQL_BACKENDURL;
  }

  if (Capacitor.isNativePlatform()) {
    try {
      const cached = localStorage.getItem('GRAPHQL_BACKENDURL');
      if (cached) {
        config = {
          ...(config || DEFAULT_APP_CONFIG),
          GRAPHQL_BACKENDURL: cached,
        };
        return cached;
      }
    } catch {
      // ignore
    }
  }

  if (import.meta.env.VITE_GRAPHQL_ENDPOINT) {
    return import.meta.env.VITE_GRAPHQL_ENDPOINT;
  }
  return PRIMARY_GRAPHQL_ENDPOINT;
};

export const getGraphQLUrl = getPrimaryGraphQLUrl;

export const getSecondaryGraphQLUrl = (): string => {
  if (config?.SECONDARY_GRAPHQL_BACKENDURL) {
    return config.SECONDARY_GRAPHQL_BACKENDURL;
  }

  if (import.meta.env.VITE_SECONDARY_GRAPHQL_ENDPOINT) {
    return import.meta.env.VITE_SECONDARY_GRAPHQL_ENDPOINT;
  }
  return SECONDARY_GRAPHQL_ENDPOINT;
};

export const getPrimaryTimeoutMs = (): number => {
  if (typeof config?.PRIMARY_TIMEOUT_MS === 'number' && config.PRIMARY_TIMEOUT_MS > 0) {
    return config.PRIMARY_TIMEOUT_MS;
  }

  if (import.meta.env.VITE_PRIMARY_TIMEOUT_MS) {
    const parsed = parseInt(import.meta.env.VITE_PRIMARY_TIMEOUT_MS, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return DEFAULT_PRIMARY_TIMEOUT_MS;
};

export const getSecondaryTimeoutMs = (): number => {
  if (typeof config?.SECONDARY_TIMEOUT_MS === 'number' && config.SECONDARY_TIMEOUT_MS > 0) {
    return config.SECONDARY_TIMEOUT_MS;
  }

  if (import.meta.env.VITE_SECONDARY_TIMEOUT_MS) {
    const parsed = parseInt(import.meta.env.VITE_SECONDARY_TIMEOUT_MS, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return DEFAULT_SECONDARY_TIMEOUT_MS;
};

export const loadConfig = async (): Promise<AppConfig> => {
  if (config) return config;

  try {
    const res = await fetch('/config.json');
    if (res.ok) {
      const data = await res.json();
      if (data?.GRAPHQL_BACKENDURL) {
        config = { ...DEFAULT_APP_CONFIG, ...data };
        if (Capacitor.isNativePlatform()) {
          try {
            localStorage.setItem('GRAPHQL_BACKENDURL', data.GRAPHQL_BACKENDURL);
          } catch {
            // ignore
          }
        }
        return config!;
      }
    }
  } catch {
    // fallback
  }

  if (import.meta.env.VITE_GRAPHQL_ENDPOINT) {
    config = {
      ...DEFAULT_APP_CONFIG,
      GRAPHQL_BACKENDURL: import.meta.env.VITE_GRAPHQL_ENDPOINT,
      ...(import.meta.env.VITE_SECONDARY_GRAPHQL_ENDPOINT
        ? { SECONDARY_GRAPHQL_BACKENDURL: import.meta.env.VITE_SECONDARY_GRAPHQL_ENDPOINT }
        : {}),
    };
    return config;
  }

  config = { ...DEFAULT_APP_CONFIG };
  return config;
};
