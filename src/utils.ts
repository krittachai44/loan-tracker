import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { type Loan, type Payment, type ReferenceRate } from './types';
import { DAYS_IN_YEAR, PREDICTION } from './constants';
import {
  normalizeRates,
  normalizeReferenceRates,
  calculatePeriodInterest,
  calculateEffectiveRate,
  allocatePayment,
  clearRateCache
} from './utils/loan-calculations';

/**
 * Format a number string with thousands separators (commas)
 * Removes non-numeric characters except decimal point, then formats
 */
export function formatNumberInput(value: string): string {
  // Early return for empty string
  if (!value) return '';

  // Remove any non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  const withSingleDecimal = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
  
  // Split by decimal point
  const [integerPart, decimalPart] = withSingleDecimal.split('.');
  
  // Add commas to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Reconstruct with decimal part if present
  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

/**
 * Remove formatting (commas) from an input string before parsing
 */
export function parseFormattedNumber(value: string): string {
  return value.replace(/,/g, '');
}

export {
  formatDateForDisplay,
  parseDateFromInput,
  formatDateInput,
  toISODate,
  isValidDate,
  ensureValidDate
} from './utils/date';

export interface PaymentLog {
    date: Date;
    daysSinceLast: number;
    interest: number;
    principalPaid: number;
    remainingPrincipal: number;
    amount: number;
    note?: string;
    isPayment: boolean;
    paymentId?: number;
    accruedInterest: number;
    rateBreakdown: string;
}

/**
 * Calculates the loan amortization schedule based on Thai Bank Logic.
 * 
 * This function has been refactored to use separate modules for:
 * - Rate calculations (rateCalculator.ts)
 * - Interest calculations (interestCalculator.ts)
 * - Payment allocations (paymentAllocator.ts)
 * 
 * Logic:
 * 1. Interest = Principal * (Rate/100) * (Days / 365)
 * 2. Payment deducts Interest first, then Principal.
 * 3. Calculation happens at each payment event.
 */
export const calculateLoanSeries = (
  loan: Loan,
  payments: Payment[],
  referenceRates: ReferenceRate[] = []
): PaymentLog[] => {
  // Clear rate cache at start of calculation
  clearRateCache();

  // Early return for no loan
  if (!loan) return [];

  // Sort payments once (immutable)
  const sortedPayments = payments.toSorted((a, b) => a.date.getTime() - b.date.getTime());

  // Normalize and sort rates
  const sortedRates = normalizeRates(loan.rates);
  const sortedRefRates = normalizeReferenceRates(referenceRates);

  // Initialize tracking variables
  let currentPrincipal = loan.principal;
  let lastDate = startOfDay(loan.startDate);
  let unpaidInterest = 0;
  const logs: PaymentLog[] = [];

  // Add initial state
  logs.push({
    date: lastDate,
    daysSinceLast: 0,
    interest: 0,
    principalPaid: 0,
    remainingPrincipal: currentPrincipal,
    amount: 0,
    note: 'Start of Loan',
    isPayment: false,
    accruedInterest: 0,
    rateBreakdown: ''
  });

  // Process each payment
  for (const payment of sortedPayments) {
    const payDate = startOfDay(payment.date);

    // Skip if payment is before start date
    if (payDate < lastDate) continue;

    const days = differenceInCalendarDays(payDate, lastDate);

    // Calculate interest for the period using extracted module
    const { totalInterest, rateBreakdown } = calculatePeriodInterest(
      lastDate,
      payDate,
      currentPrincipal,
      sortedRates,
      sortedRefRates,
      loan.id
    );

    // Allocate payment to interest and principal using extracted module
    const allocation = allocatePayment(payment.amount, totalInterest, unpaidInterest);

    // Update tracking variables
    currentPrincipal = Math.max(0, currentPrincipal - allocation.principalPaid);
    unpaidInterest = allocation.unpaidInterest;

    // Record payment log
    logs.push({
      date: payDate,
      daysSinceLast: days,
      interest: allocation.interestPaid,
      principalPaid: allocation.principalPaid,
      remainingPrincipal: currentPrincipal,
      amount: payment.amount,
      note: payment.note,
      isPayment: true,
      paymentId: payment.id,
      accruedInterest: totalInterest,
      rateBreakdown
    });

    lastDate = payDate;
  }

  return logs;
};

/**
 * Calculate loan payoff prediction based on recent payment history
 * Uses last 12 payments to estimate average payment and projects payoff timeline
 */
export interface PayoffPrediction {
    averagePayment: number;
    estimatedMonthsLeft: number;
    estimatedYearsLeft: number;
    estimatedPayoffDate: Date;
    totalEstimatedInterest: number;
    confidence: 'high' | 'medium' | 'low';
}

export const calculatePayoffPrediction = (
    loan: Loan,
    payments: Payment[],
    currentBalance: number,
    referenceRates: ReferenceRate[] = [],
    currentDate: Date = new Date()
): PayoffPrediction | null => {
    // Need at least 3 payments for meaningful prediction
    if (payments.length < 3 || currentBalance <= 0) {
        return null;
    }

    // Get last 12 payments (or all if less than 12)
    const recentPayments = [...payments]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, Math.min(12, payments.length));

    // Calculate average payment amount
    const totalPaid = recentPayments.reduce((sum, p) => sum + p.amount, 0);
    const averagePayment = totalPaid / recentPayments.length;

    // Calculate average days between payments
    const paymentDates = recentPayments
        .map(p => new Date(p.date))
        .sort((a, b) => a.getTime() - b.getTime());
    
    let totalDaysBetween = 0;
    for (let i = 1; i < paymentDates.length; i++) {
        totalDaysBetween += differenceInCalendarDays(paymentDates[i], paymentDates[i - 1]);
    }
    const avgDaysBetweenPayments = paymentDates.length > 1 
        ? totalDaysBetween / (paymentDates.length - 1) 
        : 30;

    // Get current effective annual rate
    const sortedRates = normalizeRates(loan.rates);
    const sortedRefRates = normalizeReferenceRates(referenceRates);
    const currentRate = calculateEffectiveRate(currentDate, sortedRates, sortedRefRates, loan.id);
    
    const dailyRate = currentRate / DAYS_IN_YEAR / 100;

    // Simulate loan payoff with average payment
    let balance = currentBalance;
    let projectedDate = new Date(currentDate);
    let monthsCount = 0;
    let totalInterest = 0;
    const maxIterations = PREDICTION.MAX_ITERATIONS; // Safety limit (50 years)

    while (balance > 0.01 && monthsCount < maxIterations) {
        // Calculate interest for the payment period
        const periodInterest = balance * dailyRate * avgDaysBetweenPayments;
        
        // Apply payment
        const principalPayment = Math.min(averagePayment - periodInterest, balance);
        
        if (principalPayment <= 0) {
            // Payment doesn't cover interest - loan won't be paid off
            return null;
        }

        balance -= principalPayment;
        totalInterest += periodInterest;
        
        // Move forward by average payment period
        projectedDate = new Date(projectedDate.getTime() + avgDaysBetweenPayments * 24 * 60 * 60 * 1000);
        monthsCount += avgDaysBetweenPayments / 30;
    }

    // Determine confidence level
    const paymentCount = recentPayments.length;
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (paymentCount >= 12) confidence = 'high';
    else if (paymentCount >= 6) confidence = 'medium';

    // Calculate standard deviation of payments to adjust confidence
    const avgAmount = averagePayment;
    const variance = recentPayments.reduce((sum, p) => sum + Math.pow(p.amount - avgAmount, 2), 0) / paymentCount;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / avgAmount;

    // High variation in payments = lower confidence
    if (coefficientOfVariation > 0.3) {
        confidence = confidence === 'high' ? 'medium' : 'low';
    }

    return {
        averagePayment,
        estimatedMonthsLeft: Math.round(monthsCount),
        estimatedYearsLeft: parseFloat((monthsCount / 12).toFixed(1)),
        estimatedPayoffDate: projectedDate,
        totalEstimatedInterest: totalInterest,
        confidence
    };
};
