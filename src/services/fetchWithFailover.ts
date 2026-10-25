/**
 * fetchWithFailover
 *
 * Executes a fetch request to primaryUrl with primaryTimeoutMs (default: 2000ms).
 * If the primary endpoint does not respond within the timeout, returns a 5xx server error,
 * or encounters a network error, it automatically fails over to secondaryUrl with
 * secondaryTimeoutMs (default: 3000ms).
 *
 * If both endpoints fail or time out, it throws an Error so that Apollo Client and the UI
 * can display the server unreachable error state.
 */
function normalizeUrl(url: string): string {
  if (!url) return url;
  return url.endsWith('/') ? url : `${url}/`;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  let isTimedOut = false;
  const timer = setTimeout(() => {
    isTimedOut = true;
    controller.abort();
  }, timeoutMs);

  const callerSignal = options.signal;
  let callerAbortHandler: (() => void) | undefined;
  if (callerSignal) {
    callerAbortHandler = () => {
      clearTimeout(timer);
      controller.abort();
    };
    callerSignal.addEventListener('abort', callerAbortHandler);
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err: unknown) {
    if (callerSignal?.aborted) {
      throw err;
    }
    if (isTimedOut) {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
    if (callerSignal && callerAbortHandler) {
      callerSignal.removeEventListener('abort', callerAbortHandler);
    }
  }
}

export async function fetchWithFailover(
  primaryUrl: string,
  secondaryUrl: string,
  options: RequestInit = {},
  primaryTimeoutMs = 2000,
  secondaryTimeoutMs = 3000
): Promise<Response> {
  const normPrimary = normalizeUrl(primaryUrl);
  const normSecondary = normalizeUrl(secondaryUrl);

  try {
    const primaryResponse = await fetchWithTimeout(normPrimary, options, primaryTimeoutMs);
    if (!primaryResponse.ok && primaryResponse.status >= 500) {
      throw new Error(`HTTP ${primaryResponse.status}`);
    }
    return primaryResponse;
  } catch (err: unknown) {
    if (options.signal?.aborted) {
      throw err;
    }

    const primaryErrorMsg = err instanceof Error ? err.message : String(err);
    console.warn(
      `Primary endpoint (${normPrimary}) failed (${primaryErrorMsg}). Failing over to secondary (${normSecondary}) with ${secondaryTimeoutMs}ms timeout...`
    );

    try {
      const secondaryResponse = await fetchWithTimeout(normSecondary, options, secondaryTimeoutMs);
      if (!secondaryResponse.ok && secondaryResponse.status >= 500) {
        throw new Error(`HTTP ${secondaryResponse.status}`);
      }
      return secondaryResponse;
    } catch (secondaryErr: unknown) {
      if (options.signal?.aborted) {
        throw secondaryErr;
      }
      const secErrorMsg = secondaryErr instanceof Error ? secondaryErr.message : String(secondaryErr);
      console.error(
        `Secondary endpoint (${normSecondary}) also failed (${secErrorMsg}). Both endpoints failed.`
      );
      throw new Error(
        `Failed to reach backend services. Primary: ${primaryErrorMsg}; Secondary: ${secErrorMsg}`
      );
    }
  }
}

