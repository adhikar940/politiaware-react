import React, { ReactNode } from 'react';
import { TableColumnConfig } from './types';
import { getValueByPath } from './utils';


/**
 * Renders a table cell content based on the column's configuration.
 */
export function renderCell(record: any, column: TableColumnConfig): ReactNode {
  if (column.customRender) {
    const rawVal = column.field ? getValueByPath(record, column.field) : record[column.id];
    return column.customRender(rawVal, record);
  }

  // 1. Try to get value by field path (e.g. 'party.abbreviation' or 'rulingstate.Statename')
  let value = column.field ? getValueByPath(record, column.field) : undefined;

  // 2. If undefined, fall back to direct property on record (e.g. record['party'], record['state'])
  if (value === undefined || value === null || value === '') {
    value = record[column.id];
  }

  switch (column.renderer) {
    case 'partyBadge': {
      const party =
        value ||
        (typeof record.party === 'string' ? record.party : undefined) ||
        record.party?.abbreviation ||
        record.rawParty?.abbreviation ||
        'Others';

      // Dynamically take partyColor from backend record / relation
      const color =
        record.partyColor ||
        record.party?.partyColor ||
        record.rawParty?.partyColor ||
        '#64748b';

      const partyName =
        record.partyName ||
        record.party?.partyname ||
        record.rawParty?.partyname ||
        party;

      return (
        <span
          className="party-badge"
          style={{
            backgroundColor: `${color}20`,
            color: color,
            border: `1px solid ${color}50`,
          }}
          title={partyName}
        >
          {party}
        </span>
      );
    }

    case 'statusChip': {
      const status = value === 'UT' ? 'UT' : 'State';
      return (
        <span className={`status-badge ${status.toLowerCase()}`}>
          {status}
        </span>
      );
    }

    case 'date': {
      return (
        <span style={{ color: '#64748b', fontSize: 11 }}>
          {value || '-'}
        </span>
      );
    }

    case 'actions': {
      return <button className="action-btn-pill">View Profile</button>;
    }

    case 'text':
    default: {
      if (column.id === 'name') {
        return <span style={{ fontWeight: 700, color: '#0f172a' }}>{value || '-'}</span>;
      }
      if (column.id === 'state') {
        return <span style={{ fontWeight: 600 }}>{value || '-'}</span>;
      }
      if (column.id === 'gender') {
        return <span className="gender-badge">{value || '-'}</span>;
      }
      if (column.id === 'religion') {
        return <span className="religion-badge">{value || '-'}</span>;
      }
      return value != null && value !== '' ? String(value) : '-';
    }
  }
}
