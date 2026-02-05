import * as React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { loanRepository } from '../services';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { DatePicker } from './ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { formatNumberInput, parseFormattedNumber } from '../utils';
import { useNumericInput, useSnackbar, useEditableEntity } from '../hooks';
import { toISODate } from '../utils/date';
import type { Loan } from '../types';

interface LoanRateManagerProps {
  loan: Loan;
}

interface RateEditState {
  value: string;
  isoStartDate: string;
  startDate: Date;
  type: 'fixed' | 'float';
}

interface EditState {
  rates: RateEditState[];
}

export const LoanRateManager: React.FC<LoanRateManagerProps> = ({ loan }) => {
  const { handleKeyDown, handlePaste } = useNumericInput({ allowNegative: true, allowDecimal: true });
  const { showWarning, showError } = useSnackbar();

  const { isEditing, editState, startEdit, cancelEdit, saveEdit, replaceEditState } = 
    useEditableEntity<Loan, EditState>({
      entity: loan,
      initializeEditState: (loan) => ({
        rates: loan.rates.map(r => ({
          ...r,
          isoStartDate: toISODate(r.startDate),
          value: r.value.toString()
        }))
      }),
      validate: (state) => {
        if (state.rates.some(r => !r.value || !r.isoStartDate)) {
          return 'Please fill in all fields.';
        }
        return null;
      },
      onSave: async (state) => {
        const parsedRates = state.rates.map(r => ({
          value: parseFloat(parseFormattedNumber(r.value)),
          startDate: new Date(r.isoStartDate),
          type: r.type
        }));

        if (loan.id) {
          await loanRepository.update(loan.id, { rates: parsedRates });
        }
      },
      onSaveError: (error) => {
        if (error.message === 'Please fill in all fields.') {
          showWarning(error.message);
        } else {
          showError('Failed to update rates. Please try again.');
          console.error('Error updating rates:', error);
        }
      }
    });

  const state = editState;

  const addRate = () => {
    replaceEditState({
      rates: [...state.rates, { 
        value: '', 
        isoStartDate: '', 
        startDate: new Date(), 
        type: 'fixed' as const 
      }]
    });
  };

  const removeRate = (index: number) => {
    if (state.rates.length <= 1) {
      showWarning('A loan must have at least one interest rate segment.');
      return;
    }
    replaceEditState({
      rates: state.rates.filter((_, i) => i !== index)
    });
  };

  const updateRate = (index: number, field: keyof RateEditState, val: string | 'fixed' | 'float') => {
    const newRates = [...state.rates];
    if (field === 'type') {
      newRates[index][field] = val as 'fixed' | 'float';
    } else {
      newRates[index][field as 'value' | 'isoStartDate'] = val as string;
    }
    replaceEditState({ rates: newRates });
  };

  if (!isEditing) {
    return (
      <Card>
        <CardHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardTitle>Interest Rates</CardTitle>
            <Button variant="outline" size="sm" onClick={startEdit}>
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
          {state.rates.map((r, index) => (
            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ width: '33%' }} size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={r.type}
                    onChange={(e) => updateRate(index, 'type', e.target.value as 'fixed' | 'float')}
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
            <Button type="button" variant="ghost" sx={{ flex: 1 }} onClick={cancelEdit}>
              Cancel
            </Button>
            <Button type="button" sx={{ flex: 1 }} onClick={saveEdit}>
              Save Changes
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
