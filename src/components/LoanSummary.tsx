import { memo, useMemo } from 'react';
import { Grid, useTheme } from '@mui/material';
import { SummaryCard } from './SummaryCard';
import type { Loan } from '../types';
import type { PaymentLog } from '../utils';

interface LoanSummaryProps {
    loan: Loan;
    series: PaymentLog[];
    totalPayments: number;
}

export const LoanSummary = memo<LoanSummaryProps>(({ loan, series, totalPayments }) => {
    const theme = useTheme();

    // Derive state during render instead of in effects
    const currentStatus = series[series.length - 1];

    const getRateDisplay = useMemo(() => {
        if (!loan.rates || loan.rates.length === 0) return 'N/A';
        const firstRate = loan.rates[0];
        const baseText = firstRate.type === 'fixed'
            ? `${firstRate.value}%`
            : `MRR ${firstRate.value >= 0 ? '+' : ''}${firstRate.value}%`;

        return loan.rates.length > 1 ? `${baseText} (Variable)` : `${baseText}`;
    }, [loan.rates]);

    const totalInterest = useMemo(() => 
        series.reduce((sum, item) => sum + item.interest, 0),
        [series]
    );

    const totalPaid = useMemo(() => 
        series.reduce((sum, item) => sum + item.amount, 0),
        [series]
    );

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
                <SummaryCard
                    title="Remaining Principal"
                    value={currentStatus.remainingPrincipal}
                    subtitle={`Started: ${loan.principal.toLocaleString()}`}
                    gradient={`linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`}
                    icon="money"
                />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
                <SummaryCard
                    title="Interest Paid"
                    value={totalInterest}
                    subtitle={`Rate: ${getRateDisplay} / year`}
                    valueColor="error.main"
                    icon="up"
                />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
                <SummaryCard
                    title="Total Paid"
                    value={totalPaid}
                    subtitle={`${totalPayments} payments made`}
                    valueColor="success.main"
                    icon="down"
                />
            </Grid>
        </Grid>
    );
});

LoanSummary.displayName = 'LoanSummary';
