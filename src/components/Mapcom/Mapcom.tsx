import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
// import { useQuery, gql } from '@apollo/client';

const getColor = (density?: number) => {
  if (density === undefined || density === null) {
    return '#CCCCCC';
  }
  return density > 1000 ? '#4B000F' :
         density > 500  ? '#800026' :
         density > 200  ? '#A50F15' :
         density > 100  ? '#C81E1E' :
         density > 50   ? '#E8492F' :
         density > 20   ? '#FFA07A' :
                          '#FFDAB9';
};

// const GET_INDIA_STATES = gql`
//   query GetStates {
//     multipleAreas {
//       boundary
//       entity {
//         Statename
//         capital
//         Status
//         population
//       }
//     }
//   }
// `;

const Mapcom: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    const mapContainer = document.getElementById('mapId');
    if (!mapContainer) return;
  
    const observer = new ResizeObserver(() => {
      if (!mapRef.current && mapContainer.clientHeight > 0) {
        mapRef.current = L.map('mapId', {
          center: [22.3511, 78.6677],
          zoom: 4.4,
          zoomSnap: 0.01,     // ← enables zoom levels like 4.45
            zoomDelta: 0.1,
          minZoom: 4.4,
          maxBounds: [
            [9.0, 67.0],
            [37.0, 97.0]
          ],
          maxBoundsViscosity: 1.0
        });
  
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          detectRetina: true,
          crossOrigin: true
        }).addTo(mapRef.current);
         /*
      // LOCAL TILE SERVER
      L.tileLayer('http://localhost:8090/styles/positron/{z}/{x}/{y}.png', {
        detectRetina: true,
        crossOrigin: true
      }).addTo(mapRef.current);
      */
        loadGeoJson();
        //loadGeoDataGraphQL();
      }
    });
  
    observer.observe(mapContainer);
    return () => observer.disconnect();
  }, []);
  
  const loadGeoJson = () => {
    axios.get('/assets/india_states.json').then((response) => {
      const data = response.data;
      L.geoJSON(data, {
        style: (feature: any) => {
          const population = feature?.properties?.population ?? undefined;
          return {
            fillColor: getColor(population),
            weight: 2,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
          };
        },
        onEachFeature: (feature, layer) => {
          const properties = feature?.properties || {};
          const popupContent = `
            <strong>${properties.NAME_1 || 'Unknown'}</strong><br>
            Capital: ${properties.capital || 'N/A'}<br>
            CM: ${properties.cm || 'N/A'}<br>
            Governor: ${properties.governor || 'N/A'}<br>
            Population: ${properties.population?.toLocaleString() || 'N/A'}
          `;
          layer.bindPopup(popupContent);
        }
      }).addTo(mapRef.current!);
    });
  };

  /*
  const { data } = useQuery(GET_INDIA_STATES);
  const loadGeoDataGraphQL = () => {
    if (!data) return;

    const features = data.multipleAreas.map((item: any) => {
      const boundary = JSON.parse(item.boundary);
      return {
        type: 'Feature',
        geometry: boundary,
        properties: {
          ...item.entity
        }
      };
    });

    const geoJsonData = {
      type: 'FeatureCollection',
      features: features
    };

    L.geoJSON(geoJsonData as GeoJSON.FeatureCollection, {
      style: (feature: any) => {
        const population = feature?.properties?.population ?? undefined;
        return {
          fillColor: getColor(population),
          weight: 2,
          opacity: 1,
          color: 'grey',
          fillOpacity: 0.7
        };
      },
      onEachFeature: (feature, layer) => {
        const properties = feature?.properties || {};
        const popupContent = `
          <strong>${properties.Statename || 'Unknown'}</strong><br>
          Capital: ${properties.capital || 'N/A'}<br>
          Status: ${properties.Status || 'N/A'}<br>
        `;
        layer.bindPopup(popupContent);
      }
    }).addTo(mapRef.current!);
  };
  */

  return (
    <div className="view-section">
    <h3 className="view-title">Globe View</h3>
  <div id="mapId" style={{ height: '590px',   
        width: '70%',    
        marginTop: '60px',   // pushes down from top
        marginLeft: '100px'   // pushes right from left 
                }} ></div>
  </div>
  );
};

export default Mapcom;
