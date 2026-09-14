import { FilterDataType, FilterFieldDef, FilterOperator, FilterRule, QuickFilterDef } from './filterTypes';

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  contains: 'contains (case-insensitive)',
  exact: 'equals (exact)',
  not_equals: 'does not equal',
  startswith: 'starts with',
  endswith: 'ends with',
  in: 'is one of (comma-separated)',
  is_empty: 'is empty / null',
  is_not_empty: 'has any value',
  equals: 'equals (=)',
  gt: 'greater than (>)',
  gte: 'greater than or equal (>=)',
  lt: 'less than (<)',
  lte: 'less than or equal (<=)',
  between: 'between (min & max)',
  after: 'after (>)',
  on_or_after: 'on or after (>=)',
  before: 'before (<)',
  on_or_before: 'on or before (<=)',
  year: 'in year',
  is_true: 'is True (Yes)',
  is_false: 'is False (No)',
};

export const OPERATORS_BY_TYPE: Record<FilterDataType, FilterOperator[]> = {
  string: ['contains', 'exact', 'not_equals', 'startswith', 'endswith', 'in', 'is_empty', 'is_not_empty'],
  select: ['exact', 'not_equals', 'in', 'is_empty', 'is_not_empty'],
  number: ['equals', 'not_equals', 'gt', 'gte', 'lt', 'lte', 'between', 'in', 'is_empty', 'is_not_empty'],
  date: ['equals', 'after', 'on_or_after', 'before', 'on_or_before', 'between', 'year', 'is_empty', 'is_not_empty'],
  boolean: ['is_true', 'is_false', 'is_empty'],
};

/**
 * Resolves a property from an object using a dot-notation path, e.g. "party.abbreviation"
 */
export function resolveNestedValue(item: any, path: string): any {
  if (!item || !path) return undefined;
  const parts = path.split('.');
  let current = item;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Evaluates a single filter rule against an item
 */
export function evaluateFilterRule(item: any, rule: FilterRule, fieldDef?: FilterFieldDef): boolean {
  const rawValue = resolveNestedValue(item, rule.field);

  // Empty checks
  if (rule.operator === 'is_empty') {
    return rawValue === null || rawValue === undefined || String(rawValue).trim() === '' || String(rawValue) === '-';
  }
  if (rule.operator === 'is_not_empty') {
    return rawValue !== null && rawValue !== undefined && String(rawValue).trim() !== '' && String(rawValue) !== '-';
  }

  // Boolean checks
  if (rule.operator === 'is_true') {
    return rawValue === true || String(rawValue).toLowerCase() === 'true';
  }
  if (rule.operator === 'is_false') {
    return rawValue === false || String(rawValue).toLowerCase() === 'false';
  }

  if (rawValue === null || rawValue === undefined) {
    return false;
  }

  const strVal = String(rawValue).trim();
  const targetVal = (rule.value || '').trim();

  // Number comparisons
  if (fieldDef?.dataType === 'number') {
    const numVal = parseFloat(strVal);
    const targetNum = parseFloat(targetVal);
    if (isNaN(numVal) || isNaN(targetNum)) return false;

    switch (rule.operator) {
      case 'equals':
        return numVal === targetNum;
      case 'not_equals':
        return numVal !== targetNum;
      case 'gt':
        return numVal > targetNum;
      case 'gte':
        return numVal >= targetNum;
      case 'lt':
        return numVal < targetNum;
      case 'lte':
        return numVal <= targetNum;
      case 'between': {
        const secNum = parseFloat(rule.secondaryValue || '');
        if (isNaN(secNum)) return numVal >= targetNum;
        return numVal >= Math.min(targetNum, secNum) && numVal <= Math.max(targetNum, secNum);
      }
      case 'in': {
        const set = targetVal.split(',').map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
        return set.includes(numVal);
      }
      default:
        return false;
    }
  }

  // Date comparisons
  if (fieldDef?.dataType === 'date') {
    const dateVal = new Date(strVal).getTime();
    const targetDate = new Date(targetVal).getTime();

    if (rule.operator === 'year') {
      const yr = new Date(strVal).getFullYear();
      return yr === parseInt(targetVal, 10);
    }

    if (isNaN(dateVal) || isNaN(targetDate)) return false;

    switch (rule.operator) {
      case 'equals':
        return dateVal === targetDate;
      case 'after':
      case 'gt':
        return dateVal > targetDate;
      case 'on_or_after':
      case 'gte':
        return dateVal >= targetDate;
      case 'before':
      case 'lt':
        return dateVal < targetDate;
      case 'on_or_before':
      case 'lte':
        return dateVal <= targetDate;
      case 'between': {
        const secDate = new Date(rule.secondaryValue || '').getTime();
        if (isNaN(secDate)) return dateVal >= targetDate;
        return dateVal >= Math.min(targetDate, secDate) && dateVal <= Math.max(targetDate, secDate);
      }
      default:
        return false;
    }
  }

  // String & Select comparisons
  const lowerStr = strVal.toLowerCase();
  const lowerTarget = targetVal.toLowerCase();

  switch (rule.operator) {
    case 'contains':
      return lowerStr.includes(lowerTarget);
    case 'exact':
    case 'equals':
      return lowerStr === lowerTarget;
    case 'not_equals':
      return lowerStr !== lowerTarget;
    case 'startswith':
      return lowerStr.startsWith(lowerTarget);
    case 'endswith':
      return lowerStr.endsWith(lowerTarget);
    case 'in': {
      const items = lowerTarget.split(',').map((s) => s.trim()).filter(Boolean);
      return items.includes(lowerStr);
    }
    default:
      return lowerStr.includes(lowerTarget);
  }
}

/**
 * Builds the nested GraphQL input object expected by Strawberry AsyncFilter
 * e.g. converts "party.abbreviation" with exact "BJP" into:
 * { party: { abbreviation: { exact: "BJP" } } }
 */
export function buildBackendGraphQLFilterObject(
  rules: FilterRule[],
  quickFilters: Record<string, any> = {},
  quickFilterDefs: QuickFilterDef[] = []
): Record<string, any> {
  const result: Record<string, any> = {};

  const setNested = (obj: any, pathParts: string[], operator: string, value: any) => {
    let current = obj;
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!current[part]) current[part] = {};
      current = current[part];
    }
    const leaf = pathParts[pathParts.length - 1];
    if (!current[leaf]) current[leaf] = {};
    current[leaf][operator] = value;
  };

  // 1. Process Quick Filters
  quickFilterDefs.forEach((def) => {
    const val = quickFilters[def.key];
    if (val && val !== 'All') {
      const parts = def.fieldPath.split('.');
      setNested(result, parts, 'exact', val);
    }
  });

  // 2. Process Advanced Rules
  rules.forEach((rule) => {
    if (!rule.value && rule.operator !== 'is_empty' && rule.operator !== 'is_not_empty' && rule.operator !== 'is_true' && rule.operator !== 'is_false') {
      return;
    }
    const parts = rule.field.split('.');

    switch (rule.operator) {
      case 'contains':
        setNested(result, parts, 'icontains', rule.value.trim());
        break;
      case 'exact':
      case 'equals':
        setNested(result, parts, 'exact', rule.value.trim());
        break;
      case 'startswith':
        setNested(result, parts, 'startswith', rule.value.trim());
        break;
      case 'endswith':
        setNested(result, parts, 'endswith', rule.value.trim());
        break;
      case 'in':
        setNested(result, parts, 'in', rule.value.split(',').map((s) => s.trim()));
        break;
      case 'gt':
      case 'after':
        setNested(result, parts, 'gt', rule.value.trim());
        break;
      case 'gte':
      case 'on_or_after':
        setNested(result, parts, 'gte', rule.value.trim());
        break;
      case 'lt':
      case 'before':
        setNested(result, parts, 'lt', rule.value.trim());
        break;
      case 'lte':
      case 'on_or_before':
        setNested(result, parts, 'lte', rule.value.trim());
        break;
      case 'year':
        setNested(result, parts, 'year', parseInt(rule.value.trim(), 10));
        break;
      case 'is_empty':
        setNested(result, parts, 'isnull', true);
        break;
      case 'is_not_empty':
        setNested(result, parts, 'isnull', false);
        break;
      case 'is_true':
        setNested(result, parts, 'exact', true);
        break;
      case 'is_false':
        setNested(result, parts, 'exact', false);
        break;
    }
  });

  return result;
}

