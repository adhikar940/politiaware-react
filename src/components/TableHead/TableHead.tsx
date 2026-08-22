import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from '@mui/material';

const totalColumns = [
  'Name',
  'Gender',
  'CasteCategory',
  'Religion',
  'Party',
  'PartyName',
  'Constituency',
  'State',
];

const searchModes = ['contains', 'exact'];

interface FilterParams {
  search: string[];
  searchFields: string[];
  orderBy: string;
  searchMode: string;
}

interface Props {
  onChange: (filters: FilterParams) => void;
  defaultValues?: Partial<FilterParams>;
}

const TableHead: React.FC<Props> = ({ onChange, defaultValues }) => {
  const [search, setSearch] = useState<string[]>(defaultValues?.search || []);
  const [searchFields, setSearchFields] = useState<string[]>(defaultValues?.searchFields || []);
  const [orderBy, setOrderBy] = useState<string>(defaultValues?.orderBy || 'Name');
  const [searchMode, setSearchMode] = useState<string>(defaultValues?.searchMode || 'contains');

  useEffect(() => {
    onChange({ search, searchFields, orderBy, searchMode });
  }, [search, searchFields, orderBy, searchMode]);

  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
      {/* Search Terms */}
      <TextField
        label="Search Terms (comma-separated)"
        value={search.join(', ')}
        onChange={(e) => setSearch(e.target.value.split(',').map(s => s.trim()))}
      />

      {/* Search Fields */}
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Search Fields</InputLabel>
        <Select
          multiple
          value={searchFields}
          onChange={(e) => setSearchFields(e.target.value as string[])}
          renderValue={(selected) => selected.join(', ')}
        >
          {totalColumns.map((col) => (
            <MenuItem key={col} value={col}>
              <Checkbox checked={searchFields.includes(col)} />
              <ListItemText primary={col} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Order By Field */}
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Order By</InputLabel>
        <Select
          value={orderBy}
          onChange={(e) => setOrderBy(e.target.value)}
        >
          {totalColumns.map((col) => (
            <MenuItem key={col} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Search Mode */}
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Search Mode</InputLabel>
        <Select
          value={searchMode}
          onChange={(e) => setSearchMode(e.target.value)}
        >
          {searchModes.map((mode) => (
            <MenuItem key={mode} value={mode}>
              {mode}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default TableHead;
