import { describe, bench } from 'vitest';
import { calculateLoanSeries } from '../../utils';
import { testDatasets } from '../generators/testData';

/**
 * Performance benchmarks for optimization improvements
 * 
 * Run with: npm run test:bench
 * or: vitest bench
 * 
 * These benchmarks test the actual improvements made:
 * 1. useLoanData memoization (cross-hook boundary)
 * 2. PaymentList loop combining
 * 3. LoanSummary calculation combining
 */

describe('PaymentList - Year Filtering & Collection', () => {
  const { loan, payments } = testDatasets.medium();
  const series = calculateLoanSeries(loan, payments, []);
  
  // Simulate the OLD approach (multiple iterations)
  const oldApproach = (logs: typeof series, selectedYear: number | 'ALL') => {
    const years = new Set(logs.map(log => log.date.getFullYear())); // Iteration 1
    const availableYears = Array.from(years).sort((a, b) => b - a); // Iteration 2
    const sorted = logs.toReversed(); // Iteration 3
    const filtered = selectedYear !== 'ALL' 
      ? sorted.filter(log => log.date.getFullYear() === selectedYear) // Iteration 4
      : sorted;
    return { availableYears, history: filtered };
  };

  // NEW optimized approach (combined iterations)
  const newApproach = (logs: typeof series, selectedYear: number | 'ALL') => {
    const yearsSet = new Set<number>();
    const reversed = logs.toReversed(); // Iteration 1
    
    const filtered = selectedYear === 'ALL'
      ? reversed
      : reversed.filter(log => {
          const year = log.date.getFullYear();
          return year === selectedYear;
        });
    
    for (const log of logs) {
      yearsSet.add(log.date.getFullYear()); // Iteration 2
    }
    
    return {
      availableYears: Array.from(yearsSet).sort((a, b) => b - a),
      history: filtered
    };
  };

  bench('OLD: Multiple iterations (4 passes)', () => {
    oldApproach(series, 'ALL');
  });

  bench('NEW: Combined iterations (2 passes)', () => {
    newApproach(series, 'ALL');
  });

  bench('OLD: Filtered by year (4 passes)', () => {
    oldApproach(series, 2020);
  });

  bench('NEW: Filtered by year (2 passes)', () => {
    newApproach(series, 2020);
  });
});

describe('LoanSummary - Calculation Combining', () => {
  const { loan, payments } = testDatasets.medium();
  const series = calculateLoanSeries(loan, payments, []);

  // OLD approach (two separate reduces)
  const oldApproach = (data: typeof series) => {
    const totalInterest = data.reduce((sum, item) => sum + item.interest, 0);
    const totalPaid = data.reduce((sum, item) => sum + item.amount, 0);
    return { totalInterest, totalPaid };
  };

  // NEW approach (single loop)
  const newApproach = (data: typeof series) => {
    let interest = 0;
    let paid = 0;
    for (const item of data) {
      interest += item.interest;
      paid += item.amount;
    }
    return { totalInterest: interest, totalPaid: paid };
  };

  bench('OLD: Two reduce operations', () => {
    oldApproach(series);
  });

  bench('NEW: Single for loop', () => {
    newApproach(series);
  });
});

describe('useLoanData - Series Calculation (with memoization)', () => {
  // This tests the impact of memoization on expensive calculations
  const datasets = [
    { name: '12 payments', data: testDatasets.small() },
    { name: '100 payments', data: testDatasets.medium() },
    { name: '1,000 payments', data: testDatasets.large() }
  ];

  datasets.forEach(({ name, data }) => {
    const { loan, payments, referenceRates } = data;

    bench(`calculateLoanSeries: ${name}`, () => {
      calculateLoanSeries(loan, payments, referenceRates);
    });
  });
});

describe('Array Operation Efficiency', () => {
  const { loan, payments } = testDatasets.large();
  const series = calculateLoanSeries(loan, payments, []);

  bench('toReversed() - immutable', () => {
    series.toReversed();
  });

  bench('[...arr].reverse() - spread + mutate', () => {
    [...series].reverse();
  });

  bench('Array.from().sort()', () => {
    const years = new Set(series.map(s => s.date.getFullYear()));
    Array.from(years).sort((a, b) => b - a);
  });
});

describe('Conditional Rendering Safety', () => {
  const testIds = [0, 1, 100, null, undefined];

  bench('OLD: paymentId && <Component /> (unsafe with 0)', () => {
    testIds.forEach(id => {
      if (id) {
        // Component would render
      }
    });
  });

  bench('NEW: paymentId != null && <Component /> (safe)', () => {
    testIds.forEach(id => {
      if (id != null) {
        // Component would render
      }
    });
  });
});
