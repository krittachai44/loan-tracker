import * as React from 'react';
import { Select, MenuItem, FormControl, InputLabel, Box, Typography } from '@mui/material';
import { db } from '../db';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { DatePicker } from './ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { formatNumberInput, parseFormattedNumber } from '../utils';

interface LoanSetupProps {
    onComplete: () => void;
}

interface RateSegmentState {
    value: string;
    isoStartDate: string;
    type: 'fixed' | 'float';
}

export const LoanSetup: React.FC<LoanSetupProps> = ({ onComplete }) => {
    const isoNow = new Date().toISOString().split('T')[0];
    const [name, setName] = React.useState('My Loan');
    const [principal, setPrincipal] = React.useState('');
    const [isoStartDate, setIsoStartDate] = React.useState(isoNow);

    // Initialize with one rate segment
    const [rates, setRates] = React.useState<RateSegmentState[]>([{
        value: '',
        isoStartDate: isoNow,
        type: 'fixed'
    }]);

    const addRate = () => {
        setRates([...rates, { value: '', isoStartDate: '', type: 'fixed' as const }]);
    };

    const removeRate = (index: number) => {
        if (rates.length <= 1) return;
        setRates(rates.filter((_, i) => i !== index));
    };

    const updateRate = (index: number, field: keyof RateSegmentState, val: string) => {
        const newRates = [...rates];
        newRates[index] = { ...newRates[index], [field]: val };
        setRates(newRates);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!principal || rates.some(r => !r.value || !r.isoStartDate)) return;

        const parsedRates = rates.map(r => ({
            value: parseFloat(parseFormattedNumber(r.value)),
            startDate: new Date(r.isoStartDate),
            type: r.type
        }));

        await db.loans.add({
            name,
            principal: parseFloat(parseFormattedNumber(principal)),
            rates: parsedRates,
            startDate: new Date(isoStartDate)
        });

        onComplete();
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Card>
                <CardHeader>
                    <CardTitle>Start Tracking Your Loan</CardTitle>
                </CardHeader>
                <CardContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                            <Typography variant="caption" component="label" display="block" gutterBottom>
                                Loan Name
                            </Typography>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Car Loan"
                                required
                                size="small"
                            />
                        </Box>
                        <Box>
                            <Typography variant="caption" component="label" display="block" gutterBottom>
                                Principal Amount
                            </Typography>
                            <Input
                                type="text"
                                value={principal}
                                onChange={(e) => setPrincipal(formatNumberInput(e.target.value))}
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
                                    setPrincipal(formatNumberInput(principal.slice(0, (e.target as HTMLInputElement).selectionStart || 0) + numericOnly + principal.slice((e.target as HTMLInputElement).selectionEnd || 0)));
                                }}
                                placeholder="0.00"
                                required
                                size="small"
                            />
                        </Box>
                        <Box>
                            <Typography variant="caption" component="label" display="block" gutterBottom>
                                Start Date
                            </Typography>
                            <DatePicker
                                value={isoStartDate}
                                onChange={setIsoStartDate}
                                required
                            />
                        </Box>

                        <Box>
                            <Typography variant="caption" component="label" display="block" gutterBottom>
                                Interest Rates
                            </Typography>
                            {rates.map((r, index) => (
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
                                                onKeyDown={(e) => {
                                                    // Allow: backspace, delete, tab, escape, enter, decimal point, minus sign
                                                    if (["Backspace", "Delete", "Tab", "Escape", "Enter", ".", "-"].includes(e.key) ||
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
                                                    const numericOnly = pastedText.replace(/[^0-9.-]/g, '');
                                                    const currentValue = r.value;
                                                    updateRate(index, 'value', formatNumberInput(currentValue.slice(0, (e.target as HTMLInputElement).selectionStart || 0) + numericOnly + currentValue.slice((e.target as HTMLInputElement).selectionEnd || 0)));
                                                }}
                                                placeholder={r.type === 'fixed' ? "5.5" : "-1.5"}
                                                label={r.type === 'fixed' ? 'Rate (%)' : 'Spread (+/- %)'}
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
                                            disabled={rates.length <= 1}
                                            color="error"
                                        >
                                            Remove
                                        </Button>
                                    </Box>
                                </Box>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addRate} fullWidth sx={{ mt: 1 }}>
                                + Add Rate Change
                            </Button>
                        </Box>

                        <Button type="submit" fullWidth size="lg" sx={{ mt: 2 }}>
                            Create Loan Tracker
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};
