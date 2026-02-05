import { describe, bench } from 'vitest';
import { calculateLoanSeries } from '../../utils';
import { testDatasets } from '../generators/testData';

/**
 * Performance benchmarks for calculateLoanSeries function
 * 
 * Run with: npm run test:bench
 * or: vitest bench
 */

describe('calculateLoanSeries performance', () => {
  bench('12 payments (1 year)', () => {
    const { loan, payments, referenceRates } = testDatasets.small();
    calculateLoanSeries(loan, payments, referenceRates);
  });

  bench('100 payments (~8 years)', () => {
    const { loan, payments, referenceRates } = testDatasets.medium();
    calculateLoanSeries(loan, payments, referenceRates);
  });

  bench('1,000 payments (~83 years)', () => {
    const { loan, payments, referenceRates } = testDatasets.large();
    calculateLoanSeries(loan, payments, referenceRates);
  });

  bench('10,000 payments (stress test)', () => {
    const { loan, payments, referenceRates } = testDatasets.xlarge();
    calculateLoanSeries(loan, payments, referenceRates);
  }, { iterations: 10 }); // Fewer iterations for stress test
});

describe('calculateLoanSeries with different rate segments', () => {
  bench('100 payments with 2 rate segments', () => {
    const { loan, payments, referenceRates } = testDatasets.medium();
    loan.rates = loan.rates.slice(0, 2);
    calculateLoanSeries(loan, payments, referenceRates);
  });

  bench('100 payments with 10 rate segments', () => {
    const { loan, payments, referenceRates } = testDatasets.medium();
    // Generate more rate segments
    const extraRates = [];
    for (let i = 5; i < 10; i++) {
      const segmentDate = new Date(loan.startDate);
      segmentDate.setMonth(loan.startDate.getMonth() + i * 6);
      extraRates.push({
        startDate: segmentDate,
        type: i % 2 === 0 ? 'fixed' as const : 'float' as const,
        value: 3.5 + (i * 0.3)
      });
    }
    loan.rates = [...loan.rates, ...extraRates];
    calculateLoanSeries(loan, payments, referenceRates);
  });
});

describe('calculateLoanSeries with different MRR frequencies', () => {
  bench('100 payments with 50 MRR changes', () => {
    const { loan, payments, referenceRates } = testDatasets.medium();
    calculateLoanSeries(loan, payments, referenceRates.slice(0, 50));
  });

  bench('100 payments with 200 MRR changes', () => {
    const { loan, payments, referenceRates } = testDatasets.medium();
    calculateLoanSeries(loan, payments, referenceRates.slice(0, 200));
  });
});
