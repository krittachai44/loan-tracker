import * as React from 'react';
import Stack from '@mui/material/Stack';
import { LoanDetailsManager } from './LoanDetailsManager';
import { LoanRateManager } from './LoanRateManager';
import { PaymentForm } from './PaymentForm';
import { MRRManager } from './MRRManager';
import { InfoCard } from './InfoCard';
import type { Loan } from '../types';

interface DashboardSidebarProps {
  loan: Loan;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ loan }) => {
  return (
    <Stack spacing={3}>
      <LoanDetailsManager loan={loan} />
      <LoanRateManager loan={loan} />
      <PaymentForm loanId={loan.id!} />
      <MRRManager />
      <InfoCard />
    </Stack>
  );
};
