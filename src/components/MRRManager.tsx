import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { DatePicker } from './ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useNumericInput } from '../hooks';

export const MRRManager: React.FC = () => {
  const rates = useLiveQuery(() => db.referenceRates.orderBy('date').reverse().toArray());
  const isoNow = new Date().toISOString().split('T')[0];
  const [isoDate, setIsoDate] = React.useState(isoNow);
  const [rate, setRate] = React.useState('');
  const { handleKeyDown, handlePaste } = useNumericInput({ allowDecimal: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rate || !isoDate) return;

    await db.referenceRates.add({
      date: new Date(isoDate),
      rate: parseFloat(rate)
    });

    const newIsoDate = new Date().toISOString().split('T')[0];
    setIsoDate(newIsoDate);
    setRate('');
  };

  const handleDelete = async (id: number) => {
    await db.referenceRates.delete(id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reference Rates (MRR)</CardTitle>
      </CardHeader>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="textSecondary">Effective Date</Typography>
            <DatePicker
              value={isoDate}
              onChange={setIsoDate}
              required
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="textSecondary">Rate (%)</Typography>
            <Input
              type="text"
              value={rate}
              onChange={(e) => setRate(e.target.value.replace(/[^0-9.]/g, ''))}
              onKeyDown={handleKeyDown}
              onPaste={(e) => handlePaste(e, rate, (newValue) => setRate(newValue.replace(/[^0-9.]/g, '')))}
              placeholder="7.5"
              required
              size="small"
            />
          </Box>
          <Button type="submit" size="sm">Add</Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 240, overflowY: 'auto' }}>
          {rates?.map((r) => (
            <Box key={r.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="body2">{format(r.date, 'dd/MM/yyyy')}</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{r.rate.toFixed(2)}%</Typography>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => r.id && handleDelete(r.id)}
                color="error"
                sx={{ minWidth: 24, minHeight: 24, p: 0 }}
              >
                x
              </Button>
            </Box>
          ))}
          {(!rates || rates.length === 0) && (
            <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center', py: 1 }}>No reference rates defined.</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
