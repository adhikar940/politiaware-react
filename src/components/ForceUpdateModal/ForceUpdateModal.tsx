import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import {
  cloudDownloadOutline,
  alertCircleOutline,
  sparklesOutline,
  closeOutline,
} from 'ionicons/icons';
import type { UpdateCheckResult } from '../../utils/versionCheck';

interface ForceUpdateModalProps {
  updateInfo: UpdateCheckResult | null;
  isOpen: boolean;
  onDismiss: () => void;
}

export const ForceUpdateModal: React.FC<ForceUpdateModalProps> = ({
  updateInfo,
  isOpen,
  onDismiss,
}) => {
  if (!updateInfo || !updateInfo.updateAvailable) {
    return null;
  }

  const { isMandatory, latestVersion, currentVersion, updateUrl, releaseNotes } = updateInfo;

  const handleUpdate = () => {
    if (updateUrl) {
      window.open(updateUrl, '_system');
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      backdropDismiss={!isMandatory}
      canDismiss={!isMandatory}
      onDidDismiss={onDismiss}
      className="force-update-modal"
    >
      <IonHeader>
        <IonToolbar color={isMandatory ? 'danger' : 'primary'}>
          <IonTitle>{isMandatory ? 'Update Required' : 'Update Available'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding ion-text-center">
        <div style={{ padding: '24px 16px', maxWidth: '420px', margin: '0 auto' }}>
          <IonIcon
            icon={isMandatory ? alertCircleOutline : cloudDownloadOutline}
            style={{
              fontSize: '72px',
              color: isMandatory ? 'var(--ion-color-danger, #eb445a)' : 'var(--ion-color-primary, #3880ff)',
              marginBottom: '16px',
            }}
          />

          <div style={{ marginBottom: '12px' }}>
            <IonBadge color={isMandatory ? 'danger' : 'success'} style={{ padding: '6px 12px', fontSize: '12px' }}>
              {isMandatory ? 'Mandatory Update' : 'New Version Ready'}
            </IonBadge>
          </div>

          <h2 style={{ fontWeight: 700, margin: '8px 0' }}>
            {isMandatory ? 'Please Update Politiaware' : 'New Version Available!'}
          </h2>

          <p style={{ color: 'var(--ion-color-medium, #666)', fontSize: '14px', lineHeight: '1.5' }}>
            {isMandatory
              ? `Your current app version (v${currentVersion}) is no longer supported. Please update to v${latestVersion} to continue using the application.`
              : `A new version (v${latestVersion}) is available. Your current version is v${currentVersion}.`}
          </p>

          {releaseNotes && (
            <IonCard style={{ textAlign: 'left', margin: '20px 0', borderRadius: '12px' }}>
              <IonCardContent style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <IonIcon icon={sparklesOutline} color="warning" />
                  <strong style={{ fontSize: '13px' }}>What’s New in v{latestVersion}:</strong>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ion-color-step-600, #555)' }}>
                  {releaseNotes}
                </div>
              </IonCardContent>
            </IonCard>
          )}

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <IonButton
              expand="block"
              size="large"
              color={isMandatory ? 'danger' : 'primary'}
              onClick={handleUpdate}
            >
              <IonIcon slot="start" icon={cloudDownloadOutline} />
              Update Now
            </IonButton>

            {!isMandatory && (
              <IonButton expand="block" fill="clear" color="medium" onClick={onDismiss}>
                <IonIcon slot="start" icon={closeOutline} />
                Remind Me Later
              </IonButton>
            )}
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

