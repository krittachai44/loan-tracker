import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { db } from '../db';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { DatePicker } from './ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { formatNumberInput, parseFormattedNumber } from '../utils';
import type { Payment } from '../types';

interface PaymentFormProps {
    loanId: number;
    initialPayment?: Payment;
    onComplete?: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ loanId, initialPayment, onComplete }) => {
    const [amount, setAmount] = React.useState(initialPayment ? initialPayment.amount.toString() : '');
    const [isoDate, setIsoDate] = React.useState(initialPayment ? initialPayment.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [note, setNote] = React.useState(initialPayment?.note || '');

    // Reset form if initialPayment changes (e.g. modal reused)
    React.useEffect(() => {
        if (initialPayment) {
            setAmount(initialPayment.amount.toString());
            setIsoDate(initialPayment.date.toISOString().split('T')[0]);
            setNote(initialPayment.note || '');
        } else {
            setAmount('');
            setIsoDate(new Date().toISOString().split('T')[0]);
            setNote('');
        }
    }, [initialPayment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !isoDate) return;

        const payload = {
            loanId,
            amount: parseFloat(parseFormattedNumber(amount)),
            date: new Date(isoDate),
            note
        };

        if (initialPayment && initialPayment.id) {
            await db.payments.update(initialPayment.id, payload);
        } else {
            await db.payments.add(payload);
        }

        if (!initialPayment) {
            setAmount('');
            setNote('');
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
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <Box>
                            <Typography variant="caption" component="label" display="block" gutterBottom>
                                Amount
                            </Typography>
                            <Input
                                type="text"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(formatNumberInput(e.target.value))}
                                onKeyDown={(e) => {
                                    // Allow: backspace, delete, tab, escape, enter, decimal point
                                    if (["Backspace", "Delete", "Tab", "Escape", "Enter", "."].includes(e.key) ||
                                        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                        (e.ctrlKey && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) ||
                                        // Allow: arrow keys
                                        ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
                                        return;
                                    }
                                    // Prevent if not a number
                                    if (!/^[0-9]$/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const pastedText = e.clipboardData.getData('text');
                                    const numericOnly = pastedText.replace(/[^0-9.]/g, '');
                                    setAmount(formatNumberInput(amount.slice(0, (e.target as HTMLInputElement).selectionStart || 0) + numericOnly + amount.slice((e.target as HTMLInputElement).selectionEnd || 0)));
                                }}
                                required
                                size="small"
                            />
                        </Box>
                        <Box>
                            <Typography variant="caption" component="label" display="block" gutterBottom>
                                Date
                            </Typography>
                            <DatePicker
                                value={isoDate}
                                onChange={setIsoDate}
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
                    <Button type="submit" fullWidth>
                        {initialPayment ? 'Update Payment' : 'Record Payment'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};
