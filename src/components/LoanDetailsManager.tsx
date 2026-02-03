import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';
import { db } from '../db';
import { Button } from './ui/Button';
import { Input, AmountInput } from './ui/Input';
import { DatePicker } from './ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useNumberInput } from '../hooks';
import type { Loan } from '../types';

interface LoanDetailsManagerProps {
  loan: Loan;
}

export const LoanDetailsManager: React.FC<LoanDetailsManagerProps> = ({ loan }) => {
  const [isEditing, setIsEditing] = React.useState(false);

  // Local state
  const [name, setName] = React.useState(loan.name);
  const principal = useNumberInput({ initialValue: loan.principal, min: 0 });
  const [isoStartDate, setIsoStartDate] = React.useState(loan.startDate.toISOString().split('T')[0]);

  // Reset when loan changes or edit mode toggles
  React.useEffect(() => {
    if (!isEditing) {
      setName(loan.name);
      principal.setNumericValue(loan.principal);
      setIsoStartDate(loan.startDate.toISOString().split('T')[0]);
    }
  }, [loan, isEditing, principal.setNumericValue]);

  const handleSave = async () => {
    if (!name || !principal.isValid || !isoStartDate) {
      alert("Please fill in all fields.");
      return;
    }

    if (loan.id) {
      await db.loans.update(loan.id, {
        name,
        principal: principal.numericValue,
        startDate: new Date(isoStartDate)
      });
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <Card>
        <CardHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardTitle>Loan Details</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Loan Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={isoStartDate}
              onChange={setIsoStartDate}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
            <Button variant="ghost" sx={{ flex: 1 }} onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button sx={{ flex: 1 }} onClick={handleSave}>
              Save
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
