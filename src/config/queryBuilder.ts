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
    query GetAll${queryNamePascal} {
      ${config.graphql.queryName}(limit: 50, offset: 0) {
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

