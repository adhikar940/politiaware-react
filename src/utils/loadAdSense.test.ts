import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Capacitor } from '@capacitor/core';
import { isAdSenseEligible, loadAdSenseScript, formatPublisherId } from './loadAdSense';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(),
  },
}));

describe('loadAdSense utility', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.resetAllMocks();
    document.head.innerHTML = '';
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  function setHostname(hostname: string) {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, hostname },
      writable: true,
    });
  }

  describe('formatPublisherId', () => {
    it('handles pub- prefix and converts to ca-pub-', () => {
      expect(formatPublisherId('pub-2632542826076812')).toBe('ca-pub-2632542826076812');
    });

    it('keeps existing ca- prefix intact', () => {
      expect(formatPublisherId('ca-pub-2632542826076812')).toBe('ca-pub-2632542826076812');
    });

    it('handles raw digits by prepending ca-pub-', () => {
      expect(formatPublisherId('2632542826076812')).toBe('ca-pub-2632542826076812');
    });

    it('returns empty string if empty or undefined', () => {
      expect(formatPublisherId('')).toBe('');
      expect(formatPublisherId(undefined)).toBe('');
    });
  });

  describe('isAdSenseEligible', () => {
    it('returns false when running on native platform (Android/iOS)', () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      setHostname('politiaware.com');
      vi.stubEnv('VITE_ADSENSE_PUB_ID', 'pub-2632542826076812');

      expect(isAdSenseEligible()).toBe(false);
    });

    it('returns false when running on localhost', () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
      setHostname('localhost');
      vi.stubEnv('VITE_ADSENSE_PUB_ID', 'pub-2632542826076812');

      expect(isAdSenseEligible()).toBe(false);
    });

    it('returns false when running on 127.0.0.1', () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
      setHostname('127.0.0.1');
      vi.stubEnv('VITE_ADSENSE_PUB_ID', 'pub-2632542826076812');

      expect(isAdSenseEligible()).toBe(false);
    });

    it('returns false when VITE_ADSENSE_PUB_ID is missing or empty', () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
      setHostname('politiaware.com');
      vi.stubEnv('VITE_ADSENSE_PUB_ID', '');

      expect(isAdSenseEligible()).toBe(false);
    });

    it('returns true when running on web, non-localhost, and VITE_ADSENSE_PUB_ID is set', () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
      setHostname('politiaware.com');
      vi.stubEnv('VITE_ADSENSE_PUB_ID', 'pub-2632542826076812');

      expect(isAdSenseEligible()).toBe(true);
    });
  });

  describe('loadAdSenseScript', () => {
    it('does not inject script tag if ineligible', () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      setHostname('politiaware.com');
      vi.stubEnv('VITE_ADSENSE_PUB_ID', 'pub-2632542826076812');

      loadAdSenseScript();

      const script = document.querySelector('script[src*="adsbygoogle.js"]');
      expect(script).toBeNull();
    });

    it('injects script tag with normalized ca-pub ID when eligible', () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
      setHostname('politiaware.com');
      vi.stubEnv('VITE_ADSENSE_PUB_ID', 'pub-2632542826076812');

      loadAdSenseScript();

      const script = document.querySelector('script[src*="adsbygoogle.js"]') as HTMLScriptElement;
      expect(script).not.toBeNull();
      expect(script?.src).toContain('client=ca-pub-2632542826076812');
      expect(script?.crossOrigin).toBe('anonymous');
      expect(script?.async).toBe(true);
    });

    it('does not insert duplicate script tags if called multiple times', () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
      setHostname('politiaware.com');
      vi.stubEnv('VITE_ADSENSE_PUB_ID', 'pub-2632542826076812');

      loadAdSenseScript();
      loadAdSenseScript();

      const scripts = document.querySelectorAll('script[src*="adsbygoogle.js"]');
      expect(scripts.length).toBe(1);
    });
  });
});
