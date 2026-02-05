import { useCallback } from 'react';
import { paymentRepository, referenceRateRepository } from '../services';
import type { Loan } from '../types';
import { isValidDate, formatDateForCSV, getTime, getCurrentISODate } from '../utils/date';
import { escapeCSV } from '../utils/csv';
import { useSnackbar } from './useSnackbar';

export const useLoanExport = () => {
  const { showError } = useSnackbar();

  const exportToCSV = useCallback(async (loan: Loan) => {
    try {
      // Validate loan ID
      if (!loan.id) {
        throw new Error('Loan ID is missing');
      }

      // Get all data
      const payments = await paymentRepository.getByLoanId(loan.id);
      const referenceRates = await referenceRateRepository.getAll();

      // Filter out invalid data
      const validPayments = payments.filter(p => isValidDate(p.date));
      const validReferenceRates = referenceRates.filter(r => isValidDate(r.date));
      
      // Log warnings for invalid data
      if (payments.length !== validPayments.length) {
        console.warn(`Skipped ${payments.length - validPayments.length} payment(s) with invalid dates`);
      }
      if (referenceRates.length !== validReferenceRates.length) {
        console.warn(`Skipped ${referenceRates.length - validReferenceRates.length} reference rate(s) with invalid dates`);
      }

      // Create CSV content
      const csvParts: string[] = [];

      // Section 1: Loan Details
      csvParts.push('# LOAN DETAILS');
      csvParts.push('Field,Value');
      csvParts.push(`Name,${escapeCSV(loan.name)}`);
      csvParts.push(`Principal,${loan.principal}`);
      csvParts.push(`Start Date,${formatDateForCSV(loan.startDate)}`);
      csvParts.push('');

      // Section 2: Rate Segments
      csvParts.push('# RATE SEGMENTS');
      csvParts.push('Start Date,Type,Value');
      if (loan.rates && Array.isArray(loan.rates)) {
        loan.rates.forEach(rate => {
          csvParts.push(`${formatDateForCSV(rate.startDate)},${rate.type},${rate.value}`);
        });
      }
      csvParts.push('');

      // Section 3: Reference Rates (MRR)
      csvParts.push('# REFERENCE RATES');
      csvParts.push('Date,Rate');
      validReferenceRates
        .toSorted((a, b) => getTime(a.date) - getTime(b.date))
        .forEach(rate => {
          csvParts.push(`${formatDateForCSV(rate.date)},${rate.rate}`);
        });
      csvParts.push('');

      // Section 4: Payment History
      csvParts.push('# PAYMENT HISTORY');
      csvParts.push('Date,Amount,Note');
      validPayments
        .toSorted((a, b) => getTime(a.date) - getTime(b.date))
        .forEach(payment => {
          csvParts.push(`${formatDateForCSV(payment.date)},${payment.amount},${escapeCSV(payment.note || '')}`);
        });

      const csvContent = csvParts.join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `loan_${loan.name.replace(/[^a-z0-9]/gi, '_')}_${getCurrentISODate()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      showError('Failed to export data. Please try again.');
    }
  }, [showError]);

  return { exportToCSV };
};
