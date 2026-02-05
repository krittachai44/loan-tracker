import * as React from 'react';
import Typography from '@mui/material/Typography';
import { Card, CardContent } from './ui/Card';

export const InfoCard: React.FC = () => {
  return (
    <Card sx={{ backgroundColor: 'action.hover' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
          <strong>Calculation Method:</strong> Thai Bank Logic
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
          Interest is calculated daily based on 365 days/year.
          Payments deduct accrued interest first, then principal.
        </Typography>
      </CardContent>
    </Card>
  );
};
