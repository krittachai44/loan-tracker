import { memo, useCallback, useEffect, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { db } from '../db';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { DatePicker } from './ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useNumberInput, useDateInput } from '../hooks';
import { ALLOWED_NUMBER_KEYS, ALLOWED_CTRL_KEYS, ALLOWED_NAVIGATION_KEYS, VALIDATION } from '../constants';
import type { Payment } from '../types';

interface PaymentFormProps {
    loanId: number;
    initialPayment?: Payment;
    onComplete?: () => void;
}

// Validation helper for number inputs
const isValidNumberKey = (key: string, ctrlKey: boolean): boolean => {
  if ((ALLOWED_NUMBER_KEYS as readonly string[]).includes(key)) return true;
  if (ctrlKey && (ALLOWED_CTRL_KEYS as readonly string[]).includes(key.toLowerCase())) return true;
  if ((ALLOWED_NAVIGATION_KEYS as readonly string[]).includes(key)) return true;
  return /^[0-9]$/.test(key);
};

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
    }, [initialPayment, amount, date]);

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

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isValidNumberKey(e.key, e.ctrlKey)) {
            e.preventDefault();
        }
    }, []);

    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const numericOnly = pastedText.replace(/[^0-9.]/g, '');
        const target = e.target as HTMLInputElement;
        const start = target.selectionStart || 0;
        const end = target.selectionEnd || 0;
        const newValue = amount.value.slice(0, start) + numericOnly + amount.value.slice(end);
        amount.setValue(newValue);
    }, [amount]);

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
                        <Box>
                            <Typography variant="caption" component="label" display="block" gutterBottom>
                                Amount
                            </Typography>
                            <Input
                                type="text"
                                placeholder="0.00"
                                value={amount.value}
                                onChange={(e) => amount.setValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onPaste={handlePaste}
                                required
                                size="small"
                                error={!amount.isValid && !!amount.value}
                            />
                        </Box>
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

