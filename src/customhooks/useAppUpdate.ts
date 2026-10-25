import { useState, useEffect, useCallback } from 'react';
import { loadConfig } from '../config/appConfig';
import { checkAppUpdate, UpdateCheckResult } from '../utils/versionCheck';

const SESSION_DISMISSED_KEY = 'politiaware_dismissed_update_version';

export function useAppUpdate() {
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const performCheck = useCallback(async () => {
    try {
      const config = await loadConfig();
      const result = await checkAppUpdate(config);

      if (result && result.updateAvailable) {
        // If it is an optional update, check if user already dismissed it for this session
        if (!result.isMandatory) {
          const dismissedVersion = sessionStorage.getItem(SESSION_DISMISSED_KEY);
          if (dismissedVersion === result.latestVersion) {
            setUpdateInfo(result);
            setIsOpen(false);
            return;
          }
        }

        setUpdateInfo(result);
        setIsOpen(true);
      } else {
        setUpdateInfo(result);
        setIsOpen(false);
      }
    } catch {
      // Ignore network errors on startup
    }
  }, []);

  useEffect(() => {
    performCheck();
  }, [performCheck]);

  const dismissUpdate = useCallback(() => {
    // Only allow dismissal if NOT mandatory
    if (updateInfo && !updateInfo.isMandatory) {
      sessionStorage.setItem(SESSION_DISMISSED_KEY, updateInfo.latestVersion);
      setIsOpen(false);
    }
  }, [updateInfo]);

  return {
    updateInfo,
    isOpen,
    dismissUpdate,
    checkNow: performCheck,
  };
}

