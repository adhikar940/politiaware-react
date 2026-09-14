import React, { useEffect, useState } from 'react';
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
import { menuOutline, arrowForwardOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { fetchGraphQL } from '../../services/graphqlService';
import './Home.css';

interface EntityCount {
  id: string;
  title: string;
  badge: string;
  count: number | string;
  url: string;
  colorClass: string;
  description: string;
}

const DEFAULT_METRICS: EntityCount[] = [
  {
    id: 'cms',
    title: 'Chief Ministers',
    badge: 'CM',
    count: 31,
    url: '/CMs',
    colorClass: 'badge-cm',
    description: 'State Executive Heads',
  },
  {
    id: 'governors',
    title: 'Governors',
    badge: 'GV',
    count: 37,
    url: '/Governors',
    colorClass: 'badge-gv',
    description: 'Constitutional Heads',
  },
  {
    id: 'loksabha',
    title: 'Lok Sabha',
    badge: 'LS',
    count: 544,
    url: '/Loksabha',
    colorClass: 'badge-ls',
    description: 'House of the People',
  },
  {
    id: 'rajyasabha',
    title: 'Rajya Sabha',
    badge: 'RS',
    count: 244,
    url: '/Rajyasabha',
    colorClass: 'badge-rs',
    description: 'Council of States',
  },
  {
    id: 'assembly',
    title: 'Assembly (MLAs)',
    badge: 'MLA',
    count: '4,108',
    url: '/Assembly',
    colorClass: 'badge-mla',
    description: 'State Legislators',
  },
  {
    id: 'council',
    title: 'Council (MLCs)',
    badge: 'MLC',
    count: 408,
    url: '/Council',
    colorClass: 'badge-mlc',
    description: 'Upper House Members',
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<EntityCount[]>(DEFAULT_METRICS);

  // Attempt to dynamically fetch live counts from async backend
  useEffect(() => {
    const COUNT_QUERY = `
      query GetPortalSummary {
        allCms(limit: 1) { total }
        allGovernors(limit: 1) { total }
        allLokSabhaMPs(limit: 1) { total }
        allRajyasabhaMPs(limit: 1) { total }
        allMLAs(limit: 1) { total }
        allMLCs(limit: 1) { total }
      }
    `;

    fetchGraphQL(COUNT_QUERY)
      .then((res) => {
        if (res) {
          setMetrics([
            { ...DEFAULT_METRICS[0], count: res.allCms?.total ?? 31 },
            { ...DEFAULT_METRICS[1], count: res.allGovernors?.total ?? 37 },
            { ...DEFAULT_METRICS[2], count: res.allLokSabhaMPs?.total ?? 544 },
            { ...DEFAULT_METRICS[3], count: res.allRajyasabhaMPs?.total ?? 244 },
            { ...DEFAULT_METRICS[4], count: (res.allMLAs?.total ?? 4108).toLocaleString() },
            { ...DEFAULT_METRICS[5], count: res.allMLCs?.total ?? 408 },
          ]);
        }
      })
      .catch(() => {
        // Fallback to verified baseline data
      });
  }, []);

  return (
    <IonPage id="main-content">
      {/* Top Header Toolbar */}
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => document.querySelector('ion-menu')?.open()}>
              <IonIcon icon={menuOutline} />
            </IonButton>
          </IonButtons>
          <div className="home-toolbar-brand">
            <img src="/assets/images/adhikar_logo.png" alt="Adhikar Politiaware Logo" className="home-toolbar-logo" />
            <IonTitle className="home-toolbar-title">adhikar-politiaware</IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="home-page-content">
        <div className="home-container">
          
          {/* Hero Section */}
          <div className="home-hero-card">
            <div className="home-hero-badge">
              <span>🇮🇳</span>
              <span>Democratic Representation Portal</span>
            </div>
            <h1 className="home-hero-title">Indian Governance & Parliamentary Intelligence</h1>
            <p className="home-hero-desc">
              Real-time institutional mapping, representative demographics, and constituency data across all 6 legislative and constitutional bodies in India.
            </p>
          </div>

          {/* Institutional KPI Metric Cards Grid */}
          <div className="home-metrics-grid">
            {metrics.map((item) => (
              <div
                key={item.id}
                className="metric-kpi-card"
                onClick={() => navigate(item.url)}
              >
                <div className="metric-card-top">
                  <div className={`metric-icon-badge ${item.colorClass}`}>
                    {item.badge}
                  </div>
                  <IonIcon icon={arrowForwardOutline} className="metric-arrow" />
                </div>
                <div>
                  <div className="metric-number">{item.count}</div>
                  <div className="metric-label">{item.title}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Middle Row: Overall Party Distribution Chart + 300x250 Google Ad Slot */}
          <div className="home-analytics-row">
            
            {/* Overall Representation Chart */}
            <div className="home-chart-card">
              <div className="home-card-header">
                <h3 className="home-card-title">
                  <span className="card-title-dot"></span>
                  <span>Elected Representation by Political Coalition</span>
                </h3>
                <span className="home-card-tag">Aggregate Overview</span>
              </div>

              <div className="home-dual-charts">
                {/* SVG Donut Representation */}
                <div className="home-pie-box">
                  <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" stroke="#f1f5f9" stroke-width="16" fill="none"></circle>
                    {/* BJP (44%) */}
                    <circle cx="50" cy="50" r="38" stroke="#f97316" stroke-width="16" stroke-dasharray="105 238" stroke-dashoffset="0" fill="none"></circle>
                    {/* INC (26%) */}
                    <circle cx="50" cy="50" r="38" stroke="#2563eb" stroke-width="16" stroke-dasharray="62 238" stroke-dashoffset="-105" fill="none"></circle>
                    {/* Regional / Others (30%) */}
                    <circle cx="50" cy="50" r="38" stroke="#10b981" stroke-width="16" stroke-dasharray="71 238" stroke-dashoffset="-167" fill="none"></circle>
                  </svg>
                  <div className="home-pie-center">
                    <span className="home-pie-number">5.3k+</span>
                    <span className="home-pie-sub">Leaders</span>
                  </div>
                </div>

                {/* Horizontal Bar Breakdown */}
                <div className="home-bar-list">
                  <div className="home-bar-item">
                    <div className="home-bar-info">
                      <span>Bharatiya Janata Party (BJP & Allies)</span>
                      <span>2,340 (44.2%)</span>
                    </div>
                    <div className="home-bar-track">
                      <div className="home-bar-fill" style={{ width: '44.2%', backgroundColor: '#f97316' }}></div>
                    </div>
                  </div>

                  <div className="home-bar-item">
                    <div className="home-bar-info">
                      <span>Indian National Congress (INC & Allies)</span>
                      <span>1,380 (26.0%)</span>
                    </div>
                    <div className="home-bar-track">
                      <div className="home-bar-fill" style={{ width: '26%', backgroundColor: '#2563eb' }}></div>
                    </div>
                  </div>

                  <div className="home-bar-item">
                    <div className="home-bar-info">
                      <span>Regional Parties & Independents</span>
                      <span>1,592 (29.8%)</span>
                    </div>
                    <div className="home-bar-track">
                      <div className="home-bar-fill" style={{ width: '29.8%', backgroundColor: '#10b981' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dedicated 300x250 Google Ad Slot */}
            <div className="home-ads-card">
              <div className="home-ads-header">
                <span>Advertisement</span>
                <span className="home-ads-badge">AdChoices ⓘ</span>
              </div>
              <div className="home-ads-slot-300x250">
                <div className="ad-icon-box">📢</div>
                <h4 className="ad-title">Google AdSense Partner</h4>
                <p className="ad-subtitle">300 &times; 250 Medium Rectangle</p>
                <button className="ad-cta-btn">Sponsored Content</button>
                <span className="ad-disclaimer">Reserved ad placement area</span>
              </div>
            </div>

          </div>

          {/* Bottom Section: Quick Jump Directory */}
          <div className="home-directory-section">
            <div className="home-card-header">
              <h3 className="home-card-title">
                <span className="card-title-dot" style={{ backgroundColor: '#10b981' }}></span>
                <span>Institutional Explorers Directory</span>
              </h3>
              <span className="home-card-tag">Direct Access</span>
            </div>

            <div className="home-dir-grid">
              <div className="home-dir-item" onClick={() => navigate('/CMs')}>
                <div>
                  <div className="home-dir-item-title">Chief Ministers (CMs)</div>
                  <div className="home-dir-item-subtitle">31 current and former state executives</div>
                </div>
                <IonIcon icon={arrowForwardOutline} className="metric-arrow" />
              </div>

              <div className="home-dir-item" onClick={() => navigate('/Governors')}>
                <div>
                  <div className="home-dir-item-title">State Governors</div>
                  <div className="home-dir-item-subtitle">37 constitutional heads of states and UTs</div>
                </div>
                <IonIcon icon={arrowForwardOutline} className="metric-arrow" />
              </div>

              <div className="home-dir-item" onClick={() => navigate('/Loksabha')}>
                <div>
                  <div className="home-dir-item-title">Lok Sabha Members (MPs)</div>
                  <div className="home-dir-item-subtitle">544 parliamentary representatives</div>
                </div>
                <IonIcon icon={arrowForwardOutline} className="metric-arrow" />
              </div>

              <div className="home-dir-item" onClick={() => navigate('/Rajyasabha')}>
                <div>
                  <div className="home-dir-item-title">Rajya Sabha Members (MPs)</div>
                  <div className="home-dir-item-subtitle">244 upper house state representatives</div>
                </div>
                <IonIcon icon={arrowForwardOutline} className="metric-arrow" />
              </div>

              <div className="home-dir-item" onClick={() => navigate('/Assembly')}>
                <div>
                  <div className="home-dir-item-title">State Legislative Assemblies (MLAs)</div>
                  <div className="home-dir-item-subtitle">4,108 elected state assembly members</div>
                </div>
                <IonIcon icon={arrowForwardOutline} className="metric-arrow" />
              </div>

              <div className="home-dir-item" onClick={() => navigate('/Council')}>
                <div>
                  <div className="home-dir-item-title">State Legislative Councils (MLCs)</div>
                  <div className="home-dir-item-subtitle">408 legislative council members</div>
                </div>
                <IonIcon icon={arrowForwardOutline} className="metric-arrow" />
              </div>
            </div>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
