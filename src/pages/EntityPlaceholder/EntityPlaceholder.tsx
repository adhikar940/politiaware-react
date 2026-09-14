import React from 'react';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { menuOutline } from 'ionicons/icons';
import UnderConstruction from '../../components/UnderConstruction/UnderConstuction';

interface EntityPlaceholderProps {
  title: string;
  count?: number | string;
  queryName?: string;
}

const EntityPlaceholder: React.FC<EntityPlaceholderProps> = ({ title, count, queryName }) => {
  return (
    <IonPage id="main-content">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => document.querySelector('ion-menu')?.open()}>
              <IonIcon icon={menuOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle style={{ fontWeight: 'bold' }}>{title}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center' }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '40px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              {title}
            </h1>
            {count && (
              <span style={{
                display: 'inline-block',
                background: '#dbeafe',
                color: '#1e40af',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '28px'
              }}>
                Total Registered Records: {count}
              </span>
            )}

            <UnderConstruction />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default EntityPlaceholder;

