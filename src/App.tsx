import { useLiveQuery } from 'dexie-react-hooks';
import { Box, Container, Grid, Stack } from '@mui/material';
import { db } from './db';
import { SetupLayout } from './components/SetupLayout';
import { AppHeader } from './components/AppHeader';
import { LoanSummary } from './components/LoanSummary';
import { PaymentList } from './components/PaymentList';
import { LoanGraph } from './components/LoanGraph';
import { DashboardSidebar } from './components/DashboardSidebar';
import { calculateLoanSeries } from './utils';

function App() {
  const loans = useLiveQuery(() => db.loans.toArray());
  const payments = useLiveQuery(() => db.payments.toArray());
  const referenceRates = useLiveQuery(() => db.referenceRates.toArray());

  // Show loading state
  if (!loans) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'text.secondary' }}>
        Loading...
      </Box>
    );
  }

  // Initial Setup Flow
  if (loans.length === 0) {
    return <SetupLayout />;
  }

  const activeLoan = loans[0];
  const loanPayments = payments?.filter(p => p.loanId === activeLoan.id!) || [];
  const series = calculateLoanSeries(activeLoan, loanPayments, referenceRates || []);

  return (
    <Box sx={{ minHeight: '100vh', pb: 20 }}>
      <AppHeader loanName={activeLoan.name} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <LoanSummary
            loan={activeLoan}
            series={series}
            totalPayments={loanPayments.length}
          />

          <Grid container spacing={3}>
            {/* Main Content Area (Left) */}
            <Grid item xs={12} lg={9}>
              <Stack spacing={3}>
                <LoanGraph data={series} />
                <PaymentList logs={series.filter(s => s.isPayment)} />
              </Stack>
            </Grid>

            {/* Sidebar Area (Right) */}
            <Grid item xs={12} lg={3}>
              <DashboardSidebar loan={activeLoan} />
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}

export default App;
