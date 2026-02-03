import * as React from 'react';
import { Select, MenuItem, FormControl, Box, Typography } from '@mui/material';
import { db } from '../db';
import { Button } from './ui/Button';
import { Input, AmountInput } from './ui/Input';
import { DatePicker } from './ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useNumberInput } from '../hooks';

interface LoanSetupProps {
    onComplete: () => void;
}

interface RateSegmentState {
    value: number;
    isoStartDate: string;
    type: 'fixed' | 'float';
}

// Helper component for rate input with controlled state
const RateInput: React.FC<{
    value: number;
    type: 'fixed' | 'float';
    onChange: (value: number) => void;
}> = ({ value, type, onChange }) => {
    const rateInput = useNumberInput({ 
        initialValue: value,
        allowNegative: true // Allow negative for float spreads
    });

    React.useEffect(() => {
        onChange(rateInput.numericValue);
    }, [rateInput.numericValue, onChange]);

    return (
        <AmountInput
            value={rateInput.value}
            onChange={rateInput.setValue}
            label={type === 'fixed' ? 'Rate (%)' : 'Spread (+/- %)'}
        />
    );
};

export const LoanSetup: React.FC<LoanSetupProps> = ({ onComplete }) => {
    const isoNow = new Date().toISOString().split('T')[0];
    const [name, setName] = React.useState('My Loan');
    const principal = useNumberInput({ min: 0 });
    const [isoStartDate, setIsoStartDate] = React.useState(isoNow);

    // Initialize with one rate segment
    const [rates, setRates] = React.useState<RateSegmentState[]>([{
        value: '' as any,
        isoStartDate: isoNow,
        type: 'fixed'
    }]);

    const addRate = () => {
        setRates([...rates, { value: '' as any, isoStartDate: '', type: 'fixed' as const }]);
    };

    const removeRate = (index: number) => {
        if (rates.length <= 1) return;
        setRates(rates.filter((_, i) => i !== index));
    };

    const updateRate = (index: number, field: keyof RateSegmentState, val: string | number) => {
        const newRates = [...rates];
        newRates[index] = { ...newRates[index], [field]: val };
        setRates(newRates);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!principal.numericValue || rates.some(r => !r.value || !r.isoStartDate)) return;

        const parsedRates = rates.map(r => ({
            value: r.value,
            startDate: new Date(r.isoStartDate),
            type: r.type
        }));

        await db.loans.add({
            name,
            principal: principal.numericValue,
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
                            <AmountInput
                                value={principal.value}
                                onChange={principal.setValue}
                                label="Principal Amount"
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
                                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="caption" component="label" display="block" gutterBottom>
                                                Type
                                            </Typography>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={r.type}
                                                    onChange={(e) => updateRate(index, 'type', e.target.value as 'fixed' | 'float')}
                                                    displayEmpty
                                                >
                                                    <MenuItem value="fixed">Fixed</MenuItem>
                                                    <MenuItem value="float">Float (MRR)</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <RateInput
                                                value={r.value}
                                                type={r.type}
                                                onChange={(val) => updateRate(index, 'value', val)}
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
