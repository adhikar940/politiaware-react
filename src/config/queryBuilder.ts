import { gql, DocumentNode } from '@apollo/client';
import { EntityConfig } from './types';

// Cache generated queries to prevent re-compiling AST on every render
const queryCache = new Map<string, DocumentNode>();

/**
 * Builds a GraphQL selection tree from dotted field paths.
 */
function buildSelectionTree(fields: string[]): Record<string, any> {
  const tree: Record<string, any> = {};

  // Always ensure 'id' is requested
  tree['id'] = true;

  fields.forEach((rawPath) => {
    if (!rawPath) return;

    // Strip array brackets e.g. "rulingperiods[0].startdate" -> "rulingperiods.startdate"
    const cleanPath = rawPath.replace(/\[\d+\]/g, '');
    const parts = cleanPath.split('.').filter(Boolean);

    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        if (!current[part]) {
          current[part] = true;
        }
      } else {
        if (!current[part] || typeof current[part] !== 'object') {
          current[part] = { id: true }; // Ensure child objects include id
        }
        current = current[part];
      }
    }
  });

  return tree;
}

/**
 * Converts a selection tree into a formatted GraphQL selection string.
 */
function treeToSelectionString(tree: Record<string, any>, indent = 8): string {
  const pad = ' '.repeat(indent);
  const lines: string[] = [];

  for (const [key, val] of Object.entries(tree)) {
    if (typeof val === 'object' && val !== null) {
      lines.push(`${pad}${key} {`);
      lines.push(treeToSelectionString(val, indent + 2));
      lines.push(`${pad}}`);
    } else {
      lines.push(`${pad}${key}`);
    }
  }

  return lines.join('\n');
}

/**
 * Dynamically generates an Apollo GraphQL query DocumentNode from an EntityConfig.
 */
export function buildGraphQLQuery(config: EntityConfig): DocumentNode {
  const cacheKey = config.entityKey;
  if (queryCache.has(cacheKey)) {
    return queryCache.get(cacheKey)!;
  }

  // Collect all field paths
  const fieldSet = new Set<string>();

  // 1. Extra fields
  (config.graphql.extraFields || []).forEach((f) => fieldSet.add(f));

  // 2. Table columns
  config.tableColumns.forEach((col) => {
    if (col.field) fieldSet.add(col.field);
  });

  // 3. Chart fields
  config.charts.forEach((chart) => {
    if (chart.field) fieldSet.add(chart.field);
  });

  // 4. Special relations safety (e.g., rulingperiods enddate if startdate is queried)
  if (fieldSet.has('rulingperiods[0].startdate') || fieldSet.has('rulingperiods.startdate')) {
    fieldSet.add('rulingperiods.enddate');
  }

  const tree = buildSelectionTree(Array.from(fieldSet));
  const selectionString = treeToSelectionString(tree, 8);

  const queryNamePascal =
    config.entityKey.charAt(0).toUpperCase() + config.entityKey.slice(1);

  const queryStr = `
    query GetAll${queryNamePascal}($limit: Int = 10, $offset: Int = 0, $search: String) {
      ${config.graphql.queryName}(limit: $limit, offset: $offset, search: $search) {
        ${config.graphql.totalCountKey || 'total'}
        offset
        limit
        ${config.graphql.rootDataKey || 'data'} {
${selectionString}
        }
      }
    }
  `;

  const parsedQuery = gql(queryStr);
  queryCache.set(cacheKey, parsedQuery);
  return parsedQuery;
}

const chartQueryCache = new Map<string, DocumentNode>();

/**
 * Builds a lightweight GraphQL query requesting only fields needed for chart visualizations,
 * retrieving all institutional records (up to 5000) for accurate percentage/distribution calculations.
 */
export function buildChartSummaryQuery(config: EntityConfig): DocumentNode {
  const cacheKey = `chart_${config.entityKey}`;
  if (chartQueryCache.has(cacheKey)) {
    return chartQueryCache.get(cacheKey)!;
  }

  const fieldSet = new Set<string>();
  fieldSet.add('id');

  config.charts.forEach((chart) => {
    if (chart.field) fieldSet.add(chart.field);
  });

  // Include party metadata only if party is present in this entity
  const hasParty =
    Array.from(fieldSet).some((f) => f.startsWith('party')) ||
    config.tableColumns.some((c) => c.field?.startsWith('party')) ||
    Boolean(config.graphql.extraFields?.some((f) => f.startsWith('party')));

  if (hasParty) {
    fieldSet.add('party.abbreviation');
    fieldSet.add('party.partyname');
    fieldSet.add('party.partyColor');
  }

  const allKnownFields = new Set([
    ...config.tableColumns.map((c) => c.field),
    ...config.charts.map((c) => c.field),
    ...(config.graphql.extraFields || []),
  ]);

  if (allKnownFields.has('gender')) fieldSet.add('gender');
  if (allKnownFields.has('religion')) fieldSet.add('religion');
  if (allKnownFields.has('HighestEducation')) fieldSet.add('HighestEducation');
  if (config.tableColumns.some((c) => c.field === 'rulingstate.Status' || c.id === 'status')) {
    fieldSet.add('rulingstate.Status');
  }

  const tree = buildSelectionTree(Array.from(fieldSet));
  const selectionString = treeToSelectionString(tree, 8);

  const queryNamePascal =
    config.entityKey.charAt(0).toUpperCase() + config.entityKey.slice(1);

  const queryStr = `
    query GetChartSummary${queryNamePascal}($limit: Int = 5000, $offset: Int = 0) {
      ${config.graphql.queryName}(limit: $limit, offset: $offset) {
        ${config.graphql.totalCountKey || 'total'}
        ${config.graphql.rootDataKey || 'data'} {
${selectionString}
        }
      }
    }
  `;

  const parsedQuery = gql(queryStr);
  chartQueryCache.set(cacheKey, parsedQuery);
  return parsedQuery;
}

