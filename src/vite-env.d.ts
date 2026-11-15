/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_ENDPOINT?: string;
  readonly VITE_SECONDARY_GRAPHQL_ENDPOINT?: string;
  readonly VITE_PRIMARY_TIMEOUT_MS?: string;
  readonly VITE_SECONDARY_TIMEOUT_MS?: string;
  readonly VITE_RETRY_TIMEOUT_MS?: string;
  readonly VITE_ADSENSE_PUB_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  adsbygoogle?: Record<string, unknown>[];
}
