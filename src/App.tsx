import { useLiveQuery } from 'dexie-react-hooks';
import { Box, Container, Grid, Stack, Fade, CircularProgress } from '@mui/material';
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

  // Show loading state with modern spinner
  if (!loans) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        gap: 2
      }}>
        <CircularProgress size={48} thickness={4} />
        <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Loading your loan data...</Box>
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
    <Fade in timeout={600}>
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: 'background.default',
        pb: 8
      }}>
        <AppHeader loanName={activeLoan.name} loan={activeLoan} />

        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Stack spacing={4}>
            <LoanSummary
              loan={activeLoan}
              series={series}
              totalPayments={loanPayments.length}
            />

            <Grid container spacing={3}>
              {/* Main Content Area (Left) - 2/3 width */}
              <Grid item xs={12} lg={8}>
                <Stack spacing={3}>
                  <LoanGraph data={series} />
                  <PaymentList logs={series.filter(s => s.isPayment)} />
                </Stack>
              </Grid>

              {/* Sidebar Area (Right) - 1/3 width */}
              <Grid item xs={12} lg={4}>
                <DashboardSidebar loan={activeLoan} />
              </Grid>
            </Grid>
          </Stack>
        </Container>
      </Box>
    </Fade>
  );
}

export default App;
