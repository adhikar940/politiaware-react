import {
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,IonSpinner 
  } from '@ionic/react';
  import { menuOutline } from 'ionicons/icons';
  import TableHead from '../../components/TableHead/TableHead';
  import Chartcom from '../../components/Chartcom/Chartcom';
  import Mapcom from '../../components/Mapcom/Mapcom';
  import Selectable from '../../components/Selectable/Selectable';
  import React, { useState,useEffect } from 'react';
  import './Loksabha.css';
  import '../../global.css';
  import { useLazyTable } from '../../customhooks/useTable';
  import UnderConstruction from '../../components/UnderConstruction/UnderConstuction';
  
  function MyPage() {
    return <UnderConstruction />;
  }
  
  //Table related constants
  const totalColumns_table = ['Name', 'State', 'Party', 'Gender', 'CasteCategory', 'Religion'];
  const defaultColumns = ['Name', 'State', 'Party', 'Gender'];
  
  //Chart related constants
  const total_cat_chart = ['Party', 'Gender', 'CasteCategory', 'Religion'];
  
  //Map related constants
  const total_cat_map = ['Party', 'Gender', 'CasteCategory', 'Religion'];
  
  const Loksabha: React.FC = () => {  
    const [selectedOptions, setSelectedOptions] = useState({
      table: true,
      map: false,
      chart: true,
    });
  
    // table related  
    const [selectedColumns, setSelectedColumns] = useState<string[]>(defaultColumns);
  
    
  
     const handleColumnChange = (updatedColumns: string[]) => {
      setSelectedColumns(updatedColumns);
     
    };
    
    //chart related
    const [selectedCategory, setSelectedCategory] = useState<string>('Party');  
    
      const handleSelectionChange = (newOptions: typeof selectedOptions) => {
      setSelectedOptions(newOptions);
    };
    
    //Map related
    const [selectedmapCategory, setSelectedmapCategory] = useState<string>('Party');  
  
    return ( 
        <IonPage id="main-content">
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => document.querySelector('ion-menu')?.open()}>
                  <IonIcon icon={menuOutline} />
                </IonButton>
              </IonButtons>
              <IonTitle style={{ textShadow: '0px 5px 5px darkcyan' }}>Chief Ministers</IonTitle>
            </IonToolbar>
          </IonHeader>
  
          <IonContent fullscreen>
          
          <Selectable onSelectionChange={handleSelectionChange} />

{selectedOptions.table && (
  <TableHead
 
    />
   
  )}
  
  
  {/* 
  {selectedOptions.chart &&  chartData &&
    chartData[selectedCategory] && (  
      <Chartcom
            data={chartData[selectedCategory]}
            colorMap={selectedCategory === 'Party' ? chartData?.PartyColor ?? {} : {}}
            selectedCategory={selectedCategory}
            categoryOptions={total_cat_chart}
            onCategoryChange={setSelectedCategory}
          />
    )}   */}
  {!selectedOptions.table && !selectedOptions.map && !selectedOptions.chart && (
    <div className="view-section">
      <h3 className="view-title">Select Table, Chart or Map at the right to know about me</h3>
      <img src="/assets/images/cm.png" alt="No View" style={{ width: '300px', height: 'auto', marginTop: '20px' }} />
    </div>
  )}
  {selectedOptions.map && (
    <div className="view-section">
    <h3 className="view-title">Globe View</h3>
    <UnderConstruction/>
    </div>
  )}
  
        </IonContent>
        </IonPage>
   
    );
  };
  
  export default Loksabha;
  
