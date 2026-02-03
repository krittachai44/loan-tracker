import { memo } from 'react';
import { Box, Container, Grid2, Stack, Fade, CircularProgress } from '@mui/material';
import { SetupLayout } from './components/SetupLayout';
import { AppHeader } from './components/AppHeader';
import { LoanSummary } from './components/LoanSummary';
import { PaymentList } from './components/PaymentList';
import { LoanGraph } from './components/LoanGraph';
import { DashboardSidebar } from './components/DashboardSidebar';
import { useLoanData } from './hooks';
import { LOADING_MESSAGES } from './constants';

// Memoized loading component to prevent re-creation
const LoadingState = memo(() => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100vh',
    width: '100vw',
    bgcolor: 'background.default',
    gap: 2
  }}>
    <CircularProgress size={48} thickness={4} color="primary" />
    <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
      {LOADING_MESSAGES.LOAN_DATA}
    </Box>
  </Box>
));
LoadingState.displayName = 'LoadingState';

function App() {
  const { activeLoan, loanPayments, series, referenceRates, isLoading } = useLoanData();

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Initial Setup Flow
  if (!activeLoan) {
    return <SetupLayout />;
  }

  const paymentLogs = series.filter(s => s.isPayment);

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
              payments={loanPayments}
              referenceRates={referenceRates}
            />

            <Grid2 container spacing={3}>
              {/* Main Content Area (Left) - 2/3 width */}
              <Grid2 size={{ xs: 12, lg: 8 }}>
                <Stack spacing={3}>
                  <LoanGraph data={series} />
                  <PaymentList logs={paymentLogs} />
                </Stack>
              </Grid2>

              {/* Sidebar Area (Right) - 1/3 width */}
              <Grid2 size={{ xs: 12, lg: 4 }}>
                <DashboardSidebar loan={activeLoan} />
              </Grid2>
            </Grid2>
          </Stack>
        </Container>
      </Box>
    </Fade>
  );
}

export default App;
