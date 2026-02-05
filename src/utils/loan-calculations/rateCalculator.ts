/**
 * Rate Calculator - Handles rate lookup and MRR calculations
 * Extracted from calculateLoanSeries for Single Responsibility Principle
 */
import type { Loan, ReferenceRate } from '../../types';
import { startOfDay } from 'date-fns';

// Module-level cache for rate lookups
const rateCache = new Map<string, Loan['rates'][0]>();

/**
 * Find the active rate segment for a given date
 */
function findActiveRate(
  date: Date,
  sortedRates: Array<Loan['rates'][0] & { startDate: Date }>,
  cacheKey: string
): Loan['rates'][0] {
  // Check cache first
  if (rateCache.has(cacheKey)) {
    return rateCache.get(cacheKey)!;
  }

  // Find the most recent rate that started on or before the given date
  const activeRate = sortedRates.toReversed().find(r => r.startDate <= date);

  if (!activeRate) {
    // If no rate found, use the earliest rate
    const result = sortedRates[0];
    rateCache.set(cacheKey, result);
    return result;
  }

  rateCache.set(cacheKey, activeRate);
  return activeRate;
}

/**
 * Calculate the effective annual interest rate for a period
 * Handles both fixed rates and floating rates (MRR + spread)
 */
export function calculateEffectiveRate(
  periodStart: Date,
  sortedRates: Array<Loan['rates'][0] & { startDate: Date }>,
  sortedRefRates: Array<ReferenceRate & { date: Date }>,
  loanId: number | undefined
): number {
  // Find the active loan rate segment
  const cacheKey = `${periodStart.getTime()}-${loanId}`;
  const activeRateObj = findActiveRate(periodStart, sortedRates, cacheKey);

  // Determine the actual annual interest rate (%)
  if (activeRateObj.type === 'fixed') {
    return activeRateObj.value;
  }

  // Float (MRR + Spread)
  const activeMRR = sortedRefRates.toReversed().find(r => r.date <= periodStart);
  const mrrValue = activeMRR ? activeMRR.rate : 0;
  return mrrValue + activeRateObj.value;
}

/**
 * Find the next rate change date (either loan rate change or MRR change for floating rates)
 */
export function findNextRateChangeDate(
  periodStart: Date,
  payDate: Date,
  sortedRates: Array<Loan['rates'][0] & { startDate: Date }>,
  sortedRefRates: Array<ReferenceRate & { date: Date }>,
  isFloatRate: boolean
): Date {
  // Find next loan rate change
  const nextRateChange = sortedRates.find(r => r.startDate > periodStart);
  let nextChangeDate = nextRateChange ? nextRateChange.startDate : payDate;

  // For floating rates, also check MRR changes
  if (isFloatRate) {
    const nextMRRChange = sortedRefRates.find(r => r.date > periodStart);
    if (nextMRRChange && nextMRRChange.date < nextChangeDate) {
      nextChangeDate = nextMRRChange.date;
    }
  }

  // Ensure we don't go past payDate
  if (nextChangeDate > payDate) {
    nextChangeDate = payDate;
  }

  // Defensive check against infinite loop
  if (nextChangeDate <= periodStart) {
    nextChangeDate = payDate;
  }

  return nextChangeDate;
}

/**
 * Normalize and sort rate arrays with startOfDay applied
 */
export function normalizeRates(rates: Loan['rates']): Array<Loan['rates'][0] & { startDate: Date }> {
  return rates
    .map(r => ({
      ...r,
      startDate: startOfDay(r.startDate)
    }))
    .toSorted((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

/**
 * Normalize and sort reference rates with startOfDay applied
 */
export function normalizeReferenceRates(rates: ReferenceRate[]): Array<ReferenceRate & { date: Date }> {
  return rates
    .map(r => ({
      ...r,
      date: startOfDay(r.date)
    }))
    .toSorted((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Clear the rate cache (useful for testing or when data changes)
 */
export function clearRateCache(): void {
  rateCache.clear();
}
