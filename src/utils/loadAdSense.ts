import { Capacitor } from '@capacitor/core';

/**
 * Normalizes a Google AdSense publisher ID to ensure it has the required 'ca-' prefix.
 * e.g., 'pub-2632542826076812' -> 'ca-pub-2632542826076812'
 */
export function formatPublisherId(id?: string): string {
  if (!id) return '';
  const trimmed = id.trim();
  if (trimmed.startsWith('ca-')) {
    return trimmed;
  }
  if (trimmed.startsWith('pub-')) {
    return `ca-${trimmed}`;
  }
  return `ca-pub-${trimmed}`;
}

/**
 * Returns true only when:
 * 1. The app is running on the Web (not inside native Android/iOS Capacitor wrapper).
 * 2. It is not localhost or local loopback (avoids AdSense invalid traffic penalties during dev).
 * 3. The VITE_ADSENSE_PUB_ID environment variable is provided.
 */
export function isAdSenseEligible(): boolean {
  if (typeof window === 'undefined') return false;

  const isNative = Capacitor.isNativePlatform();
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.local');
  const pubId = import.meta.env.VITE_ADSENSE_PUB_ID;

  return !isNative && !isLocal && Boolean(pubId && pubId.trim() !== '');
}

/**
 * Dynamically loads the Google AdSense script only when eligible.
 */
export function loadAdSenseScript(): void {
  if (typeof document === 'undefined') return;

  if (!isAdSenseEligible()) {
    return;
  }

  const rawPubId = import.meta.env.VITE_ADSENSE_PUB_ID;
  const pubId = formatPublisherId(rawPubId);

  // Prevent duplicate script insertion
  if (document.querySelector('script[src*="adsbygoogle.js"]')) {
    return;
  }

  const script = document.createElement('script');
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`;
  script.async = true;
  script.crossOrigin = 'anonymous';

  document.head.appendChild(script);
}
