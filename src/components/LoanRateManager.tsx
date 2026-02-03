import * as React from 'react';
import { Select, MenuItem, FormControl, InputLabel, Box, Typography } from '@mui/material';
import { format } from 'date-fns';
import { db } from '../db';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { DatePicker } from './ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { formatNumberInput, parseFormattedNumber } from '../utils';
import { useNumericInput } from '../hooks';
import type { Loan } from '../types';

interface LoanRateManagerProps {
  loan: Loan;
}

export const LoanRateManager: React.FC<LoanRateManagerProps> = ({ loan }) => {
  // Local state for editing rates
  // We map rates to a state friendly format
  const [isEditing, setIsEditing] = React.useState(false);
  const { handleKeyDown, handlePaste } = useNumericInput({ allowNegative: true, allowDecimal: true });

  // Deep copy rates to avoid mutating props directly during edit
  const [rates, setRates] = React.useState(
    loan.rates.map(r => ({
      ...r,
      isoStartDate: r.startDate.toISOString().split('T')[0],
      value: r.value.toString()
    }))
  );

  // Reset when loan changes or edit mode toggles
  React.useEffect(() => {
    if (!isEditing) {
      setRates(
        loan.rates.map(r => ({
          ...r,
          isoStartDate: r.startDate.toISOString().split('T')[0],
          value: r.value.toString()
        }))
      );
    }
  }, [loan, isEditing]);

  const addRate = () => {
    setRates([...rates, { value: '', isoStartDate: '', startDate: new Date(), type: 'fixed' as const }]);
  };

  const removeRate = (index: number) => {
    if (rates.length <= 1) {
      alert("A loan must have at least one interest rate segment.");
      return;
    }
    setRates(rates.filter((_, i) => i !== index));
  };

  const updateRate = (index: number, field: string, val: string) => {
    const newRates = [...rates];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (newRates[index] as any)[field] = val;
    setRates(newRates);
  };

  const handleSave = async () => {
    // Validate
    if (rates.some(r => !r.value || !r.isoStartDate)) {
      alert("Please fill in all fields.");
      return;
    }

    // Parse
    const parsedRates = rates.map(r => ({
      value: parseFloat(parseFormattedNumber(r.value)),
      startDate: new Date(r.isoStartDate),
      type: r.type
    }));

    // Update DB
    if (loan.id) {
      await db.loans.update(loan.id, { rates: parsedRates });
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <Card>
        <CardHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardTitle>Interest Rates</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </Box>
        </CardHeader>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {loan.rates.map((r, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body2">{format(r.startDate, 'dd/MM/yyyy')}</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                  {r.type === 'fixed' ? `${r.value}%` : `MRR ${r.value >= 0 ? '+' : ''}${r.value}%`}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Rates</CardTitle>
      </CardHeader>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {rates.map((r, index) => (
            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ width: '33%' }} size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={r.type}
                    onChange={(e) => updateRate(index, 'type', e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="fixed">Fixed</MenuItem>
                    <MenuItem value="float">Float (MRR)</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ flex: 1 }}>
                  <Input
                    type="text"
                    value={r.value}
                    onChange={(e) => updateRate(index, 'value', formatNumberInput(e.target.value))}
                    onKeyDown={handleKeyDown}
                    onPaste={(e) => handlePaste(e, r.value, (newValue) => updateRate(index, 'value', formatNumberInput(newValue)))}
                    placeholder={r.type === 'fixed' ? "5.5" : "-1.5"}
                    label={r.type === 'fixed' ? 'Rate (%)' : 'Spread'}
                    required
                    size="small"
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <DatePicker
                    value={r.isoStartDate}
                    onChange={(val) => updateRate(index, 'isoStartDate', val)}
                    required
                  />
                </Box>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRate(index)}
                  color="error"
                >
                  Del
                </Button>
              </Box>
            </Box>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addRate} fullWidth>
            + Add Rate Change
          </Button>
          <Box sx={{ display: 'flex', gap: 2, mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button type="button" variant="ghost" sx={{ flex: 1 }} onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="button" sx={{ flex: 1 }} onClick={handleSave}>
              Save Changes
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
