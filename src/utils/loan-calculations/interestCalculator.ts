/**
 * Interest Calculator - Handles interest calculations for loan periods
 * Extracted from calculateLoanSeries for Single Responsibility Principle
 */
import { differenceInCalendarDays } from 'date-fns';
import { INTEREST_CALCULATION } from '../../constants/prediction';
import type { Loan, ReferenceRate } from '../../types';
import { calculateEffectiveRate, findNextRateChangeDate } from './rateCalculator';

const { DAYS_PER_YEAR } = INTEREST_CALCULATION;

export interface InterestSegment {
  rate: number;
  days: number;
  interest: number;
}

export interface InterestCalculationResult {
  totalInterest: number;
  segments: InterestSegment[];
  rateBreakdown: string;
}

/**
 * Calculate interest for a period between two dates with variable rates
 * Handles rate changes within the period
 */
export function calculatePeriodInterest(
  startDate: Date,
  endDate: Date,
  principal: number,
  sortedRates: Array<Loan['rates'][0] & { startDate: Date }>,
  sortedRefRates: Array<ReferenceRate & { date: Date }>,
  loanId: number | undefined
): InterestCalculationResult {
  let periodStart = startDate;
  let totalInterest = 0;
  const segments: InterestSegment[] = [];
  const breakdownParts: string[] = [];

  while (periodStart < endDate) {
    // Calculate the active rate for this segment
    const annualRate = calculateEffectiveRate(periodStart, sortedRates, sortedRefRates, loanId);

    // Find when the rate will next change
    const activeRateObj = sortedRates.toReversed().find(r => r.startDate <= periodStart) || sortedRates[0];
    const nextChangeDate = findNextRateChangeDate(
      periodStart,
      endDate,
      sortedRates,
      sortedRefRates,
      activeRateObj.type === 'float'
    );

    // Calculate interest for this segment
    const daysInSegment = differenceInCalendarDays(nextChangeDate, periodStart);
    
    if (daysInSegment > 0) {
      const segmentInterest = (principal * (annualRate / 100) * daysInSegment) / DAYS_PER_YEAR;
      totalInterest += segmentInterest;
      
      segments.push({
        rate: annualRate,
        days: daysInSegment,
        interest: segmentInterest
      });
      
      breakdownParts.push(`${annualRate.toFixed(2)}%(${daysInSegment})`);
    }

    periodStart = nextChangeDate;
  }

  return {
    totalInterest,
    segments,
    rateBreakdown: breakdownParts.join(' + ')
  };
}
