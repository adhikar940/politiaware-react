import { ReactNode } from 'react';

export type ChartType = 'doughnut' | 'bar';

export interface ChartConfig {
  id: string;
  key: string;              // Unique identifier matching category tabs (e.g., 'Party', 'Status')
  title: string;            // User-facing chart title (e.g., 'Party Affiliation')
  field: string;            // Path to data field (e.g., 'party.abbreviation', 'rulingstate.Status')
  chartType: ChartType;     // 'doughnut' | 'bar'
  hasBarView?: boolean;     // Whether toggle between doughnut and bar view is supported
  colorPalette?: string;    // Name of color map (e.g. 'party') or default palette
}

export type CellRendererType =
  | 'text'
  | 'partyBadge'
  | 'statusChip'
  | 'date'
  | 'actions';

export interface TableColumnConfig {
  id: string;
  label: string;
  field?: string;           // Path to field in record (e.g., 'name', 'rulingstate.Statename')
  sortable?: boolean;
  defaultVisible?: boolean;
  renderer?: CellRendererType;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  customRender?: (value: any, record: any) => ReactNode;
}

export interface GraphQLConfig {
  queryName: string;          // GraphQL query operation (e.g. 'allCms', 'allGovernors')
  filterTypeName: string;     // Strawberry filter input type (e.g. 'AsyncFilterCmCmDepth1')
  rootDataKey?: string;       // Defaults to 'data'
  totalCountKey?: string;     // Defaults to 'total'
  extraFields?: string[];     // Extra fields needed in query (e.g. ['ispresent', 'id'])
}

export interface EntityConfig {
  entityKey: string;          // 'cms' | 'governors'
  title: string;              // 'Chief Ministers' | 'Governors'
  graphql: GraphQLConfig;
  charts: ChartConfig[];
  tableColumns: TableColumnConfig[];
}

