import { Grid2, useTheme } from '@mui/material';
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

export const LoanSummary = ({ loan, series, totalPayments, payments, referenceRates }: LoanSummaryProps) => {
  const theme = useTheme();

  // Derive state during render instead of in effects
  const currentStatus = series[series.length - 1];

  const getRateDisplay = (() => {
    if (!loan.rates || loan.rates.length === 0) return 'N/A';
    
    // Find the current active rate based on today's date
    const today = new Date();
    const sortedRates = [...loan.rates].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    const currentRate = sortedRates.reduce((prev, curr) => {
      return curr.startDate <= today ? curr : prev;
    }, sortedRates[0]);
    
    const baseText = currentRate.type === 'fixed'
      ? `${currentRate.value}%`
      : `MRR ${currentRate.value >= 0 ? '+' : ''}${currentRate.value}%`;

    return loan.rates.length > 1 ? `${baseText} (Variable)` : `${baseText}`;
  })();

  const totalInterest = series.reduce((sum, item) => sum + item.interest, 0);

  const totalPaid = series.reduce((sum, item) => sum + item.amount, 0);

  const interestPercentage = totalPaid > 0 ? (totalInterest / totalPaid) * 100 : 0;

  const payoffPrediction = calculatePayoffPrediction(loan, payments, currentStatus.remainingPrincipal, referenceRates);

  return (
    <Grid2 container spacing={3}>
      <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
        <SummaryCard
          title="Remaining Principal"
          value={currentStatus.remainingPrincipal}
          subtitle={`Started: ${loan.principal.toLocaleString()}`}
          gradient={`linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`}
          icon="money"
        />
      </Grid2>

      <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
        <SummaryCard
          title="Total Paid"
          value={totalPaid}
          subtitle={`${totalPayments} payments made`}
          valueColor="success.main"
          icon="down"
        />
      </Grid2>

      <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
        <SummaryCard
          title="Interest Paid"
          value={totalInterest}
          subtitle={`${interestPercentage.toFixed(2)}% of total paid | Current Rate: ${getRateDisplay} / year`}
          valueColor="error.main"
          icon="up"
        />
      </Grid2>

      {payoffPrediction && (
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            title="Est. Payoff Time"
            value={payoffPrediction.estimatedYearsLeft}
            valuePrefix=""
            valueSuffix={` year${payoffPrediction.estimatedYearsLeft === 1 ? '' : 's'}`}
            subtitle={`~${payoffPrediction.estimatedMonthsLeft} months | calculated based on last 12 current payment trends`}
            valueColor="info.main"
            icon="time"
          />
        </Grid2>
      )}
    </Grid2>
  );
};
