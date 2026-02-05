import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { paymentRepository } from '../services';
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

export const PaymentForm = ({ loanId, initialPayment, onComplete }: PaymentFormProps) => {
  const amount = useNumberInput({
    min: VALIDATION.MIN_PAYMENT,
    initialValue: initialPayment?.amount || ''
  });
  const date = useDateInput(initialPayment?.date);
  const [note, setNote] = useState(initialPayment?.note || '');

  // Retrieve stable functions for effect dependencies
  const { setNumericValue: setAmountValue, reset: resetAmount } = amount;
  const { setDateValue: setAmountDate, reset: resetDate } = date;

  // Reset form when initialPayment changes
  useEffect(() => {
    if (initialPayment) {
      setAmountValue(initialPayment.amount);
      setAmountDate(initialPayment.date);
      setNote(initialPayment.note || '');
    } else {
      resetAmount();
      resetDate();
      setNote('');
    }
  }, [initialPayment, setAmountValue, setAmountDate, resetAmount, resetDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount.isValid || !amount.numericValue || !date.isoDate) return;

    try {
      const payload = {
        loanId,
        amount: amount.numericValue,
        date: date.dateValue,
        note
      };

      if (initialPayment?.id) {
        await paymentRepository.update(initialPayment.id, payload);
      } else {
        await paymentRepository.create(payload);
        amount.reset();
        setNote('');
      }
    } catch (error) {
      console.error('Failed to save payment:', error);
      // Error will be handled by ErrorBoundary
      throw error;
    }

    onComplete?.();
  };

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
};

