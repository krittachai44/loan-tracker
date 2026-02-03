import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { calculateLoanSeries } from '../utils';

/**
 * Custom hook to fetch and compute loan data with memoization
 */
export const useLoanData = (loanId?: number) => {
  const loans = useLiveQuery(() => db.loans.toArray());
  const payments = useLiveQuery(() => db.payments.toArray());
  const referenceRates = useLiveQuery(() => db.referenceRates.toArray());

  const activeLoan = (() => {
    if (!loans || loans.length === 0) return null;
    return loanId ? loans.find((l) => l.id === loanId) : loans[0];
  })();

  const loanPayments = (() => {
    if (!activeLoan?.id || !payments) return [];
    return payments.filter((p) => p.loanId === activeLoan.id);
  })();

  const series = (() => {
    if (!activeLoan) return [];
    return calculateLoanSeries(activeLoan, loanPayments, referenceRates || []);
  })();

  const isLoading = !loans;
  return {
    loans,
    activeLoan,
    loanPayments,
    referenceRates: referenceRates || [],
    series,
    isLoading,
  };
};

/**
 * Custom hook to fetch all loans without calculations
 */
export const useLoans = () => {
  return useLiveQuery(() => db.loans.toArray());
};

/**
 * Custom hook to fetch payments for a specific loan
 */
export const useLoanPayments = (loanId: number) => {
  return useLiveQuery(
    () => db.payments.where('loanId').equals(loanId).toArray(),
    [loanId]
  );
};
