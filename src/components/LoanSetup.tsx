import * as React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { loanRepository } from '../services';
import { Button } from './ui/Button';
import { Input, AmountInput } from './ui/Input';
import { DatePicker } from './ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useNumberInput, useSnackbar } from '../hooks';
import { getCurrentISODate } from '../utils/date';

interface LoanSetupProps {
  onComplete: () => void;
}

interface RateSegmentState {
  value: number | '';
  isoStartDate: string;
  type: 'fixed' | 'float';
}

// Helper component for rate input with controlled state
const RateInput: React.FC<{
  value: number | '';
  type: 'fixed' | 'float';
  onChange: (value: number) => void;
}> = ({ value, type, onChange }) => {
  const rateInput = useNumberInput({
    initialValue: value,
    allowNegative: true // Allow negative for float spreads
  });

  const onChangeRef = React.useRef(onChange);

  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  React.useEffect(() => {
    onChangeRef.current(rateInput.numericValue);
  }, [rateInput.numericValue]);

  return (
    <AmountInput
      value={rateInput.value}
      onChange={rateInput.setValue}
      label={type === 'fixed' ? 'Rate (%)' : 'Spread (+/- %)'}
      showLabel={false}
    />
  );
};

export const LoanSetup: React.FC<LoanSetupProps> = ({ onComplete }) => {
  const isoNow = getCurrentISODate();
  const [name, setName] = React.useState('My Loan');
  const principal = useNumberInput({ min: 0 });
  const [isoStartDate, setIsoStartDate] = React.useState(isoNow);
  const { showError } = useSnackbar();

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

  const updateRate = (index: number, field: keyof RateSegmentState, val: string | number) => {
    const newRates = [...rates];
    newRates[index] = { ...newRates[index], [field]: val };
    setRates(newRates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!principal.numericValue || rates.some(r => !r.value || !r.isoStartDate)) {
      showError('Please fill in all fields.');
      return;
    }

    try {
      const parsedRates = rates
        .filter((r): r is RateSegmentState & { value: number } => typeof r.value === 'number')
        .map(r => ({
          value: r.value,
          startDate: new Date(r.isoStartDate),
          type: r.type
        }));

      await loanRepository.create({
        name,
        principal: principal.numericValue,
        rates: parsedRates,
        startDate: new Date(isoStartDate)
      });

      onComplete();
    } catch (err) {
      showError('Failed to create loan. Please try again.');
      console.error('Error creating loan:', err);
    }
  };

  return (
    <Card sx={{ width: '100%' }}>
      <CardHeader>
        <CardTitle>Start Tracking Your Loan</CardTitle>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          Enter your loan details to begin tracking payments and interest
        </Typography>
      </CardHeader>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Loan Name and Principal in same row */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" component="label" display="block" gutterBottom fontWeight={600}>
                Loan Name
              </Typography>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Car Loan"
                required
                size="small"
              />
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                A friendly name to identify this loan
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <AmountInput
                value={principal.value}
                onChange={principal.setValue}
                label="Principal Amount"
              />
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                The original loan amount borrowed
              </Typography>
            </Grid>
          </Grid>

          {/* Start Date */}
          <Box>
            <Typography variant="caption" component="label" display="block" gutterBottom fontWeight={600}>
              Start Date
            </Typography>
            <DatePicker
              value={isoStartDate}
              onChange={setIsoStartDate}
              required
            />
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
              When the loan officially began
            </Typography>
          </Box>

          {/* Interest Rates Section */}
          <Box>
            <Typography variant="subtitle1" component="h3" gutterBottom fontWeight={600}>
              Interest Rates
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 2 }}>
              Define interest rate changes over the loan period
            </Typography>

            {/* Rate Rows */}
            {rates.map((r, index) => (
              <Box
                key={index}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr 180px 40px',
                  gap: 2,
                  mb: 2,
                  alignItems: 'end'
                }}
              >
                <Box>
                  <Typography variant="caption" component="label" display="block" gutterBottom color="textSecondary">
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

                <Box>
                  <Typography variant="caption" component="label" display="block" gutterBottom color="textSecondary">
                    Rate (%)
                  </Typography>
                  <RateInput
                    value={r.value}
                    type={r.type}
                    onChange={(val) => updateRate(index, 'value', val)}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" component="label" display="block" gutterBottom color="textSecondary">
                    Effective Date
                  </Typography>
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
                  sx={{ minWidth: 40 }}
                >
                  ×
                </Button>
              </Box>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRate}
              fullWidth
              sx={{ mt: 1 }}
            >
              + Add Rate Change
            </Button>
          </Box>

          <Button type="submit" fullWidth size="lg" sx={{ mt: 2 }}>
            Create Loan Tracker
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
