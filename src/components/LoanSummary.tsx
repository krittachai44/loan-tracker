import * as React from 'react';
import { Grid, useTheme } from '@mui/material';
import { SummaryCard } from './SummaryCard';
import type { Loan } from '../types';
import type { PaymentLog } from '../utils';

interface LoanSummaryProps {
    loan: Loan;
    series: PaymentLog[];
    totalPayments: number;
}

export const LoanSummary: React.FC<LoanSummaryProps> = ({ loan, series, totalPayments }) => {
    const theme = useTheme();
    const currentStatus = series[series.length - 1];

    const getRateDisplay = () => {
        if (!loan.rates || loan.rates.length === 0) return 'N/A';
        const firstRate = loan.rates[0];
        const baseText = firstRate.type === 'fixed'
            ? `${firstRate.value}%`
            : `MRR ${firstRate.value >= 0 ? '+' : ''}${firstRate.value}%`;

        return loan.rates.length > 1 ? `${baseText} (Variable)` : `${baseText}`;
    };

    const totalInterest = series.reduce((sum, item) => sum + item.interest, 0);
    const totalPaid = series.reduce((sum, item) => sum + item.amount, 0);

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
                <SummaryCard
                    title="Remaining Principal"
                    value={currentStatus.remainingPrincipal}
                    subtitle={`Started: ${loan.principal.toLocaleString()}`}
                    gradient={`linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`}
                />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
                <SummaryCard
                    title="Interest Paid"
                    value={totalInterest}
                    subtitle={`Rate: ${getRateDisplay()} / year`}
                    valueColor="error.main"
                />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
                <SummaryCard
                    title="Total Paid"
                    value={totalPaid}
                    subtitle={`${totalPayments} payments made`}
                    valueColor="success.main"
                />
            </Grid>
        </Grid>
    );
};
