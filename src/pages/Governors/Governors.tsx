import React, { useState, useMemo } from 'react';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import {
  menuOutline,
  searchOutline,
  refreshOutline,
  alertCircleOutline,
  funnelOutline,
  closeCircleOutline,
  closeOutline,
} from 'ionicons/icons';
import { useQuery } from '@apollo/client';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  TableSortLabel,
} from '@mui/material';

import { governorsConfig, buildGraphQLQuery, buildChartSummaryQuery, renderCell } from '../../config';
import Selectable from '../../components/Selectable/Selectable';
// import UnderConstruction from '../../components/UnderConstruction/UnderConstuction';
import { FilterSection } from '../../components/FilterSection/FilterSection';
import { FilterFieldDef, FilterRule } from '../../components/FilterSection/filterTypes';
import { evaluateFilterRule } from '../../components/FilterSection/filterEvaluator';
import { useGraphQLFilterSchema } from '../../components/FilterSection/useGraphQLFilterSchema';
import { EntityDetailModal } from '../../components/EntityDetailModal/EntityDetailModal';
import './Governors.css';

export interface GovernorRecord {
  id: number | string;
  name: string;
  state: string;
  status: 'State' | 'UT';
  gender: string;
  religion: string;
  highestEducation: string;
  HighestEducation?: string;
  university: string;
  University?: string;
  startDate: string;
  appointedBy: string;
  ispresent: boolean;
  rulingstate?: any;
  rulingperiods?: any;
  birthCity?: any;
}

type CategoryKey = 'Gender' | 'Religion' | 'Education';

const ALL_COLUMNS = governorsConfig.tableColumns.map((col) => ({
  id: col.id,
  label: col.label,
}));

export const GOVERNOR_DEFAULT_FIELDS: FilterFieldDef[] = [
  { id: 'name', label: 'Governor Name', dataType: 'string', placeholder: 'e.g. Anandiben Patel' },
  { id: 'rulingstate.Statename', label: 'State / UT Name', dataType: 'string', placeholder: 'e.g. Uttar Pradesh' },
  {
    id: 'rulingstate.Status',
    label: 'Constitutional Status (State vs UT)',
    dataType: 'select',
    options: [
      { value: 'State', label: 'State' },
      { value: 'UT', label: 'Union Territory' },
    ],
  },
  {
    id: 'gender',
    label: 'Gender',
    dataType: 'select',
    options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
    ],
  },
  { id: 'religion', label: 'Religion', dataType: 'string', placeholder: 'e.g. Hindu, Sikh' },
  { id: 'HighestEducation', label: 'Highest Education', dataType: 'string', placeholder: 'e.g. Ph.D, LL.B, Graduate' },
  { id: 'University', label: 'University / Institute', dataType: 'string', placeholder: 'e.g. Delhi University' },
  { id: 'rulingperiods.startdate', label: 'Term Start Date', dataType: 'date' },
];

const getEducationCategory = (eduRaw: string): string => {
  const edu = (eduRaw || '').toLowerCase();
  if (
    edu.includes('ph.d') ||
    edu.includes('m.a') ||
    edu.includes('m.sc') ||
    edu.includes('m.tech') ||
    edu.includes('m.phil')
  ) {
    return 'Post-Grad / Ph.D';
  } else if (edu.includes('ll.b') || edu.includes('law')) {
    return 'Law (LL.B)';
  } else if (
    edu.includes('bachelor') ||
    edu.includes('b.sc') ||
    edu.includes('b.com') ||
    edu.includes('b.a') ||
    edu.includes('b.tech') ||
    edu.includes('b.b.a')
  ) {
    return 'Graduate';
  } else {
    return 'Others';
  }
};

const Governors: React.FC = () => {
  // 1. View Toggles (Table, Chart, Globe)
  const [selectedViews, setSelectedViews] = useState({
    table: true,
    map: false,
    chart: true,
  });

  // 1. Pagination, Search & Filter state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableSearch, setTableSearch] = useState('');
  const [chartFilter, setChartFilter] = useState<{ category: CategoryKey; value: string } | null>(null);
  const [advancedRules, setAdvancedRules] = useState<FilterRule[]>([]);
  const [appliedAdvancedRules, setAppliedAdvancedRules] = useState<FilterRule[]>([]);

  // 2. Dynamically generated GraphQL query from governorsConfig
  const GOVERNORS_GRAPHQL_QUERY = useMemo(() => buildGraphQLQuery(governorsConfig), []);
  const GOVERNORS_CHART_QUERY = useMemo(() => buildChartSummaryQuery(governorsConfig), []);

  // Server-side paginated query for table (limit, offset, search)
  const { data, loading, error, refetch } = useQuery(GOVERNORS_GRAPHQL_QUERY, {
    variables: {
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      search: tableSearch.trim() || undefined,
    },
    notifyOnNetworkStatusChange: true,
  });

  // Full institutional summary query for charts (37 members)
  const { data: chartData } = useQuery(GOVERNORS_CHART_QUERY, {
    variables: {
      limit: 5000,
      offset: 0,
    },
  });

  const totalCount = data?.allGovernors?.total ?? 37;

  // Map API response to GovernorRecord objects (current page batch)
  const governorsList: GovernorRecord[] = useMemo(() => {
    const rawList = data?.allGovernors?.data;
    if (!rawList || !Array.isArray(rawList)) return [];

    return rawList.map((item: any, idx: number) => ({
      id: item.id ?? idx + 1,
      name: item.name ?? 'Unknown',
      state: item.rulingstate?.Statename ?? 'Unknown',
      status: item.rulingstate?.Status === 'UT' ? 'UT' : 'State',
      gender: item.gender ?? 'Male',
      religion: item.religion ?? 'Hindu',
      highestEducation: item.HighestEducation ?? item.highestEducation ?? '-',
      HighestEducation: item.HighestEducation ?? item.highestEducation ?? '-',
      university: item.University ?? item.university ?? '-',
      University: item.University ?? item.university ?? '-',
      startDate: item.rulingperiods?.startdate ?? '-',
      appointedBy: 'President of India',
      ispresent: item.ispresent ?? true,
      rulingstate: item.rulingstate,
      rulingperiods: item.rulingperiods,
      birthCity: item.birthCity,
    }));
  }, [data]);

  // Full dataset for charts
  const chartGovernorsList = useMemo(() => {
    const rawList = chartData?.allGovernors?.data;
    if (!rawList || !Array.isArray(rawList)) return governorsList;

    return rawList.map((item: any, idx: number) => ({
      id: item.id ?? idx + 1,
      name: item.name ?? 'Unknown',
      state: item.rulingstate?.Statename ?? 'Unknown',
      status: item.rulingstate?.Status === 'UT' ? 'UT' : 'State',
      gender: item.gender ?? 'Male',
      religion: item.religion ?? 'Hindu',
      highestEducation: item.HighestEducation ?? item.highestEducation ?? '-',
    }));
  }, [chartData, governorsList]);

  // 3. Dynamically introspect filter fields and relations from backend GraphQL schema
  const { availableFields } = useGraphQLFilterSchema(
    governorsConfig.graphql.filterTypeName,
    GOVERNOR_DEFAULT_FIELDS
  );

  const handleApplyAdvancedRules = () => {
    setAppliedAdvancedRules([...advancedRules]);
    setPage(0);
  };

  const handleResetAdvancedRules = () => {
    setAdvancedRules([]);
    setAppliedAdvancedRules([]);
    setPage(0);
  };

  const handleRemoveAdvancedRule = (idx: number) => {
    const updated = appliedAdvancedRules.filter((_, i) => i !== idx);
    setAppliedAdvancedRules(updated);
    setAdvancedRules(updated);
    setPage(0);
  };

  const handleClearAll = () => {
    setTableSearch('');
    setChartFilter(null);
    setAdvancedRules([]);
    setAppliedAdvancedRules([]);
    setPage(0);
  };

  const hasActiveFilters = Boolean(
    tableSearch.trim() ||
    chartFilter !== null ||
    appliedAdvancedRules.some(
      (r) =>
        r.value.trim() !== '' ||
        r.operator === 'is_empty' ||
        r.operator === 'is_not_empty' ||
        r.operator === 'is_true' ||
        r.operator === 'is_false'
    )
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (tableSearch.trim()) count++;
    if (chartFilter !== null) count++;
    count += appliedAdvancedRules.filter(
      (r) =>
        r.value.trim() !== '' ||
        r.operator === 'is_empty' ||
        r.operator === 'is_not_empty' ||
        r.operator === 'is_true' ||
        r.operator === 'is_false'
    ).length;
    return count;
  }, [tableSearch, chartFilter, appliedAdvancedRules]);

  // Table Columns, Sorting & Pagination
  const [selectedColumns, setSelectedColumns] = useState<string[]>(() =>
    governorsConfig.tableColumns
      .filter((c) => c.defaultVisible !== false)
      .map((c) => c.id)
  );
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('state');
  const [selectedDetailRecord, setSelectedDetailRecord] = useState<any | null>(null);

  // 3. Base Filtered Data Source (Governs Charts: respects advanced rules and table search)
  const baseFilteredData = useMemo(() => {
    return governorsList.filter((gov) => {
      // Table search
      if (tableSearch.trim()) {
        const query = tableSearch.toLowerCase().trim();
        const matches =
          gov.name.toLowerCase().includes(query) ||
          gov.state.toLowerCase().includes(query) ||
          gov.religion.toLowerCase().includes(query) ||
          gov.highestEducation.toLowerCase().includes(query) ||
          gov.university.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Advanced condition rules evaluated dynamically via common evaluator
      for (const rule of appliedAdvancedRules) {
        const fieldDef =
          availableFields.find((f) => f.id === rule.field) ||
          GOVERNOR_DEFAULT_FIELDS.find((f) => f.id === rule.field);
        if (!evaluateFilterRule(gov, rule, fieldDef)) return false;
      }

      return true;
    });
  }, [governorsList, tableSearch, appliedAdvancedRules, availableFields]);

  // 4. Final Filtered Data Source (Governs Data Table: base filtered + chart filter)
  const filteredData = useMemo(() => {
    return baseFilteredData
      .filter((gov) => {
        if (chartFilter) {
          if (chartFilter.category === 'Gender') {
            if (gov.gender !== chartFilter.value) return false;
          } else if (chartFilter.category === 'Religion') {
            if (gov.religion !== chartFilter.value) return false;
          } else if (chartFilter.category === 'Education') {
            const cat = getEducationCategory(gov.highestEducation);
            if (cat !== chartFilter.value) return false;
          }
        }
        return true;
      })
      .sort((a: any, b: any) => {
        const valA = (govProperty(a, orderBy) || '').toString().toLowerCase();
        const valB = (govProperty(b, orderBy) || '').toString().toLowerCase();
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
  }, [baseFilteredData, chartFilter, availableFields, order, orderBy]);

  function govProperty(item: any, key: string) {
    return item[key] ?? item.rulingstate?.[key] ?? '';
  }

  // Chart Click Handlers
  const handleChartItemClick = (category: CategoryKey, key: string) => {
    if (chartFilter && chartFilter.category === category && chartFilter.value === key) {
      setChartFilter(null);
    } else {
      setChartFilter({ category, value: key });
    }
    setPage(0);
  };

  const handleCategoryTabChange = (cat: CategoryKey) => {
    setSelectedCategory(cat);
    setChartFilter(null);
    setPage(0);
  };

  // 5. Dynamic Category Counts for Charts (Computed from baseFilteredData)
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('Gender');

  const categoryCounts = useMemo(() => {
    const genderCounts: Record<string, number> = {};
    const religionCounts: Record<string, number> = {};
    const educationCounts: Record<string, number> = {
      'Post-Grad / Ph.D': 0,
      'Law (LL.B)': 0,
      'Graduate': 0,
      'Others': 0,
    };

    chartGovernorsList.forEach((gov) => {
      // Gender
      genderCounts[gov.gender] = (genderCounts[gov.gender] || 0) + 1;

      // Religion
      religionCounts[gov.religion] = (religionCounts[gov.religion] || 0) + 1;

      // Education category
      const eduCat = getEducationCategory(gov.highestEducation);
      if (educationCounts[eduCat] !== undefined) {
        educationCounts[eduCat] += 1;
      } else {
        educationCounts['Others'] += 1;
      }
    });

    return {
      Gender: genderCounts,
      Religion: religionCounts,
      Education: educationCounts,
    };
  }, [chartGovernorsList]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { State: 0, UT: 0 };
    chartGovernorsList.forEach((gov) => {
      counts[gov.status] = (counts[gov.status] || 0) + 1;
    });
    return counts;
  }, [chartGovernorsList]);

  const currentCategoryData = categoryCounts[selectedCategory] || {};
  const currentTotal = Object.values(currentCategoryData).reduce((sum, n) => sum + n, 0);

  // Dynamic color palette for categories
  const categoryColors = useMemo(() => {
    const palette = ['#0d9488', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'];
    const keys = Object.keys(currentCategoryData);
    const map: Record<string, string> = {};
    keys.forEach((key, idx) => {
      map[key] = palette[idx % palette.length];
    });
    return map;
  }, [currentCategoryData]);

  // SVG Doughnut Calculation Helper
  const doughnutSlices = useMemo(() => {
    let accumulatedAngle = 0;
    const entries = Object.entries(currentCategoryData);
    return entries.map(([key, count]) => {
      const percentage = currentTotal > 0 ? count / currentTotal : 0;
      const strokeDash = `${percentage * 238.76} 238.76`;
      const strokeOffset = -accumulatedAngle * 238.76;
      accumulatedAngle += percentage;
      return {
        key,
        count,
        percentage: Math.round(percentage * 100),
        color: categoryColors[key],
        strokeDash,
        strokeOffset,
      };
    });
  }, [currentCategoryData, currentTotal, categoryColors]);

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleColumnChange = (event: any) => {
    const val = event.target.value;
    setSelectedColumns(typeof val === 'string' ? val.split(',') : val);
  };

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
          <div className="governors-toolbar-brand">
            <img src="/assets/images/adhikar_logo.png" alt="Adhikar Politiaware Logo" className="governors-toolbar-logo" />
            <IonTitle className="governors-toolbar-title">adhikar-politiaware &bull; State Governors</IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="governors-page-content">
        <div className="governors-container">
          {/* Hero Banner with Key Metrics */}
          <div className="governors-hero-card">
            <div className="governors-hero-text">
              <div className="governors-hero-badge">
                <span>🇮🇳</span>
                <span>Constitutional Heads of States & UTs</span>
              </div>
              <h1>Governors of India (Executive Directory)</h1>
              <p>
                Governors and Lieutenant Governors appointed by the President of India representing executive constitutional authority across Indian States and Union Territories.
              </p>
            </div>
            <div className="governors-hero-kpi">
              <div className="hero-stat-box">
                <div className="hero-stat-num">{totalCount}</div>
                <div className="hero-stat-label">Total Governors</div>
              </div>
              <div className="hero-stat-box">
                <div className="hero-stat-num">{statusCounts['State'] || 0}</div>
                <div className="hero-stat-label">States</div>
              </div>
              <div className="hero-stat-box">
                <div className="hero-stat-num">{statusCounts['UT'] || 0}</div>
                <div className="hero-stat-label">UT / Admins</div>
              </div>
            </div>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="governors-loading-container">
              <IonSpinner name="crescent" color="primary" style={{ width: 44, height: 44 }} />
              <p className="loading-text">Loading Governors Records...</p>
            </div>
          )}

          {/* ERROR STATE: Backend Server Unreachable */}
          {!loading && error && (
            <div className="governors-error-card">
              <div className="error-icon-circle">
                <IonIcon icon={alertCircleOutline} />
              </div>
              <h2 className="error-title">Backend Server Unreachable</h2>
              <p className="error-message">
                Unable to establish a connection to the backend service. Please check your network connection or verify that the server is running.
              </p>
              <div className="error-actions-row">
                <button className="error-retry-btn" onClick={() => refetch()}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <IonIcon icon={refreshOutline} />
                    Retry Connection
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS STATE: Render Content When Data Available */}
          {!loading && !error && (
            <>
              {/* Interactive View Selector Component */}
              <Selectable onSelectionChange={setSelectedViews} />

              {/* ========================================================
                  UNIVERSAL REUSABLE FILTERS SECTION (DYNAMIC INTROSPECTED FIELDS)
                 ======================================================== */}
              <FilterSection
                title="Filters & Query Controls"
                subtitle="Refine directory and charts across dynamically introspected constitutional and demographic parameters"
                totalCount={totalCount}
                filteredCount={filteredData.length}
                availableFields={availableFields}
                advancedRules={advancedRules}
                onAdvancedRulesChange={setAdvancedRules}
                appliedAdvancedRules={appliedAdvancedRules}
                onApplyAdvancedRules={handleApplyAdvancedRules}
                onResetAdvancedRules={handleResetAdvancedRules}
                onClearAll={handleClearAll}
                hasActiveFilters={hasActiveFilters}
                activeFiltersCount={activeFiltersCount}
                onRemoveAdvancedRule={handleRemoveAdvancedRule}
                extraActiveChips={
                  chartFilter
                    ? [
                        {
                          id: `chart-${chartFilter.category}-${chartFilter.value}`,
                          label:
                            chartFilter.category === 'Gender'
                              ? 'Gender'
                              : chartFilter.category === 'Religion'
                              ? 'Religion'
                              : 'Education',
                          value: chartFilter.value,
                          onRemove: () => setChartFilter(null),
                        },
                      ]
                    : []
                }
              />

              {/* ========================================================
                  1. TOP SECTION: ANALYSIS CHART CANVAS + 300x250 GOOGLE AD
                 ======================================================== */}
              {selectedViews.chart && (
                <section className="governors-charts-row">
                  {/* Left Column: Chart Canvas */}
                  <div className="chart-canvas-card">
                    <div className="card-header-bar">
                      <h3 className="card-header-title">
                        <span className="card-header-accent"></span>
                        <span>1. Analysis Charts (Pie & Bar Canvas)</span>
                      </h3>

                      {/* Category Selector Tabs */}
                      <div className="chart-category-tabs">
                        {governorsConfig.charts.map((chart) => (
                          <button
                            key={chart.key}
                            className={`chart-cat-btn ${selectedCategory === chart.key ? 'active' : ''}`}
                            onClick={() => handleCategoryTabChange(chart.key as CategoryKey)}
                          >
                            {chart.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dual Visualizations Grid */}
                    <div className="visualizations-grid">
                      {/* Left: SVG Doughnut Chart */}
                      <div className="pie-visual-box">
                        <span className="visual-box-title">
                          Distribution Ratio
                          {chartFilter && chartFilter.category === selectedCategory && (
                            <span className="chart-active-filter-hint" style={{ fontSize: 10, color: '#0d9488', marginLeft: 6, fontWeight: 700 }}>
                              (Filtered: {chartFilter.value})
                            </span>
                          )}
                        </span>
                        <div className="doughnut-wrapper">
                          <svg className="doughnut-svg" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                            {doughnutSlices.map((slice) => {
                              const isSelected = chartFilter?.category === selectedCategory && chartFilter.value === slice.key;
                              const isAnySelected = chartFilter?.category === selectedCategory;

                              return (
                                <circle
                                  key={slice.key}
                                  cx="50"
                                  cy="50"
                                  r="38"
                                  fill="transparent"
                                  stroke={slice.color}
                                  strokeWidth={isSelected ? 16 : 12}
                                  strokeDasharray={slice.strokeDash}
                                  strokeDashoffset={slice.strokeOffset}
                                  strokeLinecap="round"
                                  style={{
                                    cursor: 'pointer',
                                    opacity: isAnySelected && !isSelected ? 0.35 : 1,
                                    transition: 'all 0.25s ease',
                                  }}
                                  onClick={() => handleChartItemClick(selectedCategory, slice.key)}
                                >
                                  <title>{`Click to filter by ${slice.key} (${slice.count})`}</title>
                                </circle>
                              );
                            })}
                          </svg>
                          <div className="doughnut-center-text">
                            <span className="doughnut-total-num">{currentTotal}</span>
                            <span className="doughnut-total-label">Total</span>
                          </div>
                        </div>

                        {/* Doughnut Legend */}
                        <div className="doughnut-legend">
                          {doughnutSlices.map((slice) => {
                            const isSelected = chartFilter?.category === selectedCategory && chartFilter.value === slice.key;
                            const isAnySelected = chartFilter?.category === selectedCategory;

                            return (
                              <div
                                key={slice.key}
                                className={`legend-item ${isSelected ? 'selected-legend-item' : ''}`}
                                style={{
                                  cursor: 'pointer',
                                  opacity: isAnySelected && !isSelected ? 0.45 : 1,
                                }}
                                onClick={() => handleChartItemClick(selectedCategory, slice.key)}
                                title={`Click to filter by ${slice.key}`}
                              >
                                <span className="legend-dot" style={{ backgroundColor: slice.color }}></span>
                                <span>
                                  {slice.key}: <strong>{slice.count}</strong> ({slice.percentage}%)
                                </span>
                                {isSelected && <span style={{ color: '#0d9488', fontWeight: 900, marginLeft: 2 }}>&#x2713;</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Comparative Bar Representation */}
                      <div className="bar-visual-box">
                        <span className="visual-box-title">
                          Comparative Counts
                          {chartFilter && chartFilter.category === selectedCategory && (
                            <span className="chart-active-filter-hint" style={{ fontSize: 10, color: '#0d9488', marginLeft: 6, fontWeight: 700 }}>
                              (Filtered: {chartFilter.value})
                            </span>
                          )}
                        </span>
                        {Object.entries(currentCategoryData).map(([key, count]) => {
                          const percentage = currentTotal > 0 ? Math.round((count / currentTotal) * 100) : 0;
                          const isSelected = chartFilter?.category === selectedCategory && chartFilter.value === key;
                          const isAnySelected = chartFilter?.category === selectedCategory;

                          return (
                            <div
                              key={key}
                              className={`bar-item ${isSelected ? 'selected-bar-item' : ''}`}
                              style={{
                                cursor: 'pointer',
                                opacity: isAnySelected && !isSelected ? 0.45 : 1,
                              }}
                              onClick={() => handleChartItemClick(selectedCategory, key)}
                              title={`Click to filter by ${key}`}
                            >
                              <div className="bar-item-header">
                                <span>
                                  {key}
                                  {isSelected && <span style={{ color: '#0d9488', fontWeight: 900, marginLeft: 6 }}>&#x2713;</span>}
                                </span>
                                <span>
                                  <strong>{count}</strong> ({percentage}%)
                                </span>
                              </div>
                              <div className="bar-track">
                                <div
                                  className="bar-fill"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: categoryColors[key] || '#0d9488',
                                    boxShadow: isSelected ? '0 0 8px rgba(13, 148, 136, 0.4)' : undefined,
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 300x250 Google Ad Slot */}
                  <div className="governors-ad-card">
                    <div className="ad-header-disclaimer">
                      <span>SPONSORED</span>
                      <span className="ad-choices-link">AdChoices &#x25B8;</span>
                    </div>
                    <div className="ad-box-300x250">
                      <div className="ad-badge-sponsored">Sponsored</div>
                      <h4 className="ad-slot-title">PolitiAware Insights</h4>
                      <p className="ad-slot-desc">
                        Constitutional analytics, civic intelligence, and legislative transparency platform.
                      </p>
                      <button className="ad-cta-btn">Learn More</button>
                    </div>
                  </div>
                </section>
              )}

              {/* ========================================================
                  2. MIDDLE SECTION: DATA TABLE RECORDS
                 ======================================================== */}
              {selectedViews.table && (
                <section className="governors-table-card">
                  {/* Table Controls & Column Customization */}
                  <div className="table-controls-bar">
                    <div className="table-title-group">
                      <span className="card-header-accent"></span>
                      <h3 className="card-header-title">2. Data Table Records</h3>
                      <span className="filters-results-badge">
                        Showing {totalCount > 0 ? page * rowsPerPage + 1 : 0}-{Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount} Governors
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      {/* Search in table */}
                      <div className="table-search-input">
                        <IonIcon icon={searchOutline} style={{ color: '#94a3b8', marginRight: 8, fontSize: 16 }} />
                        <input
                          type="text"
                          placeholder="Filter in results..."
                          value={tableSearch}
                          onChange={(e) => {
                            setTableSearch(e.target.value);
                            setPage(0);
                          }}
                        />
                        {tableSearch && (
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}
                            onClick={() => { setTableSearch(''); setPage(0); }}
                          >
                            <IonIcon icon={closeOutline} />
                          </button>
                        )}
                      </div>

                      {/* MUI Column Visibility Customizer */}
                      <div className="column-select-dropdown">
                        <FormControl size="small" style={{ minWidth: 170 }}>
                          <InputLabel id="gov-columns-select-label" style={{ fontSize: 12 }}>
                            Columns
                          </InputLabel>
                          <Select
                            labelId="gov-columns-select-label"
                            multiple
                            value={selectedColumns}
                            onChange={handleColumnChange}
                            renderValue={(selected) => `${(selected as string[]).length} Columns`}
                            style={{ fontSize: 12, height: 36, background: '#ffffff' }}
                          >
                            {ALL_COLUMNS.map((col) => (
                              <MenuItem key={col.id} value={col.id} style={{ fontSize: 12 }}>
                                <Checkbox checked={selectedColumns.indexOf(col.id) > -1} size="small" />
                                <ListItemText primary={col.label} primaryTypographyProps={{ fontSize: 12 }} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </div>
                  </div>

                  {/* Responsive Scrollable Table */}
                  <div style={{ overflowX: 'auto' }}>
                    <Table className="governors-custom-table" size="small">
                      <TableHead>
                        <TableRow>
                          {governorsConfig.tableColumns
                            .filter((col) => selectedColumns.includes(col.id))
                            .map((col) => (
                              <TableCell key={col.id} align={col.align || 'left'} style={{ width: col.width }}>
                                {col.sortable ? (
                                  <TableSortLabel
                                    active={orderBy === col.id}
                                    direction={orderBy === col.id ? order : 'asc'}
                                    onClick={() => handleSort(col.id as any)}
                                  >
                                    {col.label}
                                  </TableSortLabel>
                                ) : (
                                  col.label
                                )}
                              </TableCell>
                            ))}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {filteredData.map((gov) => (
                          <TableRow
                            key={gov.id}
                            hover
                            onClick={() => setSelectedDetailRecord(gov)}
                            style={{ cursor: 'pointer' }}
                          >
                            {governorsConfig.tableColumns
                              .filter((col) => selectedColumns.includes(col.id))
                              .map((col) => (
                                <TableCell key={col.id} align={col.align || 'left'}>
                                  {renderCell(gov, col, {
                                    onViewDetails: (record) => setSelectedDetailRecord(record),
                                  })}
                                </TableCell>
                              ))}
                          </TableRow>
                        ))}

                        {filteredData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={selectedColumns.length} style={{ textAlign: 'center', padding: '48px 16px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                <div style={{ fontSize: 32, color: '#94a3b8' }}>
                                  <IonIcon icon={funnelOutline} />
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>
                                  No Governors Match the Active Filters
                                </div>
                                <div style={{ fontSize: 12, color: '#64748b', maxWidth: 360, lineHeight: 1.4 }}>
                                  Try clearing your search query, adjusting quick status/demographic filters, or resetting advanced rules.
                                </div>
                                <button
                                  onClick={handleClearAll}
                                  style={{
                                    marginTop: 6,
                                    background: '#0d9488',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '8px 18px',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                  }}
                                >
                                  <IonIcon icon={closeCircleOutline} />
                                  Clear All Filters
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* MUI Table Pagination */}
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    component="div"
                    count={totalCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    style={{ borderTop: '1px solid #f1f5f9' }}
                  />
                </section>
              )}

              {/* ========================================================
                  3. BOTTOM SECTION: GLOBE VIEW - UNDER CONSTRUCTION (COMMENTED OUT)
                 ======================================================== */}
              {/* {selectedViews.map && (
                <section className="governors-globe-section">
                  <div className="globe-header">
                    <h3 className="globe-header-title">
                      <span className="card-header-accent"></span>
                      <span>3. Globe View (Geospatial Mapping)</span>
                    </h3>
                  </div>
                  <div className="globe-under-construction-banner">
                    <div className="globe-icon-circle">🌍</div>
                    <h4 className="globe-banner-title">Geospatial Globe View is Under Construction</h4>
                    <p className="globe-banner-desc">
                      Interactive 3D geospatial mapping and jurisdiction boundaries for State Governors are currently under active development.
                    </p>
                    <div className="globe-feature-pills">
                      <span className="globe-feature-pill">📍 State Jurisdiction Mapping</span>
                      <span className="globe-feature-pill">🏛️ Raj Bhavan Demographics</span>
                      <span className="globe-feature-pill">🌐 Constitutional History Timeline</span>
                    </div>
                  </div>
                  <UnderConstruction />
                </section>
              )} */}
            </>
          )}
        </div>

        {/* Entity Details Modal */}
        <EntityDetailModal
          open={Boolean(selectedDetailRecord)}
          onClose={() => setSelectedDetailRecord(null)}
          record={selectedDetailRecord}
          entityType="Governor"
        />
      </IonContent>
    </IonPage>
  );
};

export default Governors;
