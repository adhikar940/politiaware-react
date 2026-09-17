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
  refreshOutline,
  alertCircleOutline,
  funnelOutline,
  closeCircleOutline,
  searchOutline,
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

import { rajyasabhaConfig, buildGraphQLQuery, buildChartSummaryQuery, renderCell } from '../../config';
import Selectable from '../../components/Selectable/Selectable';
import UnderConstruction from '../../components/UnderConstruction/UnderConstuction';
import { FilterSection } from '../../components/FilterSection/FilterSection';
import { FilterFieldDef, FilterRule } from '../../components/FilterSection/filterTypes';
import { evaluateFilterRule } from '../../components/FilterSection/filterEvaluator';
import { useGraphQLFilterSchema } from '../../components/FilterSection/useGraphQLFilterSchema';
import { EntityDetailModal } from '../../components/EntityDetailModal/EntityDetailModal';
import './Rajyasabha.css';

export interface RajyaSabhaRecord {
  id: number | string;
  name: string;
  state: string;
  party: string;
  partyName?: string;
  partyColor?: string;
  rawParty?: any;
  gender: string;
  elected?: string;
  religion: string;
  highestEducation: string;
  university: string;
  ispresent: boolean;
  [key: string]: any;
}

type CategoryKey = 'Party' | 'Gender' | 'Religion' | 'Education';

const ALL_COLUMNS = rajyasabhaConfig.tableColumns.map((col) => ({
  id: col.id,
  label: col.label,
}));

export const RAJYASABHA_FILTER_FIELDS: FilterFieldDef[] = [
  { id: 'name', label: 'MP Name', dataType: 'string', placeholder: 'e.g. J.P. Nadda' },
  { id: 'state.Statename', label: 'State / Representation', dataType: 'string', placeholder: 'e.g. Gujarat' },
  { id: 'party.abbreviation', label: 'Party Abbreviation', dataType: 'string', placeholder: 'e.g. BJP, INC, AAP' },
  {
    id: 'gender',
    label: 'Gender',
    dataType: 'select',
    options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
    ],
  },
  {
    id: 'elected',
    label: 'Electorate / Type',
    dataType: 'string',
    placeholder: 'e.g. Legislature, Nominated',
  },
  {
    id: 'HighestEducation',
    label: 'Highest Education',
    dataType: 'string',
    placeholder: 'e.g. Graduate, Post Graduate',
  },
];

const getEducationCategory = (edu: string): string => {
  const low = (edu || '').toLowerCase();
  if (low.includes('ph.d') || low.includes('doctor') || low.includes('m.phil') || low.includes('post-grad') || low.includes('m.') || low.includes('master')) {
    return 'Post-Grad / Ph.D';
  } else if (low.includes('ll.b') || low.includes('law') || low.includes('advocate') || low.includes('barrister')) {
    return 'Law (LL.B)';
  } else if (low.includes('graduate') || low.includes('b.') || low.includes('bachelor') || low.includes('degree') || low.includes('engineering')) {
    return 'Graduate';
  } else {
    return 'Others';
  }
};

const Rajyasabha: React.FC = () => {
  const [selectedViews, setSelectedViews] = useState({
    table: true,
    map: true,
    chart: true,
  });

  // 1. Pagination, Search & Filter state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableSearch, setTableSearch] = useState('');
  const [chartFilter, setChartFilter] = useState<{ category: CategoryKey; value: string } | null>(null);
  const [advancedRules, setAdvancedRules] = useState<FilterRule[]>([]);
  const [appliedAdvancedRules, setAppliedAdvancedRules] = useState<FilterRule[]>([]);

  // 2. Dynamically generated GraphQL queries from rajyasabhaConfig
  const RAJYASABHA_GRAPHQL_QUERY = useMemo(() => buildGraphQLQuery(rajyasabhaConfig), []);
  const RAJYASABHA_CHART_QUERY = useMemo(() => buildChartSummaryQuery(rajyasabhaConfig), []);

  // Server-side paginated query for table
  const { data, loading, error, refetch } = useQuery(RAJYASABHA_GRAPHQL_QUERY, {
    variables: {
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      search: tableSearch.trim() || undefined,
    },
    notifyOnNetworkStatusChange: true,
  });

  // Full institutional summary query for charts (244 members)
  const { data: chartData } = useQuery(RAJYASABHA_CHART_QUERY, {
    variables: {
      limit: 5000,
      offset: 0,
    },
  });

  const totalCount = data?.allRajyasabhaMPs?.total ?? 244;

  // Map API response to RajyaSabhaRecord objects (current page batch)
  const mpList: RajyaSabhaRecord[] = useMemo(() => {
    const rawList = data?.allRajyasabhaMPs?.data;
    if (!rawList || !Array.isArray(rawList)) return [];

    return rawList.map((item: any, idx: number) => ({
      ...item,
      id: item.id ?? idx + 1,
      name: item.name ?? 'Unknown',
      state: item.state?.Statename ?? item.state ?? 'Unknown',
      status: item.state?.Status === 'UT' ? 'UT' : 'State',
      party: item.party?.abbreviation || 'Others',
      partyName: item.party?.partyname || 'Other Party',
      partyColor: item.party?.partyColor || '#4338ca',
      rawParty: item.party,
      gender: item.gender ?? 'Male',
      elected: item.elected ?? '-',
      religion: item.religion ?? 'Hindu',
      highestEducation: item.HighestEducation ?? item.highestEducation ?? '-',
      university: item.University ?? item.university ?? '-',
      ispresent: item.isPresent ?? item.ispresent ?? true,
    }));
  }, [data]);

  // Full dataset for charts
  const chartMpsList = useMemo(() => {
    const rawList = chartData?.allRajyasabhaMPs?.data;
    if (!rawList || !Array.isArray(rawList)) return mpList;

    return rawList.map((item: any, idx: number) => ({
      ...item,
      id: item.id ?? idx + 1,
      name: item.name ?? 'Unknown',
      party: item.party?.abbreviation || 'Others',
      partyName: item.party?.partyname || 'Other Party',
      partyColor: item.party?.partyColor || '#4338ca',
      gender: item.gender ?? 'Male',
      religion: item.religion ?? 'Hindu',
      highestEducation: item.HighestEducation ?? item.highestEducation ?? '-',
    }));
  }, [chartData, mpList]);

  const { availableFields } = useGraphQLFilterSchema(
    rajyasabhaConfig.graphql.filterTypeName,
    RAJYASABHA_FILTER_FIELDS
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
        r.field &&
        r.operator &&
        (r.value !== '' || ['is_null', 'is_not_null', 'is_empty', 'is_not_empty'].includes(r.operator))
    )
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (tableSearch.trim()) count++;
    if (chartFilter !== null) count++;
    count += appliedAdvancedRules.filter(
      (r) =>
        r.field &&
        r.operator &&
        (r.value !== '' || ['is_null', 'is_not_null', 'is_empty', 'is_not_empty'].includes(r.operator))
    ).length;
    return count;
  }, [tableSearch, chartFilter, appliedAdvancedRules]);

  // Table state
  const [selectedColumns, setSelectedColumns] = useState<string[]>(() =>
    rajyasabhaConfig.tableColumns
      .filter((c) => c.defaultVisible !== false)
      .map((c) => c.id)
  );
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('name');
  const [selectedDetailRecord, setSelectedDetailRecord] = useState<any | null>(null);

  // Base filtered
  const baseFilteredData = useMemo(() => {
    return mpList.filter((mp) => {
      if (tableSearch.trim()) {
        const query = tableSearch.toLowerCase().trim();
        const matches =
          mp.name.toLowerCase().includes(query) ||
          mp.state.toLowerCase().includes(query) ||
          mp.party.toLowerCase().includes(query) ||
          (mp.partyName && mp.partyName.toLowerCase().includes(query)) ||
          mp.religion.toLowerCase().includes(query) ||
          mp.highestEducation.toLowerCase().includes(query);
        if (!matches) return false;
      }

      for (const rule of appliedAdvancedRules) {
        const fieldDef =
          availableFields.find((f) => f.id === rule.field) ||
          RAJYASABHA_FILTER_FIELDS.find((f) => f.id === rule.field);
        if (!evaluateFilterRule(mp, rule, fieldDef)) return false;
      }

      return true;
    });
  }, [mpList, tableSearch, appliedAdvancedRules, availableFields]);

  // Final filtered
  const filteredData = useMemo(() => {
    return baseFilteredData
      .filter((mp) => {
        if (chartFilter) {
          if (chartFilter.category === 'Party') {
            if (mp.party !== chartFilter.value) return false;
          } else if (chartFilter.category === 'Gender') {
            if (mp.gender !== chartFilter.value) return false;
          } else if (chartFilter.category === 'Religion') {
            if (mp.religion !== chartFilter.value) return false;
          } else if (chartFilter.category === 'Education') {
            const cat = getEducationCategory(mp.highestEducation);
            if (cat !== chartFilter.value) return false;
          }
        }
        return true;
      })
      .sort((a: any, b: any) => {
        const valA = (a[orderBy] || '').toString().toLowerCase();
        const valB = (b[orderBy] || '').toString().toLowerCase();
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
  }, [baseFilteredData, chartFilter, order, orderBy]);

  const handleSort = (columnId: string) => {
    if (orderBy === columnId) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(columnId);
      setOrder('asc');
    }
  };

  const handleColumnChange = (event: any) => {
    setSelectedColumns(event.target.value as string[]);
  };

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

  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('Party');

  const categoryCounts = useMemo(() => {
    const partyCounts: Record<string, number> = {};
    const genderCounts: Record<string, number> = {};
    const religionCounts: Record<string, number> = {};
    const educationCounts: Record<string, number> = {
      'Post-Grad / Ph.D': 0,
      'Law (LL.B)': 0,
      'Graduate': 0,
      'Others': 0,
    };

    chartMpsList.forEach((mp) => {
      partyCounts[mp.party] = (partyCounts[mp.party] || 0) + 1;
      genderCounts[mp.gender] = (genderCounts[mp.gender] || 0) + 1;
      religionCounts[mp.religion] = (religionCounts[mp.religion] || 0) + 1;
      const eduCat = getEducationCategory(mp.highestEducation);
      if (educationCounts[eduCat] !== undefined) {
        educationCounts[eduCat] += 1;
      } else {
        educationCounts['Others'] += 1;
      }
    });

    return {
      Party: partyCounts,
      Gender: genderCounts,
      Religion: religionCounts,
      Education: educationCounts,
    };
  }, [chartMpsList]);

  const currentCategoryData = categoryCounts[selectedCategory] || {};
  const currentTotal = Object.values(currentCategoryData).reduce((sum, n) => sum + n, 0);

  const categoryColors = useMemo(() => {
    if (selectedCategory === 'Party') {
      const backendColorMap: Record<string, string> = {};
      chartMpsList.forEach((mp) => {
        if (mp.party && mp.partyColor) {
          backendColorMap[mp.party] = mp.partyColor;
        }
      });
      const keys = Object.keys(currentCategoryData);
      const fallbackPalette = ['#4338ca', '#f97316', '#10b981', '#a855f7', '#ef4444', '#eab308', '#64748b'];
      const map: Record<string, string> = {};
      keys.forEach((key, idx) => {
        map[key] = backendColorMap[key] || fallbackPalette[idx % fallbackPalette.length];
      });
      return map;
    }

    const palette = ['#4338ca', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#0d9488'];
    const keys = Object.keys(currentCategoryData);
    const map: Record<string, string> = {};
    keys.forEach((key, idx) => {
      map[key] = palette[idx % palette.length];
    });
    return map;
  }, [selectedCategory, currentCategoryData, chartMpsList]);

  const donutSlices = useMemo(() => {
    if (currentTotal === 0) return [];
    let cumulative = 0;
    const circumference = 2 * Math.PI * 38;

    return Object.entries(currentCategoryData)
      .filter(([_, count]) => count > 0)
      .map(([key, count]) => {
        const ratio = count / currentTotal;
        const strokeDasharray = `${ratio * circumference} ${circumference}`;
        const strokeDashoffset = -cumulative * circumference;
        cumulative += ratio;

        return {
          key,
          count,
          percentage: (ratio * 100).toFixed(1),
          strokeDasharray,
          strokeDashoffset,
          color: categoryColors[key] || '#94a3b8',
        };
      });
  }, [currentCategoryData, currentTotal, categoryColors]);

  return (
    <IonPage id="main-content">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => document.querySelector('ion-menu')?.open()}>
              <IonIcon icon={menuOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle style={{ fontWeight: 'bold' }}>Rajya Sabha Members (MPs)</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => refetch()} title="Refresh Data">
              <IonIcon icon={refreshOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <Selectable onSelectionChange={setSelectedViews} />

        <div className="rajyasabha-container">
          {/* HERO BANNER */}
          <div className="rajyasabha-hero-banner">
            <div className="rajyasabha-hero-text">
              <h1>Rajya Sabha (Council of States)</h1>
              <p>
                Permanent upper house of Parliament representing Indian States and Union Territories, maintaining continuity in India's federal legislative structure.
              </p>
            </div>
            <div className="rajyasabha-hero-kpi">
              <div className="hero-stat-box">
                <div className="hero-stat-num">{data?.allRajyasabhaMPs?.total ?? totalCount}</div>
                <div className="hero-stat-label">Total MPs</div>
              </div>
              <div className="hero-stat-box">
                <div className="hero-stat-num">{categoryCounts.Gender['Female'] || 0}</div>
                <div className="hero-stat-label">Women MPs</div>
              </div>
              <div className="hero-stat-box">
                <div className="hero-stat-num">{Object.keys(categoryCounts.Party).length}</div>
                <div className="hero-stat-label">Parties</div>
              </div>
            </div>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="rajyasabha-loading-container">
              <IonSpinner name="crescent" color="primary" style={{ width: 44, height: 44 }} />
              <p className="loading-text">Loading Rajya Sabha Records...</p>
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="rajyasabha-error-card">
              <div className="error-icon-circle">
                <IonIcon icon={alertCircleOutline} />
              </div>
              <h2 className="error-title">Backend Server Unreachable</h2>
              <p className="error-desc">
                Could not connect to the GraphQL server. Please ensure the backend is running.
              </p>
              <button className="error-retry-btn" onClick={() => refetch()}>
                <IonIcon icon={refreshOutline} />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* FILTER SECTION */}
              <FilterSection
                title="Filters & Query Controls"
                subtitle="Refine directory and charts across dynamic parliamentary and demographic parameters"
                totalCount={totalCount}
                filteredCount={chartFilter ? filteredData.length : totalCount}
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
                          label: chartFilter.category,
                          value: chartFilter.value,
                          onRemove: () => setChartFilter(null),
                        },
                      ]
                    : []
                }
              />

              {/* 1. TOP SECTION: ANALYSIS CHART CANVAS + 300x250 GOOGLE AD */}
              {selectedViews.chart && (
                <section className="rajyasabha-charts-row">
                  <div className="chart-canvas-card">
                    <div className="card-header-bar">
                      <h3 className="card-header-title">
                        <span className="card-header-accent"></span>
                        <span>1. Analysis Charts (Pie & Bar Canvas)</span>
                      </h3>

                      <div className="chart-category-tabs">
                        {rajyasabhaConfig.charts.map((chart) => (
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

                    <div className="visualizations-grid">
                      <div className="pie-visual-box">
                        <span className="visual-box-title">
                          Distribution Ratio
                          {chartFilter && chartFilter.category === selectedCategory && (
                            <span style={{ fontSize: 10, color: '#4338ca', marginLeft: 6, fontWeight: 700 }}>
                              (Filtered: {chartFilter.value})
                            </span>
                          )}
                        </span>
                        <div className="donut-svg-wrapper">
                          <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100" style={{ width: 170, height: 170 }}>
                            <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="15" fill="none" />
                            {donutSlices.map((slice) => {
                              const isSelected = chartFilter?.category === selectedCategory && chartFilter.value === slice.key;
                              const isAnySelected = chartFilter?.category === selectedCategory;
                              return (
                                <circle
                                  key={slice.key}
                                  cx="50"
                                  cy="50"
                                  r="38"
                                  stroke={slice.color}
                                  strokeWidth={isSelected ? 18 : 15}
                                  strokeDasharray={slice.strokeDasharray}
                                  strokeDashoffset={slice.strokeDashoffset}
                                  fill="none"
                                  opacity={!isAnySelected || isSelected ? 1 : 0.25}
                                  style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    transformOrigin: 'center',
                                  }}
                                  onClick={() => handleChartItemClick(selectedCategory, slice.key)}
                                >
                                  <title>{`${slice.key}: ${slice.count} (${slice.percentage}%)`}</title>
                                </circle>
                              );
                            })}
                          </svg>
                          <div className="pie-center-stat">
                            <span className="pie-center-num">{currentTotal}</span>
                            <span className="pie-center-label">Total MPs</span>
                          </div>
                        </div>
                      </div>

                      <div className="bar-visual-box">
                        <span className="visual-box-title">Comparative Volume Breakdown</span>
                        <div className="bar-breakdown-list">
                          {donutSlices.map((slice) => {
                            const isSelected = chartFilter?.category === selectedCategory && chartFilter.value === slice.key;
                            const isAnySelected = chartFilter?.category === selectedCategory;
                            return (
                              <div
                                key={slice.key}
                                className="bar-row-item"
                                style={{
                                  opacity: !isAnySelected || isSelected ? 1 : 0.35,
                                  background: isSelected ? 'rgba(67, 56, 202, 0.08)' : 'transparent',
                                }}
                                onClick={() => handleChartItemClick(selectedCategory, slice.key)}
                              >
                                <div className="bar-row-header">
                                  <span className="bar-row-label">{slice.key}</span>
                                  <span className="bar-row-val">{slice.count} ({slice.percentage}%)</span>
                                </div>
                                <div className="bar-row-track">
                                  <div
                                    className="bar-row-fill"
                                    style={{
                                      width: `${slice.percentage}%`,
                                      backgroundColor: slice.color,
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rajyasabha-ads-card">
                    <div className="rajyasabha-ads-header">
                      <span>Advertisement</span>
                      <span>AdChoices ⓘ</span>
                    </div>
                    <div className="rajyasabha-ads-slot-300x250">
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📢</div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>Google AdSense Partner</h4>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px 0' }}>300 × 250 Medium Rectangle</p>
                      <button className="action-btn-pill">Sponsored Content</button>
                    </div>
                  </div>
                </section>
              )}

              {/* 2. DATA TABLE */}
              {selectedViews.table && (
                <section className="rajyasabha-table-section">
                  <div className="table-controls-bar">
                    <div className="table-record-count">
                      <span>Showing </span>
                      <strong>{totalCount > 0 ? page * rowsPerPage + 1 : 0}</strong>
                      <span>-</span>
                      <strong>{Math.min((page + 1) * rowsPerPage, totalCount)}</strong>
                      <span> of </span>
                      <strong>{totalCount}</strong>
                      <span> MPs</span>
                      {chartFilter && (
                        <button
                          onClick={() => setChartFilter(null)}
                          style={{
                            marginLeft: 12,
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#1d4ed8',
                            borderRadius: 6,
                            padding: '2px 8px',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          ✕ Reset {chartFilter.category} Filter
                        </button>
                      )}
                    </div>

                    <div className="table-actions-group" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div className="table-search-input" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '4px 10px', height: 36 }}>
                        <IonIcon icon={searchOutline} style={{ color: '#94a3b8', marginRight: 8, fontSize: 16 }} />
                        <input
                          type="text"
                          placeholder="Filter in results..."
                          value={tableSearch}
                          onChange={(e) => {
                            setTableSearch(e.target.value);
                            setPage(0);
                          }}
                          style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, width: 140 }}
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
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel id="rajyasabha-columns-select-label" style={{ fontSize: 12 }}>
                          Columns
                        </InputLabel>
                        <Select
                          labelId="rajyasabha-columns-select-label"
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

                  <div style={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {rajyasabhaConfig.tableColumns
                            .filter((col) => selectedColumns.includes(col.id))
                            .map((col) => (
                              <TableCell key={col.id} align={col.align || 'left'} style={{ width: col.width }}>
                                {col.sortable ? (
                                  <TableSortLabel
                                    active={orderBy === col.id}
                                    direction={orderBy === col.id ? order : 'asc'}
                                    onClick={() => handleSort(col.id)}
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
                        {filteredData.map((mp) => (
                          <TableRow
                            key={mp.id}
                            hover
                            onClick={() => setSelectedDetailRecord(mp)}
                            style={{ cursor: 'pointer' }}
                          >
                            {rajyasabhaConfig.tableColumns
                              .filter((col) => selectedColumns.includes(col.id))
                              .map((col) => (
                                <TableCell key={col.id} align={col.align || 'left'}>
                                  {renderCell(mp, col, {
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
                                  No Rajya Sabha Members Match the Active Filters
                                </div>
                                <button
                                  onClick={handleClearAll}
                                  style={{
                                    marginTop: 6,
                                    background: '#4338ca',
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

              {/* 3. GLOBE VIEW */}
              {selectedViews.map && (
                <section className="rajyasabha-globe-section">
                  <div className="globe-header">
                    <h3 className="globe-header-title">
                      <span className="card-header-accent"></span>
                      <span>3. Globe View (Geospatial Mapping)</span>
                    </h3>
                  </div>
                  <div className="globe-under-construction-banner">
                    <div className="globe-icon-circle">🌍</div>
                    <h4 className="globe-banner-title">State Legislative Allocations Under Construction</h4>
                    <p className="globe-banner-desc">
                      Interactive 3D geospatial mapping and state seat quotas for Rajya Sabha are currently in development.
                    </p>
                    <div className="globe-feature-pills">
                      <span className="globe-feature-pill">📍 State Federal Quotas</span>
                      <span className="globe-feature-pill">🏛️ Council of States Balance</span>
                      <span className="globe-feature-pill">📊 State Demographics</span>
                    </div>
                  </div>
                  <UnderConstruction />
                </section>
              )}
            </>
          )}
        </div>

        {/* Entity Details Modal */}
        <EntityDetailModal
          open={Boolean(selectedDetailRecord)}
          onClose={() => setSelectedDetailRecord(null)}
          record={selectedDetailRecord}
          entityType="Rajya Sabha MP"
        />
      </IonContent>
    </IonPage>
  );
};

export default Rajyasabha;
