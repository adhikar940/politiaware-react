import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Navigate, Route } from 'react-router-dom';
import SideMenu from './components/SideMenu/SideMenu';
import Home from './pages/Home/Home';
import CMs from './pages/CMs/CMs';
import Loksabha from './pages/Loksabha/Loksabha';
import Governors from './pages/Governors/Governors';
import Rajyasabha from './pages/Rajyasabha/Rajyasabha';
import Assembly from './pages/Assembly/Assembly';
import Council from './pages/Council/Council';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { ForceUpdateModal } from './components/ForceUpdateModal';
import { useAppUpdate } from './customhooks/useAppUpdate';

setupIonicReact();

const App: React.FC = () => {
  const { updateInfo, isOpen, dismissUpdate } = useAppUpdate();

  return (
    <IonApp>
      <IonReactRouter>
        {/* Persistent Side Menu */}
        <SideMenu />
        <IonRouterOutlet id="main">
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/CMs" element={<CMs />} />
          <Route path="/Loksabha" element={<Loksabha />} />
          <Route path="/Governors" element={<Governors />} />
          <Route path="/Rajyasabha" element={<Rajyasabha />} />
          <Route path="/Assembly" element={<Assembly />} />
          <Route path="/Council" element={<Council />} />
        </IonRouterOutlet>
      </IonReactRouter>

      {/* Remote Config App Version Update Gate (Mandatory & Optional) */}
      <ForceUpdateModal
        updateInfo={updateInfo}
        isOpen={isOpen}
        onDismiss={dismissUpdate}
      />
    </IonApp>
  );
};

export default App;
