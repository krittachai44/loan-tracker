import { memo, useCallback, useEffect, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { db } from '../db';
import { Button } from './ui/Button';
import { AmountInput, Input } from './ui/Input';
import { DatePicker } from './ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useNumberInput, useDateInput } from '../hooks';
import { VALIDATION } from '../constants';
import type { Payment } from '../types';

interface PaymentFormProps {
  loanId: number;
  initialPayment?: Payment;
  onComplete?: () => void;
}

export const PaymentForm = memo<PaymentFormProps>(({ loanId, initialPayment, onComplete }) => {
  const amount = useNumberInput({
    min: VALIDATION.MIN_PAYMENT,
    initialValue: initialPayment?.amount || ''
  });
  const date = useDateInput(initialPayment?.date);
  const [note, setNote] = useState(initialPayment?.note || '');

  // Reset form when initialPayment changes
  useEffect(() => {
    if (initialPayment) {
      amount.setNumericValue(initialPayment.amount);
      date.setDateValue(initialPayment.date);
      setNote(initialPayment.note || '');
    } else {
      amount.reset();
      date.reset();
      setNote('');
    }
  }, [initialPayment?.id, initialPayment?.amount, initialPayment?.date, initialPayment?.note, amount.setNumericValue, date.setDateValue, amount.reset, date.reset]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount.isValid || !amount.numericValue || !date.isoDate) return;

    const payload = {
      loanId,
      amount: amount.numericValue,
      date: date.dateValue,
      note
    };

    if (initialPayment?.id) {
      await db.payments.update(initialPayment.id, payload);
    } else {
      await db.payments.add(payload);
      amount.reset();
      setNote('');
    }

    onComplete?.();
  }, [loanId, amount, date, note, initialPayment, onComplete]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialPayment ? 'Edit Payment' : 'Add Payment'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {amount.error && amount.value && (
            <Alert severity="error">{amount.error}</Alert>
          )}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <AmountInput
              label="Amount"
              value={amount.value}
              onChange={amount.setValue}
              required
              size="small"
              error={!amount.isValid && !!amount.value}
            />
            <Box>
              <Typography variant="caption" component="label" display="block" gutterBottom>
                Date
              </Typography>
              <DatePicker
                value={date.isoDate}
                onChange={date.setIsoDate}
                required
              />
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" component="label" display="block" gutterBottom>
              Note (Optional)
            </Typography>
            <Input
              type="text"
              placeholder="e.g. Monthly installment"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              size="small"
            />
          </Box>
          <Button type="submit" fullWidth disabled={!amount.isValid}>
            {initialPayment ? 'Update Payment' : 'Record Payment'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
});

PaymentForm.displayName = 'PaymentForm';

