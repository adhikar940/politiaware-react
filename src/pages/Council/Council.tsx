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

import { councilConfig, buildGraphQLQuery, buildChartSummaryQuery, renderCell } from '../../config';
import Selectable from '../../components/Selectable/Selectable';
// import UnderConstruction from '../../components/UnderConstruction/UnderConstuction';
import { FilterSection } from '../../components/FilterSection/FilterSection';
import { FilterFieldDef, FilterRule } from '../../components/FilterSection/filterTypes';
import { evaluateFilterRule } from '../../components/FilterSection/filterEvaluator';
import { useGraphQLFilterSchema } from '../../components/FilterSection/useGraphQLFilterSchema';
import { EntityDetailModal } from '../../components/EntityDetailModal/EntityDetailModal';
import './Council.css';

export interface MLCRecord {
  id: number | string;
  name: string;
  constituency: string;
  state: string;
  party: string;
  partyName?: string;
  partyColor?: string;
  rawParty?: any;
  gender: string;
  elected?: string;
  highestEducation: string;
  university: string;
  ispresent: boolean;
  [key: string]: any;
}

type CategoryKey = 'Party' | 'Gender' | 'Education';

const ALL_COLUMNS = councilConfig.tableColumns.map((col) => ({
  id: col.id,
  label: col.label,
}));

export const COUNCIL_FILTER_FIELDS: FilterFieldDef[] = [
  { id: 'name', label: 'MLC Name', dataType: 'string', placeholder: 'e.g. MLC Name' },
  { id: 'constituencyName', label: 'Constituency', dataType: 'string', placeholder: 'e.g. Graduates, Teachers' },
  { id: 'state.Statename', label: 'State', dataType: 'string', placeholder: 'e.g. Uttar Pradesh, Maharashtra' },
  { id: 'party.abbreviation', label: 'Party Abbreviation', dataType: 'string', placeholder: 'e.g. BJP, SP, INC' },
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
    label: 'Elected By / Category',
    dataType: 'string',
    placeholder: 'e.g. Graduates, Local body',
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

const Council: React.FC = () => {
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

  // 2. Dynamically generated GraphQL queries from councilConfig
  const COUNCIL_GRAPHQL_QUERY = useMemo(() => buildGraphQLQuery(councilConfig), []);
  const COUNCIL_CHART_QUERY = useMemo(() => buildChartSummaryQuery(councilConfig), []);

  // Server-side paginated query for table (limit, offset, search)
  const { data, loading, error, refetch } = useQuery(COUNCIL_GRAPHQL_QUERY, {
    variables: {
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      search: tableSearch.trim() || undefined,
    },
    notifyOnNetworkStatusChange: true,
  });

  // Full institutional summary query for charts (408 members)
  const { data: chartData } = useQuery(COUNCIL_CHART_QUERY, {
    variables: {
      limit: 5000,
      offset: 0,
    },
  });

  const totalCount = data?.allMLCs?.total ?? 408;

  // Map API response to MLCRecord objects (current page batch)
  const mlcList: MLCRecord[] = useMemo(() => {
    const rawList = data?.allMLCs?.data;
    if (!rawList || !Array.isArray(rawList)) return [];

    return rawList.map((item: any, idx: number) => ({
      ...item,
      id: item.id ?? idx + 1,
      name: item.name ?? 'Unknown',
      constituency: item.constituencyName ?? 'Graduates / Local Bodies',
      state: item.state?.Statename ?? item.state ?? 'Unknown',
      party: item.party?.abbreviation || 'Others',
      partyName: item.party?.partyname || 'Other Party',
      partyColor: item.party?.partyColor || '#d97706',
      rawParty: item.party,
      gender: item.gender ?? 'Male',
      elected: item.elected ?? '-',
      highestEducation: item.HighestEducation ?? item.highestEducation ?? '-',
      university: item.University ?? item.university ?? '-',
      ispresent: item.isPresent ?? item.ispresent ?? true,
    }));
  }, [data]);

  // Full dataset for charts
  const chartMlcsList = useMemo(() => {
    const rawList = chartData?.allMLCs?.data;
    if (!rawList || !Array.isArray(rawList)) return mlcList;

    return rawList.map((item: any, idx: number) => ({
      ...item,
      id: item.id ?? idx + 1,
      name: item.name ?? 'Unknown',
      party: item.party?.abbreviation || 'Others',
      partyName: item.party?.partyname || 'Other Party',
      partyColor: item.party?.partyColor || '#d97706',
      gender: item.gender ?? 'Male',
      highestEducation: item.HighestEducation ?? item.highestEducation ?? '-',
    }));
  }, [chartData, mlcList]);

  const { availableFields } = useGraphQLFilterSchema(
    councilConfig.graphql.filterTypeName,
    COUNCIL_FILTER_FIELDS
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
    councilConfig.tableColumns
      .filter((c) => c.defaultVisible !== false)
      .map((c) => c.id)
  );
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('name');
  const [selectedDetailRecord, setSelectedDetailRecord] = useState<any | null>(null);

  // Base filtered
  const baseFilteredData = useMemo(() => {
    return mlcList.filter((mlc) => {
      if (tableSearch.trim()) {
        const query = tableSearch.toLowerCase().trim();
        const matches =
          mlc.name.toLowerCase().includes(query) ||
          mlc.constituency.toLowerCase().includes(query) ||
          mlc.state.toLowerCase().includes(query) ||
          mlc.party.toLowerCase().includes(query) ||
          (mlc.partyName && mlc.partyName.toLowerCase().includes(query)) ||
          mlc.highestEducation.toLowerCase().includes(query);
        if (!matches) return false;
      }

      for (const rule of appliedAdvancedRules) {
        const fieldDef =
          availableFields.find((f) => f.id === rule.field) ||
          COUNCIL_FILTER_FIELDS.find((f) => f.id === rule.field);
        if (!evaluateFilterRule(mlc, rule, fieldDef)) return false;
      }

      return true;
    });
  }, [mlcList, tableSearch, appliedAdvancedRules, availableFields]);

  // Final filtered
  const filteredData = useMemo(() => {
    return baseFilteredData
      .filter((mlc) => {
        if (chartFilter) {
          if (chartFilter.category === 'Party') {
            if (mlc.party !== chartFilter.value) return false;
          } else if (chartFilter.category === 'Gender') {
            if (mlc.gender !== chartFilter.value) return false;
          } else if (chartFilter.category === 'Education') {
            const cat = getEducationCategory(mlc.highestEducation);
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
    const educationCounts: Record<string, number> = {
      'Post-Grad / Ph.D': 0,
      'Law (LL.B)': 0,
      'Graduate': 0,
      'Others': 0,
    };

    chartMlcsList.forEach((mlc) => {
      partyCounts[mlc.party] = (partyCounts[mlc.party] || 0) + 1;
      genderCounts[mlc.gender] = (genderCounts[mlc.gender] || 0) + 1;
      const eduCat = getEducationCategory(mlc.highestEducation);
      if (educationCounts[eduCat] !== undefined) {
        educationCounts[eduCat] += 1;
      } else {
        educationCounts['Others'] += 1;
      }
    });

    return {
      Party: partyCounts,
      Gender: genderCounts,
      Education: educationCounts,
    };
  }, [chartMlcsList]);

  const currentCategoryData = categoryCounts[selectedCategory] || {};
  const currentTotal = Object.values(currentCategoryData).reduce((sum, n) => sum + n, 0);

  const categoryColors = useMemo(() => {
    if (selectedCategory === 'Party') {
      const backendColorMap: Record<string, string> = {};
      chartMlcsList.forEach((mlc) => {
        if (mlc.party && mlc.partyColor) {
          backendColorMap[mlc.party] = mlc.partyColor;
        }
      });
      const keys = Object.keys(currentCategoryData);
      const fallbackPalette = ['#d97706', '#2563eb', '#10b981', '#a855f7', '#ef4444', '#f97316', '#64748b'];
      const map: Record<string, string> = {};
      keys.forEach((key, idx) => {
        map[key] = backendColorMap[key] || fallbackPalette[idx % fallbackPalette.length];
      });
      return map;
    }

    const palette = ['#d97706', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#0d9488'];
    const keys = Object.keys(currentCategoryData);
    const map: Record<string, string> = {};
    keys.forEach((key, idx) => {
      map[key] = palette[idx % palette.length];
    });
    return map;
  }, [selectedCategory, currentCategoryData, chartMlcsList]);

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
          <IonTitle style={{ fontWeight: 'bold' }}>State Legislative Councils (MLCs)</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => refetch()} title="Refresh Data">
              <IonIcon icon={refreshOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <Selectable onSelectionChange={setSelectedViews} />

        <div className="council-container">
          {/* HERO BANNER */}
          <div className="council-hero-banner">
            <div className="council-hero-text">
              <h1>State Legislative Councils (Vidhan Parishad)</h1>
              <p>
                Upper houses in 6 Indian states (UP, Maharashtra, Karnataka, Bihar, Andhra Pradesh, Telangana), providing seasoned legislative review through diverse stakeholder electorates.
              </p>
            </div>
            <div className="council-hero-kpi">
              <div className="hero-stat-box">
                <div className="hero-stat-num">{data?.allMLCs?.total ?? mlcList.length}</div>
                <div className="hero-stat-label">Total MLCs</div>
              </div>
              <div className="hero-stat-box">
                <div className="hero-stat-num">{categoryCounts.Gender['Female'] || 0}</div>
                <div className="hero-stat-label">Women MLCs</div>
              </div>
              <div className="hero-stat-box">
                <div className="hero-stat-num">{Object.keys(categoryCounts.Party).length}</div>
                <div className="hero-stat-label">Parties</div>
              </div>
            </div>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="council-loading-container">
              <IonSpinner name="crescent" color="primary" style={{ width: 44, height: 44 }} />
              <p className="loading-text">Loading Legislative Council Records...</p>
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="council-error-card">
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
                subtitle="Refine directory and charts across dynamic legislative council and demographic parameters"
                totalCount={mlcList.length}
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
                <section className="council-charts-row">
                  <div className="chart-canvas-card">
                    <div className="card-header-bar">
                      <h3 className="card-header-title">
                        <span className="card-header-accent"></span>
                        <span>1. Analysis Charts (Pie & Bar Canvas)</span>
                      </h3>

                      <div className="chart-category-tabs">
                        {councilConfig.charts.map((chart) => (
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
                            <span style={{ fontSize: 10, color: '#d97706', marginLeft: 6, fontWeight: 700 }}>
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
                            <span className="pie-center-label">Total MLCs</span>
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
                                  background: isSelected ? 'rgba(217, 119, 6, 0.08)' : 'transparent',
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

                  <div className="council-ads-card">
                    <div className="council-ads-header">
                      <span>Advertisement</span>
                      <span>AdChoices ⓘ</span>
                    </div>
                    <div className="council-ads-slot-300x250">
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📢</div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>Ad Placement</h4>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px 0' }}>300 × 250 Medium Rectangle</p>
                      <button className="action-btn-pill">Ad Placement</button>
                    </div>
                  </div>
                </section>
              )}

              {/* 2. DATA TABLE */}
              {selectedViews.table && (
                <section className="council-table-section">
                  <div className="table-controls-bar">
                    <div className="table-record-count">
                      <span>Showing </span>
                      <strong>{totalCount > 0 ? page * rowsPerPage + 1 : 0}</strong>
                      <span>-</span>
                      <strong>{Math.min((page + 1) * rowsPerPage, totalCount)}</strong>
                      <span> of </span>
                      <strong>{totalCount}</strong>
                      <span> MLCs</span>
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
                        <InputLabel id="council-columns-select-label" style={{ fontSize: 12 }}>
                          Columns
                        </InputLabel>
                        <Select
                          labelId="council-columns-select-label"
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
                          {councilConfig.tableColumns
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
                        {filteredData.map((mlc) => (
                          <TableRow
                            key={mlc.id}
                            hover
                            onClick={() => setSelectedDetailRecord(mlc)}
                            style={{ cursor: 'pointer' }}
                          >
                            {councilConfig.tableColumns
                              .filter((col) => selectedColumns.includes(col.id))
                              .map((col) => (
                                <TableCell key={col.id} align={col.align || 'left'}>
                                  {renderCell(mlc, col, {
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
                                  No Legislative Council Members Match the Active Filters
                                </div>
                                <button
                                  onClick={handleClearAll}
                                  style={{
                                    marginTop: 6,
                                    background: '#d97706',
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

              {/* 3. GLOBE VIEW - UNDER CONSTRUCTION (COMMENTED OUT) */}
              {/* {selectedViews.map && (
                <section className="council-globe-section">
                  <div className="globe-header">
                    <h3 className="globe-header-title">
                      <span className="card-header-accent"></span>
                      <span>3. Globe View (Geospatial Mapping)</span>
                    </h3>
                  </div>
                  <div className="globe-under-construction-banner">
                    <div className="globe-icon-circle">🌍</div>
                    <h4 className="globe-banner-title">State Legislative Council Mapping is Under Construction</h4>
                    <p className="globe-banner-desc">
                      Interactive 3D geospatial mapping across the 6 bicameral state legislative council jurisdictions are currently in development.
                    </p>
                    <div className="globe-feature-pills">
                      <span className="globe-feature-pill">📍 6 Bicameral States</span>
                      <span className="globe-feature-pill">🏛️ Graduates & Teachers Electorates</span>
                      <span className="globe-feature-pill">📊 Vidhan Parishad Demographics</span>
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
          entityType="State MLC"
        />
      </IonContent>
    </IonPage>
  );
};

export default Council;
