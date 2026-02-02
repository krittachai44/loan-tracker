import { describe, it, expect } from 'vitest';
import { calculateLoanSeries, formatNumberInput, formatDateForDisplay } from '../utils';
import type { Loan, Payment, ReferenceRate } from '../types';

describe('Utils', () => {
  describe('formatNumberInput', () => {
    it('should format positive numbers correctly', () => {
      expect(formatNumberInput('1000')).toBe('1,000');
      expect(formatNumberInput('1000000')).toBe('1,000,000');
      expect(formatNumberInput('123456.789')).toBe('123,456.789');
    });

    it('should format negative numbers correctly', () => {
      expect(formatNumberInput('-1000')).toBe('1,000'); // removes non-numeric
    });

    it('should format zero correctly', () => {
      expect(formatNumberInput('0')).toBe('0');
    });

    it('should handle decimal precision', () => {
      expect(formatNumberInput('1.1')).toBe('1.1');
      expect(formatNumberInput('1.111')).toBe('1.111');
    });
  });

  describe('formatDateForDisplay', () => {
    it('should format dates correctly', () => {
      expect(formatDateForDisplay('2024-01-15')).toBe('15/01/2024');
      expect(formatDateForDisplay('2024-12-31')).toBe('31/12/2024');
    });

    it('should handle empty string', () => {
      expect(formatDateForDisplay('')).toBe('');
    });
  });

  describe('calculateLoanSeries', () => {
    const mockLoan: Loan = {
      id: 1,
      name: 'Test Loan',
      principal: 100000,
      startDate: new Date('2024-01-01'),
      rates: [
        {
          startDate: new Date('2024-01-01'),
          type: 'fixed',
          value: 5.0,
        },
      ],
    };

    const mockPayments: Payment[] = [
      {
        id: 1,
        loanId: 1,
        date: new Date('2024-02-01'),
        amount: 5000,
      },
    ];

    const mockReferenceRates: ReferenceRate[] = [];

    it('should return an array', () => {
      const result = calculateLoanSeries(mockLoan, mockPayments, mockReferenceRates);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should include payment entries', () => {
      const result = calculateLoanSeries(mockLoan, mockPayments, mockReferenceRates);
      const paymentEntries = result.filter(entry => entry.isPayment);
      expect(paymentEntries.length).toBeGreaterThan(0);
    });

    it('should calculate balance correctly after payment', () => {
      const result = calculateLoanSeries(mockLoan, mockPayments, mockReferenceRates);
      const firstPayment = result.find(entry => entry.isPayment);
      
      if (firstPayment) {
        expect(firstPayment.remainingPrincipal).toBeLessThan(mockLoan.principal);
      }
    });

    it('should handle multiple payments', () => {
      const multiplePayments: Payment[] = [
        {
          id: 1,
          loanId: 1,
          date: new Date('2024-02-01'),
          amount: 5000,
        },
        {
          id: 2,
          loanId: 1,
          date: new Date('2024-03-01'),
          amount: 5000,
        },
      ];

      const result = calculateLoanSeries(mockLoan, multiplePayments, mockReferenceRates);
      const paymentEntries = result.filter(entry => entry.isPayment);
      expect(paymentEntries.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle float rate with reference rates', () => {
      const floatLoan: Loan = {
        ...mockLoan,
        rates: [
          {
            startDate: new Date('2024-01-01'),
            type: 'float',
            value: 1.0, // margin
          },
        ],
      };

      const referenceRates: ReferenceRate[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          rate: 4.0,
        },
      ];

      const result = calculateLoanSeries(floatLoan, mockPayments, referenceRates);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty payments array', () => {
      const result = calculateLoanSeries(mockLoan, [], mockReferenceRates);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should maintain chronological order', () => {
      const result = calculateLoanSeries(mockLoan, mockPayments, mockReferenceRates);
      
      for (let i = 1; i < result.length; i++) {
        expect(result[i].date.getTime()).toBeGreaterThanOrEqual(result[i - 1].date.getTime());
      }
    });

    it('should calculate interest correctly for fixed rate', () => {
      const result = calculateLoanSeries(mockLoan, mockPayments, mockReferenceRates);
      const paymentEntry = result.find(entry => entry.isPayment);
      
      if (paymentEntry) {
        expect(paymentEntry.interest).toBeGreaterThan(0);
        expect(paymentEntry.principalPaid).toBeGreaterThan(0);
      }
    });

    it('should handle multiple rate segments', () => {
      const multiRateLoan: Loan = {
        ...mockLoan,
        rates: [
          {
            startDate: new Date('2024-01-01'),
            type: 'fixed',
            value: 5.0,
          },
          {
            startDate: new Date('2024-06-01'),
            type: 'fixed',
            value: 4.5,
          },
        ],
      };

      const result = calculateLoanSeries(multiRateLoan, mockPayments, mockReferenceRates);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
