import { Capacitor } from '@capacitor/core';

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

  const pubId = import.meta.env.VITE_ADSENSE_PUB_ID;

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
