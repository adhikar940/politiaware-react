import {
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon
} from '@ionic/react';
import { useParams } from 'react-router';
import ExploreContainer from '../components/ExploreContainer';
import './Page.css';
import { menuOutline } from 'ionicons/icons';
import React, { useEffect, useRef } from 'react';

const Page: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const menuRef = useRef<HTMLIonMenuElement | null>(null);

  useEffect(() => {
    // Get menu element after component mounts
    menuRef.current = document.querySelector('ion-menu');

    const openMenu = async () => {
      if (menuRef.current) {
        await menuRef.current.open();
        setTimeout(() => {
          menuRef.current?.close();
        }, 5000); // Auto-close after 5 seconds
      }
    };

    openMenu();
  }, []);

  const openMenuWithTimeout = async () => {
    if (menuRef.current) {
      await menuRef.current.open();
      setTimeout(() => {
        menuRef.current?.close();
      }, 5000);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={openMenuWithTimeout}>
              <IonIcon icon={menuOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>{name}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{name}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name={name} />
      </IonContent>
    </IonPage>
  );
};

export default Page;
