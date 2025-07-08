import React, { useEffect, useMemo, useState } from 'react';
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  TableContainer,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  TableSortLabel
} from '@mui/material';

interface TableComponentProps {
  totalColumns: string[];
  selectedColumns: string[];
  tableData: Record<string, any>[];  // changed to array of objects
  onColumnChange: (selected: string[]) => void;
}

const generateRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 90%)`;
};

const getTextColor = (bg: string): string => {
  return '#1a1a1a';
};

const TableComponent: React.FC<TableComponentProps> = ({
  totalColumns,
  selectedColumns,
  tableData,
  onColumnChange
}) => {
  const [columns, setColumns] = useState<string[]>(selectedColumns);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState<string | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setColumns(selectedColumns);
  }, [selectedColumns]);

  const handleColumnChange = (event: any) => {
    const updated = event.target.value;
    setColumns(updated);
    onColumnChange(updated);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value.toLowerCase());
  };

  const handleSort = (column: string) => {
    if (orderBy === column) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(column);
      setOrder('asc');
    }
  };

  const sortedRows = [...tableData];
  if (orderBy) {
    sortedRows.sort((a, b) => {
      const aVal = String(a[orderBy] ?? '').toLowerCase();
      const bVal = String(b[orderBy] ?? '').toLowerCase();
      return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }

  const filtered = sortedRows.filter(row =>
    columns.some(col => String(row[col] ?? '').toLowerCase().includes(filter))
  );

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const columnColors = useMemo(() => {
    const map: Record<string, string> = {};
    columns.forEach((col) => {
      map[col] = generateRandomColor();
    });
    return map;
  }, [columns]);

  return (
    <div className="view-section">
      <h3 className="view-title">Table Hub</h3>
      <Paper sx={{ padding: 3 }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
          <TextField label="Filter" onChange={handleSearch} />

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Columns</InputLabel>
            <Select
              multiple
              value={columns}
              onChange={handleColumnChange}
              renderValue={(selected) => selected.join(', ')}
            >
              {totalColumns.map((col) => (
                <MenuItem key={col} value={col}>
                  <Checkbox checked={columns.includes(col)} />
                  <ListItemText primary={col} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map(col => (
                  <TableCell key={col} onClick={() => handleSort(col)} style={{ cursor: 'pointer' }} sx={{
                    fontWeight: 'bold',
                    backgroundColor: '#e3f2fd',
                    color: '#0d47a1'
                  }}>
                    <TableSortLabel
                      active={orderBy === col}
                      direction={orderBy === col ? order : 'asc'}
                    >
                      {col}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((row, i) => (
                <TableRow key={i}>
                  {columns.map(col => (
                    <TableCell
                      key={col}
                      sx={{
                        backgroundColor: columnColors[col],
                        color: getTextColor(columnColors[col]),
                        fontWeight: 500
                      }}
                    >
                      {row[col]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[2, 5, 10, 25, 100]}
        />
      </Paper>
    </div>
  );
};

export default TableComponent;
