export type FilterDataType = 'string' | 'number' | 'date' | 'boolean' | 'select';

export type FilterOperator =
  // String operators
  | 'contains'
  | 'exact'
  | 'not_equals'
  | 'startswith'
  | 'endswith'
  | 'in'
  | 'is_empty'
  | 'is_not_empty'
  // Number operators
  | 'equals'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  // Date operators
  | 'after'
  | 'on_or_after'
  | 'before'
  | 'on_or_before'
  | 'year'
  // Boolean operators
  | 'is_true'
  | 'is_false';

export interface FilterFieldOption {
  value: string;
  label: string;
}

export interface FilterFieldDef {
  id: string; // dot-notation path, e.g. "party.abbreviation" or "name"
  label: string;
  dataType: FilterDataType;
  options?: FilterFieldOption[]; // for 'select' type or quick suggestions
  placeholder?: string;
}

export interface FilterRule {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string;
  secondaryValue?: string; // used for 'between' / range lookups
}

export interface QuickFilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface QuickFilterDef {
  key: string;
  label: string;
  type: 'pills' | 'select';
  options: QuickFilterOption[];
  fieldPath: string; // e.g. "status" or "party.abbreviation"
}

