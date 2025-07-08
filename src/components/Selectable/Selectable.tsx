import React, { useState, useEffect } from 'react';
import {
  IonButton,
  IonItem,
  IonCheckbox,
  IonIcon,
} from '@ionic/react';
import { chevronUpOutline, chevronDownOutline } from 'ionicons/icons';
import './Selectable.css';

type Options = {
  table: boolean;
  map: boolean;
  chart: boolean;
};

interface SelectableProps {
  onSelectionChange?: (options: Options) => void;
}

const Selectable: React.FC<SelectableProps> = ({ onSelectionChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showComponent, setShowComponent] = useState(true);

  const [options, setOptions] = useState<Options>({
    table: true,
    map: true,
    chart: true,
  });

  useEffect(() => {
    // Emit default selection
    onSelectionChange?.(options);

    // Hide after 5 seconds
    const timer = setTimeout(() => setShowComponent(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
    setShowComponent(true); // Ensure it's visible if user toggles
  };

  const toggleOption = (key: keyof Options) => {
    const updated = { ...options, [key]: !options[key] };
    setOptions(updated);
    onSelectionChange?.(updated);
  };

  if (!showComponent) {
    return (
      <div className="selectable-wrapper">
        <IonButton size="small" onClick={toggleExpand}>
          <IonIcon icon={chevronDownOutline} />
        </IonButton>
      </div>
    );
  }

  return (
    <div className="selectable-wrapper">
      <div className="selector-container">
        <IonButton size="small" onClick={toggleExpand}>
          <IonIcon icon={chevronUpOutline} />
        </IonButton>

        {isExpanded && (
          <div className="options">
            <IonItem lines="none">
              <IonCheckbox
                checked={options.table}
                onIonChange={() => toggleOption('table')}
              />
              <span style={{ marginLeft: '8px' }}>Table</span>
            </IonItem>
            <IonItem lines="none">
              <IonCheckbox
                checked={options.map}
                onIonChange={() => toggleOption('map')}
              />
              <span style={{ marginLeft: '8px' }}>Map</span>
            </IonItem>
            <IonItem lines="none">
              <IonCheckbox
                checked={options.chart}
                onIonChange={() => toggleOption('chart')}
              />
              <span style={{ marginLeft: '8px' }}>Chart</span>
            </IonItem>
          </div>
        )}
      </div>
    </div>
  );
};

export default Selectable;
