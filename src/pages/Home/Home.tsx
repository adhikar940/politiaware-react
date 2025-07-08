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
import React from 'react';
import { menuOutline } from 'ionicons/icons';

const Home: React.FC = () => {
  return ( 
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => document.querySelector('ion-menu')?.open()}>
                <IonIcon icon={menuOutline} />
              </IonButton>
            </IonButtons>
            <IonTitle>Home</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen>
          <div className="ion-padding">
            <h2>Welcome to the Home Page</h2>
            <p>This is your starting point.</p>
          </div>
        </IonContent>
      </IonPage>
 
  );
};

export default Home;
