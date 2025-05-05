import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Box,
} from '@mui/material';
import { CategoryAverage } from '../types';

interface RawDataTableProps {
  categoryAverages: CategoryAverage[];
}

const RawDataTable: React.FC<RawDataTableProps> = ({ categoryAverages }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredData = categoryAverages.filter(item =>
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <TextField
        fullWidth
        label="搜尋技能分類"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>技能分類</TableCell>
              <TableCell align="right">平均分數</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow key={row.category}>
                <TableCell component="th" scope="row">
                  {row.category}
                </TableCell>
                <TableCell align="right">
                  {row.average.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RawDataTable; 