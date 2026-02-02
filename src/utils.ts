import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { type Loan, type Payment, type ReferenceRate } from './types';
import { DAYS_IN_YEAR } from './constants';

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

/**
 * Convert ISO date (YYYY-MM-DD) to DD/MM/YYYY format
 */
export function formatDateForDisplay(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Convert DD/MM/YYYY format to ISO date (YYYY-MM-DD)
 */
export function parseDateFromInput(dateStr: string): string {
  if (!dateStr) return '';
  
  const cleaned = dateStr.replace(/\//g, '');
  
  // Early return if user hasn't finished typing
  if (cleaned.length < 8) return dateStr;
  
  const day = cleaned.substring(0, 2);
  const month = cleaned.substring(2, 4);
  const year = cleaned.substring(4, 8);
  
  // Validate format
  if (!/^\d{2}$/.test(day) || !/^\d{2}$/.test(month) || !/^\d{4}$/.test(year)) {
    return dateStr;
  }
  
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  
  // Validate ranges
  if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
    return dateStr;
  }
  
  return `${year}-${month}-${day}`;
}

/**
 * Format date input as user types (DD/MM/YYYY)
 */
export function formatDateInput(value: string): string {
  const digitsOnly = value.replace(/[^\d]/g, '');
  
  // Early returns for shorter inputs
  if (digitsOnly.length === 0) return '';
  if (digitsOnly.length <= 2) return digitsOnly;
  if (digitsOnly.length <= 4) return `${digitsOnly.substring(0, 2)}/${digitsOnly.substring(2)}`;
  
  return `${digitsOnly.substring(0, 2)}/${digitsOnly.substring(2, 4)}/${digitsOnly.substring(4, 8)}`;
}

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

// Cache for rate lookups to avoid repeated searches
const rateCache = new Map<string, { type: 'fixed' | 'float'; value: number }>();

/**
 * Find active rate for a given date (with caching)
 */
const findActiveRate = (
  date: Date,
  sortedRates: Array<{ startDate: Date; type: 'fixed' | 'float'; value: number }>,
  cacheKey: string
): { type: 'fixed' | 'float'; value: number } => {
  const cached = rateCache.get(cacheKey);
  if (cached) return cached;

  // Find the rate using reduce (more efficient than filter + find)
  const activeRate = sortedRates.reduce((prev, curr) => {
    return curr.startDate <= date ? curr : prev;
  }, sortedRates[0]);

  const result = { type: activeRate.type, value: activeRate.value };
  rateCache.set(cacheKey, result);
  return result;
};

/**
 * Calculates the loan amortization schedule based on Thai Bank Logic.
 * Logic:
 * 1. Interest = Principal * (Rate/100) * (Days / 365)
 * 2. Payment deducts Interest first, then Principal.
 * 3. Calculation happens at each payment event.
 */
export const calculateLoanSeries = (loan: Loan, payments: Payment[], referenceRates: ReferenceRate[] = []): PaymentLog[] => {
    // Clear cache at start of calculation
    rateCache.clear();

    // Early return for no loan
    if (!loan) return [];

    // Sort payments once
    const sortedPayments = [...payments].sort((a, b) => a.date.getTime() - b.date.getTime());

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

    // Normalize and sort rates
    const sortedRates = [...loan.rates]
      .map(r => ({
        ...r,
        startDate: startOfDay(r.startDate)
      }))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // Normalize and sort reference rates
    const sortedRefRates = [...referenceRates]
      .map(r => ({
        ...r,
        date: startOfDay(r.date)
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    for (const payment of sortedPayments) {
        const payDate = startOfDay(payment.date);

        // Skip if payment is before start date
        if (payDate < lastDate) continue;

        const days = differenceInCalendarDays(payDate, lastDate);

        // Calculate interest with variable rates and MRR
        let periodInterest = 0;
        let periodStart = lastDate;
        const periodSegments: string[] = [];

        while (periodStart < payDate) {
            // Find the active loan rate segment
            const cacheKey = `${periodStart.getTime()}-${loan.id}`;
            const activeRateObj = findActiveRate(periodStart, sortedRates, cacheKey);

            // Determine the actual annual interest rate (%)
            let annualRate = 0;
            if (activeRateObj.type === 'fixed') {
                annualRate = activeRateObj.value;
            } else {
                // Float (MRR + Spread)
                const activeMRR = sortedRefRates.reduce((prev, curr) => {
                    return curr.date <= periodStart ? curr : prev;
                }, null as ReferenceRate | null);

                const mrrValue = activeMRR ? activeMRR.rate : 0;
                annualRate = mrrValue + activeRateObj.value;
            }

            // Determine the end of this calculation segment
            const nextRateChange = sortedRates.find(r => r.startDate > periodStart);
            let nextChangeDate = nextRateChange ? nextRateChange.startDate : payDate;

            if (activeRateObj.type === 'float') {
                const nextMRRChange = sortedRefRates.find(r => r.date > periodStart);
                if (nextMRRChange && nextMRRChange.date < nextChangeDate) {
                    nextChangeDate = nextMRRChange.date;
                }
            }

            // Ensure we don't go past payDate
            if (nextChangeDate > payDate) nextChangeDate = payDate;

            // Defensive check against infinite loop
            if (nextChangeDate <= periodStart) {
                nextChangeDate = payDate;
            }

            const daysInSegment = differenceInCalendarDays(nextChangeDate, periodStart);
            if (daysInSegment > 0) {
                periodSegments.push(`${annualRate.toFixed(2)}%(${daysInSegment})`);
                const segmentInterest = (currentPrincipal * (annualRate / 100) * daysInSegment) / DAYS_IN_YEAR;
                periodInterest += segmentInterest;
            }

            periodStart = nextChangeDate;
        }

        // Calculate interest and principal allocation
        const totalInterestDue = unpaidInterest + periodInterest;
        let interestPaid = 0;
        let principalPaid = 0;

        if (payment.amount >= totalInterestDue) {
            interestPaid = totalInterestDue;
            principalPaid = payment.amount - totalInterestDue;
            unpaidInterest = 0;
        } else {
            interestPaid = payment.amount;
            principalPaid = 0;
            unpaidInterest = totalInterestDue - payment.amount;
        }

        currentPrincipal = Math.max(0, currentPrincipal - principalPaid);

        logs.push({
            date: payDate,
            daysSinceLast: days,
            interest: interestPaid,
            principalPaid: principalPaid,
            remainingPrincipal: currentPrincipal,
            amount: payment.amount,
            note: payment.note,
            isPayment: true,
            paymentId: payment.id,
            accruedInterest: periodInterest,
            rateBreakdown: periodSegments.join('/')
        });

        lastDate = payDate;
    }

    return logs;
};
