import { describe, it, expect } from 'vitest';
import { compareVersions, evaluateUpdateStatus } from './versionCheck';

describe('versionCheck utilities', () => {
  describe('compareVersions', () => {
    it('correctly compares version numbers', () => {
      expect(compareVersions('0.0.1', '0.0.2')).toBe(-1);
      expect(compareVersions('0.0.2', '0.0.1')).toBe(1);
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
      expect(compareVersions('1.10.0', '1.2.0')).toBe(1);
      expect(compareVersions('1.2.0', '1.10.0')).toBe(-1);
      expect(compareVersions('2.0.0', '1.9.9')).toBe(1);
      expect(compareVersions('1.0', '1.0.0')).toBe(0);
    });
  });

  describe('evaluateUpdateStatus', () => {
    it('requires MANDATORY update when current version is strictly below minimum required version', () => {
      const result = evaluateUpdateStatus({
        currentVersion: '0.9.0',
        minRequiredVersion: '1.0.0',
        latestVersion: '1.2.0',
        forceUpdate: false,
      });

      expect(result.updateAvailable).toBe(true);
      expect(result.isMandatory).toBe(true);
      expect(result.currentVersion).toBe('0.9.0');
      expect(result.minRequiredVersion).toBe('1.0.0');
      expect(result.latestVersion).toBe('1.2.0');
    });

    it('requires OPTIONAL update when version is between min required and latest (non-mandatory)', () => {
      const result = evaluateUpdateStatus({
        currentVersion: '1.0.0',
        minRequiredVersion: '1.0.0',
        latestVersion: '1.2.0',
        forceUpdate: false,
      });

      expect(result.updateAvailable).toBe(true);
      expect(result.isMandatory).toBe(false);
    });

    it('makes update MANDATORY when forceUpdate is true even if current version meets min requirement', () => {
      const result = evaluateUpdateStatus({
        currentVersion: '1.1.0',
        minRequiredVersion: '1.0.0',
        latestVersion: '1.2.0',
        forceUpdate: true,
      });

      expect(result.updateAvailable).toBe(true);
      expect(result.isMandatory).toBe(true);
    });

    it('does not require any update when current version equals or exceeds latest version', () => {
      const result = evaluateUpdateStatus({
        currentVersion: '1.2.0',
        minRequiredVersion: '1.0.0',
        latestVersion: '1.2.0',
        forceUpdate: false,
      });

      expect(result.updateAvailable).toBe(false);
      expect(result.isMandatory).toBe(false);
    });

    it('handles newer current version than latest gracefully', () => {
      const result = evaluateUpdateStatus({
        currentVersion: '1.3.0',
        minRequiredVersion: '1.0.0',
        latestVersion: '1.2.0',
        forceUpdate: true,
      });

      expect(result.updateAvailable).toBe(false);
      expect(result.isMandatory).toBe(false);
    });
  });
});

