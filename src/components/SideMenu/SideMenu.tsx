import React, { useEffect, useRef } from 'react';
import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonBadge,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import {
  homeOutline,
  ribbonOutline,
  businessOutline,
  libraryOutline,
  peopleOutline,
  layersOutline,
} from 'ionicons/icons';

import './SideMenu.css';

interface AppPage {
  title: string;
  url: string;
  count?: number | string;
  customIcon?: string;
  icon?: string;
}

const appPages: AppPage[] = [
  {
    title: 'Home',
    url: '/home',
    icon: homeOutline,
  },
  {
    title: 'Chief Ministers (cms)',
    url: '/CMs',
    count: 31,
    customIcon: '/assets/images/cm.png',
  },
  {
    title: 'Governors',
    url: '/Governors',
    count: 37,
    icon: ribbonOutline,
  },
  {
    title: 'Lok Sabha',
    url: '/Loksabha',
    count: 544,
    icon: businessOutline,
  },
  {
    title: 'Rajya Sabha',
    url: '/Rajyasabha',
    count: 244,
    icon: libraryOutline,
  },
  {
    title: 'Assembly (MLAs)',
    url: '/Assembly',
    count: '4,108',
    icon: peopleOutline,
  },
  {
    title: 'Council (MLCs)',
    url: '/Council',
    count: 408,
    icon: layersOutline,
  },
];

const SideMenu: React.FC = () => {
  const location = useLocation();
  const menuRef = useRef<HTMLIonMenuElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Automatically open the side menu when the UI loads (for 3 seconds then auto close)
  useEffect(() => {
    const openTimer = setTimeout(async () => {
      try {
        const menu = menuRef.current || (document.querySelector('ion-menu') as HTMLIonMenuElement | null);
        if (menu) {
          await menu.open(true);
        }
      } catch (err) {
        console.warn('Auto open menu error:', err);
      }
    }, 400);

    return () => {
      clearTimeout(openTimer);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  // When menu finishes opening, stay open for 3 seconds (3000ms) then auto close
  const handleDidOpen = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(async () => {
      try {
        const menu = menuRef.current || (document.querySelector('ion-menu') as HTMLIonMenuElement | null);
        if (menu && (await menu.isOpen())) {
          await menu.close(true);
        }
      } catch (err) {
        console.warn('Auto close menu error:', err);
      }
    }, 3000);
  };

  // When menu closes (either automatically or by user action), clean up the timer
  const handleDidClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  return (
    <IonMenu
      contentId="main"
      type="overlay"
      ref={menuRef}
      className="adhikar-sidemenu"
      onIonDidOpen={handleDidOpen}
      onIonDidClose={handleDidClose}
    >
      <IonContent>
        {/* Brand Header with Custom Logo */}
        <div className="sidemenu-brand-header">
          <div className="sidemenu-logo-box">
            <img src="/assets/images/adhikar_logo.png" alt="Adhikar Politiaware Logo" className="sidemenu-logo-img" />
          </div>
          <div className="sidemenu-brand-text">
            <h2 className="brand-title">adhikar-politiaware</h2>
            <p className="brand-subtitle">Democratic Representation Portal</p>
          </div>
        </div>

        {/* Menu Navigation List */}
        <IonList id="sidemenu-nav-list" lines="none">
          <div className="sidemenu-section-label">Institutional Directory</div>
          
          {appPages.map((appPage, index) => {
            const isSelected = location.pathname.toLowerCase() === appPage.url.toLowerCase();

            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem
                  className={`sidemenu-item ${isSelected ? 'selected' : ''}`}
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
                      className="sidemenu-item-icon custom"
                    />
                  ) : (
                    <IonIcon
                      aria-hidden="true"
                      slot="start"
                      icon={appPage.icon}
                      className="sidemenu-item-icon"
                    />
                  )}
                  <IonLabel className="sidemenu-item-label">{appPage.title}</IonLabel>
                  {appPage.count && (
                    <IonBadge slot="end" className={`sidemenu-item-badge ${isSelected ? 'badge-active' : ''}`}>
                      {appPage.count}
                    </IonBadge>
                  )}
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>

        {/* Footer Status Badge */}
        <div className="sidemenu-footer">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span>Live Data Synchronized</span>
          </div>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default SideMenu;