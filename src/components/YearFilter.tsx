import * as React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';

interface YearFilterProps {
  availableYears: number[];
  selectedYear: number | 'ALL';
  onYearChange: (year: number | 'ALL') => void;
}

export const YearFilter: React.FC<YearFilterProps> = ({
  availableYears,
  selectedYear,
  onYearChange
}) => {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select
        value={selectedYear}
        onChange={(e) => {
          const val = e.target.value;
          onYearChange(val === 'ALL' ? 'ALL' : Number(val));
        }}
      >
        <MenuItem value="ALL">All Time</MenuItem>
        {availableYears.map(year => (
          <MenuItem key={year} value={year}>{year}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
