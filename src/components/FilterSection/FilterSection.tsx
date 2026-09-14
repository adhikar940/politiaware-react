import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import {
  funnelOutline,
  searchOutline,
  closeOutline,
  closeCircleOutline,
  addCircleOutline,
  trashOutline,
  chevronDownOutline,
  chevronUpOutline,
} from 'ionicons/icons';
import {
  FilterFieldDef,
  FilterRule,
  QuickFilterDef,
} from './filterTypes';
import {
  OPERATOR_LABELS,
  OPERATORS_BY_TYPE,
} from './filterEvaluator';
import './FilterSection.css';

export interface FilterSectionProps {
  title?: string;
  subtitle?: string;
  totalCount: number;
  filteredCount: number;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  quickFilters?: QuickFilterDef[];
  quickFilterValues?: Record<string, any>;
  onQuickFilterChange?: (key: string, value: any) => void;
  availableFields: FilterFieldDef[];
  advancedRules: FilterRule[];
  onAdvancedRulesChange: (rules: FilterRule[]) => void;
  appliedAdvancedRules: FilterRule[];
  onApplyAdvancedRules: () => void;
  onResetAdvancedRules: () => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  activeFiltersCount: number;
  onRemoveQuickFilter?: (key: string) => void;
  onRemoveAdvancedRule?: (index: number) => void;
  extraActiveChips?: Array<{
    id: string;
    label: string;
    value: string;
    onRemove: () => void;
  }>;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  title = 'Filters & Query Controls',
  subtitle = 'Refine records and visual charts across demographic and constitutional parameters',
  totalCount,
  filteredCount,
  searchTerm = '',
  onSearchChange,
  quickFilters = [],
  quickFilterValues = {},
  onQuickFilterChange,
  availableFields,
  advancedRules,
  onAdvancedRulesChange,
  appliedAdvancedRules,
  onApplyAdvancedRules,
  onResetAdvancedRules,
  onClearAll,
  hasActiveFilters,
  activeFiltersCount,
  onRemoveQuickFilter,
  onRemoveAdvancedRule,
  extraActiveChips = [],
}) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Add rule helper
  const handleAddRule = () => {
    const defaultField = availableFields[0]?.id || 'name';
    const fieldDef = availableFields.find((f) => f.id === defaultField);
    const defaultOperator = fieldDef ? OPERATORS_BY_TYPE[fieldDef.dataType][0] : 'contains';

    const newRule: FilterRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      field: defaultField,
      operator: defaultOperator,
      value: '',
    };
    onAdvancedRulesChange([...advancedRules, newRule]);
  };

  // Update rule helper
  const handleUpdateRule = (id: string, updates: Partial<FilterRule>) => {
    const updated = advancedRules.map((r) => {
      if (r.id !== id) return r;
      const updatedRule = { ...r, ...updates };

      // If field changed, adapt operator to match new data type
      if (updates.field && updates.field !== r.field) {
        const fieldDef = availableFields.find((f) => f.id === updates.field);
        if (fieldDef) {
          const allowed = OPERATORS_BY_TYPE[fieldDef.dataType];
          if (!allowed.includes(updatedRule.operator)) {
            updatedRule.operator = allowed[0];
          }
        }
      }
      return updatedRule;
    });
    onAdvancedRulesChange(updated);
  };

  // Delete rule helper
  const handleDeleteRule = (id: string) => {
    onAdvancedRulesChange(advancedRules.filter((r) => r.id !== id));
  };

  return (
    <section className="filter-section-container">
      {/* 1. Filters Header Bar */}
      <div className="filter-header-bar">
        <div className="filter-header-left">
          <div className="filter-title-wrap">
            <div className="filter-icon-box">
              <IonIcon icon={funnelOutline} />
            </div>
            <div>
              <h3 className="filter-title">{title}</h3>
              <span className="filter-subtitle">{subtitle}</span>
            </div>
          </div>
          <span className="filter-count-badge">
            Showing {filteredCount} of {totalCount}
          </span>
        </div>

        <div className="filter-header-actions">
          {hasActiveFilters && (
            <button className="filter-clear-btn" onClick={onClearAll}>
              <IonIcon icon={closeCircleOutline} />
              <span>Clear All ({activeFiltersCount})</span>
            </button>
          )}
          <button
            className={`filter-adv-toggle-btn ${advancedOpen ? 'active' : ''} ${
              appliedAdvancedRules.length > 0 ? 'has-rules' : ''
            }`}
            onClick={() => setAdvancedOpen(!advancedOpen)}
          >
            <IonIcon icon={funnelOutline} />
            <span>Advanced Filters</span>
            {appliedAdvancedRules.length > 0 && (
              <span className="adv-rules-pill">{appliedAdvancedRules.length}</span>
            )}
            <IonIcon icon={advancedOpen ? chevronUpOutline : chevronDownOutline} />
          </button>
        </div>
      </div>

      {/* 2. Quick Filters Grid (rendered only when search or quickFilters provided) */}
      {((onSearchChange && searchTerm !== undefined) || quickFilters.length > 0) && (
        <div className="quick-filters-row">
          {/* Global Keyword Search */}
          {onSearchChange && (
            <div className="quick-filter-item quick-search-item">
              <label className="quick-filter-label">Quick Search</label>
              <div className="quick-search-box">
                <IonIcon icon={searchOutline} className="quick-search-icon" />
                <input
                  type="text"
                  placeholder="Search keyword..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="quick-search-input"
                />
                {searchTerm && (
                  <button className="quick-search-clear" onClick={() => onSearchChange('')}>
                    <IonIcon icon={closeOutline} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Dynamic Quick Filters */}
          {quickFilters.map((qf) => {
            const currentValue = quickFilterValues[qf.key] || 'All';

            return (
              <div key={qf.key} className="quick-filter-item">
                <label className="quick-filter-label">{qf.label}</label>
                {qf.type === 'pills' ? (
                  <div className="filter-pills-wrap">
                    {qf.options.map((opt) => (
                      <button
                        key={opt.value}
                        className={`filter-pill-btn ${currentValue === opt.value ? 'active' : ''}`}
                        onClick={() => onQuickFilterChange && onQuickFilterChange(qf.key, opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <select
                    className="filter-dropdown-select"
                    value={currentValue}
                    onChange={(e) => onQuickFilterChange && onQuickFilterChange(qf.key, e.target.value)}
                  >
                    {qf.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Active Filter Chips */}
      {hasActiveFilters && (
        <div className="active-chips-bar">
          <span className="active-chips-label">Active:</span>
          <div className="chips-list">
            {/* Custom / Chart Filter Chips */}
            {extraActiveChips.map((chip) => (
              <span key={chip.id} className="active-chip">
                {chip.label}: <strong>{chip.value}</strong>
                <button
                  className="active-chip-remove"
                  onClick={chip.onRemove}
                  title={`Remove ${chip.label} filter`}
                >
                  <IonIcon icon={closeOutline} />
                </button>
              </span>
            ))}

            {onSearchChange && searchTerm.trim() && (
              <span className="active-chip">
                Search: <strong>"{searchTerm}"</strong>
                <button
                  className="active-chip-remove"
                  onClick={() => onSearchChange('')}
                  title="Remove search filter"
                >
                  <IonIcon icon={closeOutline} />
                </button>
              </span>
            )}

            {quickFilters.map((qf) => {
              const val = quickFilterValues[qf.key];
              if (!val || val === 'All') return null;
              const opt = qf.options.find((o) => o.value === val);
              return (
                <span key={qf.key} className="active-chip">
                  {qf.label}: <strong>{opt?.label || val}</strong>
                  <button
                    className="active-chip-remove"
                    onClick={() => {
                      if (onRemoveQuickFilter) onRemoveQuickFilter(qf.key);
                      else if (onQuickFilterChange) onQuickFilterChange(qf.key, 'All');
                    }}
                    title={`Remove ${qf.label} filter`}
                  >
                    <IonIcon icon={closeOutline} />
                  </button>
                </span>
              );
            })}

            {appliedAdvancedRules.map((rule, idx) => {
              const fieldDef = availableFields.find((f) => f.id === rule.field);
              const opLabel = OPERATOR_LABELS[rule.operator] || rule.operator;
              return (
                <span key={rule.id} className="active-chip rule-chip">
                  Rule: <strong>{fieldDef?.label || rule.field}</strong> {opLabel}
                  {rule.value ? ` "${rule.value}"` : ''}
                  {rule.secondaryValue ? ` and "${rule.secondaryValue}"` : ''}
                  <button
                    className="active-chip-remove"
                    onClick={() => {
                      if (onRemoveAdvancedRule) onRemoveAdvancedRule(idx);
                    }}
                    title="Remove rule"
                  >
                    <IonIcon icon={closeOutline} />
                  </button>
                </span>
              );
            })}

            <button className="chips-clear-all" onClick={onClearAll}>
              Reset All
            </button>
          </div>
        </div>
      )}

      {/* 4. Collapsible Advanced Multi-Condition Rule Builder Panel */}
      {advancedOpen && (
        <div className="advanced-panel">
          <div className="adv-panel-header">
            <div>
              <h4 className="adv-panel-title">Multi-Condition Rule Builder</h4>
              <p className="adv-panel-subtitle">
                Construct compound queries across primitive and relational fields matching generic backend GraphQL operators.
              </p>
            </div>
            <button className="adv-add-btn" onClick={handleAddRule}>
              <IonIcon icon={addCircleOutline} />
              Add Condition Rule
            </button>
          </div>

          {advancedRules.length === 0 ? (
            <div className="adv-rules-empty">
              No condition rules defined. Click <strong>"Add Condition Rule"</strong> above to construct custom filters.
            </div>
          ) : (
            <div className="adv-rules-list">
              {advancedRules.map((rule, idx) => {
                const fieldDef = availableFields.find((f) => f.id === rule.field);
                const allowedOperators = fieldDef ? OPERATORS_BY_TYPE[fieldDef.dataType] : OPERATORS_BY_TYPE.string;
                const isBetween = rule.operator === 'between';
                const isNoVal =
                  rule.operator === 'is_empty' ||
                  rule.operator === 'is_not_empty' ||
                  rule.operator === 'is_true' ||
                  rule.operator === 'is_false';

                return (
                  <div key={rule.id} className="adv-rule-row">
                    <span className="adv-idx">#{idx + 1}</span>

                    {/* Field Selector */}
                    <select
                      className="adv-select-field"
                      value={rule.field}
                      onChange={(e) => handleUpdateRule(rule.id, { field: e.target.value })}
                    >
                      {availableFields.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>

                    {/* Context-aware Operator Selector */}
                    <select
                      className="adv-select-operator"
                      value={rule.operator}
                      onChange={(e) =>
                        handleUpdateRule(rule.id, { operator: e.target.value as any })
                      }
                    >
                      {allowedOperators.map((op) => (
                        <option key={op} value={op}>
                          {OPERATOR_LABELS[op] || op}
                        </option>
                      ))}
                    </select>

                    {/* Value Input */}
                    {!isNoVal && !isBetween && (
                      <input
                        type={fieldDef?.dataType === 'date' ? 'date' : fieldDef?.dataType === 'number' ? 'number' : 'text'}
                        className="adv-val-input"
                        placeholder={fieldDef?.placeholder || 'Comparison value...'}
                        value={rule.value}
                        onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onApplyAdvancedRules();
                        }}
                      />
                    )}

                    {/* Between dual inputs */}
                    {isBetween && (
                      <div className="adv-val-between-wrap">
                        <input
                          type={fieldDef?.dataType === 'date' ? 'date' : 'number'}
                          className="adv-val-input"
                          placeholder="Min value..."
                          value={rule.value}
                          onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                        />
                        <span style={{ fontSize: 11, color: '#64748b' }}>to</span>
                        <input
                          type={fieldDef?.dataType === 'date' ? 'date' : 'number'}
                          className="adv-val-input"
                          placeholder="Max value..."
                          value={rule.secondaryValue || ''}
                          onChange={(e) => handleUpdateRule(rule.id, { secondaryValue: e.target.value })}
                        />
                      </div>
                    )}

                    {/* Delete button */}
                    <button
                      className="adv-del-btn"
                      title="Remove condition"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <IonIcon icon={trashOutline} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="adv-panel-footer">
            <div className="adv-panel-actions-left">
              <button
                className="adv-apply-btn"
                onClick={onApplyAdvancedRules}
                disabled={advancedRules.length === 0}
              >
                Apply Rules ({advancedRules.length})
              </button>
              <button
                className="adv-reset-btn"
                onClick={onResetAdvancedRules}
                disabled={advancedRules.length === 0 && appliedAdvancedRules.length === 0}
              >
                Reset Rules
              </button>
            </div>
            <button className="adv-close-btn" onClick={() => setAdvancedOpen(false)}>
              Close Panel
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default FilterSection;

