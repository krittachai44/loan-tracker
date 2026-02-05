import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { loanRepository } from '../services';
import { Button } from './ui/Button';
import { Input, AmountInput } from './ui/Input';
import { DatePicker } from './ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useNumberInput, useSnackbar, useEditableEntity } from '../hooks';
import { toISODate } from '../utils/date';
import type { Loan } from '../types';

interface LoanDetailsManagerProps {
  loan: Loan;
}

interface EditState {
  name: string;
  principal: string;
  principalIsValid: boolean;
  isoStartDate: string;
}

export const LoanDetailsManager: React.FC<LoanDetailsManagerProps> = ({ loan }) => {
  const { showWarning, showError } = useSnackbar();
  const principal = useNumberInput({ initialValue: loan.principal, min: 0 });

  const { isEditing, editState, startEdit, cancelEdit, saveEdit, updateField } = 
    useEditableEntity<Loan, EditState>({
      entity: loan,
      initializeEditState: (loan) => ({
        name: loan.name,
        principal: loan.principal.toString(),
        principalIsValid: true,
        isoStartDate: toISODate(loan.startDate)
      }),
      validate: (state) => {
        if (!state.name || !state.isoStartDate) {
          return 'Please fill in all fields.';
        }
        if (!state.principalIsValid) {
          return 'Please enter a valid principal amount.';
        }
        return null;
      },
      onSave: async (state) => {
        if (loan.id) {
          await loanRepository.update(loan.id, {
            name: state.name,
            principal: principal.numericValue,
            startDate: new Date(state.isoStartDate)
          });
        }
      },
      onSaveError: (error) => {
        showWarning(error.message);
        if (error.message !== 'Please fill in all fields.' && error.message !== 'Please enter a valid principal amount.') {
          showError('Failed to update loan details. Please try again.');
          console.error('Error updating loan:', error);
        }
      }
    });

  // Sync principal input state with editState
  React.useEffect(() => {
    if (isEditing) {
      updateField('principalIsValid', principal.isValid);
    }
  }, [principal.isValid, isEditing, updateField]);

  if (!isEditing) {
    return (
      <Card>
        <CardHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardTitle>Loan Details</CardTitle>
            <Button variant="outline" size="sm" onClick={startEdit}>
              Edit
            </Button>
          </Box>
        </CardHeader>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="textSecondary">Name</Typography>
              <Typography variant="body2" fontWeight={500}>{loan.name}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="textSecondary">Principal</Typography>
              <Typography variant="body2" fontWeight={500}>{loan.principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="textSecondary">Start Date</Typography>
              <Typography variant="body2" fontWeight={500}>{format(loan.startDate, 'dd/MM/yyyy')}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const state = editState;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Loan Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Input
              value={state.name}
              onChange={(e) => updateField('name', e.target.value)}
              label="Loan Name"
              size="small"
            />
          </Box>
          <Box>
            <AmountInput
              label="Principal Amount"
              value={principal.value}
              onChange={principal.setValue}
              size="small"
              error={!principal.isValid && !!principal.value}
            />
          </Box>
          <Box>
            <DatePicker
              value={state.isoStartDate}
              onChange={(val) => updateField('isoStartDate', val)}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
            <Button variant="ghost" sx={{ flex: 1 }} onClick={cancelEdit}>
              Cancel
            </Button>
            <Button sx={{ flex: 1 }} onClick={saveEdit}>
              Save
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
