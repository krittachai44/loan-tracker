import { memo, useMemo } from 'react';
import { Grid, useTheme } from '@mui/material';
import { SummaryCard } from './SummaryCard';
import type { Loan, Payment, ReferenceRate } from '../types';
import type { PaymentLog } from '../utils';
import { calculatePayoffPrediction } from '../utils';

interface LoanSummaryProps {
    loan: Loan;
    series: PaymentLog[];
    totalPayments: number;
    payments: Payment[];
    referenceRates: ReferenceRate[];
}

export const LoanSummary = memo<LoanSummaryProps>(({ loan, series, totalPayments, payments, referenceRates }) => {
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

    const payoffPrediction = useMemo(() => 
        calculatePayoffPrediction(loan, payments, currentStatus.remainingPrincipal, referenceRates),
        [loan, payments, currentStatus.remainingPrincipal, referenceRates]
    );

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                    title="Remaining Principal"
                    value={currentStatus.remainingPrincipal}
                    subtitle={`Started: ${loan.principal.toLocaleString()}`}
                    gradient={`linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`}
                    icon="money"
                />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                    title="Interest Paid"
                    value={totalInterest}
                    subtitle={`Rate: ${getRateDisplay} / year`}
                    valueColor="error.main"
                    icon="up"
                />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                    title="Total Paid"
                    value={totalPaid}
                    subtitle={`${totalPayments} payments made`}
                    valueColor="success.main"
                    icon="down"
                />
            </Grid>

            {payoffPrediction && (
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard
                        title="Est. Payoff Time"
                        value={payoffPrediction.estimatedYearsLeft}
                        valuePrefix=""
                        valueSuffix={` year${payoffPrediction.estimatedYearsLeft === 1 ? '' : 's'}`}
                        subtitle={`~${payoffPrediction.estimatedMonthsLeft} months | ${payoffPrediction.confidence} confidence | calculated based on last 12 current payment trends`}
                        valueColor="info.main"
                        icon="time"
                    />
                </Grid>
            )}
        </Grid>
    );
});

LoanSummary.displayName = 'LoanSummary';
