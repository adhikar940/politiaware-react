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

  it('returns primary response when primary responds within 2000ms timeout', async () => {
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

    const res = await fetchWithFailover(primaryUrl, secondaryUrl, {}, 2000, 3000);
    expect(res).toBe(mockPrimaryResponse);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(primaryUrl, expect.any(Object));
  });

  it('fails over to secondary when primary times out after 2000ms', async () => {
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

    const failoverPromise = fetchWithFailover(primaryUrl, secondaryUrl, {}, 2000, 3000);

    // Fast-forward 2000ms (primary timeout)
    await vi.advanceTimersByTimeAsync(2000);

    const res = await failoverPromise;
    expect(res).toBe(mockSecondaryResponse);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenNthCalledWith(1, primaryUrl, expect.any(Object));
    expect(fetchSpy).toHaveBeenNthCalledWith(2, secondaryUrl, expect.any(Object));
  });

  it('fails over to secondary immediately when primary returns HTTP 502/503', async () => {
    const mock502Response = new Response('Bad Gateway', { status: 502 });
    const mockSecondaryResponse = new Response(JSON.stringify({ data: { ok: true } }), {
      status: 200,
    });

    const fetchSpy = vi.fn().mockImplementation((url) => {
      if (url === primaryUrl) {
        return Promise.resolve(mock502Response);
      }
      if (url === secondaryUrl) {
        return Promise.resolve(mockSecondaryResponse);
      }
      return Promise.reject(new Error('Unknown url'));
    });

    vi.stubGlobal('fetch', fetchSpy);

    const res = await fetchWithFailover(primaryUrl, secondaryUrl, {}, 2000, 3000);
    expect(res).toBe(mockSecondaryResponse);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('fails over to secondary when primary encounters network error', async () => {
    const mockSecondaryResponse = new Response(JSON.stringify({ data: { ok: true } }), {
      status: 200,
    });

    const fetchSpy = vi.fn().mockImplementation((url) => {
      if (url === primaryUrl) {
        return Promise.reject(new Error('Network connection refused'));
      }
      if (url === secondaryUrl) {
        return Promise.resolve(mockSecondaryResponse);
      }
      return Promise.reject(new Error('Unknown url'));
    });

    vi.stubGlobal('fetch', fetchSpy);

    const res = await fetchWithFailover(primaryUrl, secondaryUrl, {}, 2000, 3000);
    expect(res).toBe(mockSecondaryResponse);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('throws an error when both primary and secondary fail', async () => {
    const fetchSpy = vi.fn().mockImplementation((url) => {
      if (url === primaryUrl) {
        return Promise.reject(new Error('Primary network failure'));
      }
      if (url === secondaryUrl) {
        return Promise.reject(new Error('Secondary network failure'));
      }
      return Promise.reject(new Error('Unknown url'));
    });

    vi.stubGlobal('fetch', fetchSpy);

    await expect(
      fetchWithFailover(primaryUrl, secondaryUrl, {}, 2000, 3000)
    ).rejects.toThrow('Failed to reach backend services');

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});

