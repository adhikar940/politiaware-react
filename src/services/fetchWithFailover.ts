/**
 * fetchWithFailover
 *
 * Executes a 4-step failover and retry strategy across Primary and Secondary endpoints:
 * 1. Attempt Primary with primaryInitialTimeoutMs (default: 2000ms)
 * 2. If Primary fails/times out, try Secondary with secondaryTimeoutMs (default: 5000ms)
 * 3. If Secondary fails/times out, retry Primary with retryTimeoutMs (default: 5000ms)
 *    (gives Primary ~7s to finish waking up from cold sleep)
 * 4. If Primary retry fails/times out, retry Secondary with retryTimeoutMs (default: 5000ms)
 *    (gives Secondary ~12s to finish waking up)
 * Total maximum time: 2s + 5s + 5s + 5s = 17 seconds.
 *
 * If all 4 attempts fail, throws an Error so that Apollo Client / UI displays the error state.
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
  primaryInitialTimeoutMs = 2000,
  secondaryTimeoutMs = 5000,
  retryTimeoutMs = 5000
): Promise<Response> {
  const normPrimary = normalizeUrl(primaryUrl);
  const normSecondary = normalizeUrl(secondaryUrl);

  const attempts = [
    { label: 'Primary', url: normPrimary, timeoutMs: primaryInitialTimeoutMs },
    { label: 'Secondary', url: normSecondary, timeoutMs: secondaryTimeoutMs },
    { label: 'Primary (Retry)', url: normPrimary, timeoutMs: retryTimeoutMs },
    { label: 'Secondary (Retry)', url: normSecondary, timeoutMs: retryTimeoutMs },
  ];

  const failureLog: string[] = [];

  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    try {
      const response = await fetchWithTimeout(attempt.url, options, attempt.timeoutMs);
      if (!response.ok && response.status >= 500) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response;
    } catch (err: unknown) {
      if (options.signal?.aborted) {
        throw err;
      }

      const errorMsg = err instanceof Error ? err.message : String(err);
      failureLog.push(`${attempt.label} (${attempt.url}) failed (${errorMsg})`);

      if (i < attempts.length - 1) {
        const nextAttempt = attempts[i + 1];
        console.warn(
          `${attempt.label} (${attempt.url}) failed after ${attempt.timeoutMs}ms (${errorMsg}). Failing over to ${nextAttempt.label} (${nextAttempt.url}) with ${nextAttempt.timeoutMs}ms timeout...`
        );
      }
    }
  }

  console.error(
    `All 4 endpoint attempts failed (17s total budget):\n${failureLog.join('\n')}`
  );
  throw new Error(
    `Failed to reach backend services after 4 attempts (17s total budget):\n${failureLog.join('; ')}`
  );
}

