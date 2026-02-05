import { type Loan, type Payment, type ReferenceRate } from '../../types';

/**
 * Generate test data for performance testing
 */

/**
 * Generate a test loan with configurable rate segments
 */
export function generateTestLoan(options: {
  principal?: number;
  rateSegments?: number;
  startDate?: Date;
}): Loan {
  const { principal = 1000000, rateSegments = 5, startDate = new Date('2020-01-01') } = options;

  const rates: Loan['rates'] = [];
  const monthsPerSegment = Math.floor(48 / rateSegments); // 4 years divided by segments

  for (let i = 0; i < rateSegments; i++) {
    const segmentDate = new Date(startDate);
    segmentDate.setMonth(startDate.getMonth() + i * monthsPerSegment);

    rates.push({
      startDate: segmentDate,
      type: i % 2 === 0 ? 'fixed' : 'float',
      value: 3.5 + (i * 0.5) // Incrementing rates
    });
  }

  return {
    id: 1,
    name: `Test Loan ${principal}`,
    principal,
    startDate,
    rates
  };
}

/**
 * Generate test payments with realistic spacing
 */
export function generateTestPayments(options: {
  count: number;
  loanId?: number;
  startDate?: Date;
  monthlyPayment?: number;
}): Payment[] {
  const { 
    count, 
    loanId = 1, 
    startDate = new Date('2020-01-01'), 
    monthlyPayment = 25000 
  } = options;

  const payments: Payment[] = [];
  const baseDate = new Date(startDate);

  for (let i = 0; i < count; i++) {
    const paymentDate = new Date(baseDate);
    paymentDate.setMonth(baseDate.getMonth() + i);
    paymentDate.setDate(5); // Payment on 5th of each month

    payments.push({
      id: i + 1,
      loanId,
      date: paymentDate,
      amount: monthlyPayment + (Math.random() * 5000 - 2500), // ±2500 variation
      note: i % 10 === 0 ? `Payment ${i + 1}` : undefined
    });
  }

  return payments;
}

/**
 * Generate test reference rates (MRR)
 */
export function generateTestReferenceRates(options: {
  count: number;
  startDate?: Date;
  baseRate?: number;
}): ReferenceRate[] {
  const { count, startDate = new Date('2019-01-01'), baseRate = 2.5 } = options;

  const rates: ReferenceRate[] = [];
  const baseDate = new Date(startDate);

  for (let i = 0; i < count; i++) {
    const rateDate = new Date(baseDate);
    rateDate.setMonth(baseDate.getMonth() + i);
    rateDate.setDate(1); // Rate change on 1st of month

    // Simulate rate fluctuations
    const fluctuation = Math.sin(i / 12) * 0.5; // Cyclical changes
    const randomNoise = (Math.random() - 0.5) * 0.2;

    rates.push({
      id: i + 1,
      date: rateDate,
      rate: baseRate + fluctuation + randomNoise
    });
  }

  return rates;
}

/**
 * Generate complete test dataset for performance testing
 */
export function generateCompleteTestDataset(paymentCount: number) {
  const loan = generateTestLoan({
    principal: 1000000,
    rateSegments: 5,
    startDate: new Date('2020-01-01')
  });

  const payments = generateTestPayments({
    count: paymentCount,
    loanId: loan.id!,
    startDate: loan.startDate,
    monthlyPayment: 25000
  });

  const referenceRates = generateTestReferenceRates({
    count: Math.ceil(paymentCount * 1.2), // More rates than payments
    startDate: new Date('2019-01-01'),
    baseRate: 2.5
  });

  return { loan, payments, referenceRates };
}

/**
 * Preset datasets for common testing scenarios
 */
export const testDatasets = {
  small: () => generateCompleteTestDataset(12), // 1 year
  medium: () => generateCompleteTestDataset(100), // ~8 years
  large: () => generateCompleteTestDataset(1000), // ~83 years
  xlarge: () => generateCompleteTestDataset(10000) // ~833 years (stress test)
};
