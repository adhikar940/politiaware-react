import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import type { AppConfig } from '../config/appConfig';

export interface UpdateCheckResult {
  updateAvailable: boolean;
  isMandatory: boolean;
  currentVersion: string;
  latestVersion: string;
  minRequiredVersion: string;
  updateUrl: string;
  releaseNotes?: string;
}

/**
 * Compare two semver-like strings (e.g. "1.2.3" vs "1.3.0").
 * Returns:
 *  -1 if v1 < v2
 *   0 if v1 === v2
 *   1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const p1 = (v1 || '0').split('.').map((n) => parseInt(n, 10) || 0);
  const p2 = (v2 || '0').split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(p1.length, p2.length);

  for (let i = 0; i < len; i++) {
    const num1 = p1[i] ?? 0;
    const num2 = p2[i] ?? 0;
    if (num1 < num2) return -1;
    if (num1 > num2) return 1;
  }
  return 0;
}

/**
 * Evaluates whether an update is available, and whether it is mandatory or optional.
 */
export function evaluateUpdateStatus({
  currentVersion,
  minRequiredVersion,
  latestVersion,
  forceUpdate = false,
  updateUrl = 'https://play.google.com/store/apps/details?id=io.ionic.starter',
  releaseNotes,
}: {
  currentVersion: string;
  minRequiredVersion?: string;
  latestVersion?: string;
  forceUpdate?: boolean;
  updateUrl?: string;
  releaseNotes?: string;
}): UpdateCheckResult {
  const minVer = minRequiredVersion || currentVersion;
  const latestVer = latestVersion || minVer;

  const isBelowMin = compareVersions(currentVersion, minVer) < 0;
  const isBelowLatest = compareVersions(currentVersion, latestVer) < 0;

  // Mandatory if strictly below minimum required version, OR if forceUpdate flag is enabled while below latest
  const isMandatory = isBelowMin || (forceUpdate && isBelowLatest);
  const updateAvailable = isBelowMin || isBelowLatest;

  return {
    updateAvailable,
    isMandatory,
    currentVersion,
    latestVersion: latestVer,
    minRequiredVersion: minVer,
    updateUrl,
    releaseNotes,
  };
}

/**
 * Retrieves the current app version from native Capacitor App plugin or fallback.
 */
export async function getCurrentAppVersion(fallbackVersion = '0.0.1'): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    try {
      const info = await App.getInfo();
      if (info?.version) {
        return info.version;
      }
    } catch {
      // Fall back if plugin call fails
    }
  }
  return fallbackVersion;
}

/**
 * Checks remote config to evaluate whether the app requires an update.
 * By default runs on native mobile platforms (or on web if forceCheckOnWeb is true).
 */
export async function checkAppUpdate(
  config: AppConfig | null,
  forceCheckOnWeb = false
): Promise<UpdateCheckResult | null> {
  if (!config) return null;

  // Web typically auto-updates upon reload, so check only on native unless forced for testing
  if (!Capacitor.isNativePlatform() && !forceCheckOnWeb) {
    return null;
  }

  const currentVersion = await getCurrentAppVersion('0.0.1');
  const minRequiredVersion = config.MIN_APP_VERSION || config.MIN_ANDROID_VERSION;
  const latestVersion = config.LATEST_APP_VERSION || config.LATEST_ANDROID_VERSION;

  return evaluateUpdateStatus({
    currentVersion,
    minRequiredVersion,
    latestVersion,
    forceUpdate: config.FORCE_UPDATE,
    updateUrl: config.ANDROID_UPDATE_URL,
    releaseNotes: config.UPDATE_RELEASE_NOTES,
  });
}

