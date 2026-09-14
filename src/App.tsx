import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Navigate, Route } from 'react-router-dom';
import SideMenu from './components/SideMenu/SideMenu';
import Home from './pages/Home/Home';
import CMs from './pages/CMs/CMs';
import Loksabha from './pages/Loksabha/Loksabha';
import EntityPlaceholder from './pages/EntityPlaceholder/EntityPlaceholder';
import Governors from './pages/Governors/Governors';

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

setupIonicReact();

const App: React.FC = () => {
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
          <Route
            path="/Rajyasabha"
            element={<EntityPlaceholder title="Rajya Sabha Members" count={244} queryName="allRajyasabhaMPs(limit: 10, offset: 0)" />}
          />
          <Route
            path="/Assembly"
            element={<EntityPlaceholder title="State Legislative Assemblies (MLAs)" count="4,108" queryName="allMLAs(limit: 10, offset: 0)" />}
          />
          <Route
            path="/Council"
            element={<EntityPlaceholder title="State Legislative Councils (MLCs)" count={408} queryName="allMLCs(limit: 10, offset: 0)" />}
          />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
