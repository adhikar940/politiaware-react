export async function onRequest(context) {
  const endpoint =
    context.env.GRAPHQL_BACKENDURL ||
    context.env.VITE_GRAPHQL_ENDPOINT ||
    'https://politiaware-api-render.samadhikar.com/graphql/async/';

  const secondaryEndpoint =
    context.env.SECONDARY_GRAPHQL_BACKENDURL ||
    context.env.VITE_SECONDARY_GRAPHQL_ENDPOINT ||
    'https://politiaware-api-gcp.samadhikar.com/graphql/async/';

  const timeoutMs = parseInt(
    context.env.PRIMARY_TIMEOUT_MS || context.env.VITE_PRIMARY_TIMEOUT_MS || '2000',
    10
  );

  const secondaryTimeoutMs = parseInt(
    context.env.SECONDARY_TIMEOUT_MS || context.env.VITE_SECONDARY_TIMEOUT_MS || '5000',
    10
  );

  const retryTimeoutMs = parseInt(
    context.env.RETRY_TIMEOUT_MS || context.env.VITE_RETRY_TIMEOUT_MS || '5000',
    10
  );

  const minVersion =
    context.env.MIN_APP_VERSION ||
    context.env.MIN_ANDROID_VERSION ||
    '0.0.1';
  const latestVersion =
    context.env.LATEST_APP_VERSION ||
    context.env.LATEST_ANDROID_VERSION ||
    '0.0.1';
  const forceUpdate = context.env.FORCE_UPDATE === 'true';
  const updateUrl =
    context.env.ANDROID_UPDATE_URL ||
    'https://play.google.com/store/apps/details?id=io.ionic.starter';
  const releaseNotes =
    context.env.UPDATE_RELEASE_NOTES ||
    'Latest civic dataset, bug fixes, and performance improvements.';

  return new Response(
    JSON.stringify({
      GRAPHQL_BACKENDURL: endpoint,
      SECONDARY_GRAPHQL_BACKENDURL: secondaryEndpoint,
      PRIMARY_TIMEOUT_MS: timeoutMs,
      SECONDARY_TIMEOUT_MS: secondaryTimeoutMs,
      RETRY_TIMEOUT_MS: retryTimeoutMs,
      MIN_APP_VERSION: minVersion,
      LATEST_APP_VERSION: latestVersion,
      FORCE_UPDATE: forceUpdate,
      ANDROID_UPDATE_URL: updateUrl,
      UPDATE_RELEASE_NOTES: releaseNotes,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
