import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithFailover } from './fetchWithFailover';

describe('fetchWithFailover', () => {
  const primaryUrl = 'https://politiaware-api-render.samadhikar.com/graphql/async/';
  const secondaryUrl = 'https://politiaware-api-gcp.samadhikar.com/graphql/async/';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns primary response on Step 1 when primary responds within 2000ms timeout', async () => {
    const mockPrimaryResponse = new Response(JSON.stringify({ data: { test: 1 } }), {
      status: 200,
    });

    const fetchSpy = vi.fn().mockImplementation((url) => {
      if (url === primaryUrl) {
        return Promise.resolve(mockPrimaryResponse);
      }
      return Promise.reject(new Error('Secondary should not be called'));
    });

    vi.stubGlobal('fetch', fetchSpy);

    const res = await fetchWithFailover(primaryUrl, secondaryUrl, {}, 2000, 5000, 5000);
    expect(res).toBe(mockPrimaryResponse);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(primaryUrl, expect.any(Object));
  });

  it('fails over to Step 2 (secondary) when primary times out after 2000ms', async () => {
    vi.useFakeTimers();

    const mockSecondaryResponse = new Response(JSON.stringify({ data: { fromSecondary: true } }), {
      status: 200,
    });

    const fetchSpy = vi.fn().mockImplementation((url, options) => {
      if (url === primaryUrl) {
        return new Promise((_, reject) => {
          options.signal?.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        });
      }
      if (url === secondaryUrl) {
        return Promise.resolve(mockSecondaryResponse);
      }
      return Promise.reject(new Error('Unknown url'));
    });

    vi.stubGlobal('fetch', fetchSpy);

    const failoverPromise = fetchWithFailover(primaryUrl, secondaryUrl, {}, 2000, 5000, 5000);

    // Fast-forward 2000ms (primary initial timeout)
    await vi.advanceTimersByTimeAsync(2000);

    const res = await failoverPromise;
    expect(res).toBe(mockSecondaryResponse);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenNthCalledWith(1, primaryUrl, expect.any(Object));
    expect(fetchSpy).toHaveBeenNthCalledWith(2, secondaryUrl, expect.any(Object));
  });

  it('retries Step 3 (Primary for 5s) when Step 1 and Step 2 fail', async () => {
    const mockPrimaryRetryResponse = new Response(JSON.stringify({ data: { awakened: true } }), {
      status: 200,
    });

    let primaryAttempts = 0;
    const fetchSpy = vi.fn().mockImplementation((url) => {
      if (url === primaryUrl) {
        primaryAttempts++;
        if (primaryAttempts === 1) {
          return Promise.reject(new Error('Primary cold starting (503)'));
        }
        return Promise.resolve(mockPrimaryRetryResponse);
      }
      if (url === secondaryUrl) {
        return Promise.reject(new Error('Secondary unavailable'));
      }
      return Promise.reject(new Error('Unknown url'));
    });

    vi.stubGlobal('fetch', fetchSpy);

    const res = await fetchWithFailover(primaryUrl, secondaryUrl, {}, 2000, 5000, 5000);
    expect(res).toBe(mockPrimaryRetryResponse);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(primaryAttempts).toBe(2);
  });

  it('retries Step 4 (Secondary for 5s) when Steps 1, 2, and 3 fail', async () => {
    const mockSecondaryRetryResponse = new Response(JSON.stringify({ data: { gcpAwake: true } }), {
      status: 200,
    });

    let secondaryAttempts = 0;
    const fetchSpy = vi.fn().mockImplementation((url) => {
      if (url === primaryUrl) {
        return Promise.reject(new Error('Primary failed'));
      }
      if (url === secondaryUrl) {
        secondaryAttempts++;
        if (secondaryAttempts === 1) {
          return Promise.reject(new Error('Secondary first attempt failed'));
        }
        return Promise.resolve(mockSecondaryRetryResponse);
      }
      return Promise.reject(new Error('Unknown url'));
    });

    vi.stubGlobal('fetch', fetchSpy);

    const res = await fetchWithFailover(primaryUrl, secondaryUrl, {}, 2000, 5000, 5000);
    expect(res).toBe(mockSecondaryRetryResponse);
    expect(fetchSpy).toHaveBeenCalledTimes(4);
    expect(secondaryAttempts).toBe(2);
  });

  it('throws an error when all 4 attempts fail (17s total budget)', async () => {
    const fetchSpy = vi.fn().mockImplementation((url) => {
      if (url === primaryUrl) {
        return Promise.reject(new Error('Primary error'));
      }
      if (url === secondaryUrl) {
        return Promise.reject(new Error('Secondary error'));
      }
      return Promise.reject(new Error('Unknown url'));
    });

    vi.stubGlobal('fetch', fetchSpy);

    await expect(
      fetchWithFailover(primaryUrl, secondaryUrl, {}, 2000, 5000, 5000)
    ).rejects.toThrow('Failed to reach backend services after 4 attempts');

    expect(fetchSpy).toHaveBeenCalledTimes(4);
  });
});

