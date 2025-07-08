import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import {
  archiveOutline,
  archiveSharp,
  heartOutline,
  heartSharp,
  planetOutline,
  paperPlaneOutline,
  paperPlaneSharp,
  trashOutline,
  trashSharp,
  warningOutline,
  warningSharp,
} from 'ionicons/icons';

import './SideMenu.css';

const appPages = [
  {
    title: 'Adhikar',
    url: '/Home',
    iosIcon: planetOutline,
    mdIcon: planetOutline,
  },
  {
    title: 'Chief Ministers',
    url: '/CMs',
    customIcon: '/assets/images/cm.png'
  },
  
];

const SideMenu: React.FC = () => {
  const location = useLocation();
  const menuRef = useRef<HTMLIonMenuElement>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    // Handle initial load
    if (isFirstLoad) {
      menu.open(true);
      const initialTimer = setTimeout(() => {
        menu.close(true);
        setIsFirstLoad(false);
      }, 5000);

      return () => clearTimeout(initialTimer);
    }

    // Handle menu open events
    const handleMenuOpen = () => {
      const timer = setTimeout(() => {
        menu.close(true);
      }, 5000);
      return () => clearTimeout(timer);
    };

    menu.addEventListener('ionMenuChange', handleMenuOpen);

    return () => {
      menu.removeEventListener('ionMenuChange', handleMenuOpen);
    };
  }, [isFirstLoad]);

  return (
    <IonMenu contentId="main" type="overlay" ref={menuRef}>
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader>Adhikar</IonListHeader>
          <IonNote>Welcome to Adhikar</IonNote>
          {appPages.map((appPage, index) => (
            <IonMenuToggle key={index} autoHide={false}>
              <IonItem
                className={location.pathname === appPage.url ? 'selected' : ''}
                routerLink={appPage.url}
                routerDirection="none"
                lines="none"
                detail={false}
              >
                {appPage.customIcon ? (
                  <img
                    src={appPage.customIcon}
                    alt={appPage.title}
                    slot="start"
                    style={{ width: 25, height: 25, marginRight: 16 }}
                    aria-hidden="true"
                  />
                ) : (
                  <IonIcon
                    aria-hidden="true"
                    slot="start"
                    ios={appPage.iosIcon}
                    md={appPage.mdIcon}
                  />
                )}
                <IonLabel>{appPage.title}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
        </IonList>      
      </IonContent>
    </IonMenu>
  );
};

export default SideMenu;